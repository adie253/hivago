import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, SearchX } from 'lucide-react';
import { RestaurantGrid } from '../components/RestaurantGrid';
import { SearchBar } from '../components/SearchBar';
import { CategoryCarousel } from '../components/CategoryCarousel';
import { FilterChips } from '../components/FilterChips';
import { useFilters } from '../context/FilterContext';
import restaurantBanner from '../../assets/restaurant_page/restaurant_banner.svg';
import restaurantBannerMobile from '../../assets/restaurant_baaner_mobile.svg';
import { LocationRequiredModal } from '../components/LocationRequiredModal';

export const RestaurantsPage: React.FC = () => {
    const navigate = useNavigate();
    const { 
        filteredRestaurants, 
        totalCount, 
        currentPage, 
        setCurrentPage, 
        pageSize,
        isLoading, 
        error, 
        refreshData,
        isLocationRequired
    } = useFilters();

    const totalPages = Math.ceil(totalCount / pageSize);

    if (isLoading && filteredRestaurants.length === 0 && !isLocationRequired) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-red-200 border-t-brand-primary rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-bold animate-pulse text-lg">Finding the best restaurants for you...</p>
            </div>
        );
    }

    if (error && filteredRestaurants.length === 0) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
                <div className="bg-red-50 p-8 rounded-3xl mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
                    <p className="text-gray-600 mb-6 max-w-sm">{error.message || 'Failed to load restaurants'}</p>
                    <button
                        onClick={refreshData}
                        className="bg-brand-primary text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-lg"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans overflow-x-hidden p-0 relative">
            {isLocationRequired && <LocationRequiredModal />}

            <div className="w-full">
                {/* Desktop View Banner */}
                <img 
                    src={restaurantBanner} 
                    alt="Discover 100+ Restaurants" 
                    className="hidden sm:block w-full h-auto object-cover m-0 p-0"
                />
                {/* Mobile View Banner */}
                <img 
                    src={restaurantBannerMobile} 
                    alt="Discover 100+ Restaurants" 
                    className="block sm:hidden w-full h-auto object-cover m-0 p-0"
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
                                {totalCount === 0 && !isLoading ? (
                                    "No restaurants found matching your criteria"
                                ) : (
                                    `Showing ${filteredRestaurants.length} of ${totalCount} results`
                                )}
                            </p>
                        </div>
                    </div>

                    {filteredRestaurants.length === 0 && !isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center">
                            <div className="bg-gray-50 p-10 rounded-full mb-6">
                                <SearchX className="w-16 h-16 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                            <p className="text-gray-500 max-w-xs">We couldn't find any restaurants matching your filters. Try clearing some filters or searching for something else.</p>
                        </div>
                    ) : (
                        <>
                            <div className={isLoading ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>
                                <RestaurantGrid
                                    restaurants={filteredRestaurants}
                                    onRestaurantClick={(id) => navigate(`/restaurant/${id}`)}
                                />
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="mt-16 flex items-center justify-center gap-4">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1 || isLoading}
                                        className="p-3 rounded-xl border border-gray-200 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    
                                    <div className="flex items-center gap-2">
                                        {[...Array(totalPages)].map((_, i) => {
                                            const pageNum = i + 1;
                                            // Only show a few page numbers around current page
                                            if (
                                                pageNum === 1 || 
                                                pageNum === totalPages || 
                                                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                            ) {
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                                                            currentPage === pageNum 
                                                                ? 'bg-brand-primary text-white shadow-lg shadow-red-100' 
                                                                : 'text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            }
                                            if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                                return <span key={pageNum} className="text-gray-300">...</span>;
                                            }
                                            return null;
                                        })}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages || isLoading}
                                        className="p-3 rounded-xl border border-gray-200 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
