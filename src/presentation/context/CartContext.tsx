import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from './ToastContext';
import DIContainer from '../../di/container';
import { CartItem } from '../../core/entities/CartItem';
import { syncCart, isTokenValid, getCart, refreshToken, clearServerCart } from '../../data/api';
import { SessionWarningPopup } from '../components/SessionWarningPopup';

interface CartContextType {
    cartItems: CartItem[];
    restaurantId?: string;
    restaurantName?: string;
    addToCart: (item: Omit<CartItem, 'quantity'>, rId?: string, rName?: string, silent?: boolean) => void;
    removeFromCart: (itemId: string, silent?: boolean) => void;
    clearCart: () => void;
    refreshCartFromServer: () => Promise<void>;
    cartTotal: number;
    refreshLoginStatus: () => void;
    deliveryQuote: any | null;
    setDeliveryQuote: (quote: any | null) => void;
    deliveryStatus: 'success' | 'error' | 'warning' | null;
    setDeliveryStatus: (status: 'success' | 'error' | 'warning' | null) => void;
    deliveryError: string | null;
    setDeliveryError: (error: string | null) => void;
    isCheckingDelivery: boolean;
    setIsCheckingDelivery: (isChecking: boolean) => void;
    reorder: (items: CartItem[], restaurantId: string, restaurantName: string) => Promise<void>;
    isLoggedIn: boolean;
    fulfillmentType: 'Delivery' | 'Pickup';
    setFulfillmentType: (type: 'Delivery' | 'Pickup') => void;
    includeCutlery: boolean;
    setIncludeCutlery: (include: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showToast } = useToast();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [restaurantId, setRestaurantId] = useState<string | undefined>(undefined);
    const [restaurantName, setRestaurantName] = useState<string | undefined>(undefined);
    const [isLoggedIn, setIsLoggedIn] = useState(isTokenValid());
    const [deliveryQuote, setDeliveryQuote] = useState<any | null>(null);
    const [deliveryStatus, setDeliveryStatus] = useState<'success' | 'error' | 'warning' | null>(null);
    const [deliveryError, setDeliveryError] = useState<string | null>(null);
    const [isCheckingDelivery, setIsCheckingDelivery] = useState<boolean>(false);
    const [fulfillmentType, setFulfillmentTypeState] = useState<'Delivery' | 'Pickup'>('Delivery');

    const setFulfillmentType = (type: 'Delivery' | 'Pickup') => {
        setFulfillmentTypeState(type);
        showToast(`Switched to ${type} mode`, "success");
    };
    const [includeCutlery, setIncludeCutlery] = useState<boolean>(false);

    const hasSyncedAfterLogin = useRef(false);
    const sessionCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const syncDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Session Warning States
    const [isSessionWarningOpen, setIsSessionWarningOpen] = useState(false);
    const [isRefreshingToken, setIsRefreshingToken] = useState(false);
    const [expiresInSeconds, setExpiresInSeconds] = useState(0);
    const [refreshError, setRefreshError] = useState<string | null>(null);

    // Conflict State
    const [conflictInfo, setConflictInfo] = useState<{ name: string, id: string } | null>(null);

