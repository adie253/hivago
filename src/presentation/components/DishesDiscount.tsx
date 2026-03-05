import React from 'react';
import { Clock, MapPin, Tag, ChevronRight, Percent } from 'lucide-react';

interface DiscountedDish {
    id: string;
    name: string;
    restaurant: string;
    originalPrice: number;
    discountedPrice: number;
    discount: string;
    deliveryTime: string;
    distance: string;
    priceForTwo: string;
    imageUrl: string;
}

const mockDiscountedDishes: DiscountedDish[] = [
    {
        id: 'dd1',
        name: 'Power Bowl',
        restaurant: 'Green Garden',
        originalPrice: 300,
        discountedPrice: 150,
        discount: '50% off',
        deliveryTime: '20-25 min',
        distance: '0.8 km',
        priceForTwo: '₹300 for two',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: 'dd2',
        name: 'Margherita Pizza',
        restaurant: 'Pizza Paradise',
        originalPrice: 500,
        discountedPrice: 400,
        discount: '20% off',
        deliveryTime: '20-25 min',
        distance: '0.8 km',
        priceForTwo: '₹400 for two',
        imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: 'dd3',
        name: 'Avocado Toast',
        restaurant: 'Health Haven',
        originalPrice: 250,
        discountedPrice: 125,
        discount: '50% off',
        deliveryTime: '15-20 min',
        distance: '1.2 km',
        priceForTwo: '₹250 for two',
        imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: 'dd4',
        name: 'Grilled Chicken',
        restaurant: 'Protein Plus',
        originalPrice: 450,
        discountedPrice: 225,
        discount: '50% off',
        deliveryTime: '25-30 min',
        distance: '2.5 km',
        priceForTwo: '₹450 for two',
        imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&q=80&w=400'
    }
];

export const DishesDiscount: React.FC = () => {
    return (
        <div className="px-4 md:px-12 py-8 md:py-12 bg-white">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Dishes up to 50% off</h2>
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 shadow-sm border border-red-200">
                        <Percent className="w-5 h-5" strokeWidth={3} />
                    </div>
                </div>
                <button className="text-gray-900 hover:text-emerald-600 transition-colors p-2 bg-gray-50 rounded-full">
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 snap-x scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {mockDiscountedDishes.map((dish) => (
                    <div
                        key={dish.id}
                        className="flex flex-col min-w-[220px] md:min-w-[260px] bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer snap-start"
                    >
                        {/* Image Container */}
                        <div className="relative h-32 md:h-36 w-full overflow-hidden">
                            <img
                                src={dish.imageUrl}
                                alt={dish.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>

                        {/* Content */}
                        <div className="p-4 flex flex-col flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-0.5 group-hover:text-emerald-600 transition-colors truncate">{dish.name}</h3>
                            <p className="text-gray-400 text-xs mb-3 font-medium truncate">{dish.restaurant}</p>

                            <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium mb-4">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{dish.deliveryTime}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>{dish.distance}</span>
                                </div>
                            </div>

                            <div className="mt-auto pt-3 border-t border-gray-50 flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-base font-bold text-emerald-600">Rs.{dish.discountedPrice.toFixed(0)}</span>
                                    <span className="text-[11px] text-gray-400 line-through">Rs.{dish.originalPrice.toFixed(0)}</span>
                                </div>

                                <div className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm border border-emerald-50">
                                    <Tag className="w-3 h-3 fill-current" />
                                    {dish.discount}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
