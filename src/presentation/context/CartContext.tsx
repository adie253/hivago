import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import DIContainer from '../../di/container';
import { CartItem } from '../../core/entities/CartItem';
import { syncCart, isTokenValid, getCart, refreshToken, clearServerCart } from '../../data/api';
import { SessionWarningPopup } from '../components/SessionWarningPopup';

interface CartContextType {
    cartItems: CartItem[];
    restaurantId?: string;
    restaurantName?: string;
    addToCart: (item: Omit<CartItem, 'quantity'>, restaurantId?: string, restaurantName?: string) => void;
    removeFromCart: (itemId: string) => void;
    clearCart: () => void;
    refreshCartFromServer: () => Promise<void>;
    cartTotal: number;
    refreshLoginStatus: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [restaurantId, setRestaurantId] = useState<string | undefined>(undefined);
    const [restaurantName, setRestaurantName] = useState<string | undefined>(undefined);
    const [isLoggedIn, setIsLoggedIn] = useState(isTokenValid());

    const hasSyncedAfterLogin = useRef(false);
    const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const sessionCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isUpdatingFromSync = useRef(false);
    const lastSyncedCartRef = useRef<string>("");

    // Session Warning States
    const [isSessionWarningOpen, setIsSessionWarningOpen] = useState(false);
    const [isRefreshingToken, setIsRefreshingToken] = useState(false);
    const [expiresInSeconds, setExpiresInSeconds] = useState(0);
    const [refreshError, setRefreshError] = useState<string | null>(null);
    
    // Conflict State
    const [conflictInfo, setConflictInfo] = useState<{ name: string, id: string } | null>(null);