    // RECONCILE CARTS (STRICT FRONTEND MERGE)
    const reconcileCarts = useCallback(async (localCart: any) => {
        if (!isLoggedIn || hasSyncedAfterLogin.current) return;

        try {
            // 1. Fetch current server state
            const remoteCart = await getCart();
            const hasLocalItems = localCart?.items?.length > 0;
            const hasRemoteItems = remoteCart?.items?.length > 0;

            // ❗ Immediately clear localStorage cart — once we're logged in, server is source of truth.
            // This prevents reload from re-reading stale guest items and merging them again.
            DIContainer.getClearCartUseCase().execute();

            // Handle Restaurant Conflict
            if (hasLocalItems && hasRemoteItems && localCart.restaurantId !== remoteCart.restaurantId) {
                setConflictInfo({
                    name: remoteCart.restaurantName || "another restaurant",
                    id: remoteCart.restaurantId
                });
                return;
            }

            let finalItems: CartItem[] = [];
            let finalRestaurantId = localCart.restaurantId || remoteCart?.restaurantId;
            let finalRestaurantName = localCart.restaurantName || remoteCart?.restaurantName;

            if (hasLocalItems && hasRemoteItems) {
                finalItems = performFrontendMerge(localCart.items, remoteCart.items);
            } else if (hasLocalItems) {
                finalItems = localCart.items;
            } else if (hasRemoteItems) {
                finalItems = convertServerItems(remoteCart.items);
                finalRestaurantId = remoteCart.restaurantId;
                finalRestaurantName = remoteCart.restaurantName;
            }

            // 2. Update UI state (no localStorage write — we're logged in)
            setCartItems(finalItems);
            setRestaurantId(finalRestaurantId);
            setRestaurantName(finalRestaurantName);

            // 3. Push merged result to server only if local items were involved
            if (hasLocalItems && finalItems.length > 0) {
                const itemsPayload: { menuItemId: string; name: string; unitPrice: number; quantity: number; options?: string; specialInstructions?: string; }[] =
                    finalItems.map(item => {
                        const p: { menuItemId: string; name: string; unitPrice: number; quantity: number; options?: string; specialInstructions?: string; } = {
                            menuItemId: item.menuItemId || item.id,
                            name: item.name,
                            unitPrice: item.price,
                            quantity: item.quantity,
                        };
                        if (item.description && item.description !== "") p.options = item.description;
                        if (item.customizations && item.customizations !== "") p.specialInstructions = item.customizations;
                        return p;
                    });

                await syncCart({
                    restaurantId: finalRestaurantId!,
                    restaurantName: finalRestaurantName || 'Restaurant',
                    items: itemsPayload
                }, true);
            }

        } catch (e) {
            console.error('Cart reconciliation failed:', e);
        } finally {
            hasSyncedAfterLogin.current = true;
        }
    }, [isLoggedIn]);

    const convertServerItems = (remoteItems: any[]): CartItem[] => {
        return remoteItems.map((rItem: any) => ({
            id: rItem.id || (rItem.specialInstructions ? `${rItem.menuItemId}-${btoa(rItem.specialInstructions).substring(0, 8)}` : rItem.menuItemId),
            menuItemId: rItem.menuItemId,
            name: rItem.name,
            price: rItem.unitPrice,
            quantity: rItem.quantity,
            isVeg: true,
            isAddon: false,
            customizations: rItem.specialInstructions || undefined,
            description: Array.isArray(rItem.options)
                ? rItem.options.map((o: any) => `${o.name}: ${o.value}`).join(", ")
                : (typeof rItem.options === 'string' ? rItem.options : "")
        }));
    };

    const updateStateWithFinalCart = (items: CartItem[], rId: string, rName: string) => {
        setCartItems(items);
        setRestaurantId(rId);
        setRestaurantName(rName);

        // Only persist to localStorage for guests — logged-in users rely on server
        if (!isLoggedIn) {
            DIContainer.getCartRepository().saveCart({
                restaurantId: rId,
                restaurantName: rName,
                items: items
            });
        }
    };

    const performFrontendMerge = (local: CartItem[], remote: any[]): CartItem[] => {
        const mergedMap = new Map<string, CartItem>();

        // 1. Process remote items first (trusting server pricing)
        const remoteItems = convertServerItems(remote);
        remoteItems.forEach(item => {
            const key = `${item.menuItemId}-${item.customizations || ''}`;
            mergedMap.set(key, { ...item });
        });

        // 2. Merge local items
        local.forEach(lItem => {
            const key = `${lItem.menuItemId}-${lItem.customizations || ''}`;
            if (mergedMap.has(key)) {
                // If exists, increment quantity (frontend deduplication)
                const existing = mergedMap.get(key)!;
                existing.quantity += lItem.quantity;
            } else {
                // New item
                mergedMap.set(key, { ...lItem });
            }
        });

        return Array.from(mergedMap.values());
    };

