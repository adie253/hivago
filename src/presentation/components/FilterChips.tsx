import React, { useState } from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { FilterModal } from './FilterModal';

const filters = [
    { name: 'Pickup', active: false },
    { name: 'Popular', active: false },
    { name: 'High Protein', active: false },
    { name: 'Under 30 Mins', active: false },
    { name: 'Cost for Two', active: false },
    { name: 'Open Now', active: false },
    { name: 'Newly Added', active: false },
    { name: 'Pro', active: false },
];

export const FilterChips: React.FC = () => {
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    return (
        <>
            <div className="w-full flex items-center gap-3 md:gap-4 px-4 md:px-12 pb-6 md:pb-8 border-b border-gray-100 font-sans overflow-x-auto no-scrollbar">

                {/* Filter Icon button */}
                <button
                    onClick={() => setIsFilterModalOpen(true)}
                    className="bg-[#FF4732] text-white p-2.5 md:p-3 rounded-xl shadow hover:bg-orange-700 transition-colors flex-shrink-0"
                >
                    <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5" />
                </button>

                {/* Sort By Dropdown */}
                <button className="border border-gray-300 text-gray-700 px-3 py-1.5 md:px-4 md:py-2 rounded-full font-medium text-xs md:text-sm flex items-center gap-1.5 md:gap-2 hover:bg-gray-50 transition-colors flex-shrink-0">
                    Sort By
                    <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
                </button>

                {/* Other chips */}
                <div className="flex gap-2 md:gap-3 flex-shrink-0 pr-4">
                    {filters.map((filter, idx) => (
                        <button
                            key={idx}
                            className="border border-gray-300 text-gray-700 px-3 py-1.5 md:px-4 md:py-2 rounded-full font-medium text-xs md:text-sm hover:bg-gray-50 transition-colors whitespace-nowrap"
                        >
                            {filter.name}
                        </button>
                    ))}
                </div>
            </div>

            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
            />
        </>
    );
};
