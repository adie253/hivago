import React from 'react';
import { Search, Mic } from 'lucide-react';

export const SearchBar: React.FC = () => {
    return (
        <div className="w-full flex justify-between items-center py-4 md:py-6 px-4 md:px-12 border-b border-gray-100 font-sans gap-4 md:gap-0">

            {/* Search Input */}
            <div className="flex bg-gray-50 rounded-full px-3 md:px-4 border border-gray-100 items-center flex-1 max-w-[500px] h-10 md:h-12 shadow-sm focus-within:ring-2 focus-within:ring-[#FF4732] transition-shadow shrink">
                <Search className="text-gray-400 w-4 h-4 md:w-5 md:h-5 mx-1 md:mx-2 flex-shrink-0" />
                <input
                    type="text"
                    placeholder="Restaurants, dishes..."
                    className="bg-transparent border-none outline-none text-gray-700 w-full placeholder-gray-400 font-medium ml-1 md:ml-2 text-sm md:text-base min-w-0"
                />
                <div className="border-l border-gray-300 h-5 md:h-6 mx-1 md:mx-2"></div>
                <Mic className="text-[#FF4732] w-4 h-4 md:w-5 md:h-5 mx-1 md:mx-2 cursor-pointer hover:scale-110 transition-transform flex-shrink-0" />
            </div>

            {/* Veg / Non-veg Toggles */}
            <div className="flex gap-2 md:gap-4 flex-shrink-0">
                {/* Veg Toggle */}
                <div className="flex items-center bg-gray-100 rounded-full p-1 cursor-pointer w-12 md:w-16 shadow-inner justify-start">
                    <div className="bg-white rounded-full w-5 h-5 md:w-6 md:h-6 shadow flex items-center justify-center">
                        <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-emerald-600 rounded-sm"></div>
                    </div>
                </div>

                {/* Non-Veg Toggle */}
                <div className="flex items-center bg-gray-100 rounded-full p-1 cursor-pointer w-12 md:w-16 shadow-inner relative justify-start">
                    <div className="bg-white rounded-full w-5 h-5 md:w-6 md:h-6 shadow flex items-center justify-center absolute left-1 border border-red-500">
                        <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] md:border-l-[5px] md:border-r-[5px] md:border-b-[8px] border-l-transparent border-r-transparent border-b-red-600"></div>
                    </div>
                </div>
            </div>

        </div>
    );
};
