import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Clock, Star, Search, Mic, MapPin } from 'lucide-react';
import { MenuPageSkeleton } from '../components/Skeletons';
import { MenuItemCard, MenuItem } from '../components/MenuItemCard';
import { ItemDetailOverlay } from '../components/ItemDetailOverlay';
import { useFilters, Restaurant } from '../context/FilterContext';
import { useCart } from '../context/CartContext';
import DIContainer from '../../di/container';
import deliveryBoy from '../../assets/delivery_pickup/delivery.svg';
import pickupBoy from '../../assets/delivery_pickup/pickup.svg';
import { useUserLocation } from '../context/LocationContext';

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d.toFixed(1);
};

export const RestaurantMenuPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const highlightedId = searchParams.get('highlight');
    const { isLoading: filtersLoading } = useFilters();
    const { selectedLocation } = useUserLocation();

    const { fulfillmentType, setFulfillmentType } = useCart();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [isLocalLoading, setIsLocalLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [menuSearchQuery, setMenuSearchQuery] = useState('');
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

    // Force 'Delivery' if restaurant doesn't accept pickup
    useEffect(() => {
        if (restaurant && !restaurant.acceptsPickup && fulfillmentType === 'Pickup') {
            setFulfillmentType('Delivery');
        }
    }, [restaurant, fulfillmentType, setFulfillmentType]);

    useEffect(() => {
        if (restaurant && highlightedId) {
            // Give a small delay to ensure DOM is rendered
            setTimeout(() => {
                const element = document.getElementById(`item-${highlightedId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 800);
        }
    }, [restaurant, highlightedId]);

    const categories = React.useMemo(() => restaurant
        ? ['All', ...Array.from(new Set(restaurant.menu.map(item => item.category)))]
        : ['All'], [restaurant]);

    const filteredMenu = React.useMemo(() => {
        return restaurant?.menu.filter(item => {
            const matchesTab = activeTab === 'All' || item.category === activeTab;
            const matchesSearch = item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) || 
                                 (item.description || '').toLowerCase().includes(menuSearchQuery.toLowerCase());
            return matchesTab && matchesSearch;
        }) || [];
    }, [restaurant?.menu, activeTab, menuSearchQuery]);

    const menuItems: MenuItem[] = React.useMemo(() => filteredMenu.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        isVeg: item.type === 'Veg',
        bestseller: false, // API doesn't return this yet
        description: item.description || '',
        imageUrl: item.imageUrl || ''
    })), [filteredMenu]);

    useEffect(() => {
        if (restaurant && categories.length > 0 && !categories.includes(activeTab)) {
            setActiveTab('All');
        }
    }, [categories, activeTab, restaurant]);

    if (isLocalLoading || (filtersLoading && !restaurant)) {
        return <MenuPageSkeleton />;
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white font-sans gap-6 text-center px-6">
                <div className="text-6xl">🥘</div>
                <h2 className="text-2xl font-bold text-gray-900">Restaurant Not Found</h2>
                <p className="text-gray-500 max-w-xs">We couldn't find the restaurant you're looking for. It might be closed or doesn't exist.</p>
                <button
                    onClick={() => navigate('/restaurants')}
                    className="bg-[#FF4732] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                    Back to Restaurants
                </button>
            </div>
        );
    }



    return (
        <div className="min-h-screen bg-[#F8FAFC] md:bg-[#F4F6F8] font-sans pb-20">
            {/* MOBILE VIEW (md:hidden) */}
            <div className="block md:hidden">
                {/* Hero Image Section */}
                <div className="relative w-full h-64">
                    <img 
                        src={restaurant.imageUrl} 
                        alt={restaurant.name} 
                        className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
                    
                    {/* Floating Buttons */}
                    <div className="absolute top-6 pl-4 flex items-center gap-4 w-full pr-12 justify-between">
                        <button 
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-800" />
                        </button>
                        <button className="w-10 h-10 bg-white -mr-8 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all">
                            <span className="text-gray-400 text-xl">♡</span>
                        </button>
                    </div>
                </div>

                {/* Overlapping Info Card */}
                <div className="px-5 -mt-12 relative z-10">
                    <div className="bg-white rounded-[24px] p-6 shadow-xl border border-gray-50">
                        <h1 className="text-2xl font-bold text-gray-900 leading-tight font-sans">
                            {restaurant.name}
                        </h1>
                        <p className="text-gray-400 font-bold text-xs mt-1 tracking-tight">
                            Veg-Non Veg Family Restaurant
                        </p>

                        <div className="flex items-center gap-2 text-gray-600 mt-4">
                            <MapPin className="w-3.5 h-3.5 text-[#FF4732]" />
                            <span className="text-[11px] font-bold line-clamp-1">{restaurant.addressLine || 'Pune, India'}</span>
                        </div>

                        <div className="flex items-center justify-center gap-3 mt-4 text-[11px] font-bold text-gray-500">
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-[#FF4732]" />
                                <span>{restaurant.deliveryTime}</span>
                            </div>
                            <span className="text-gray-300">•</span>
                            <div className="flex items-center gap-1.5">
                                <span>{selectedLocation && restaurant?.latitude && restaurant?.longitude 
                                    ? `${calculateDistance(selectedLocation.latitude, selectedLocation.longitude, restaurant.latitude, restaurant.longitude)} km` 
                                    : '-- km'}</span>
                            </div>
                            <span className="text-gray-300">•</span>
                            <div className="flex items-center gap-1.5">
                                <img src={deliveryBoy} alt="free" className="w-3.5 h-3.5" />
                                <span>Free</span>
                            </div>
                            <span className="text-gray-300">•</span>
                            <div className="flex items-center gap-1.5">
                                <Star className="w-3.5 h-3.5 text-[#FF4732] fill-[#FF4732]" />
                                <span>{restaurant.rating}</span>
                                <span className="text-gray-400 font-medium">200+ ratings</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delivery/Pickup Toggle (Mobile) */}
                <div className="px-5 mt-6">
                    <div className="bg-white rounded-full border border-gray-100 shadow-sm p-1.5 flex items-center justify-between w-full mx-auto max-w-[320px]">
                        <div className="flex items-center gap-2 pl-2 md:pl-2 ">
                            <div className="flex -space-x-1 ">
                                <button 
                                    onClick={() => setFulfillmentType('Delivery')}
                                    className={`w-25 h-20 rounded-full flex items-center justify-center border-[3px] border-white transition-all shadow-md ${fulfillmentType === 'Delivery' ? 'bg-red-50 ring-2 ring-gray-100' : 'bg-gray-50 opacity-40'}`}
                                >
                                    <div className={`p-4 px-6 rounded-full ${fulfillmentType === 'Delivery' ? 'border border-[#B02421]' : ''}`}>
                                        <img src={deliveryBoy} alt="delivery" className="w-8 h-8" />
                                    </div>
                                </button>
                                {restaurant.acceptsPickup && (
                                    <button 
                                        onClick={() => setFulfillmentType('Pickup')}
                                        className={`w-25 h-20 rounded-full flex items-center justify-center border-[3px] border-white transition-all shadow-md ${fulfillmentType === 'Pickup' ? 'bg-red-50 ring-2 ring-gray-100' : 'bg-gray-50 opacity-40'}`}
                                    >
                                        <div className={`p-4 px-6 rounded-full ${fulfillmentType === 'Pickup' ? 'border border-[#B02421]' : ''}`}>
                                            <img src={pickupBoy} alt="pickup" className="w-8 h-8" />
                                        </div>
                                    </button>
                                )}
                            </div>
                            <div className="pl-2">
                                <p className="text-[#B02421] font-bold text-lg leading-tight capitalize">{fulfillmentType}</p>
                                <p className="text-gray-500 text-xs font-bold">
                                    {fulfillmentType === 'Delivery' ? restaurant.deliveryTime : '15 - 20 min'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar (Mobile) */}
                <div className="px-5 mt-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-red-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for dishes"
                            value={menuSearchQuery}
                            onChange={(e) => setMenuSearchQuery(e.target.value)}
                            className="block w-full pl-12 pr-12 py-4 bg-white border border-gray-100 shadow-sm rounded-2xl text-[13px] font-bold text-gray-900 placeholder-gray-400 focus:ring-0 transition-all"
                        />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <Mic className="h-5 w-5 text-[#FF4732]" />
                        </div>
                    </div>
                </div>

                {/* Category Tabs (Mobile) */}
                <div className="mt-8">
                    <div className="flex items-center gap-8 px-5 overflow-x-auto no-scrollbar scroll-smooth">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={`text-[14px] whitespace-nowrap pb-3 transition-all relative ${activeTab === cat ? 'font-bold text-[#FF4732]' : 'font-medium text-gray-400 hover:text-gray-700'}`}
                            >
                                {cat}
                                {activeTab === cat && (
                                    <span className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-[#FF4732] rounded-t-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Menu Header & Grid (Mobile) */}
                <div className="px-5 mt-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">{activeTab}</h2>
                    {menuItems.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {menuItems.map(item => (
                                <MenuItemCard 
                                    key={item.id} 
                                    item={item} 
                                    restaurantId={restaurant.id}
                                    restaurantName={restaurant.name}
                                    onClick={() => setSelectedItem(item)}
                                    isHighlighted={highlightedId === item.id}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl p-10 text-center border border-gray-50 flex flex-col items-center gap-3">
                            <div className="text-4xl">🍽️</div>
                            <p className="text-gray-900 font-bold">No dishes found</p>
                            <p className="text-gray-500 text-xs">Try searching for something else or clearing filters.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* DESKTOP VIEW (md:block) */}
            <div className="hidden md:block">
                {/* Top Search & Back Bar */}
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors flex-shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for dishes"
                            value={menuSearchQuery}
                            onChange={(e) => setMenuSearchQuery(e.target.value)}
                            className="block w-full pl-12 pr-12 py-3 bg-[#EEF2F6] border-none rounded-xl text-sm font-medium text-gray-900 placeholder-gray-500 focus:ring-0 transition-all"
                        />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <Mic className="h-5 w-5 text-[#FF4732]" />
                        </div>
                    </div>
                </div>

                {/* Restaurant Info Card (Desktop) */}
                <div className="max-w-7xl mx-auto px-4 mt-2">
                    <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex gap-8 relative overflow-hidden">
                        {/* Left Section: Info */}
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-1">
                                    {restaurant.name}
                                </h1>
                                <p className="text-gray-500 font-bold text-sm mb-2 uppercase tracking-tight">
                                    Veg-Non Veg Family Restaurant
                                </p>
                                <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                                    <MapPin className="w-4 h-4 text-[#FF4732]" />
                                    <span className="font-bold">{restaurant.addressLine || 'Pune, India'}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 mt-8">
                                <div className="flex items-center gap-2">
                                    <Star className="w-5 h-5 text-green-600 fill-green-600" />
                                    <span className="text-base font-bold text-gray-900">{restaurant.rating}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Clock className="w-5 h-5" />
                                    <span className="text-base font-bold">{restaurant.deliveryTime}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500">
                                    <MapPin className="w-5 h-5" />
                                    <span className="text-base font-bold">
                                        {selectedLocation && restaurant?.latitude && restaurant?.longitude 
                                            ? `${calculateDistance(selectedLocation.latitude, selectedLocation.longitude, restaurant.latitude, restaurant.longitude)} km` 
                                            : '-- km'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Middle Section: Delivery Status */}
                        <div className="flex flex-col items-center justify-center px-10">
                            <div className="bg-white rounded-full border border-gray-100 shadow-sm p-1.5 flex items-center gap-4">
                                <div className="flex">
                                    <button 
                                        onClick={() => setFulfillmentType('Delivery')}
                                        className={`w-20 h-15 rounded-full flex items-center justify-center border-2 border-white transition-all shadow-sm ${fulfillmentType === 'Delivery' ? 'bg-red-50 z-10 scale-110' : 'bg-gray-50 opacity-40 hover:opacity-100'}`}
                                    >
                                        <img src={deliveryBoy} alt="delivery" className="w-[60%] h-[60%]" />
                                    </button>
                                    {restaurant.acceptsPickup && (
                                        <button 
                                            onClick={() => setFulfillmentType('Pickup')}
                                            className={`w-20 h-15 rounded-full flex items-center justify-center border-2 border-white transition-all shadow-sm ${fulfillmentType === 'Pickup' ? 'bg-red-50 z-10 scale-110' : 'bg-gray-50 opacity-40 hover:opacity-100'}`}
                                        >
                                            <img src={pickupBoy} alt="pickup" className="w-[60%] h-[60%]" />
                                        </button>
                                    )}
                                </div>
                                <div className="pr-4">
                                    <p className="text-[#B02421] font-bold text-lg leading-none capitalize">{fulfillmentType}</p>
                                    <p className="text-gray-500 text-xs font-bold mt-0.5">
                                        {fulfillmentType === 'Delivery' ? restaurant.deliveryTime : '15 - 20 min'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 mt-6">
                                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                                    <div className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center shadow-sm">
                                        <Clock className="w-2.5 h-2.5 text-white" />
                                    </div>
                                    <div className="flex flex-col leading-tight">
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Fast Delivery</span>
                                        <span className="text-[9px] font-bold opacity-80">{restaurant.deliveryTime}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                                    <div className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center shadow-sm">
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                    </div>
                                    <div className="flex flex-col leading-tight">
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Live Tracking</span>
                                        <span className="text-[9px] font-bold opacity-80">Real Time</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Section: Image */}
                        <div className="w-72 h-48 rounded-2xl overflow-hidden shadow-md">
                            <img
                                src={restaurant.imageUrl}
                                alt={restaurant.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Menu Sections Container (Desktop) */}
                <div className="max-w-7xl mx-auto px-4 mt-12">
                    <div className="flex items-center gap-10 border-b border-gray-100">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={`text-base pb-5 transition-all relative ${activeTab === cat ? 'font-bold text-[#FF4732]' : 'font-medium text-gray-400 hover:text-gray-900 group'}`}
                            >
                                {cat}
                                {activeTab === cat && (
                                    <span className="absolute bottom-[-1px] left-0 right-0 h-[4px] bg-[#FF4732] rounded-t-full" />
                                )}
                                <span className="absolute bottom-[-1px] left-0 right-0 h-[4px] bg-gray-200 rounded-t-full scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
                            </button>
                        ))}
                    </div>

                    <div className="mt-12 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">{activeTab}</h2>
                    </div>

                    {menuItems.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {menuItems.map(item => (
                                <MenuItemCard 
                                    key={item.id} 
                                    item={item} 
                                    restaurantId={restaurant.id}
                                    restaurantName={restaurant.name}
                                    onClick={() => setSelectedItem(item)}
                                    isHighlighted={highlightedId === item.id}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-[32px] p-20 text-center border border-gray-100 flex flex-col items-center gap-4 shadow-sm">
                            <div className="text-6xl">🥘</div>
                            <h3 className="text-xl font-bold text-gray-900">No dishes found matching your search</h3>
                            <p className="text-gray-500 max-w-xs mx-auto">We couldn't find any items in this category. Try adjusting your search or category selection.</p>
                            <button 
                                onClick={() => {setMenuSearchQuery(''); setActiveTab('All');}}
                                className="mt-2 text-[#FF4732] font-bold hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Overlay Component */}
            <ItemDetailOverlay 
                item={selectedItem} 
                onClose={() => setSelectedItem(null)} 
            />
        </div>
    );
};
