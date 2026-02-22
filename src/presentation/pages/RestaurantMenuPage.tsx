import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, ShieldCheck, Navigation } from 'lucide-react';
import { MenuItemCard, MenuItem } from '../components/MenuItemCard';
import { mockRestaurants } from '../../data/api/MockRestaurants';

const mockMenu: MenuItem[] = [
    {
        id: 'm1',
        name: 'Farmhouse Pizza',
        price: '₹349',
        isVeg: true,
        bestseller: true,
        description: 'A combination of onion, crisp capsicum, mushroom & fresh tomato.',
        imageUrl: '/card_food.png'
    },
    {
        id: 'm2',
        name: 'Spicy Chicken Burger',
        price: '₹199',
        isVeg: false,
        bestseller: true,
        description: 'Crispy fried chicken patty topped with jalapenos and spicy mayo.',
        imageUrl: '/card_food.png'
    },
    {
        id: 'm3',
        name: 'Margherita Pizza',
        price: '₹250',
        isVeg: true,
        bestseller: false,
        description: 'Classic cheese and tomato pizza.',
        imageUrl: '/card_food.png'
    }
];

export const RestaurantMenuPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery');

    const restaurant = mockRestaurants.find(r => r.id === id) || mockRestaurants[0];

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-32">
            {/* Header Container */}
            <div className="bg-white border-b border-gray-100 pb-6 relative z-10 shadow-sm overflow-hidden">

                {/* Top Cover Image and Info */}
                <div className="w-full flex justify-between items-stretch">

                    {/* Left Info Column */}
                    <div className="flex-1 px-4 sm:px-8 py-6 pt-8 flex flex-col justify-center max-w-2xl relative z-10">
                        <button
                            onClick={() => navigate(-1)}
                            className="mb-6 bg-gray-100 p-2.5 rounded-full w-max hover:bg-gray-200 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                            {restaurant.name}
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium">{restaurant.cuisines.join(', ')}</p>

                        {/* Delivery / Pickup Toggle */}
                        <div className="mt-8 flex bg-red-50 rounded-full w-max p-1 relative border border-red-100 shadow-inner">
                            <button
                                onClick={() => setDeliveryMode('delivery')}
                                className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold transition-colors ${deliveryMode === 'delivery' ? 'text-white' : 'text-red-400 hover:text-red-500'}`}
                            >
                                Delivery
                            </button>
                            <button
                                onClick={() => setDeliveryMode('pickup')}
                                className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold transition-colors ${deliveryMode === 'pickup' ? 'text-white' : 'text-red-400 hover:text-red-500'}`}
                            >
                                Pickup
                            </button>

                            {/* Animated Toggle Background */}
                            <div
                                className="absolute top-1 bottom-1 w-1/2 bg-[#FF4732] rounded-full transition-transform duration-300 shadow-md"
                                style={{ transform: `translateX(${deliveryMode === 'delivery' ? '0%' : '100%'})` }}
                            ></div>
                        </div>
                    </div>

                    {/* Right Header Image */}
                    <div className="hidden sm:block w-[40%] max-w-[500px] bg-gray-200 rounded-bl-[100px] overflow-hidden shadow-inner absolute right-0 top-0 bottom-0 h-full min-h-[250px]">
                        <img src={restaurant.imageUrl} alt="Cover" className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>

            {/* USP Section */}
            <div className="max-w-4xl mx-auto mt-8 px-4 flex justify-between gap-4 overflow-x-auto no-scrollbar pb-2">
                <div className="flex flex-col items-center bg-white border border-emerald-100 p-4 rounded-3xl shadow-sm min-w-[100px] flex-1">
                    <Clock className="w-8 h-8 text-emerald-500 mb-2" />
                    <span className="text-xs font-bold text-gray-700">Fast Delivery</span>
                </div>
                <div className="flex flex-col items-center bg-white border border-blue-100 p-4 rounded-3xl shadow-sm min-w-[100px] flex-1">
                    <ShieldCheck className="w-8 h-8 text-blue-500 mb-2" />
                    <span className="text-xs font-bold text-gray-700">Safe & Secure</span>
                </div>
                <div className="flex flex-col items-center bg-white border border-purple-100 p-4 rounded-3xl shadow-sm min-w-[100px] flex-1">
                    <Navigation className="w-8 h-8 text-purple-500 mb-2" />
                    <span className="text-xs font-bold text-gray-700">Live Tracking</span>
                </div>
            </div>

            {/* Categories Navigator */}
            <div className="max-w-4xl mx-auto mt-8 px-4 flex gap-3 overflow-x-auto no-scrollbar">
                <button className="bg-emerald-50 text-emerald-700 border-2 border-emerald-500 px-6 py-2 rounded-full font-bold whitespace-nowrap shadow-sm">
                    Recommended
                </button>
                <button className="bg-white text-gray-600 border border-gray-200 px-6 py-2 rounded-full font-bold whitespace-nowrap hover:bg-gray-50 transition">
                    Pizzas
                </button>
                <button className="bg-white text-gray-600 border border-gray-200 px-6 py-2 rounded-full font-bold whitespace-nowrap hover:bg-gray-50 transition">
                    Beverages
                </button>
            </div>

            {/* Menu List */}
            <div className="max-w-4xl mx-auto mt-6 px-4">
                {mockMenu.map(item => (
                    <MenuItemCard key={item.id} item={item} />
                ))}
            </div>

        </div>
    );
};
