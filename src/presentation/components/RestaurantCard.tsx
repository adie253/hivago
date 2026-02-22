import React from 'react';
import { Star, Clock, MapPin, Heart } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';

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
}

interface RestaurantCardProps {
    restaurant: Restaurant;
    onClick?: () => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onClick }) => {
    const { toggleFavorite, isFavorite } = useFavorites();
    const isFav = isFavorite(restaurant.id);

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-[24px] overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group flex flex-col h-full"
        >
            {/* Image Container */}
            <div className="relative w-full h-48 sm:h-56 bg-gray-200 overflow-hidden">
                <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                        {restaurant.promoted && (
                            <span className="bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded bg-opacity-80 uppercase tracking-widest w-max">
                                Promoted
                            </span>
                        )}
                        {restaurant.discount && (
                            <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded shadow-sm w-max">
                                {restaurant.discount}
                            </span>
                        )}
                    </div>

                    {/* Like Button */}
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(restaurant); }}
                        className={`bg-white rounded-full p-2 py-2 shadow-sm transition-colors ${isFav ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'}`}
                    >
                        <Heart className={`w-5 h-5 transition-transform ${isFav ? 'fill-current scale-110' : 'fill-transparent scale-100'}`} />
                    </button>
                </div>

                {/* Floating Rating Pill */}
                <div className="absolute bottom-4 right-4 bg-white px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                    <span className="font-bold text-sm text-gray-800">{restaurant.rating}</span>
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                </div>
            </div>

            {/* Content Container */}
            <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#FF4732] transition-colors truncate pr-2">
                        {restaurant.name}
                    </h3>
                </div>

                <p className="text-gray-500 text-sm mb-4 truncate">
                    {restaurant.cuisines.join(', ')}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600 space-x-2">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{restaurant.deliveryTime}</span>
                    </div>

                    <div className="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0"></div>

                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{restaurant.distance}</span>
                    </div>

                    <div className="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0 hidden min-[360px]:block"></div>

                    <div className="font-medium whitespace-nowrap hidden min-[360px]:block">
                        {restaurant.costForTwo} for two
                    </div>
                </div>
            </div>
        </div>
    );
};
