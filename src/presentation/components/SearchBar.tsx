import React, { useState } from 'react';
import { Search, Mic } from 'lucide-react';

export const SearchBar: React.FC = () => {
    const [isVegOnly, setIsVegOnly] = useState(false);

    return (
        <div className="w-full flex justify-between items-center py-2 md:py-6 px-4 md:px-12 border-b border-gray-100 font-sans gap-2 md:gap-0 sticky top-[119px] sm:top-[82px] z-40 bg-white">

            {/* Search Input */}
            <div className="flex bg-[#F3F4F6] rounded-lg px-3 md:px-4 border border-gray-100 items-center flex-1 max-w-[500px] h-10 md:h-12 shadow-sm focus-within:ring-2 focus-within:ring-[#FF4732] transition-shadow shrink">
                <Search className="text-[#FF4732] w-4 h-4 md:w-5 md:h-5 mx-1 md:mx-2 flex-shrink-0" />
                <div className="border-l border-gray-300 h-5 md:h-6 mx-1 md:mx-2"></div>
                <Mic className="text-[#FF4732] w-4 h-4 md:w-5 md:h-5 mx-1 md:mx-2 cursor-pointer hover:scale-110 transition-transform flex-shrink-0" />
                <input
                    type="text"
                    placeholder="Restaurants, dishes..."
                    className="bg-[#F3F4F6] border-none outline-none text-gray-700 w-full placeholder-gray-400 font-medium ml-1 md:ml-2 text-sm md:text-base min-w-0"
                />
            </div>

            {/* Veg / Non-veg Toggles */}
            <div className="flex flex-col items-center justify-center gap-1 md:gap-4 flex-shrink-0">
                {/* Veg Toggle */}
                <span className="text-gray-600 font-bold text-[10px]">VEG</span>
                <div
                    onClick={() => setIsVegOnly(!isVegOnly)}
                    className={`flex items-center rounded-full p-1 cursor-pointer w-10 md:w-14 h-6 md:h-8 transition-colors duration-300 ${isVegOnly ? 'bg-emerald-500' : 'bg-gray-200'}`}
                >
                    <div className={`bg-white rounded-full w-4 h-4 md:w-6 md:h-6 shadow transform transition-transform duration-300 ${isVegOnly ? 'translate-x-4 md:translate-x-6' : 'translate-x-0'}`}>
                    </div>
                </div>
            </div>

        </div>
    );
};
