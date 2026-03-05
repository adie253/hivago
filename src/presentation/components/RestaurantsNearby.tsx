import React from 'react';
import { Star, Clock, MapPin, Zap, ChevronRight } from 'lucide-react';
import { mockRestaurants } from '../../data/api/MockRestaurants';

export const RestaurantsNearby: React.FC = () => {
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
            <div className="flex overflow-x-auto gap-6 md:gap-8 pb-8 snap-x scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {mockRestaurants.map((restaurant) => (
                    <div
                        key={restaurant.id}
                        className="flex flex-col min-w-[280px] md:min-w-[320px] bg-white rounded-[32px] p-3 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer snap-start"
                    >
                        {/* Image Container - Light Gray Background */}
                        <div className="relative aspect-[4/3] w-full bg-[#F5F5F5] rounded-[24px] overflow-hidden mb-4 flex items-center justify-center">
                            <img
                                src={restaurant.imageUrl}
                                alt={restaurant.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />

                            {/* Bottom Left Rating Pill */}
                            <div className="absolute bottom-4 left-4 bg-white px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5">
                                <Star className="w-4 h-4 text-emerald-500 fill-current" />
                                <span className="text-sm font-bold text-gray-900">{restaurant.rating}</span>
                            </div>

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
                                    <span>{restaurant.distance}</span>
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