    // 🚀 RECONCILE CARTS (STRICT FRONTEND MERGE)
    const reconcileCarts = useCallback(async (localCart: any) => {
        if (!isLoggedIn || hasSyncedAfterLogin.current) return;

        try {
            // 1. Fetch current server state
            const remoteCart = await getCart();
            const hasLocalItems = localCart?.items?.length > 0;
            const hasRemoteItems = remoteCart?.items?.length > 0;

            // Handle Restaurant Conflict
            if (hasLocalItems && hasRemoteItems && localCart.restaurantId !== remoteCart.restaurantId) {
                setConflictInfo({ 
                    name: remoteCart.restaurantName || "another restaurant",
                    id: remoteCart.restaurantId
                });
                return;
            }

            let finalItems: CartItem[] = [];
            let finalRestaurantId = localCart.restaurantId || remoteCart.restaurantId;
            let finalRestaurantName = localCart.restaurantName || remoteCart.restaurantName;

            if (hasLocalItems && hasRemoteItems) {
                // Perform Frontend Merge
                finalItems = performFrontendMerge(localCart.items, remoteCart.items);
            } else if (hasLocalItems) {
                finalItems = localCart.items;
            } else if (hasRemoteItems) {
                finalItems = convertServerItems(remoteCart.items);
            }

            // 2. Update UI & Local Storage immediately
            updateStateWithFinalCart(finalItems, finalRestaurantId, finalRestaurantName);
            
            // 3. Push to server with replaceCart=true to OVERWRITE with the merged result
            if (finalItems.length > 0) {
                await syncCart({
                    restaurantId: finalRestaurantId!,
                    restaurantName: finalRestaurantName || 'Restaurant',
                    items: finalItems.map(item => ({
                        menuItemId: item.menuItemId || item.id,
                        name: item.name,
                        unitPrice: item.price,
                        quantity: item.quantity,
                        options: item.description || "",
                        specialInstructions: item.customizations || ""
                    }))
                }, true); // FORCE OVERWRITE with our merged state
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
        isUpdatingFromSync.current = true;
        const itemsJson = JSON.stringify(items);
        lastSyncedCartRef.current = itemsJson; // ❗ Prevent the sync effect from firing again
        
        setCartItems(items);
        setRestaurantId(rId);
        setRestaurantName(rName);
        
        DIContainer.getCartRepository().saveCart({
            restaurantId: rId,
            restaurantName: rName,
            items: items
        });
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

    // 🚀 INIT CART
    useEffect(() => {
        const init = async () => {
            const localCartData = DIContainer.getGetCartUseCase().execute();

            if (isLoggedIn) {
                if (!hasSyncedAfterLogin.current) {
                    await reconcileCarts(localCartData);
                }
            } else {
                // Guest mode
                setCartItems(localCartData.items || []);
                setRestaurantId(localCartData.restaurantId);
                setRestaurantName(localCartData.restaurantName);
                hasSyncedAfterLogin.current = false;
                lastSyncedCartRef.current = "";
            }
        };

        init();
    }, [isLoggedIn, reconcileCarts]);

    // 🚀 SYNC CART (ONLY AFTER INIT)
    useEffect(() => {
        const userId = localStorage.getItem('customer_id');

        if (!isLoggedIn || !userId) return;

        // ❗ Skip if this change matches the last state we received from the server
        const currentCartJson = JSON.stringify(cartItems);
        if (lastSyncedCartRef.current === currentCartJson) {
            return;
        }

        // ❗ Skip initial login sync (already handled)
        if (!hasSyncedAfterLogin.current) return;

        if (intervalRef.current) clearTimeout(intervalRef.current);

        intervalRef.current = setTimeout(async () => {
            try {
                if (cartItems.length === 0) {
                    await clearServerCart();
                    return;
                }
                
                if (!restaurantId) return;

                // 🔥 Deduplicate items before sending to server as a safety measure
                const itemMap = new Map<string, any>();
                cartItems.forEach(item => {
                    const key = `${item.menuItemId || item.id}-${item.customizations || ''}`;
                    if (itemMap.has(key)) {
                        itemMap.get(key).quantity += item.quantity;
                    } else {
                        const payloadItem: any = {
                            menuItemId: item.menuItemId || item.id,
                            name: item.name,
                            unitPrice: item.price,
                            quantity: item.quantity,
                        };
                        
                        // 🔥 Omit empty strings to avoid 500 errors on some backends
                        if (item.description && item.description !== "") {
                            payloadItem.options = item.description;
                        }
                        
                        if (item.customizations && item.customizations !== "") {
                            payloadItem.specialInstructions = item.customizations;
                        }

                        itemMap.set(key, payloadItem);
                    }
                });

                const itemsPayload = Array.from(itemMap.values());

                const syncResponse = await syncCart({
                    restaurantId,
                    restaurantName: restaurantName || 'Restaurant',
                    items: itemsPayload
                }, true);

                if (syncResponse && syncResponse.items) {
                    const updatedItems: CartItem[] = syncResponse.items.map((rItem: any) => ({
                        id: rItem.id || (rItem.specialInstructions ? `${rItem.menuItemId}-${btoa(rItem.specialInstructions).substring(0, 8)}` : rItem.menuItemId),
                        menuItemId: rItem.menuItemId,
                        name: rItem.name,
                        price: rItem.unitPrice,
                        quantity: rItem.quantity,
                        isVeg: true,
                        isAddon: false,
                        customizations: rItem.specialInstructions || undefined,
                        // Handle options array from server
                        description: Array.isArray(rItem.options) 
                            ? rItem.options.map((o: any) => `${o.name}: ${o.value}`).join(", ") 
                            : (typeof rItem.options === 'string' ? rItem.options : "")
                    }));

                    const updatedJson = JSON.stringify(updatedItems);
                    lastSyncedCartRef.current = updatedJson;
                    setCartItems(updatedItems);
                    
                    DIContainer.getCartRepository().saveCart({
                        restaurantId: syncResponse.restaurantId,
                        restaurantName: syncResponse.restaurantName,
                        items: updatedItems
                    });
                }
            } catch (err) {
                console.error("Cart sync failed:", err);
            }
        }, 400);

        return () => {
            if (intervalRef.current) clearTimeout(intervalRef.current);
        };
    }, [cartItems, restaurantId, restaurantName, isLoggedIn]);

    // 🚀 ADD TO CART
    const addToCart = useCallback((item: Omit<CartItem, 'quantity'>, rId?: string, rName?: string) => {
        if (!rId) return;

        // 🔥 Prevent multi-restaurant cart
        if (restaurantId && restaurantId !== rId) {
            DIContainer.getClearCartUseCase().execute();
        }

        const updatedCartData = DIContainer.getAddToCartUseCase().execute(item, rId, rName);

        setCartItems([...updatedCartData.items]);
        setRestaurantId(updatedCartData.restaurantId);
        setRestaurantName(updatedCartData.restaurantName);
    }, [restaurantId]);

    // 🚀 REMOVE
    const removeFromCart = useCallback((itemId: string) => {
        const updatedCartData = DIContainer.getRemoveFromCartUseCase().execute(itemId);

        setCartItems([...updatedCartData.items]);
        setRestaurantId(updatedCartData.restaurantId);
        setRestaurantName(updatedCartData.restaurantName);
    }, []);

    // 🚀 CLEAR
    const clearCart = useCallback(() => {
        DIContainer.getClearCartUseCase().execute();
        setCartItems([]);
        setRestaurantId(undefined);
        setRestaurantName(undefined);
    }, []);

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
            cartTotal,
            refreshLoginStatus
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
                                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round"/>
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