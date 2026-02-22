import React, { createContext, useContext, useState, useEffect } from 'react';
import DIContainer from '../../di/container';
import { CartItem } from '../../core/entities/CartItem';

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: Omit<CartItem, 'quantity'>) => void;
    removeFromCart: (itemId: string) => void;
    clearCart: () => void;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    useEffect(() => {
        const items = DIContainer.getGetCartUseCase().execute();
        setCartItems(items);
    }, []);

    const addToCart = (item: Omit<CartItem, 'quantity'>) => {
        const updatedCart = DIContainer.getAddToCartUseCase().execute(item);
        setCartItems([...updatedCart]);
    };

    const removeFromCart = (itemId: string) => {
        const updatedCart = DIContainer.getRemoveFromCartUseCase().execute(itemId);
        setCartItems([...updatedCart]);
    };

    const clearCart = () => {
        DIContainer.getClearCartUseCase().execute();
        setCartItems([]);
    };

    const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, cartTotal }}>
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
