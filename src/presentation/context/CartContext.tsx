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

    // Session Warning States
    const [isSessionWarningOpen, setIsSessionWarningOpen] = useState(false);
    const [isRefreshingToken, setIsRefreshingToken] = useState(false);
    const [expiresInSeconds, setExpiresInSeconds] = useState(0);
    const [refreshError, setRefreshError] = useState<string | null>(null);

    // 🚀 INIT CART
    useEffect(() => {
        const initCart = async () => {
            const localCartData = DIContainer.getGetCartUseCase().execute();

            if (isLoggedIn) {
                try {
                    const remoteCart = await getCart();

                    if (localCartData.items?.length > 0) {
                        // 🔥 PRIORITY → LOCAL CART
                        setCartItems(localCartData.items);
                        setRestaurantId(localCartData.restaurantId);
                        setRestaurantName(localCartData.restaurantName);

                        // 🔥 SYNC ONLY ONCE
                        if (!hasSyncedAfterLogin.current) {
                            hasSyncedAfterLogin.current = true;

                            const syncResponse = await syncCart({
                                restaurantId: localCartData.restaurantId!,
                                restaurantName: localCartData.restaurantName || 'Restaurant',
                                items: localCartData.items.map(item => ({
                                    menuItemId: item.menuItemId || item.id,
                                    name: item.name,
                                    unitPrice: item.price,
                                    quantity: item.quantity,
                                    options: item.description || "[]",
                                    specialInstructions: item.customizations || ""
                                }))
                            }, true);

                            // The backend MERGES the guest cart with the saved server cart.
                            // We MUST update the local UI and storage with the merged result!
                            if (syncResponse && syncResponse.items) {
                                const mergedItems: CartItem[] = syncResponse.items.map((rItem: any) => ({
                                    id: rItem.specialInstructions ? `${rItem.menuItemId}-${btoa(rItem.specialInstructions).substring(0, 8)}` : rItem.menuItemId,
                                    menuItemId: rItem.menuItemId,
                                    name: rItem.name,
                                    price: rItem.unitPrice,
                                    quantity: rItem.quantity,
                                    description: typeof rItem.options === 'string' ? rItem.options : JSON.stringify(rItem.options || []),
                                    imageUrl: rItem.imageUrl || '',
                                    isVeg: true,
                                    isAddon: false,
                                    customizations: rItem.specialInstructions || undefined
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
                        }

                    } else if (remoteCart?.items?.length > 0) {
                        // 🔥 FALLBACK → SERVER CART
                        const convertedItems: CartItem[] = remoteCart.items.map((rItem: any) => ({
                            id: rItem.specialInstructions ? `${rItem.menuItemId}-${btoa(rItem.specialInstructions).substring(0, 8)}` : rItem.menuItemId,
                            menuItemId: rItem.menuItemId,
                            name: rItem.name,
                            price: rItem.unitPrice,
                            quantity: rItem.quantity,
                            description: typeof rItem.options === 'string' ? rItem.options : JSON.stringify(rItem.options || []),
                            imageUrl: rItem.imageUrl || '',
                            isVeg: true,
                            isAddon: false,
                            customizations: rItem.specialInstructions || undefined
                        }));

                        setCartItems(convertedItems);
                        setRestaurantId(remoteCart.restaurantId);
                        setRestaurantName(remoteCart.restaurantName);
                        
                        // Save the server cart to local storage to keep them perfectly in sync
                        DIContainer.getCartRepository().saveCart({
                            restaurantId: remoteCart.restaurantId,
                            restaurantName: remoteCart.restaurantName,
                            items: convertedItems
                        });
                    }

                } catch (e) {
                    console.error('Cart init failed:', e);
                }
            } else {
                setCartItems(localCartData.items);
                setRestaurantId(localCartData.restaurantId);
                setRestaurantName(localCartData.restaurantName);
            }
        };

        initCart();
    }, [isLoggedIn]);

    // 🚀 SYNC CART (ONLY AFTER INIT)
    useEffect(() => {
        const userId = localStorage.getItem('customer_id');

        if (!isLoggedIn || !userId) return;

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

                const itemsPayload = cartItems.map(item => ({
                    menuItemId: item.menuItemId || item.id,
                    name: item.name,
                    unitPrice: item.price,
                    quantity: item.quantity,
                    options: item.description || "[]",
                    specialInstructions: item.customizations || ""
                }));

                syncCart({
                    restaurantId,
                    restaurantName: restaurantName || 'Restaurant',
                    items: itemsPayload
                }, true);

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
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};