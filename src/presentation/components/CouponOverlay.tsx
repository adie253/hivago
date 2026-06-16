import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Ticket, HelpCircle, Plus } from 'lucide-react';

interface CouponOverlayProps {
    onClose: () => void;
}

export const CouponOverlay: React.FC<CouponOverlayProps> = ({ onClose }) => {
    const [selectedOffers, setSelectedOffers] = useState<Set<string>>(new Set());

    useEffect(() => {
        (window as any).__activeModalsCount = ((window as any).__activeModalsCount || 0) + 1;
        document.body.style.overflow = 'hidden';
        return () => {
            (window as any).__activeModalsCount = Math.max(0, ((window as any).__activeModalsCount || 0) - 1);
            if (((window as any).__activeModalsCount) === 0) {
                document.body.style.overflow = 'unset';
            }
        };
    }, []);

    const toggleOffer = (id: string) => {
        const newSet = new Set(selectedOffers);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedOffers(newSet);
    };

    const renderOfferCard = (id: string, title: string) => {
        const isSelected = selectedOffers.has(id);
        return (
            <div 
                key={id} 
                className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center justify-between mb-3 cursor-pointer"
                onClick={() => toggleOffer(id)}
            >
                <div className="flex items-center gap-3">
                    <div className="bg-[#FFF4E5] p-2 rounded-lg text-[#F7A626]">
                        <Ticket className="w-5 h-5 fill-current" />
                    </div>
                    <span className="font-bold text-[16px] text-gray-900">{title}</span>
                    <HelpCircle className="w-4 h-4 text-gray-300 fill-gray-300 stroke-white" />
                </div>
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-[#FF4732] bg-[#FF4732]' : 'border-gray-200'}`}>
                    {isSelected && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
            </div>
        );
    };

    return createPortal(
        <div 
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:p-6 transition-opacity"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-[#F8FAFC] w-full max-w-md sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] min-h-[80vh] animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-5 duration-300 relative">
                
                {/* Drag handle for bottom sheet feel */}
                <div className="w-full flex justify-center pt-3 pb-2 bg-white sm:hidden sticky top-0 z-10 rounded-t-3xl">
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar bg-[#F8FAFC] p-4 sm:p-5 pb-8 border-t border-gray-100">
                    
                    {/* Promo Code Input */}
                    <form 
                        onSubmit={(e) => {
                            e.preventDefault();
                            onClose();
                        }}
                        className="bg-white rounded-2xl p-1 shadow-sm border border-gray-100 flex items-center mb-6"
                    >
                        <input 
                            type="text" 
                            placeholder="Promo Code" 
                            className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-[15px] placeholder-gray-400 font-medium text-gray-800"
                        />
                        <button type="submit" className="text-[#FF4732] font-bold px-5 py-3">
                            Apply
                        </button>
                    </form>

                    <h3 className="text-gray-600 text-[15px] font-medium mb-3 px-1">Offers</h3>
                    {renderOfferCard('free-delivery', 'FREE Delivery')}
                    {renderOfferCard('20-off-1', '20% OFF')}

                    <h3 className="text-gray-600 text-[15px] font-medium mb-3 mt-5 px-1">Order Offers</h3>
                    {renderOfferCard('20-off-2', '20% OFF')}
                    {renderOfferCard('10-off', '10% OFF')}

                    {/* See More button */}
                    <button className="w-full bg-[#FFEFEF] text-[#FF4732] rounded-2xl py-4 flex items-center justify-center gap-2 font-bold mt-2 transition-colors active:scale-[0.98]">
                        <Plus className="w-5 h-5" strokeWidth={2.5} />
                        See More Offers
                    </button>
                </div>

                {/* Bottom Apply Button */}
                <div className="bg-white p-4 border-t border-gray-100 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] pb-safe sm:pb-4">
                    <button
                        onClick={onClose}
                        className="w-full bg-[#FF584A] text-white font-bold text-[17px] py-[16px] rounded-xl shadow-md hover:bg-[#E5483B] transition-colors active:scale-[0.98]"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
