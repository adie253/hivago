import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Star, Search, Mic, Heart, Bike, User } from 'lucide-react';
import { MenuItemCard, MenuItem } from '../components/MenuItemCard';
import { useFilters, Restaurant } from '../context/FilterContext';
import DIContainer from '../../di/container';
import deliveryBoy from '../../assets/delivery_pickup/delivery.svg';
import pickupBoy from '../../assets/delivery_pickup/pickup.svg';

export const RestaurantMenuPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isLoading: filtersLoading } = useFilters();

    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [isLocalLoading, setIsLocalLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery');

    useEffect(() => {
        const fetchRestaurant = async () => {
            if (!id) return;
            setIsLocalLoading(true);
            try {
                const useCase = DIContainer.getGetRestaurantUseCase();
                const data = await useCase.execute(id);
                setRestaurant(data);
            } catch (error) {
                console.error("Failed to fetch restaurant menu:", error);
            } finally {
                setIsLocalLoading(false);
            }
        };

        fetchRestaurant();
    }, [id]);

    const categories = restaurant
        ? ['All', ...Array.from(new Set(restaurant.menu.map(item => item.category)))]
        : ['All'];

    useEffect(() => {
        if (restaurant && categories.length > 0 && !categories.includes(activeTab)) {
            setActiveTab('All');
        }
    }, [categories, activeTab, restaurant]);

    if (isLocalLoading || (filtersLoading && !restaurant)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white font-sans">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#FF4732] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-bold animate-pulse">Fetching delicious menu...</p>
                </div>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white font-sans gap-6 text-center px-6">
                <div className="text-6xl">🥘</div>
                <h2 className="text-2xl font-black text-gray-900">Restaurant Not Found</h2>
                <p className="text-gray-500 max-w-xs">We couldn't find the restaurant you're looking for. It might be closed or doesn't exist.</p>
                <button
                    onClick={() => navigate('/restaurants')}
                    className="bg-[#FF4732] text-white px-8 py-3 rounded-full font-black shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                    Back to Restaurants
                </button>
            </div>
        );
    }

    const filteredMenu = activeTab === 'All'
        ? restaurant.menu
        : restaurant.menu.filter(item => item.category === activeTab);

    const menuItems: MenuItem[] = filteredMenu.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        isVeg: item.type === 'Veg',
        bestseller: false, // API doesn't return this yet
        description: item.description || '',
        imageUrl: item.imageUrl || ''
    }));

    return (
        <div className="min-h-screen bg-white font-sans pb-20">
            {/* Top Header - Image with Overlays - Slightly shorter for mobile */}
            <div className="relative w-full h-72 md:h-80 overflow-hidden rounded-b-[32px] md:rounded-b-[40px] shadow-sm">
                <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                />

                {/* Back and Favorite Buttons - More compact */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 text-gray-800" />
                    </button>
                    <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors">
                        <Heart className="w-4 h-4 text-gray-800" />
                    </button>
                </div>
            </div>

            {/* Restaurant Info Card - Floating - More compact text */}
            <div className="max-w-[calc(100%-40px)] mx-auto relative z-20 mt-[-100px]">
                <div className="bg-white rounded-[28px] p-5 shadow-xl border border-gray-100 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">
                                {restaurant.name}
                            </h1>
                            <p className="text-gray-400 font-bold text-[10px] md:text-xs uppercase tracking-wider mt-0.5">
                                Family Restaurant
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 mt-0.5">
                        <div className="flex items-center gap-1.5 text-gray-400">
                            <Star className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                            <span className="text-[11px] md:text-xs font-black text-gray-900">{restaurant.rating}</span>
                            <span className="text-[9px] md:text-[10px] font-bold text-gray-300">200+ ratings</span>
                        </div>
                    </div>

                    {/* Delivery Status Card - Switchable */}
                    <div className="mt-3 p-2 bg-[#CE181B]   rounded-[20px] flex items-center justify-between shadow-lg relative overflow-hidden">
                        <div className="flex items-center p-2 gap-1 z-10 bg-white rounded-full">
                            {/* Delivery Button - Smaller */}
                            <button
                                onClick={() => setDeliveryMode('delivery')}
                                className={`p-2 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${deliveryMode === 'delivery' ? 'bg-white shadow-md border border-[#CE181B]' : 'bg-transparent'}`}
                            >
                                <img src={deliveryBoy} alt="" />
                            </button>

                            {/* Vertical Divider */}
                            <div className="w-[1px] h-6 bg-gray-400 bg-opacity-20 mx-0.5" />

                            {/* Pickup Button - Smaller */}
                            <button
                                onClick={() => setDeliveryMode('pickup')}
                                className={`p-2 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${deliveryMode === 'pickup' ? 'bg-white shadow-md border border-[#CE181B]' : 'bg-transparent'}`}
                            >
                                <img src={pickupBoy} alt="" />
                            </button>
                        </div>

                        <div className="flex flex-col items-end text-white pr-2.5 transition-all duration-300">
                            <span className="text-xs font-black uppercase tracking-widest leading-none">
                                {deliveryMode === 'delivery' ? 'Delivery' : 'Pickup'}
                            </span>
                            <div className="flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                <span className="text-[10px] font-black opacity-80 uppercase">
                                    {deliveryMode === 'delivery' ? restaurant.deliveryTime : '15-20 min'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Sections Container */}
            <div className="max-w-7xl mx-auto px-5 mt-8">
                {/* Internal Menu Search - Slimmer */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-[#FF4732]" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for dishes"
                        className="block w-full pl-11 pr-10 py-3.5 bg-gray-50 border-none rounded-[16px] text-xs font-bold text-gray-900 placeholder-gray-400 shadow-sm focus:ring-1 focus:ring-[#FF4732] transition-all"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center border-l border-gray-100 my-3 pointer-events-none">
                        <Mic className="h-4 w-4 text-[#FF4732] ml-3" />
                    </div>
                </div>

                {/* Categories Tabs - Smaller text */}
                <div className="mt-6 flex px-5 w-full justify-between items-center overflow-x-auto no-scrollbar pb-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={`text-[12px] font-black whitespace-nowrap pb-1.5 transition-all relative ${activeTab === cat ? 'text-[#FF4732]' : 'text-gray-400'}`}
                        >
                            {cat}
                            {activeTab === cat && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF4732] rounded-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Section Header - Smaller */}
                <div className="mt-6 mb-4">
                    <h2 className="text-lg font-black text-gray-900">{activeTab}</h2>
                </div>

                {/* Menu Grid - 2 columns */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {menuItems.map(item => (
                        <MenuItemCard key={item.id} item={item} />
                    ))}
                </div>
            </div>
        </div>
    );
};