    //  INIT CART
    useEffect(() => {
        const init = async () => {
            if (isLoggedIn) {
                const alreadySynced = sessionStorage.getItem('cart_reconciled') === 'true';

                if (alreadySynced) {
                    // Reload: skip reconcile, just load from server
                    try {
                        const remoteCart = await getCart();
                        if (remoteCart?.items?.length > 0) {
                            const items = convertServerItems(remoteCart.items);
                            setCartItems(items);
                            setRestaurantId(remoteCart.restaurantId);
                            setRestaurantName(remoteCart.restaurantName);
                        }
                    } catch (e) {
                        console.error('Failed to load cart on reload:', e);
                    }
                } else {
                    // First login: run full reconcile (merge guest + server)
                    const localCartData = DIContainer.getGetCartUseCase().execute();
                    await reconcileCarts(localCartData);
                    sessionStorage.setItem('cart_reconciled', 'true');
                }
            } else {
                // Guest mode
                const localCartData = DIContainer.getGetCartUseCase().execute();
                setCartItems(localCartData.items || []);
                setRestaurantId(localCartData.restaurantId);
                setRestaurantName(localCartData.restaurantName);
                hasSyncedAfterLogin.current = false;
            }
        };

        init();
    }, [isLoggedIn, reconcileCarts]);

