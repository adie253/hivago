import React, { useState, useEffect } from 'react';
import { Store, Bike, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiOrder, getMyOrders } from '../../data/api';

export const OrdersPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
    const [orders, setOrders] = useState<ApiOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const data = await getMyOrders(0, 50);
                const ordersList = Array.isArray(data) ? data : (data?.items || data?.content || data?.data?.content || data?.data || []);
                setOrders(ordersList);
            } catch (error) {
                console.error("Failed to load orders", error);
                setOrders([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const activeStatuses = ['PENDING', 'PREPARING', 'READY', 'ASSIGNED', 'PAID'];
    const activeOrders = orders.filter(o => activeStatuses.includes((o.status || '').toUpperCase()));
    const pastOrders = orders.filter(o => !activeStatuses.includes((o.status || '').toUpperCase()));
    const currentOrdersList = activeTab === 'active' ? activeOrders : pastOrders;

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatStatus = (status: string) => {
        if (!status) return '';
        return status.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
    };

    const getStatusColor = (status: string) => {
        if (['DELIVERED', 'PICKED_UP'].includes(status)) return 'bg-[#E6F9EA] text-[#00A32A]';
        if (['CANCELLED', 'REJECTED'].includes(status)) return 'bg-red-50 text-red-600';
        return 'bg-blue-50 text-blue-600'; // Default for pending/active
    };

    return (
        <div className="w-full bg-[#FAFAFA] min-h-screen pb-20 font-sans flex flex-col items-center">
            <div className="w-full mt-4 md:mt-10 max-w-md bg-white min-h-screen flex flex-col shadow-sm">
                
                {/* Header Section */}
                <div className="px-5 pt-6 pb-2">
                    <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                </div>

                {/* Tabs */}
                <div className="flex px-5 border-b border-gray-200">
                    <button 
                        onClick={() => setActiveTab('active')}
                        className={`py-3 mr-6 font-semibold text-[15px] relative transition-colors ${activeTab === 'active' ? 'text-[#FF4732]' : 'text-gray-500'}`}
                    >
                        Active ({activeOrders.length})
                        {activeTab === 'active' && (
                            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#FF4732] rounded-t-[2px]"></span>
                        )}
                    </button>
                    <button 
                        onClick={() => setActiveTab('past')}
                        className={`py-3 font-semibold text-[15px] relative transition-colors ${activeTab === 'past' ? 'text-[#FF4732]' : 'text-gray-500'}`}
                    >
                        Past ({pastOrders.length})
                        {activeTab === 'past' && (
                            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#FF4732] rounded-t-[2px]"></span>
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-5 py-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center mt-20">
                            <Loader className="w-8 h-8 text-[#FF4732] animate-spin" />
                            <p className="text-gray-500 mt-4 text-sm">Loading orders...</p>
                        </div>
                    ) : currentOrdersList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center mt-12">
                            <div className="w-full max-w-[280px] aspect-[4/3] bg-gradient-to-t from-red-50 to-red-100 rounded-xl flex items-center justify-center mb-8 relative border border-red-50">
                                <div className="absolute w-24 h-24 bg-white/50 backdrop-blur-sm rounded-full -top-4 -right-4 blur-[20px]"></div>
                                <div className="z-10 bg-white shadow-sm p-4 rounded-lg flex gap-3 rotate-[-5deg]">
                                    <div className="w-10 h-10 border-2 border-red-100 rounded flex items-center justify-center bg-white"><div className="w-4 h-4 rounded-full bg-red-300"></div></div>
                                    <div className="w-8 h-12 bg-white border border-gray-100 rounded-b-md shadow-sm relative"><div className="absolute top-2 w-full h-4 bg-red-200"></div><div className="absolute top-[-4px] w-[110%] -left-[5%] h-2 bg-white rounded-sm border border-gray-100 shadow-sm"></div></div>
                                </div>
                            </div>
                            
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                {activeTab === 'active' ? 'No active orders' : 'No past orders'}
                            </h2>
                            <p className="text-[#6C727F] text-sm mb-8 text-center max-w-[240px]">
                                {activeTab === 'active' ? "You don't have any active orders" : "You haven't placed any orders yet"}
                            </p>
                            
                            <Link 
                                to="/restaurants"
                                className="bg-[#FF4732] text-white font-bold py-3.5 px-8 rounded-[12px] hover:bg-red-600 transition-colors shadow-sm"
                            >
                                Browse Restaurants
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {currentOrdersList.map((order) => {
                                // Default to delivery if empty or null
                                const typeStr = order.orderType ? order.orderType.toLowerCase() : 'delivery';
                                const itemsCount = Array.isArray(order.items) ? order.items.reduce((acc: any, item: any) => acc + item.quantity, 0) : (order.totalItems || 0);
                                
                                return (
                                    <div key={order.id} className="border border-gray-100 rounded-[16px] p-4 flex flex-col bg-white shadow-sm">
                                        <div className="flex items-start justify-between mb-4">
                                            
                                            <div className="flex items-center gap-3">
                                                {/* Icon */}
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${typeStr === 'pickup' ? 'bg-[#EBF3FF] text-[#297BFF]' : 'bg-[#FFF4E5] text-[#D88A31]'}`}>
                                                    {typeStr === 'pickup' ? <Store className="w-5 h-5" /> : <Bike className="w-5 h-5" />}
                                                </div>
                                                
                                                {/* Details */}
                                                <div className="flex flex-col">
                                                    <h3 className="font-bold text-[16px] text-gray-900 leading-tight mb-0.5">{order.restaurantName || "Restaurant"}</h3>
                                                    <div className="text-[#6C727F] text-[13px]">{itemsCount} items • ₹{order.totalAmount || order.total || 0}</div>
                                                    <div className="text-[#9CA3AF] text-[12px] mt-0.5">{formatDate(order.updatedAt || order.createdAt)}</div>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div className={`px-2.5 py-1 rounded-[6px] text-[11px] font-bold tracking-wide mt-1 ${getStatusColor(order.status)}`}>
                                                {formatStatus(order.status)}
                                            </div>
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-3 mt-1">
                                            <button 
                                                onClick={() => activeTab === 'active' ? navigate('/track-order') : null}
                                                className="flex-1 bg-[#F3F4F6] hover:bg-gray-200 text-gray-900 font-bold py-2.5 rounded-[10px] text-[14px] transition-colors"
                                            >
                                                View Details
                                            </button>
                                            <button className="flex-1 bg-[#00B21A] hover:bg-green-600 text-white font-bold py-2.5 rounded-[10px] text-[14px] transition-colors">
                                                Reorder
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
