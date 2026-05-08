import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RestaurantGrid } from '../components/RestaurantGrid';
import { SearchBar } from '../components/SearchBar';
import { CategoryCarousel } from '../components/CategoryCarousel';
import { FilterChips } from '../components/FilterChips';
import { useFilters } from '../context/FilterContext';
import restaurantBanner from '../../assets/restaurant_page/restaurant_banner.svg';

export const RestaurantsPage: React.FC = () => {
    const navigate = useNavigate();
    const { filteredRestaurants, isLoading, error, refreshData } = useFilters();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-red-200 border-t-[#FF4732] rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-bold animate-pulse text-lg">Finding the best restaurants for you...</p>
            </div>
        );
    }

    if (error && filteredRestaurants.length === 0) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
                <div className="bg-red-50 p-8 rounded-3xl mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
                    <p className="text-gray-600 mb-6 max-w-sm">{error}</p>
                    <button
                        onClick={refreshData}
                        className="bg-[#FF4732] text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-lg"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans overflow-x-hidden p-0 ">
            <div className="w-full">
                <img 
                    src={restaurantBanner} 
                    alt="Discover 100+ Restaurants" 
                    className="w-full h-auto object-cover m-0 p-0"
                />
            </div>

            <div className="max-w-7xl mx-auto bg-white relative z-30 pt-6 pb-20">
                <SearchBar />
                <CategoryCarousel />
                <FilterChips />

                <div className="px-4 md:px-12 py-8 md:py-10">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">All Restaurants</h2>
                            <p className="text-gray-500 font-medium text-sm mt-1">
                                {error ? (
                                    <span className="text-amber-600">⚠ Showing offline data (Live API is currently unavailable)</span>
                                ) : (
                                    `Showing ${filteredRestaurants.length} results`
                                )}
                            </p>
                        </div>
                        {error && (
                            <button
                                onClick={refreshData}
                                className="text-[#FF4732] font-bold text-sm hover:underline"
                            >
                                Retry Sync
                            </button>
                        )}
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
