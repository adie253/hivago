import React, { useState, useEffect } from 'react';
import { getFallbackImage } from '../../utils/imageUtils';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, Mic, ArrowLeft, X, RotateCcw } from 'lucide-react';
import { useFilters } from '../context/FilterContext';
import DIContainer from '../../di/container';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { allRestaurants, searchQuery, setSearchQuery } = useFilters();
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleItemClick = (restaurantId: string, dishId?: string) => {
        setSearchQuery('');
        navigate(`/restaurant/${restaurantId}${dishId ? `?highlight=${dishId}` : ''}`);
        onClose();
    };

    const recentSearches = [
        'Biryani',
        'Cafe Good Luck',
        'Vohuman Cafe'
    ];

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        const timer = setTimeout(async () => {
            try {
                const query = searchQuery.toLowerCase();
                const searchResults: any[] = [];

                // 1. Search in Restaurants from local state (Fast)
                allRestaurants.forEach(restaurant => {
                    if (restaurant.name.toLowerCase().includes(query) ||
                        restaurant.cuisines.some(c => c.toLowerCase().includes(query))) {
                        searchResults.push({
                            id: restaurant.id,
                            name: restaurant.name,
                            type: 'Restaurant',
                            rating: restaurant.rating,
                            time: restaurant.deliveryTime,
                            image: restaurant.imageUrl
                        });
                    }
                });

                // 2. Search in Dishes via API
                const searchDishesUseCase = DIContainer.getSearchDishesUseCase();
                const apiDishes = await searchDishesUseCase.execute(query);

                apiDishes.forEach(item => {
                    const restaurantId = item.restaurantId || item.id;
                    // Only show dishes from restaurants within the 5km radius (present in allRestaurants)
                    const belongsToNearRestaurant = allRestaurants.some(r => r.id === restaurantId);
                    if (belongsToNearRestaurant) {
                        searchResults.push({
                            id: restaurantId,
                            dishId: item.id,
                            name: item.name,
                            type: 'Dish',
                            restaurantName: item.restaurantName || 'Restaurant',
                            image: (item.imageUrl && item.imageUrl !== 'null' && item.imageUrl !== 'undefined' && !item.imageUrl.includes('example.com'))
                                ? item.imageUrl
                                : getFallbackImage(item.name),
                            price: item.price
                        });
                    }
                });

                setResults(searchResults.slice(0, 15));
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, allRestaurants]);

    // Prevent body scroll when overlay is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col font-sans animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Top Navigation */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                <div className="flex items-center">
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors mr-2">
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <span className="text-gray-500 font-medium text-sm">Search for dishes & restaurants</span>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Search Input Area */}
            <div className="px-4 py-4">
                <div className="flex bg-white rounded-xl px-4 border border-gray-200 items-center h-12 shadow-sm focus-within:ring-2 focus-within:ring-[#FF4732] transition-shadow">
                    <Search className="text-[#FF4732] w-5 h-5 mr-3" />
                    <input
                        autoFocus
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Try Pizza"
                        className="bg-transparent border-none outline-none text-gray-700 w-full placeholder-gray-400 font-medium text-base h-full"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-gray-100 rounded-full transition-colors mr-2">
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    )}
                    <div className="border-l border-gray-300 h-6 mx-2" />
                    <Mic className="text-[#FF4732] w-5 h-5 cursor-pointer hover:scale-110 transition-transform" />
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-4 pb-8">
                {!searchQuery && (
                    <div className="mt-4">
                        <h3 className="text-xs font-bold text-gray-500 tracking-widest mb-4">RECENTLY SEARCHED RESTAURANTS</h3>
                        <div className="flex flex-wrap gap-3">
                            {recentSearches.map((term, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSearchQuery(term)}
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700">{term}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {searchQuery && results.length > 0 && (
                    <div className="mt-2 space-y-4">
                        {results.map((item) => (
                            <div
                                key={item.dishId ? `${item.id}-${item.dishId}` : item.id}
                                onClick={() => handleItemClick(item.id, item.dishId)}
                                className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-1 rounded-xl transition-colors"
                            >
                                <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="w-16 h-16 rounded-xl object-cover" 
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        if (!target.src.includes('fallback')) {
                                            target.src = getFallbackImage(item.name);
                                        }
                                    }}
                                />
                                <div className="flex flex-col flex-1">
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold text-gray-900">{item.name.split(new RegExp(`(${searchQuery})`, 'gi')).map((part: string, i: number) =>
                                            part.toLowerCase() === searchQuery.toLowerCase() ? <span key={i} className="text-gray-900">{part}</span> : <span key={i} className="text-gray-400">{part}</span>
                                        )}</span>
                                        {item.type === 'Restaurant' && <span className="text-gray-400 font-medium">House</span>}
                                    </div>
                                    <div className="text-xs text-gray-500 font-medium">
                                        {item.type} {item.restaurantName && `• ${item.restaurantName}`}
                                    </div>
                                    {item.type === 'Dish' && (
                                        <div className="text-sm font-bold text-gray-900 mt-1">₹{item.price}</div>
                                    )}
                                    {item.type === 'Restaurant' && item.rating && (
                                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500 font-medium">
                                            <span className="flex items-center gap-0.5 text-emerald-600">★ {item.rating}</span>
                                            <span>• {item.time}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {searchQuery && results.length === 0 && !isSearching && (
                    <div className="mt-20 flex flex-col items-center justify-center text-center">
                        <div className="relative w-48 h-48 mb-6">
                            {/* Mock Illustration */}
                            <div className="absolute inset-0 bg-[#EEF2FF] rounded-full" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative">
                                    <Search className="w-24 h-24 text-blue-500 opacity-20" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-4xl">🔎</span>
                                    </div>
                                </div>
                            </div>
                            {/* Floating elements to mimic mockup */}
                            <div className="absolute -left-4 top-1/2 w-8 h-8 bg-orange-100 rounded-lg transform rotate-12 flex items-center justify-center">☕</div>
                            <div className="absolute -right-2 top-1/3 w-6 h-6 bg-blue-100 rounded-full" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Search not found</h2>
                        <p className="text-gray-400 text-sm">Try again for better results</p>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};
