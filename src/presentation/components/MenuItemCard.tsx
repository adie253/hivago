import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export interface MenuItem {
    id: string;
    name: string;
    price: string | number;
    isVeg: boolean;
    bestseller: boolean;
    description: string;
    imageUrl: string;
}

interface MenuItemCardProps {
    item: MenuItem;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
    const { cartItems, addToCart, removeFromCart } = useCart();
    const cartItem = cartItems.find(i => i.id === item.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    const handleAdd = () => {
        const numericPrice = typeof item.price === 'string'
            ? parseInt(item.price.replace(/[^0-9]/g, ''), 10)
            : item.price;
        addToCart({
            id: item.id,
            name: item.name,
            price: numericPrice,
            isVeg: item.isVeg,
        });
    };

    const handleRemove = () => {
        removeFromCart(item.id);
    };

    return (
        <div className="bg-white rounded-[24px] overflow-hidden transition-all duration-300 hover:shadow-xl group">
            {/* Top Image Section */}
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Best Seller Badge Overlay */}
                {item.bestseller && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-orange-500 text-white px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm bg-opacity-90">
                        <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                            <span className="text-orange-500 text-[10px] font-black">★</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider">Best Seller</span>
                    </div>
                )}
            </div>

            {/* Bottom Content Section */}
            <div className="p-3.5 flex flex-col gap-0.5">
                <h4 className="font-bold text-gray-900 text-[13px] md:text-sm leading-tight truncate">{item.name}</h4>
                <p className="text-[10px] md:text-[11px] text-gray-400 font-medium line-clamp-2 leading-tight">
                    {item.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
                </p>

                {/* Price and Action Row */}
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">Price</span>
                        <span className="font-black text-gray-900 text-[13px] md:text-sm">
                            {typeof item.price === 'string' ? item.price : `Rs. ${item.price.toFixed(0)}`}
                        </span>
                    </div>

                    {/* Quantity Selector - More compact for mobile */}
                    <div className="flex items-center bg-gray-50 rounded-full p-0.5 border border-gray-100 shadow-sm">
                        <button
                            onClick={handleRemove}
                            disabled={quantity === 0}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${quantity > 0 ? 'bg-white text-red-500 shadow-sm hover:bg-red-50' : 'text-gray-300'}`}
                        >
                            <Minus className="w-3.5 h-3.5" strokeWidth={3} />
                        </button>
                        <span className="font-black w-6 text-center text-[12px] text-gray-900">{quantity}</span>
                        <button
                            onClick={handleAdd}
                            className="w-7 h-7 rounded-full bg-[#FF4732] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
