import React from 'react';
import { Star, Clock, MapPin, Heart, Zap } from 'lucide-react';
import { mockRestaurants } from '../../data/api/MockRestaurants';
import { useFavorites } from '../context/FavoritesContext';

export const RecommendedRestaurants: React.FC = () => {
    const { toggleFavorite, isFavorite } = useFavorites();

    return (
        <div className="px-4 md:px-12 py-8 md:py-12 bg-white">
            <h2 className="text-3xl font-inter font-bold     text-gray-900 tracking-tight mb-8">Recommended</h2>

            <div className="flex overflow-x-auto gap-6 md:gap-8 pb-8 snap-x scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {mockRestaurants.map((restaurant) => {
                    const isFav = isFavorite(restaurant.id);
                    return (
                        <div
                            key={restaurant.id}
                            className="flex flex-col min-w-[280px] md:min-w-[340px] bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer snap-start"
                        >
                            {/* Image Container */}
                            <div className="relative h-48 md:h-56 w-full overflow-hidden">
                                <img
                                    src={restaurant.imageUrl}
                                    alt={restaurant.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />

                                {/* Overlay Badges */}
                                {restaurant.promoted && (
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-[#FFC107] text-gray-900 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
                                            Promoted
                                        </span>
                                    </div>
                                )}

                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(restaurant); }}
                                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                                </button>

                                <div className="absolute bottom-4 left-4 bg-white px-2.5 py-1.5 rounded-xl shadow-md flex items-center gap-1.5">
                                    <Star className="w-4 h-4 text-emerald-500 fill-current" />
                                    <span className="text-sm font-bold text-gray-900">{restaurant.rating}</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 flex flex-col flex-1">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{restaurant.name}</h3>
                                    <div className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 uppercase tracking-wider border border-emerald-100">
                                        <Zap className="w-3 h-3 fill-current" />
                                        Near & Fast
                                    </div>
                                </div>

                                <p className="text-gray-500 text-sm mb-4 line-clamp-1">
                                    {restaurant.cuisines.join(', ')}
                                </p>

                                <div className="mt-auto flex items-center justify-between text-[13px] text-gray-500 font-medium">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 opacity-70" />
                                        <span>{restaurant.deliveryTime}</span>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 opacity-70" />
                                        <span>{restaurant.distance}</span>
                                    </div>

                                    <div className="text-gray-700 font-bold whitespace-nowrap">
                                        ₹{restaurant.costForTwo.replace(/[^\d]/g, '')} for two
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
