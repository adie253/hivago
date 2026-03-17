import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useFilters } from '../context/FilterContext';

const categoriesData = [
    { name: 'All', icon: '🍽️' },
    { name: 'Burgers', icon: '🍔' },
    { name: 'Pizza', icon: '🍕' },
    { name: 'Sushi', icon: '🍣' },
    { name: 'Tacos', icon: '🌮' },
    { name: 'Salads', icon: '🥗' },
    { name: 'Ramen', icon: '🍜' },
    { name: 'Chicken', icon: '🍗' },
    { name: 'Desserts', icon: '🍰' },
    { name: 'Pasta', icon: '🍝' },
    { name: 'Sea Food', icon: '🦞' },
];

export const CategoryCarousel: React.FC = () => {
    const { activeCategory, setActiveCategory } = useFilters();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300; // Adjust scroll distance as needed
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="w-full flex items-center justify-start md:justify-center gap-2 md:gap-4 py-2 md:py-8 px-4 md:px-12 relative font-sans overflow-hidden">

            {/* Left Chevron - Hidden on Mobile */}
            <button
                onClick={() => scroll('left')}
                className="hidden md:block bg-red-50 text-[#FF4732] rounded-full p-2 hover:bg-red-100 transition-colors shadow-sm flex-shrink-0 z-10 "
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Categories */}
            <div
                ref={scrollContainerRef}
                className="flex gap-4 md:gap-6 overflow-x-auto pb-4 -mb-4 px-2 snap-x scroll-smooth no-scrollbar"
            >
                {categoriesData.map((cat, index) => {
                    const isActive = activeCategory === cat.name;
                    return (
                        <div
                            key={index}
                            onClick={() => setActiveCategory(cat.name)}
                            className={`flex flex-col items-center justify-center gap-1 md:gap-2 p-3 md:p-4 min-w-[68px] min-h-[68px] md:min-w-[100px] md:min-h-[100px] rounded-2xl mt-1 cursor-pointer transition-all snap-start flex-shrink-0 ${isActive
                                ? 'border-2 border-red-500 bg-red-50 shadow-md transform -translate-y-1'
                                : 'bg-gray-50 border border-transparent hover:bg-gray-100'
                                }`}
                        >
                            <span className="text-2xl md:text-3xl">{cat.icon}</span>
                            <span className={`font-semibold text-xs md:text-sm ${isActive ? 'text-red-700' : 'text-gray-600'}`}>
                                {cat.name}
                            </span> 
                        </div>
                    );
                })}
            </div>

            {/* Right Chevron - Hidden on Mobile */}
            <button
                onClick={() => scroll('right')}
                className="hidden md:block bg-red-50 text-[#FF4732] rounded-full p-2 hover:bg-red-100 transition-colors shadow-sm flex-shrink-0 z-10"
            >
                <ChevronRight className="w-5 h-5" />
            </button>

        </div>
    );
};
