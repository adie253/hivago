import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import DIContainer from '../../di/container';
import { CartItem } from '../../core/entities/CartItem';
import { syncCart, isTokenValid, getCart } from '../../data/api';

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

                            await syncCart({
                                restaurantId: localCartData.restaurantId!,
                                restaurantName: localCartData.restaurantName || 'Restaurant',
                                items: localCartData.items.map(item => ({
                                    menuItemId: item.id,
                                    name: item.name,
                                    unitPrice: item.price,
                                    quantity: item.quantity,
                                    options: item.description || "[]",
                                    specialInstructions: ""
                                }))
                            }, true);
                        }

                    } else if (remoteCart?.items?.length > 0) {
                        // 🔥 FALLBACK → SERVER CART
                        const convertedItems: CartItem[] = remoteCart.items.map((rItem: any) => ({
                            id: rItem.menuItemId,
                            name: rItem.name,
                            price: rItem.unitPrice,
                            quantity: rItem.quantity,
                            description: rItem.options || '',
                            imageUrl: rItem.imageUrl || '',
                            isVeg: true,
                            isAddon: false
                        }));

                        setCartItems(convertedItems);
                        setRestaurantId(remoteCart.restaurantId);
                        setRestaurantName(remoteCart.restaurantName);
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
        if (!restaurantId || cartItems.length === 0) return;

        // ❗ Skip initial login sync (already handled)
        if (!hasSyncedAfterLogin.current) return;

        if (intervalRef.current) clearTimeout(intervalRef.current);

        intervalRef.current = setTimeout(() => {
            try {
                const itemsPayload = cartItems.map(item => ({
                    menuItemId: item.id,
                    name: item.name,
                    unitPrice: item.price,
                    quantity: item.quantity,
                    options: item.description || "[]",
                    specialInstructions: ""
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
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};