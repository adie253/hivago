import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RestaurantGrid } from '../components/RestaurantGrid';
import { SearchBar } from '../components/SearchBar';
import { CategoryCarousel } from '../components/CategoryCarousel';
import { FilterChips } from '../components/FilterChips';
import { useFilters } from '../context/FilterContext';

export const RestaurantsPage: React.FC = () => {
    const navigate = useNavigate();
    const { filteredRestaurants } = useFilters();

    return (
        <div className="min-h-screen bg-white font-sans">
            <div className="bg-[#FF4732] w-full pt-8 pb-16 px-6 md:px-12 lg:px-24 shadow-sm relative">
                <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
                    <h1 className="text-white font-extrabold text-3xl md:text-5xl leading-tight mb-4 drop-shadow-md">
                        Discover 100+ Restaurants
                    </h1>
                    <p className="text-red-100 font-medium text-sm md:text-base max-w-md">
                        Explore the best food spots near you with exclusive offers and quick delivery.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto bg-white relative z-30 pt-2 pb-20">
                <SearchBar />
                <CategoryCarousel />
                <FilterChips />

                <div className="px-4 md:px-12 py-8 md:py-10">``
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">All Restaurants</h2>
                            <p className="text-gray-500 font-medium text-sm mt-1">Showing {filteredRestaurants.length} results</p>
                        </div>
                    </div>

                    <RestaurantGrid
                        restaurants={filteredRestaurants}
                        onRestaurantClick={(id) => navigate(`/restaurant/${id}`)}
                    />
                </div>
            </div>
        </div>
    );
};
