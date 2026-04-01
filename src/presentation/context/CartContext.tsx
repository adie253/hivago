import React, { createContext, useContext, useState, useEffect } from 'react';
import DIContainer from '../../di/container';
import { CartItem } from '../../core/entities/CartItem';
import { syncCart, isTokenValid } from '../../data/api';

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

    useEffect(() => {
        const cartData = DIContainer.getGetCartUseCase().execute();
        setCartItems(cartData.items);
        setRestaurantId(cartData.restaurantId);
        setRestaurantName(cartData.restaurantName);
    }, []);

    useEffect(() => {
        const userId = localStorage.getItem('customer_id');
        if (isLoggedIn && userId && cartItems.length > 0 && restaurantId) {
            // Function to ensure valid UUIDs for the backend
            const ensureGuid = (id: string | undefined) => {
                if (!id) return "3fa85f64-5717-4562-b3fc-2c963f66afa6";
                if (id.includes('-') && id.length >= 32) return id;
                return "3fa85f64-5717-4562-b3fc-2c963f66afa6";
            };

            syncCart({
                restaurantId: ensureGuid(restaurantId),
                restaurantName: restaurantName || 'Restaurant',
                items: cartItems.map(item => {
                    const payload: any = {
                        menuItemId: ensureGuid(item.id),
                        name: item.name,
                        unitPrice: item.price,
                        quantity: item.quantity,
                        options: "[]",
                        specialInstructions: ""
                    };
                    return payload;
                })
            }).catch(e => console.error("Failed to sync cart:", e));
        }
    }, [cartItems, restaurantId, restaurantName, isLoggedIn]);

    const addToCart = (item: Omit<CartItem, 'quantity'>, rId?: string, rName?: string) => {
        const updatedCartData = DIContainer.getAddToCartUseCase().execute(item, rId, rName);
        setCartItems([...updatedCartData.items]);
        setRestaurantId(updatedCartData.restaurantId);
        setRestaurantName(updatedCartData.restaurantName);
    };

    const removeFromCart = (itemId: string) => {
        const updatedCartData = DIContainer.getRemoveFromCartUseCase().execute(itemId);
        setCartItems([...updatedCartData.items]);
        setRestaurantId(updatedCartData.restaurantId);
        setRestaurantName(updatedCartData.restaurantName);
    };

    const clearCart = () => {
        DIContainer.getClearCartUseCase().execute();
        setCartItems([]);
        setRestaurantId(undefined);
        setRestaurantName(undefined);
    };

    const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const refreshLoginStatus = () => {
        setIsLoggedIn(isTokenValid());
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
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
