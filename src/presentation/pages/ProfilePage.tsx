import React, { useState, useEffect } from 'react';
import { MapPin, CreditCard, Clock, Settings, ChevronRight, LogOut, Heart } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { RestaurantCard } from '../components/RestaurantCard';
import { Order } from '../../core/entities/Order';
import DIContainer from '../../di/container';

export const ProfilePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'orders' | 'favorites' | 'settings'>('orders');
    const { favorites } = useFavorites();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);

    useEffect(() => {
        if (activeTab === 'orders') {
            const fetchOrders = async () => {
                setIsLoadingOrders(true);
                try {
                    const useCase = DIContainer.getOrdersUseCase();
                    const data = await useCase.execute();
                    setOrders(data);
                } catch (err) {
                    console.error('Failed to fetch orders:', err);
                } finally {
                    setIsLoadingOrders(false);
                }
            };
            fetchOrders();
        }
    }, [activeTab]);

    return (
        <div className="w-full bg-[#F8F9FA] min-h-screen pb-20 lg:px-30">
            {/* Header / Cover Area */}
            <div className="bg-[#FF4732] h-40 md:h-36 w-full relative">
                <div className="absolute -bottom-15 md:-bottom-17 left-6 md:left-16 flex items-end gap-6">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
                        <img
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
                            alt="User Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="mb-2 md:mb-4">
                        <h1 className="text-2xl md:text-3xl font-extrabold drop-shadow-md">Aditya Ekhande</h1>
                        <p className="font-medium text-sm text-gray-400">aadityaekhande@gmail.com</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-16 mt-20 md:mt-24 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Sidebar: Navigation & Quick Stats */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    {/* Quick Stats Card */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex justify-between items-center text-center">
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-1">Total Orders</p>
                            <p className="text-2xl font-black text-gray-900">42</p>
                        </div>
                        <div className="w-px h-10 bg-gray-100"></div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-1">Loyalty Points</p>
                            <p className="text-2xl font-black text-[#FF4732]">1,250</p>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`w-full flex items-center justify-between p-4 md:p-5 transition-colors border-b border-gray-50 ${activeTab === 'orders' ? 'bg-[#FFF4F3] border-l-4 border-l-[#FF4732]' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}
                        >
                            <div className="flex items-center gap-3">
                                <Clock className={`w-5 h-5 ${activeTab === 'orders' ? 'text-[#FF4732]' : 'text-gray-400'}`} />
                                <span className={`font-semibold ${activeTab === 'orders' ? 'text-[#FF4732]' : 'text-gray-700'}`}>Order History</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>

                        <button
                            onClick={() => setActiveTab('favorites')}
                            className={`w-full flex items-center justify-between p-4 md:p-5 transition-colors border-b border-gray-50 ${activeTab === 'favorites' ? 'bg-[#FFF4F3] border-l-4 border-l-[#FF4732]' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}
                        >
                            <div className="flex items-center gap-3">
                                <Heart className={`w-5 h-5 ${activeTab === 'favorites' ? 'text-[#FF4732]' : 'text-gray-400'}`} />
                                <span className={`font-semibold ${activeTab === 'favorites' ? 'text-[#FF4732]' : 'text-gray-700'}`}>Favorites</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>

                        <button
                            className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-gray-50 transition-colors border-b border-gray-50 border-l-4 border-l-transparent"
                        >
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-gray-400" />
                                <span className="font-semibold text-gray-700">Saved Addresses</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>

                        <button
                            className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-gray-50 transition-colors border-b border-gray-50 border-l-4 border-l-transparent"
                        >
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-5 h-5 text-gray-400" />
                                <span className="font-semibold text-gray-700">Payment Methods</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>

                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`w-full flex items-center justify-between p-4 md:p-5 transition-colors border-b border-gray-50 ${activeTab === 'settings' ? 'bg-[#FFF4F3] border-l-4 border-l-[#FF4732]' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}
                        >
                            <div className="flex items-center gap-3">
                                <Settings className={`w-5 h-5 ${activeTab === 'settings' ? 'text-[#FF4732]' : 'text-gray-400'}`} />
                                <span className={`font-semibold ${activeTab === 'settings' ? 'text-[#FF4732]' : 'text-gray-700'}`}>Settings</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>

                        <button
                            className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-red-50 transition-colors border-l-4 border-l-transparent group"
                        >
                            <div className="flex items-center gap-3">
                                <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-500" />
                                <span className="font-semibold text-red-500 group-hover:text-red-600">Log Out</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Right Content Area */}
                <div className="lg:col-span-2">

                    {/* Order History Tab */}
                    {activeTab === 'orders' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Recent Orders</h2>

                            <div className="flex flex-col gap-4">
                                {isLoadingOrders ? (
                                    <div className="flex justify-center py-10">
                                        <div className="w-8 h-8 border-4 border-[#FF4732] border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <p className="text-gray-500 text-center py-10 font-medium">No orders found.</p>
                                ) : (
                                    orders.map((order) => (
                                        <div key={order.id} className="border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gray-200 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-orange-50 flex items-center justify-center">
                                                    <span className="text-2xl">🍕</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg">Order #{order.id}</h3>
                                                    <p className="text-sm tracking-wide text-gray-500 font-medium">{order.items.join(', ')}</p>
                                                    <p className="text-xs text-gray-400 mt-1">Oct 24, 2023 • 7:30 PM</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0">
                                                <span className="font-black text-gray-900 text-lg">₹{order.totalAmount}</span>
                                                <span className={`text-xs font-bold px-2 py-1 rounded-md mt-1 capitalize ${order.status === 'delivered' ? 'text-emerald-600 bg-emerald-50' :
                                                    order.status === 'cancelled' ? 'text-red-600 bg-red-50' :
                                                        'text-blue-600 bg-blue-50'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <button className="w-full mt-6 py-3 rounded-xl border-2 border-gray-100 text-gray-700 font-bold hover:bg-gray-50 transition-colors">
                                View All Orders
                            </button>
                        </div>
                    )}

                    {/* Settings Tab Placeholder */}
                    {activeTab === 'settings' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Account Settings</h2>
                            <div className="space-y-4">
                                <div className="p-4 border border-gray-100 rounded-xl">
                                    <h3 className="font-bold text-gray-800 mb-1">Personal Information</h3>
                                    <p className="text-sm text-gray-500">Update your name, email, and phone number.</p>
                                </div>
                                <div className="p-4 border border-gray-100 rounded-xl">
                                    <h3 className="font-bold text-gray-800 mb-1">Notifications</h3>
                                    <p className="text-sm text-gray-500">Manage order tracking alerts and promotional emails.</p>
                                </div>
                                <div className="p-4 border border-gray-100 rounded-xl">
                                    <h3 className="font-bold text-gray-800 mb-1">Security</h3>
                                    <p className="text-sm text-gray-500">Change your password and secure your account.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Favorites Tab */}
                    {activeTab === 'favorites' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Favorite Restaurants</h2>

                            {favorites.length === 0 ? (
                                <p className="text-gray-500 text-center py-10 font-medium">You haven't added any restaurants to your favorites yet.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {favorites.map((restaurant) => (
                                        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
