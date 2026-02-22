import React from 'react';
import { Plus, Minus, FileEdit } from 'lucide-react';
import { useCart } from '../context/CartContext';

export interface MenuItem {
    id: string;
    name: string;
    price: string;
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
        const numericPrice = parseInt(item.price.replace(/[^0-9]/g, ''), 10);
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
        <div className="flex bg-white p-4 rounded-2xl shadow-sm border border-gray-100 gap-4 mb-4 hover:shadow-md transition-shadow">

            {/* Left Thumbnail Image */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            </div>

            {/* Right Content */}
            <div className="flex flex-col flex-1 justify-between">
                <div>
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col">
                            {/* Veg & Bestseller Tags */}
                            <div className="flex items-center gap-2 mb-1.5">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${item.isVeg ? 'border-emerald-600' : 'border-red-600'}`}>
                                    <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`}></div>
                                </div>
                                {item.bestseller && (
                                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                        Bestseller
                                    </span>
                                )}
                            </div>

                            <h4 className="font-bold text-gray-900 text-lg leading-tight">{item.name}</h4>
                            <span className="font-extrabold text-gray-900 mt-1">{item.price}</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.description}</p>
                </div>

                {/* Action Row */}
                <div className="flex items-center justify-between mt-4">
                    <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors">
                        <FileEdit className="w-3.5 h-3.5" />
                        Add a Note <span className="text-gray-400">+</span>
                    </button>

                    {/* Add / Counter Button */}
                    {quantity === 0 ? (
                        <button
                            onClick={handleAdd}
                            className="bg-[#FF4732] text-white font-bold text-sm px-6 py-2 rounded-lg shadow-sm hover:bg-orange-700 hover:shadow-md transition-all active:scale-95"
                        >
                            ADD
                        </button>
                    ) : (
                        <div className="flex items-center bg-red-50 text-[#FF4732] rounded-lg border border-red-200 overflow-hidden shadow-sm h-9">
                            <button
                                onClick={handleRemove}
                                className="px-3 h-full hover:bg-red-100 transition-colors flex items-center justify-center"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold w-6 text-center text-sm">{quantity}</span>
                            <button
                                onClick={handleAdd}
                                className="px-3 h-full hover:bg-red-100 transition-colors flex items-center justify-center"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
