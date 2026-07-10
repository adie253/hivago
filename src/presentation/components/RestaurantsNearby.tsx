import React, { useMemo } from 'react';
import { getFallbackImage } from '../../utils/imageUtils';
import { Clock, MapPin, Zap, ChevronRight } from 'lucide-react';
import { useFilters } from '../context/FilterContext';
import { useUserLocation } from '../context/LocationContext';
import { useNavigate } from 'react-router-dom';
import { haversineKm, formatDistance } from '../../utils/distanceUtils';

export const RestaurantsNearby: React.FC = () => {
    const { allRestaurants, isLoading } = useFilters();
    const { selectedLocation } = useUserLocation();
    const navigate = useNavigate();

    // Compute distance for each restaurant, then sort nearest first
    const sortedRestaurants = useMemo(() => {
        const userLat = selectedLocation?.latitude;
        const userLng = selectedLocation?.longitude;

        return [...allRestaurants]
            .map(r => {
                const distKm =
                    userLat != null && userLng != null && r.latitude != null && r.longitude != null
                        ? haversineKm(userLat, userLng, r.latitude, r.longitude)
                        : null;
                return { restaurant: r, distKm };
            })
            .sort((a, b) => {
                if (a.distKm == null && b.distKm == null) return 0;
                if (a.distKm == null) return 1;
                if (b.distKm == null) return -1;
                return a.distKm - b.distKm;
            });
    }, [allRestaurants, selectedLocation]);

    if (isLoading) return null;

    return (
        <div className="px-4 md:px-12 py-8 md:py-12 bg-white">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Restaurants Nearby</h2>
                </div>
                <button className="text-gray-900 hover:text-emerald-600 transition-colors p-2 bg-gray-50 rounded-full">
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Horizontal Scroll Container */}
            <div className="flex overflow-x-auto overflow-y-hidden gap-6 md:gap-8 pb-8 snap-x scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {sortedRestaurants.slice(0, 6).map(({ restaurant, distKm }) => (
                    <div
                        key={restaurant.id}
                        onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                        className="flex flex-col w-[280px] md:w-[320px] flex-shrink-0 bg-white rounded-[32px] p-3 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer snap-start"
                    >
                        {/* Image Container */}
                        <div className="relative aspect-[4/3] w-full bg-[#F5F5F5] rounded-[24px] overflow-hidden mb-4 flex items-center justify-center">
                            <img
                                src={restaurant.imageUrl}
                                alt={restaurant.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    if (!target.src.includes('fallback')) {
                                        target.src = getFallbackImage(restaurant.name, restaurant.cuisines[0], 'restaurant');
                                    }
                                }}
                            />



                            {restaurant.discount && (
                                <div className="absolute top-4 left-4">
                                    <span className="bg-blue-600 text-white text-[11px] font-bold px-3 py-1 rounded-lg shadow-md">
                                        {restaurant.discount}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="px-2 flex-1 flex flex-col">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-emerald-600 transition-colors">{restaurant.name}</h3>
                                <div className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 uppercase tracking-wider border border-emerald-100">
                                    <Zap className="w-3 h-3 fill-current" />
                                    Near & Fast
                                </div>
                            </div>

                            <p className="text-sm text-gray-500 mb-4 font-medium">
                                {restaurant.cuisines.slice(0, 2).join(', ')} Family Restaurant
                            </p>

                            <div className="mt-auto flex items-center justify-between text-[13px] text-gray-500 font-medium">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 opacity-70" />
                                    <span>{restaurant.deliveryTime}</span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 opacity-70" />
                                    <span>
                                        {distKm != null
                                            ? formatDistance(distKm)
                                            : restaurant.distance}
                                    </span>
                                </div>

                                <div className="text-gray-700 font-bold">
                                    ₹{restaurant.costForTwo.replace(/[^\d]/g, '')} for two
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
