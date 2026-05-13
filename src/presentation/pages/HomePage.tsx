import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from '../components/HeroSection';
import { SearchBar } from '../components/SearchBar';
import { CategoryCarousel } from '../components/CategoryCarousel';
import { FilterChips } from '../components/FilterChips';
import { RestaurantGrid } from '../components/RestaurantGrid';
import { RestaurantsNearby } from '../components/RestaurantsNearby';
import { DishesDiscount } from '../components/DishesDiscount';
import { RecommendedRestaurants } from '../components/RecommendedRestaurants';
import { OfferBanners } from '../components/OfferBanners';
import { PromoBanners } from '../components/PromoBanners';
import { DeliveryFeatures } from '../components/DeliveryFeatures';
import { useFilters } from '../context/FilterContext';

export const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const { allRestaurants, isLoading } = useFilters();

    return (
        <div className="min-h-screen bg-white font-sans">
            <HeroSection />

            <div className="max-w-7xl mx-auto bg-white rounded-t-3xl  relative z-30 shadow-sm border-t border-gray-100 pt-2 pb-20">
                <SearchBar />
                <CategoryCarousel />

                {/* Restaurants Grid Section */}
                <div className="px-4 md:px-12 py-1 md:py-10">
                    <div className="flex justify-between items-end mb-6">
                        <h2 className="text-2xl font-inter font-bold text-gray-900 tracking-tight">Popular Restaurants</h2>
                        <button onClick={() => navigate('/restaurants')} className="text-[#FF4732] font-bold text-sm flex items-center hover:underline">
                            View All <span className="ml-1">&gt;</span>
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="min-w-[280px] h-64 bg-gray-100 animate-pulse rounded-[24px]"></div>
                            ))}
                        </div>
                    ) : (
                        <RestaurantGrid
                            restaurants={allRestaurants.slice(0, 8)}
                            onRestaurantClick={(id) => navigate(`/restaurant/${id}`)}
                            scrollable={true}
                        />
                    )}
                </div>

                {/* Promo Banners Section */}
                {/* <PromoBanners /> */}

                <FilterChips />
                {/* Popular This Week Section */}
                <RestaurantsNearby />
                <DishesDiscount />
                <RecommendedRestaurants />
                {/* <OfferBanners /> */}
            </div>

            {/* Delivery Features Section - Full Width Dark Background */}
            <DeliveryFeatures />

        </div>
    );
};
