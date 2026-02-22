import React, { useEffect, useRef } from 'react';
import { Restaurant, RestaurantCard } from './RestaurantCard';
import gsap from 'gsap';

interface RestaurantGridProps {
    restaurants: Restaurant[];
    onRestaurantClick?: (id: string) => void;
}

export const RestaurantGrid: React.FC<RestaurantGridProps> = ({ restaurants, onRestaurantClick }) => {
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (restaurants.length > 0 && gridRef.current) {
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
        >
            {restaurants.map((rest) => (
                <RestaurantCard
                    key={rest.id}
                    restaurant={rest}
                    onClick={() => onRestaurantClick && onRestaurantClick(rest.id)}
                />
            ))}
        </div>
    );
};
