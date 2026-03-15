import React from 'react';
import { Plus, Minus, Star } from 'lucide-react';
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
        <div className="bg-white rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col h-full border border-gray-100">
            {/* Image Section */}
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Discount Tag */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-[#4CAF50] text-white px-2 py-0.5 rounded-md shadow-sm text-[9px] font-black">
                    <div className="w-2.5 h-2.5 rounded-full bg-white flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-[#4CAF50] rounded-full" />
                    </div>
                    <span>20% off</span>
                </div>

                {/* Bestseller / Legend Badge */}
                <div className="absolute bottom-3 right-3 flex flex-col gap-2 items-end">
                    <div className="bg-[#B02421] p-1.5 rounded-md shadow-md">
                        <div className="w-3 h-3 bg-white/20 rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full translate-y-[-1px]" />
                        </div>
                    </div>
                    {item.bestseller && (
                        <div className="bg-[#4CAF50] text-white px-2 py-0.5 rounded-md text-[9px] font-black flex items-center gap-1 shadow-sm">
                             <Star className="w-2.5 h-2.5 fill-white" />
                             <span>Best Seller</span>
                        </div>
                    )}
                </div>

                {/* Dietary Indicator (Top left of content usually, but here as badge) */}
                <div className="absolute top-3 left-3">
                    <div className={`w-4 h-4 rounded-sm border-2 ${item.isVeg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center bg-white p-0.5`}>
                        <div className={`w-full h-full rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-1">
                <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-base leading-snug mb-1">
                        {item.name}
                    </h4>
                    <p className="text-[11px] text-gray-400 font-medium line-clamp-2 leading-relaxed">
                        {item.description || "Lorem ipsum, lorem ipsum"}
                    </p>
                </div>

                <div className="flex items-center justify-between mt-4">
                    <span className="font-bold text-gray-900 text-base">
                        Rs. {typeof item.price === 'string' ? item.price.replace(/[^0-9.]/g, '') : item.price.toFixed(2)}
                    </span>

                    <div className="flex items-center">
                        {quantity === 0 ? (
                            <button
                                onClick={handleAdd}
                                className="px-6 py-1.5 rounded-lg border border-gray-200 text-[#FF4732] font-bold text-sm hover:bg-red-50 transition-colors shadow-sm"
                            >
                                ADD
                            </button>
                        ) : (
                            <div className="flex items-center bg-red-50 rounded-lg overflow-hidden border border-[#FF4732]/20">
                                <button
                                    onClick={handleRemove}
                                    className="w-8 h-8 flex items-center justify-center text-[#FF4732] hover:bg-[#FF4732]/10 transition-colors"
                                >
                                    <Minus className="w-3.5 h-3.5" strokeWidth={3} />
                                </button>
                                <span className="w-6 text-center text-sm font-bold text-gray-900">{quantity}</span>
                                <button
                                    onClick={handleAdd}
                                    className="w-8 h-8 flex items-center justify-center text-[#FF4732] hover:bg-[#FF4732]/10 transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
