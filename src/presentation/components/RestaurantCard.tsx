import React from 'react';
import { getFallbackImage } from '../../utils/imageUtils';
import { Clock, MapPin, Heart } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { useUserLocation } from '../context/LocationContext';
import { haversineKm, formatDistance } from '../../utils/distanceUtils';

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
    acceptsPickup?: boolean;
    latitude?: number;
    longitude?: number;
}

interface RestaurantCardProps {
    restaurant: Restaurant;
    onClick?: () => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onClick }) => {
    const { toggleFavorite, isFavorite } = useFavorites();
    const { selectedLocation } = useUserLocation();
    const isFav = isFavorite(restaurant.id);

    const displayDistance = (() => {
        const uLat = selectedLocation?.latitude;
        const uLng = selectedLocation?.longitude;
        if (uLat != null && uLng != null && restaurant.latitude != null && restaurant.longitude != null) {
            return formatDistance(haversineKm(uLat, uLng, restaurant.latitude, restaurant.longitude));
        }
        return restaurant.distance;
    })();

    return (
        <div
            onClick={onClick}
            className="bg-white shadow-sm rounded-[24px] overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group flex flex-col h-full"
        >
            {/* Image Container */}
            <div className="relative w-full h-[160px] sm:h-36 bg-gray-200 overflow-hidden">
                <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes('fallback')) {
                            target.src = getFallbackImage(restaurant.name, restaurant.cuisines[0], 'restaurant');
                        }
                    }}
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
                        {restaurant.acceptsPickup && (
                            <span className="bg-white text-[#FF4732] text-[10px] font-extrabold px-2 py-1 rounded shadow-sm w-max uppercase border border-red-50">
                                Pickup Available
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

                <div className="mt-auto flex items-center justify-between text-xs text-gray-600 space-x-2">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{restaurant.deliveryTime}</span>
                    </div>

                    <div className="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0"></div>

                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{displayDistance}</span>
                    </div>

                    <div className="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0 hidden min-[360px]:block"></div>

                    <div className="font-medium whitespace-nowrap hidden min-[360px]:block">
                        {restaurant.costForTwo?.replace(/Rs\.?/i, '₹')} for two
                    </div>
                </div>
            </div>
        </div>
    );
};
