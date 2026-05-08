import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, ShoppingBag, Loader2, ChevronRight } from 'lucide-react';
import { MenuItem } from './MenuItemCard';
import { fetchItemDetails, ApiItem } from '../../data/api';

interface AddOnsOverlayProps {
    originalItem: MenuItem | null;
    onClose: () => void;
    onConfirmAdd: (item: MenuItem, mainItemPrice: number, instructions: string, selectedAddons: {id: string, name: string, price: number}[]) => void;
}

export const AddOnsOverlay: React.FC<AddOnsOverlayProps> = ({ originalItem, onClose, onConfirmAdd }) => {
    const [apiItem, setApiItem] = useState<ApiItem | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Frequently bought together is still mock as API doesn't provide it yet
    const frequentlyBought: any[] = [];

    const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
    const [fbtQuantities, setFbtQuantities] = useState<Record<string, number>>({});
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [unavailabilityAction, setUnavailabilityAction] = useState('Remove it from my order');
    const [isUnavailabilityMenuOpen, setIsUnavailabilityMenuOpen] = useState(false);

    useEffect(() => {
        const originalStyle = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.body.classList.add('hide-floating-cart');
        return () => {
            document.body.style.overflow = originalStyle;
            document.body.classList.remove('hide-floating-cart');
        };
    }, []);

    useEffect(() => {
        const loadItemDetails = async () => {
            if (!originalItem) return;
            setIsLoading(true);
            try {
                const details = await fetchItemDetails(originalItem.id);
                setApiItem(details);
            } catch (error) {
                console.error("Failed to fetch item details", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (originalItem) {
            loadItemDetails();
        }
    }, [originalItem]);

    const toggleOption = (id: string) => {
        const newSet = new Set(selectedOptions);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedOptions(newSet);
    };

    const basePrice = useMemo(() => {
        if (!originalItem) return 0;
        return typeof originalItem.price === 'string'
            ? parseInt(originalItem.price.replace(/[^0-9]/g, ''), 10)
            : originalItem.price;
    }, [originalItem]);

    const mainItemPrice = useMemo(() => {
        let total = basePrice;
        
        // Add selected options from API (ingredients/mods)
        if (apiItem && apiItem.options) {
            apiItem.options.forEach(opt => {
                const optPrice = typeof opt.additionalPrice === 'number' && !isNaN(opt.additionalPrice) ? opt.additionalPrice : 0;
                if (selectedOptions.has(opt.id)) total += optPrice;
            });
        }
        return total;
    }, [basePrice, selectedOptions, apiItem]);

    const selectedAddonsList = useMemo(() => {
        const list: {id: string, name: string, price: number}[] = [];
        frequentlyBought.forEach(fb => {
            const qty = fbtQuantities[fb.id] || 0;
            if (qty > 0) {
                for (let i = 0; i < qty; i++) {
                    list.push({ id: `${fb.id}-${i}`, name: fb.name, price: fb.price });
                }
            }
        });
        return list;
    }, [fbtQuantities, frequentlyBought]);

    const selectedOptionsText = useMemo(() => {
        if (!apiItem || !apiItem.options) return "";
        return apiItem.options
            .filter(opt => selectedOptions.has(opt.id))
            .map(opt => opt.name)
            .join(", ");
    }, [apiItem, selectedOptions]);

    const finalInstructions = useMemo(() => {
        const parts = [];
        if (selectedOptionsText) parts.push(`Selected: ${selectedOptionsText}`);
        if (specialInstructions) parts.push(specialInstructions);
        return parts.join(" | ");
    }, [selectedOptionsText, specialInstructions]);

    const totalPrice = useMemo(() => {
        return mainItemPrice + selectedAddonsList.reduce((acc, curr) => acc + curr.price, 0);
    }, [mainItemPrice, selectedAddonsList]);
    if (!originalItem) return null;

    return createPortal(
        <>
        <div 

            className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-[#F8FAFC] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-5 duration-300">
                
                {/* Header */}
                <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 shrink-0 sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight flex items-center gap-2">
                             Add Ons
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-bold text-gray-500">{apiItem ? apiItem.name : originalItem.name}</span>
                            <span className="text-sm font-bold text-gray-900">Rs. {basePrice}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                    
                    {/* Top indicator bar matching image */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#FF4732] rounded-b-full"></div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1 overflow-y-auto no-scrollbar scroll-smooth">
                    
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-[#FF4732] animate-spin" />
                            <span className="ml-3 text-gray-500 font-bold">Loading options...</span>
                        </div>
                    ) : (
                        <>
                            {/* Tabs */}
                            <div className="flex border-b border-gray-200 mb-6">
                                <button className="text-sm font-bold text-gray-900 pb-3 border-b-2 border-gray-900 px-1">
                                    Customise as per your Taste
                                </button>
                            </div>

                            {/* Options Section */}
                            {apiItem && apiItem.options && apiItem.options.length > 0 && (
                                <div className="mb-8 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-900 mb-4 tracking-wide">Add Ingredients</h3>
                                    <div className="space-y-4">
                                        {apiItem.options.map((opt) => {
                                            const isSelected = selectedOptions.has(opt.id);
                                            const optPrice = typeof opt.additionalPrice === 'number' && !isNaN(opt.additionalPrice) ? opt.additionalPrice : 0;
                                            return (
                                                <div key={opt.id} className="flex items-center justify-between group cursor-pointer" onClick={() => toggleOption(opt.id)}>
                                                    <div>
                                                        <p className={`text-sm font-bold transition-colors ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>{opt.name}</p>
                                                        {optPrice > 0 ? (
                                                            <p className="text-[11px] font-bold text-gray-400">Rs. {optPrice}</p>
                                                        ) : (
                                                            <p className="text-[11px] font-bold text-gray-400">Included</p>
                                                        )}
                                                    </div>
                                                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-[#FF4732] border-[#FF4732] shadow-sm scale-105' : 'bg-transparent border-gray-300 hover:border-[#FF4732]'}`}>
                                                        {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}


                            {/* Special Instructions */}
                            <div className="mb-6 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-900 mb-2">Special Instructions</h3>
                                <p className="text-[10px] text-gray-500 font-medium mb-3">Please let us know if you are allergic to something or if we need to avoid anything.</p>
                                <div className="relative">
                                    <textarea 
                                        maxLength={350}
                                        className="w-full rounded-xl border border-gray-200 p-3 text-xs bg-gray-50 focus:bg-white transition-all focus:ring-1 focus:ring-[#FF4732] focus:border-[#FF4732] resize-none h-24 placeholder-gray-400"
                                        placeholder="e.g. Less spicy, no onions..."
                                        value={specialInstructions}
                                        onChange={(e) => setSpecialInstructions(e.target.value)}
                                    />
                                    <div className="absolute bottom-3 right-3 text-[9px] font-bold text-gray-400">
                                        {350 - specialInstructions.length} characters remaining
                                    </div>
                                </div>
                            </div>

                            {/* Unavailability Option */}
                            <div className="mb-6">
                                <h3 className="text-[13px] font-bold text-gray-800 mb-3 px-1">If this product is not available</h3>
                                <button 
                                    onClick={() => setIsUnavailabilityMenuOpen(true)}
                                    className="w-full bg-white rounded-2xl py-3.5 px-4 flex items-center justify-between border border-gray-100 shadow-sm active:scale-[0.98] transition-all"
                                >
                                    <span className="text-[13px] font-medium text-gray-500">{unavailabilityAction}</span>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        </>
                    )}

                </div>

                {/* Bottom Action Bar */}
                <div className="bg-white p-4 sm:p-6 border-t border-gray-100 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-20">
                     <button
                         onClick={() => onConfirmAdd({
                             ...originalItem,
                         }, mainItemPrice, finalInstructions, selectedAddonsList)}
                         className="w-full bg-[#D12E27] text-white rounded-2xl py-4 px-6 flex items-center justify-between shadow-lg hover:bg-[#B52721] active:scale-[0.98] transition-all group"
                         disabled={isLoading}
                     >
                         <div className="flex items-center gap-3">
                              <span className="text-lg font-bold tracking-wide">Rs. {totalPrice.toFixed(2)}</span>
                         </div>
                         <div className="flex items-center gap-2 bg-white text-[#D12E27] px-4 py-2 rounded-xl font-bold text-sm group-hover:bg-red-50 transition-colors">
                              <ShoppingBag className="w-4 h-4" />
                              <span>{isLoading ? 'Loading...' : 'Add item to cart'}</span>
                         </div>
                     </button>
                </div>

            </div>
        </div>

        {/* Unavailability Options Modal */}
        {isUnavailabilityMenuOpen && (
            <div 
                className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" 
                onClick={() => setIsUnavailabilityMenuOpen(false)}
            >
                <div 
                    className="bg-white w-full max-w-[320px] rounded-[24px] p-6 shadow-2xl animate-in zoom-in-95 duration-200" 
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-[15px] font-bold text-gray-900 pr-5 leading-tight">If this product is not available</h3>
                        <button 
                            onClick={() => setIsUnavailabilityMenuOpen(false)} 
                            className="text-gray-400 hover:text-gray-600 p-1 -mt-1 -mr-2"
                        >
                            <X className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                    </div>
                    <div className="flex flex-col items-start gap-4">
                        {['Remove it from my order', 'Cancel the entire order.', 'Call Us'].map(option => (
                            <button
                                key={option}
                                onClick={() => {
                                    setUnavailabilityAction(option);
                                    setIsUnavailabilityMenuOpen(false);
                                }}
                                className={`text-left text-[14px] transition-colors ${unavailabilityAction === option ? 'text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}
        </>,
        document.body
    );
};
