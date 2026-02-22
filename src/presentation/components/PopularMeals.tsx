import React from 'react';
import { Star, Plus } from 'lucide-react';

interface Meal {
    id: string;
    name: string;
    restaurant: string;
    price: string;
    rating: number;
    imageUrl: string;
    calories: string;
}

const mockMeals: Meal[] = [
    {
        id: 'm1',
        name: 'Truffle Mushroom Burger',
        restaurant: 'Burger King',
        price: '₹249',
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400',
        calories: '450 kcal'
    },
    {
        id: 'm2',
        name: 'Spicy Pepperoni Pizza',
        restaurant: 'Pizza Hut',
        price: '₹399',
        rating: 4.6,
        imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=400',
        calories: '600 kcal'
    },
    {
        id: 'm3',
        name: 'Dragon Sushi Roll',
        restaurant: 'Sushi Daily',
        price: '₹450',
        rating: 4.9,
        imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=400',
        calories: '320 kcal'
    },
    {
        id: 'm4',
        name: 'Grilled Salmon Bowl',
        restaurant: 'Health Freak',
        price: '₹350',
        rating: 4.7,
        imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=400',
        calories: '410 kcal'
    }
];

export const PopularMeals: React.FC = () => {
    return (
        <div className="px-4 md:px-12 py-8 md:py-10 bg-gray-50 border-t border-gray-100">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Popular this week</h2>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Top meals ordered in your area</p>
                </div>
                <button className="text-[#FF4732] font-bold text-sm flex items-center hover:underline">
                    View All <span className="ml-1">&gt;</span>
                </button>
            </div>

            {/* Horizontal Scroll Container */}
            <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 px-1.5 -mx-1.5 snap-x scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {mockMeals.map((meal) => (
                    <div
                        key={meal.id}
                        className="flex flex-col min-w-[240px] md:min-w-[280px] bg-white rounded-3xl p-3 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer snap-start"
                    >
                        {/* Image Container */}
                        <div className="relative h-40 w-full rounded-2xl overflow-hidden mb-4">
                            <img src={meal.imageUrl} alt={meal.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur leading-none px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                                <Star className="w-3 h-3 text-emerald-500 fill-current" />
                                <span className="text-xs font-bold text-gray-800">{meal.rating}</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-1 flex-1 flex flex-col justify-between">
                            <div>
                                <p className="text-xs font-bold text-[#FF4732] uppercase tracking-wider mb-1">{meal.restaurant}</p>
                                <h3 className="text-base md:text-lg font-bold text-gray-900 leading-tight mb-2 line-clamp-1">{meal.name}</h3>
                                <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-md">{meal.calories}</span>
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
                                <span className="text-lg font-black text-gray-900">{meal.price}</span>
                                <button className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-[#FF4732] transition-colors shadow-sm">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
