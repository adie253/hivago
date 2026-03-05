import React, { createContext, useContext, useState, useEffect } from 'react';
import restaurantsData from '../../data/restaurants.json';

export interface FoodItem {
    id: string;
    name: string;
    type: 'Veg' | 'Non-Veg';
    price: number;
    category: string;
}

export interface Restaurant {
    id: string;
    name: string;
    cuisines: string[];
    rating: number;
    deliveryTime: string;
    distance: string;
    costForTwo: string;
    imageUrl: string;
    promoted?: boolean;
    discount?: string;
    isVeg: boolean;
    categories: string[];
    menu: FoodItem[];
}

interface FilterContextType {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    activeCategory: string;
    setActiveCategory: (category: string) => void;
    isVegOnly: boolean;
    setIsVegOnly: (value: boolean) => void;
    minRating: number;
    setMinRating: (rating: number) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
    filteredRestaurants: Restaurant[];
    allRestaurants: Restaurant[];
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const allRestaurants: Restaurant[] = restaurantsData.restaurants as Restaurant[];
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [isVegOnly, setIsVegOnly] = useState(false);
    const [minRating, setMinRating] = useState(0);
    const [sortBy, setSortBy] = useState('Relevance');
    const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(allRestaurants);

    useEffect(() => {
        let results = [...allRestaurants];

        // Apply Veg Only filter
        if (isVegOnly) {
            results = results.filter(r => r.isVeg);
        }

        // Apply Rating filter
        if (minRating > 0) {
            results = results.filter(r => r.rating >= minRating);
        }

        // Apply Category filter
        if (activeCategory !== 'All') {
            results = results.filter(r => r.categories.includes(activeCategory));
        }

        // Apply Search query
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            results = results.filter(r =>
                r.name.toLowerCase().includes(query) ||
                r.cuisines.some(c => c.toLowerCase().includes(query)) ||
                r.menu.some(m => m.name.toLowerCase().includes(query))
            );
        }

        // Apply Sorting
        if (sortBy === 'Low to high') {
            results.sort((a, b) => {
                const priceA = parseInt(a.costForTwo.replace(/[^\d]/g, ''));
                const priceB = parseInt(b.costForTwo.replace(/[^\d]/g, ''));
                return priceA - priceB;
            });
        } else if (sortBy === 'High to low') {
            results.sort((a, b) => {
                const priceA = parseInt(a.costForTwo.replace(/[^\d]/g, ''));
                const priceB = parseInt(b.costForTwo.replace(/[^\d]/g, ''));
                return priceB - priceA;
            });
        } else if (sortBy === 'Rating') {
            results.sort((a, b) => b.rating - a.rating);
        }

        setFilteredRestaurants(results);
    }, [searchQuery, activeCategory, isVegOnly, minRating, sortBy, allRestaurants]);

    return (
        <FilterContext.Provider value={{
            searchQuery,
            setSearchQuery,
            activeCategory,
            setActiveCategory,
            isVegOnly,
            setIsVegOnly,
            minRating,
            setMinRating,
            sortBy,
            setSortBy,
            filteredRestaurants,
            allRestaurants
        }}>
            {children}
        </FilterContext.Provider>
    );
};

export const useFilters = () => {
    const context = useContext(FilterContext);
    if (!context) {
        throw new Error('useFilters must be used within a FilterProvider');
    }
    return context;
};
