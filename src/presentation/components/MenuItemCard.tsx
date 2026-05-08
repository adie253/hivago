import React, { useState } from 'react';
import { Plus, Minus, Star, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { AddOnsOverlay } from './AddOnsOverlay';
import { fetchItemDetails } from '../../data/api';

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
    restaurantId?: string;
    restaurantName?: string;
    onClick?: () => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, restaurantId, restaurantName, onClick }) => {
    const { cartItems, addToCart, removeFromCart } = useCart();
    const [showCustomize, setShowCustomize] = useState(false);
    const [isCheckingOptions, setIsCheckingOptions] = useState(false);

    const cartItemsOfThisType = cartItems.filter(i => (i.menuItemId || i.id) === item.id);
    const quantity = cartItemsOfThisType.reduce((acc, i) => acc + i.quantity, 0);

    const getNumericPrice = () => typeof item.price === 'string' ? parseInt(item.price.replace(/[^0-9]/g, ''), 10) : item.price;

    const handleInitialAdd = async (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();

        setIsCheckingOptions(true);
        try {
            const details = await fetchItemDetails(item.id);
            if (details && details.options && details.options.length > 0) {
                // Item has options, open the customize overlay
                setShowCustomize(true);
            } else {
                // No options, immediately add to cart
                addToCart({
                    id: item.id,
                    name: item.name,
                    price: getNumericPrice(),
                    isVeg: item.isVeg,
                }, restaurantId, restaurantName);
            }
        } catch (error) {
            console.error("Failed to fetch item details to check for options", error);
            // Fallback: If API fails, try to show the overlay (it will retry fetching inside, or fail gracefully)
            setShowCustomize(true);
        } finally {
            setIsCheckingOptions(false);
        }
    };

    const handleConfirmAdd = (itemToAdd: MenuItem, mainItemPrice: number, instructions: string, selectedAddons: { id: string, name: string, price: number }[]) => {
        // Add the main item
        const cartItemId = instructions 
            ? `${itemToAdd.id}-${btoa(instructions).substring(0, 8)}` 
            : itemToAdd.id;

        addToCart({
            id: cartItemId,
            menuItemId: itemToAdd.id,
            name: itemToAdd.name,
            price: mainItemPrice,
            isVeg: itemToAdd.isVeg,
            customizations: instructions || undefined
        }, restaurantId, restaurantName);

        // Add each addon as a separate item with isAddon flag
        selectedAddons.forEach(addon => {
            addToCart({
                id: addon.id,
                name: addon.name,
                price: addon.price,
                isVeg: true, // Assuming addons are mostly veg or inherit? Let's assume true for simplicity or if we had more metadata
                isAddon: true
            }, restaurantId, restaurantName);
        });

        console.log("Instructions for", itemToAdd.name, ":", instructions);
        setShowCustomize(false);
    };

    const handleRemove = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (cartItemsOfThisType.length > 0) {
            // Remove the last added variation
            removeFromCart(cartItemsOfThisType[cartItemsOfThisType.length - 1].id);
        }
    };

    return (
        <div
            className={`bg-white rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col h-full border border-gray-100`}
        >
            {/* Image Section */}
            <div
                className={`relative aspect-[4/3] overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}
                onClick={onClick}
            >
                <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Discount Tag */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-[#4CAF50] text-white px-2 py-0.5 rounded-md shadow-sm text-[9px] font-bold">
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
                        <div className="bg-[#4CAF50] text-white px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-1 shadow-sm">
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
                                onClick={handleInitialAdd}
                                disabled={isCheckingOptions}
                                className="px-6 py-1.5 rounded-lg border border-gray-200 text-[#FF4732] font-bold text-sm hover:bg-red-50 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 min-w-[70px] justify-center"
                            >
                                {isCheckingOptions ? <Loader2 className="w-4 h-4 animate-spin" /> : "ADD"}
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
                                    onClick={handleInitialAdd}
                                    disabled={isCheckingOptions}
                                    className="w-8 h-8 flex items-center justify-center text-[#FF4732] hover:bg-[#FF4732]/10 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isCheckingOptions ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" strokeWidth={3} />}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showCustomize && (
                <AddOnsOverlay
                    originalItem={item}
                    onClose={() => setShowCustomize(false)}
                    onConfirmAdd={handleConfirmAdd}
                />
            )}
        </div>
    );
};
