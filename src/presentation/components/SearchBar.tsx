import React, { useState } from 'react';
import { Search, Mic } from 'lucide-react';
import { VegSelectorModal } from './VegSelectorModal';
import { SearchOverlay } from './SearchOverlay';
import { useFilters } from '../context/FilterContext';

export const SearchBar: React.FC = () => {
    const { isVegOnly, setIsVegOnly } = useFilters();
    const [isVegSelectorOpen, setIsVegSelectorOpen] = useState(false);
    const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);

    const handleVegToggle = () => {
        if (!isVegOnly) {
            // Turning it ON triggers the detailed selector
            setIsVegSelectorOpen(true);
        } else {
            // Just turn it OFF
            setIsVegOnly(false);
        }
    };

    return (
        <div className="w-full flex justify-between items-center py-2 md:py-6 px-4 md:px-12 border-b border-gray-100 font-sans gap-2 md:gap-0 sticky top-[116px] sm:top-[60px] z-40 bg-white">

            {/* Search Input */}
            <div
                onClick={() => setIsSearchOverlayOpen(true)}
                className="flex bg-[#F3F4F6] rounded-lg px-3 md:px-4 border border-gray-100 items-center flex-1 max-w-[500px] h-10 md:h-12 shadow-sm focus-within:ring-2 focus-within:ring-[#FF4732] transition-shadow shrink cursor-pointer"
            >
                <Search className="text-[#FF4732] w-4 h-4 md:w-5 md:h-5 mx-1 md:mx-2 flex-shrink-0" />
                <input
                    type="text"
                    readOnly
                    placeholder="Search for food, restaurants..."
                    className="bg-transparent border-none outline-none text-gray-700 w-full placeholder-gray-400 font-medium ml-1 md:ml-2 text-sm md:text-base min-w-0 cursor-pointer"
                />
                <div className="border-l border-gray-300 h-5 md:h-6 mx-1 md:mx-2" />
                <Mic className="text-[#FF4732] w-4 h-4 md:w-5 md:h-5 mx-1 md:mx-2 cursor-pointer hover:scale-110 transition-transform flex-shrink-0" />
            </div>

            <SearchOverlay
                isOpen={isSearchOverlayOpen}
                onClose={() => setIsSearchOverlayOpen(false)}
            />

            {/* Veg / Non-veg Toggles */}
            <div className="flex flex-col items-center justify-center gap-1 md:gap-2 flex-shrink-0">
                <span className="text-gray-500 font-bold text-[10px] tracking-wider">VEG</span>
                <button
                    onClick={handleVegToggle}
                    className={`relative flex items-center rounded-full cursor-pointer w-10 md:w-12 h-5 md:h-6 transition-all duration-300 shadow-inner ${isVegOnly ? 'bg-emerald-500' : 'bg-gray-200'}`}
                >
                    <div className={`bg-white rounded-full w-4 h-4 md:w-5 md:h-5 shadow-md transform transition-transform duration-300 flex items-center justify-center ${isVegOnly ? 'translate-x-5 md:translate-x-6' : 'translate-x-1'}`}>
                        {isVegOnly && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    </div>
                </button>
            </div>

            <VegSelectorModal
                isOpen={isVegSelectorOpen}
                onClose={() => setIsVegSelectorOpen(false)}
                onApply={(type) => {
                    console.log('Search Bar Veg Filter Applied:', type);
                    setIsVegOnly(true);
                    setIsVegSelectorOpen(false);
                }}
            />

        </div>
    );
};