    // Shared debounced push — batches rapid +/- taps into a single API call
    const debouncedPushToServer = useCallback((cartData: { restaurantId: string; restaurantName: string; items: CartItem[] }) => {
        if (!isLoggedIn) return;
        if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);
        syncDebounceRef.current = setTimeout(async () => {
            try {
                const itemsPayload: { menuItemId: string; name: string; unitPrice: number; quantity: number; options?: string; specialInstructions?: string; }[] = cartData.items.map(i => {
                    const payload: { menuItemId: string; name: string; unitPrice: number; quantity: number; options?: string; specialInstructions?: string; } = {
                        menuItemId: i.menuItemId || i.id,
                        name: i.name,
                        unitPrice: i.price,
                        quantity: i.quantity,
                    };
                    if (i.description && i.description !== "") payload.options = i.description;
                    if (i.customizations && i.customizations !== "") payload.specialInstructions = i.customizations;
                    return payload;
                });

                // Step 1: Clear the server cart so same-restaurant merge doesn't double quantities
                await clearServerCart();

                // Step 2: POST the full current cart as a fresh state
                await syncCart({
                    restaurantId: cartData.restaurantId,
                    restaurantName: cartData.restaurantName || 'Restaurant',
                    items: itemsPayload
                }, true);
            } catch (err) {
                console.error("Failed to push cart to server:", err);
            }
        }, 800);
    }, [isLoggedIn]);

    // 🚀 ADD TO CART
    const addToCart = useCallback((item: Omit<CartItem, 'quantity'>, rId?: string, rName?: string, silent: boolean = false) => {
        let isExisting = false;
        setCartItems(existingItems => {
            const currentRestaurantId = existingItems.length > 0 ? restaurantId : undefined;

            if (currentRestaurantId && rId && currentRestaurantId !== rId) {
                setConflictInfo({ id: rId, name: rName || 'Restaurant' });
                return existingItems;
            }

            const key = `${item.menuItemId || item.id}-${item.customizations || ''}`;
            const existingIndex = existingItems.findIndex(
                i => `${i.menuItemId || i.id}-${i.customizations || ''}` === key
            );

            isExisting = existingIndex >= 0;
            let updatedItems: CartItem[];
            if (isExisting) {
                updatedItems = existingItems.map((i, idx) =>
                    idx === existingIndex ? { ...i, quantity: i.quantity + 1 } : i
                );
            } else {
                updatedItems = [...existingItems, { ...item, quantity: 1 } as CartItem];
            }

            if (isLoggedIn) {
                debouncedPushToServer({
                    restaurantId: rId || currentRestaurantId!,
                    restaurantName: rName || restaurantName || 'Restaurant',
                    items: updatedItems
                });
            } else {
                DIContainer.getAddToCartUseCase().execute(item, rId || currentRestaurantId!, rName || restaurantName!);
            }

            setRestaurantId(rId || currentRestaurantId);
            setRestaurantName(rName || restaurantName);
            return updatedItems;
        });

        if (!silent) {
            if (isExisting) {
                showToast(`Updated ${item.name} quantity`, "success");
            } else {
                showToast(`Added ${item.name} to cart`, "success");
            }
        }
    }, [restaurantId, restaurantName, isLoggedIn, debouncedPushToServer, showToast]);

    // 🚀 REORDER
    const reorder = useCallback(async (items: CartItem[], rId: string, rName: string) => {
        // 1. Update UI state immediately
        setCartItems(items);
        setRestaurantId(rId);
        setRestaurantName(rName);

        // 2. Clear local storage for guests, or push to server for logged-in users
        if (isLoggedIn) {
            // For reorder, we push immediately instead of debouncing to ensure it's ready for checkout
            try {
                const itemsPayload = items.map(i => ({
                    menuItemId: i.menuItemId || i.id,
                    name: i.name,
                    unitPrice: i.price,
                    quantity: i.quantity,
                    options: i.description,
                    specialInstructions: i.customizations
                }));

                await clearServerCart();
                await syncCart({
                    restaurantId: rId,
                    restaurantName: rName,
                    items: itemsPayload
                }, true);
            } catch (err) {
                console.error("Reorder sync failed:", err);
                showToast("Failed to reorder items", "error");
            }
        } else {
            // For guest, we manually sync with repository
            DIContainer.getCartRepository().saveCart({
                restaurantId: rId,
                restaurantName: rName,
                items: items
            });
        }
        showToast(`Reordered items from ${rName}`, "success");
    }, [isLoggedIn, showToast]);

    //  REMOVE
    const removeFromCart = useCallback((itemId: string, silent: boolean = false) => {
        if (isLoggedIn) {
            // Logged in: update React state directly, skip localStorage
            setCartItems(prev => {
                const updatedItems = prev
                    .map(i => i.id === itemId || i.menuItemId === itemId
                        ? { ...i, quantity: i.quantity - 1 }
                        : i
                    )
                    .filter(i => i.quantity > 0);

                const currentRestaurantId = updatedItems.length > 0 ? restaurantId : undefined;
                const currentRestaurantName = updatedItems.length > 0 ? restaurantName : undefined;

                setRestaurantId(currentRestaurantId);
                setRestaurantName(currentRestaurantName);

                if (updatedItems.length === 0) {
                    // Last item removed — cancel debounce and delete cart from server
                    if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);
                    clearServerCart().catch(err => console.error("Failed to clear server cart:", err));
                } else if (currentRestaurantId) {
                    debouncedPushToServer({
                        restaurantId: currentRestaurantId,
                        restaurantName: currentRestaurantName || 'Restaurant',
                        items: updatedItems
                    });
                }
                return updatedItems;
            });
            
            if (!silent) {
                showToast("Removed from cart", "success");
            }
        } else {
            // Guest: use DI use case which writes to localStorage
            const updatedCartData = DIContainer.getRemoveFromCartUseCase().execute(itemId);
            setCartItems([...updatedCartData.items]);
            setRestaurantId(updatedCartData.restaurantId);
            setRestaurantName(updatedCartData.restaurantName);
            if (!silent) {
                showToast("Removed from cart", "success");
            }
        }
    }, [isLoggedIn, restaurantId, restaurantName, debouncedPushToServer, showToast]);

    // 🚀 CLEAR
    const clearCart = useCallback(() => {
        DIContainer.getClearCartUseCase().execute();
        setCartItems([]);
        setRestaurantId(undefined);
        setRestaurantName(undefined);
        
        if (isLoggedIn) {
            clearServerCart().catch(err => console.error("Failed to clear server cart:", err));
        }
        showToast("Cart cleared", "success");
    }, [isLoggedIn, showToast]);

    const forceReplaceCart = async () => {
        if (!conflictInfo) return;
        const localCartData = DIContainer.getGetCartUseCase().execute();

        try {
            const syncResponse = await syncCart({
                restaurantId: localCartData.restaurantId!,
                restaurantName: localCartData.restaurantName || 'Restaurant',
                items: localCartData.items.map(item => ({
                    menuItemId: item.menuItemId || item.id,
                    name: item.name,
                    unitPrice: item.price,
                    quantity: item.quantity,
                    options: item.description || "",
                    specialInstructions: item.customizations || ""
                }))
            }, true); // FORCE REPLACE

            if (syncResponse && syncResponse.items) {
                const mergedItems: CartItem[] = syncResponse.items.map((rItem: any) => ({
                    id: rItem.id || (rItem.specialInstructions ? `${rItem.menuItemId}-${btoa(rItem.specialInstructions).substring(0, 8)}` : rItem.menuItemId),
                    menuItemId: rItem.menuItemId,
                    name: rItem.name,
                    price: rItem.unitPrice,
                    quantity: rItem.quantity,
                    isVeg: true,
                    isAddon: false,
                    customizations: rItem.specialInstructions || undefined,
                    description: Array.isArray(rItem.options)
                        ? rItem.options.map((o: any) => `${o.name}: ${o.value}`).join(", ")
                        : (typeof rItem.options === 'string' ? rItem.options : "")
                }));

                setCartItems(mergedItems);
                setRestaurantId(syncResponse.restaurantId);
                setRestaurantName(syncResponse.restaurantName);
                DIContainer.getCartRepository().saveCart({
                    restaurantId: syncResponse.restaurantId,
                    restaurantName: syncResponse.restaurantName,
                    items: mergedItems
                });
            }
        } catch (e) {
            console.error("Force replace failed:", e);
        } finally {
            setConflictInfo(null);
        }
    };

    const refreshCartFromServer = useCallback(async () => {
        if (!isLoggedIn) return;
        try {
            const remoteCart = await getCart();
            if (remoteCart && remoteCart.items) {
                const convertedItems = convertServerItems(remoteCart.items);
                updateStateWithFinalCart(convertedItems, remoteCart.restaurantId, remoteCart.restaurantName);
            } else {
                updateStateWithFinalCart([], "", "");
                DIContainer.getClearCartUseCase().execute();
            }
        } catch (e) {
            console.error("Failed to refresh cart from server:", e);
        }
    }, [isLoggedIn]);

    const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const refreshLoginStatus = () => {
        setIsLoggedIn(isTokenValid());
        hasSyncedAfterLogin.current = false; // 🔥 reset for next login
    };

    const handleLogout = useCallback(() => {
        localStorage.removeItem('customer_token');

        localStorage.removeItem('customer_refresh_token');
        localStorage.removeItem('customer_token_expires_at');
        localStorage.removeItem('customer_id');
        localStorage.removeItem('customer_phone');
        localStorage.removeItem('customer_name');
        localStorage.removeItem('hivago_cart_v2');
        localStorage.removeItem('customer_refresh_token');

        // ❗ Clear cart from localStorage so stale local items don't
        // get merged into the server cart on the NEXT login
        DIContainer.getClearCartUseCase().execute();
        setCartItems([]);
        setRestaurantId(undefined);
        setRestaurantName(undefined);
        // Clear the reconcile flag so next login runs fresh reconcile
        sessionStorage.removeItem('cart_reconciled');
        hasSyncedAfterLogin.current = false;

        setIsLoggedIn(false);
        setIsSessionWarningOpen(false);
    }, []);

    const handleStayLoggedIn = async () => {
        setIsRefreshingToken(true);
        setRefreshError(null);
        const result = await refreshToken();
        setIsRefreshingToken(false);
        if (result) {
            setIsSessionWarningOpen(false);
            refreshLoginStatus();
        } else {
            setRefreshError("Could not extend session. Please log in again.");
            // Wait 2 seconds before logout to show the error
            setTimeout(() => {
                handleLogout();
            }, 2500);
        }
    };

    // 🚀 SESSION MONITORING
    useEffect(() => {
        const checkSession = () => {
            const expiresAt = localStorage.getItem('customer_token_expires_at');
            if (expiresAt && isLoggedIn) {
                const expiryTime = new Date(expiresAt).getTime();
                const now = Date.now();
                const timeLeft = expiryTime - now;
                const timeLeftSeconds = Math.max(0, Math.floor(timeLeft / 1000));

                setExpiresInSeconds(timeLeftSeconds);

                if (timeLeft <= 0) {
                    handleLogout();
                } else if (timeLeft < 5 * 60 * 1000) { // Show popup 5 minutes before
                    setIsSessionWarningOpen(true);
                } else {
                    setIsSessionWarningOpen(false);
                }
            } else if (!expiresAt && isLoggedIn) {
                // If logged in but no expiry date, maybe it's a permanent session or we should skip
            } else {
                setIsSessionWarningOpen(false);
            }
        };

        if (isLoggedIn) {
            sessionCheckIntervalRef.current = setInterval(checkSession, 1000); // Check every 1s for accuracy
            checkSession();
        } else {
            if (sessionCheckIntervalRef.current) clearInterval(sessionCheckIntervalRef.current);
            setIsSessionWarningOpen(false);
        }

        return () => {
            if (sessionCheckIntervalRef.current) clearInterval(sessionCheckIntervalRef.current);
        };
    }, [isLoggedIn, handleLogout]);

    return (
        <CartContext.Provider value={{
            cartItems,
            restaurantId,
            restaurantName,
            addToCart,
            removeFromCart,
            clearCart,
            refreshCartFromServer,
            cartTotal,
            refreshLoginStatus,
            deliveryQuote,
            setDeliveryQuote,
            deliveryStatus,
            setDeliveryStatus,
            deliveryError,
            setDeliveryError,
            isCheckingDelivery,
            setIsCheckingDelivery,
            reorder,
            isLoggedIn,
            fulfillmentType,
            setFulfillmentType,
            includeCutlery,
            setIncludeCutlery
        }}>
            {children}
            <SessionWarningPopup
                isOpen={isSessionWarningOpen}
                onClose={() => setIsSessionWarningOpen(false)}
                onLogout={handleLogout}
                onStayLoggedIn={handleStayLoggedIn}
                isRefreshing={isRefreshingToken}
                expiresInSeconds={expiresInSeconds}
                error={refreshError}
            />

            {conflictInfo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[28px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-[#FF4732]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-3">Restaurant Conflict</h3>
                            <p className="text-gray-500 leading-relaxed font-medium">
                                Your existing cart has items from <span className="text-gray-900 font-bold">"{conflictInfo.name}"</span>.
                                Would you like to clear it and start fresh with your current items?
                            </p>
                        </div>
                        <div className="flex border-t border-gray-100">
                            <button
                                onClick={() => {
                                    setConflictInfo(null);
                                    // Optionally pull existing cart here if they "Keep"
                                    getCart().then(remoteCart => {
                                        if (remoteCart && remoteCart.items) {
                                            const convertedItems: CartItem[] = remoteCart.items.map((rItem: any) => ({
                                                id: rItem.id || rItem.menuItemId,
                                                menuItemId: rItem.menuItemId,
                                                name: rItem.name,
                                                price: rItem.unitPrice,
                                                quantity: rItem.quantity,
                                                isVeg: true,
                                                isAddon: false,
                                                customizations: rItem.specialInstructions || undefined,
                                                description: Array.isArray(rItem.options)
                                                    ? rItem.options.map((o: any) => `${o.name}: ${o.value}`).join(", ")
                                                    : (typeof rItem.options === 'string' ? rItem.options : "")
                                            }));
                                            setCartItems(convertedItems);
                                            setRestaurantId(remoteCart.restaurantId);
                                            setRestaurantName(remoteCart.restaurantName);
                                        }
                                    });
                                }}
                                className="flex-1 px-6 py-5 text-gray-500 font-bold hover:bg-gray-50 transition-colors border-r border-gray-100"
                            >
                                Keep Existing
                            </button>
                            <button
                                onClick={forceReplaceCart}
                                className="flex-1 px-6 py-5 text-[#FF4732] font-extrabold hover:bg-red-50 transition-colors"
                            >
                                Start Fresh
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};