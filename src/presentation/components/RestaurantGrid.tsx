import React, { useEffect, useRef } from 'react';
import { Restaurant, RestaurantCard } from './RestaurantCard';
import gsap from 'gsap';

interface RestaurantGridProps {
    restaurants: Restaurant[];
    onRestaurantClick?: (id: string) => void;
    scrollable?: boolean;
}

export const RestaurantGrid: React.FC<RestaurantGridProps> = ({
    restaurants,
    onRestaurantClick,
    scrollable = false
}) => {
    const prevIdsRef = useRef<string>("");
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const currentIds = restaurants.map(r => r.id).join(',');
        if (restaurants.length > 0 && gridRef.current && prevIdsRef.current !== currentIds) {
            prevIdsRef.current = currentIds;
            gsap.fromTo(
                gridRef.current.children,
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'back.out(1.2)', clearProps: 'all' }
            );
        }
    }, [restaurants]);

    if (restaurants.length === 0) {
        return (
            <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-3xl border border-gray-100">
                No restaurants found nearby.
            </div>
        );
    }

    return (
        <div
            ref={gridRef}
            className={
                scrollable
                    ? "flex overflow-x-auto pb-6 gap-6 md:gap-8 snap-x scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-1"
                    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
            }
        >
            {restaurants.map((rest) => (
                <div
                    key={rest.id}
                    className={scrollable ? "flex-shrink-0 w-[280px] sm:w-[320px] snap-start" : ""}
                >
                    <RestaurantCard
                        restaurant={rest}
                        onClick={() => onRestaurantClick && onRestaurantClick(rest.id)}
                    />
                </div>
            ))}
        </div>
    );
};
