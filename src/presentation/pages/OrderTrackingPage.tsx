import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, CheckCircle, ChefHat, Bike, ShoppingBag, Phone, Star, Loader2 } from 'lucide-react';
import { getOrderById, getActiveOrders, ApiOrder } from '../../data/api';

// Using the assets we moved/generated
import orderPlacedImg from '../../assets/checkout/order_placed.svg';
import preparingImg from '../../assets/checkout/preparing.png';
import deliveryImg from '../../assets/checkout/delivery.png';
import deliveredImg from '../../assets/checkout/delivered.png';
import { MobileMenu } from '../components/checkout/MobileMenu';
import { useNotifications } from '../context/NotificationContext';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const OrderTrackingPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const [order, setOrder] = useState<ApiOrder | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState<'placed' | 'preparing' | 'delivery' | 'delivered' | 'cancelled' | 'rejected'>('placed');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { lastStatusUpdate } = useNotifications();
    const { reorder } = useCart();

    // Map the backend status precisely to the tracking UI pipeline
    useEffect(() => {
        if (order) {
            const apiStatus = (order.status || '').toUpperCase();
            const statusDisplay = ((order as any).statusDisplay || '').toUpperCase();
            if (['DELIVERED', 'COMPLETED'].includes(apiStatus) || statusDisplay === 'DELIVERED') {
                setStatus('delivered');
            } else if (['ASSIGNED', 'PICKED_UP'].includes(apiStatus) || statusDisplay === 'PICKED UP') {
                setStatus('delivery');
            } else if (['PREPARING', 'READY', 'READY FOR PICKUP', 'READY_FOR_PICKUP'].includes(apiStatus) || statusDisplay === 'READY FOR PICKUP') {
                setStatus('preparing');
            } else if (['REJECTED', 'REFUNDING', 'REFUNDED'].includes(apiStatus) || statusDisplay === 'REJECTED' || statusDisplay === 'REFUND IN PROGRESS') {
                setStatus('rejected');
            } else if (apiStatus === 'CANCELLED' || statusDisplay === 'CANCELLED') {
                setStatus('cancelled');
            } else {
                setStatus('placed'); // PENDING, PAID, CONFIRMED
            }
        }
    }, [order]);



    const fetchOrder = async (isInitial = false) => {
        if (isInitial) setIsLoading(true);
        try {
            if (orderId) {
                const o = await getOrderById(orderId);
                if (o) setOrder(o);
            } else {
                const active = await getActiveOrders();
                if (active && active.length > 0) setOrder(active[0]);
            }
        } finally {
            if (isInitial) {
                setIsLoading(false);
            }
        }
    };

    // Initial load
    useEffect(() => {
        fetchOrder(true);
        
        // Polling remains as a background fallback
        const interval = setInterval(() => fetchOrder(false), 10000);
        return () => clearInterval(interval);
    }, [orderId]);

    const handleReorder = async () => {
        if (!order || !order.items || order.items.length === 0) return;
        
        try {
            // Map order items to CartItems with robust property fallback
            const reorderItems = order.items.map(item => ({
                id: item.menuItemId || (item as any).id,
                menuItemId: item.menuItemId || (item as any).id,
                name: item.name || (item as any).itemName || "Item",
                price: item.unitPrice || (item as any).price || 0,
                quantity: item.quantity || 1,
                isVeg: true,
                description: item.options || (item as any).itemDescription || "",
                customizations: item.specialInstructions || ""
            }));
            
            await reorder(reorderItems, order.restaurantId, order.restaurantName);
            navigate('/checkout');
        } catch (error) {
            console.error("[OrderTracking] Reorder failed:", error);
            navigate('/checkout');
        }
    };

    // Handle real-time SignalR updates
    useEffect(() => {
        if (lastStatusUpdate && (lastStatusUpdate.orderId === orderId || (!orderId && order))) {
            console.log('[OrderTracking] Real-time update detected, refreshing...');
            fetchOrder(false);
        }
    }, [lastStatusUpdate]);

    const stages = [
        { 
            id: 'placed', 
            label: 'Order Placed', 
            subtext: (status === 'rejected' || status === 'cancelled') 
                ? (order?.rejectionReason || order?.cancellationReason || 'Order unsuccessful')
                : (order?.status?.toUpperCase() === 'PAID') 
                    ? 'Waiting for restaurant to accept' 
                    : 'Your order has been placed successfully', 
            icon: CheckCircle, 
            image: orderPlacedImg 
        },
        { 
            id: 'preparing', 
            label: 'Preparing', 
            subtext: 'Your food is being prepared', 
            icon: ChefHat, 
            image: preparingImg 
        },
        { 
            id: 'delivery', 
            label: 'Out for Delivery', 
            subtext: 'Your food on the way.', 
            icon: Bike, 
            image: deliveryImg 
        },
        { 
            id: 'delivered', 
            label: 'Delivered', 
            subtext: 'Your order has been delivered.', 
            icon: ShoppingBag, 
            image: deliveredImg 
        }
    ];

    const currentStageIndex = status === 'cancelled' || status === 'rejected' ? 0 : Math.max(0, stages.findIndex(s => s.id === status));

    // Robust parsing functions to handle varying backend serialization formats
    const getAddressDisplay = (o: any) => {
        if (!o) return 'Plot No.7, Arenja Chambers, Navi Mumbai';
        
        const cleanAddress = (addrStr: string) => {
            return addrStr.replace(/,?\s*000000\b/g, '').trim().replace(/,\s*$/, '');
        };

        // Match the real backend: o.deliveryInfo.deliveryAddress
        if (o.deliveryInfo?.deliveryAddress) {
            const addr = o.deliveryInfo.deliveryAddress;
            if (addr.formattedAddress) return cleanAddress(addr.formattedAddress);
            const street = addr.street || addr.addressLine || addr.address || '';
            const city = addr.city || '';
            if (street || city) return cleanAddress([street, city].filter(Boolean).join(', '));
        }
        
        // Legacy fallback check on root if structure reverts
        if (o.deliveryAddress) {
            if (typeof o.deliveryAddress === 'string') return cleanAddress(o.deliveryAddress);
            const street = o.deliveryAddress.street || o.deliveryAddress.addressLine || o.deliveryAddress.address || '';
            const city = o.deliveryAddress.city || '';
            if (street || city) return cleanAddress([street, city].filter(Boolean).join(', '));
        }
        
        return o.deliveryInfo?.deliveryAddress?.formattedAddress || 'Pune, India';
    };

    const getOrderTotal = (o: any) => {
        if (!o) return 370;
        
        const itemsTotal = Array.isArray(o.items) ? o.items.reduce((sum: number, item: any) => sum + ((item.unitPrice || 0) * (item.quantity || 1)), 0) : 0;
        const backendTotal = o.pricing?.total || o.total || o.totalAmount;

        // If backend returns a drastically lower total (like 173 instead of 660+), the backend calculation is likely bugged
        // We calculate it manually to preserve UI consistency
        if (itemsTotal > 0 && backendTotal && Math.abs(backendTotal - itemsTotal) > 100) {
            const tax = o.pricing?.tax || 0;
            const fee = o.pricing?.serviceFee || 0;
            return itemsTotal + tax + fee;
        }

        if (backendTotal) return backendTotal;
        if (o.pricing?.subTotal) return o.pricing.subTotal;
        
        // Final fallback: Calculate from items
        if (itemsTotal > 0) return itemsTotal;
        
        return backendTotal || 0;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center font-sans">
                <Loader2 className="w-10 h-10 animate-spin text-[#00A050]" />
                <p className="mt-4 text-gray-500 font-medium">Fetching order details...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center font-sans pb-20">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center gap-4 max-w-sm text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                        <ShoppingBag className="w-8 h-8 text-gray-300" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">No Active Order</h2>
                    <p className="text-gray-500 text-sm font-medium">We couldn't find an active order to track right now.</p>
                    <button 
                        onClick={() => navigate('/', { replace: true })}
                        className="mt-4 bg-[#FF584A] text-white px-8 py-3.5 rounded-xl font-bold shadow-md hover:bg-[#E5483B] active:scale-[0.98] transition-all"
                    >
                        Browse Restaurants
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'rejected' || status === 'cancelled') {
        return (
            <div className="min-h-[100dvh] bg-[#F8F9FA] font-sans pb-20">
                {/* Navbar */}
                <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-20 border-b border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="p-2 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex items-center justify-center">
                            <ArrowLeft className="w-5 h-5 text-gray-800" />
                        </button>
                        <h1 className="text-lg font-bold text-gray-900">Order Status</h1>
                    </div>
                </div>

                <div className="max-w-[850px] mx-auto px-4 pt-8 lg:pt-12">
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
                        
                        {/* Left Column: Status & Illustration */}
                        <div className="flex flex-col items-center lg:items-start lg:flex-1 lg:max-w-[340px] w-full text-center lg:text-left">
                            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-[#FFF0EF] rounded-2xl flex items-center justify-center mb-5 border-4 border-white shadow-sm relative shrink-0">
                                <AlertCircle className="w-8 h-8 lg:w-10 lg:h-10 text-[#FF4732]" />
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 lg:w-7 lg:h-7 bg-white rounded-full flex items-center justify-center shadow-md">
                                    <ShoppingBag className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-gray-400" />
                                </div>
                            </div>

                            <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
                                {status === 'rejected' ? 'Order Rejected' : 'Order Cancelled'}
                            </h2>
                            
                            <p className="text-gray-500 font-bold text-base lg:text-lg mb-6 leading-relaxed">
                                {order?.rejectionReason || order?.cancellationReason || (status === 'rejected' ? 'The restaurant is unable to fulfill your order right now.' : "Your order was cancelled.")}
                            </p>

                            {/* Actions - Desktop Only inside left col */}
                            <div className="hidden lg:flex flex-col gap-2.5 w-full max-w-[280px]">
                                <button 
                                    onClick={handleReorder}
                                    className="w-full bg-[#FF584A] text-white font-bold text-[16px] py-4 rounded-xl shadow-lg shadow-red-100 hover:bg-[#E5483B] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    <RefreshCcw className="w-4 h-4" />
                                    Reorder Now
                                </button>
                                <button 
                                    onClick={() => navigate('/')}
                                    className="w-full bg-white text-gray-500 font-bold text-[15px] py-4 rounded-xl border border-gray-100 hover:bg-gray-50 active:scale-[0.98] transition-all"
                                >
                                    Back to Home
                                </button>
                            </div>
                        </div>

                        {/* Right Column: Cards */}
                        <div className="flex flex-col gap-5 lg:flex-1 w-full">
                            {/* Refund Info Card */}
                            <div className="w-full bg-white rounded-[24px] p-6 lg:p-8 shadow-[0_12px_30px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col gap-5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                                
                                <div className="relative z-10 flex flex-col gap-5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Refund Amount</span>
                                        <span className="text-[#FF4732] font-extrabold text-2xl">₹{getOrderTotal(order)}</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Refund Status</span>
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#E6F5EC] text-[#00A050] rounded-full text-[11px] font-extrabold shadow-sm border border-[#D1EEDB]">
                                            <CheckCircle className="w-3 h-3" />
                                            <span>INITIATED</span>
                                        </div>
                                    </div>
                                    
                                    <hr className="border-gray-50" />
                                    
                                    <div className="flex items-start gap-3 bg-[#F8FAFC] p-4 rounded-xl border border-blue-50/50">
                                        <Clock className="w-5 h-5 text-[#8B96A5] shrink-0 mt-0.5" />
                                        <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
                                            Refunds typically take <span className="text-gray-900 font-bold">5-7 business days</span> to reflect in your account once processed by PayU.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary (Minimized) */}
                            <div className="w-full bg-white rounded-[24px] p-6 lg:p-8 shadow-[0_12px_30px_rgba(0,0,0,0.02)] border border-gray-100">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2.5">
                                        <ShoppingBag className="w-4 h-4 text-[#FF4732]" />
                                        Order Details
                                    </h3>
                                    <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase bg-gray-50 px-2.5 py-0.5 rounded-full">#{order.orderNumber.slice(-5)}</span>
                                </div>
                                
                                <div className="flex flex-col gap-4">
                                    {order?.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-start text-[14px]">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-gray-800 font-bold">{item.name || (item as any).itemName}</span>
                                                <span className="text-gray-400 text-xs font-bold uppercase tracking-tighter">Qty: {item.quantity}</span>
                                            </div>
                                            <span className="text-gray-900 font-extrabold">₹{(item.unitPrice || 0) * (item.quantity || 1)}</span>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="mt-6 pt-6 border-t border-dashed border-gray-100 flex justify-between items-center">
                                    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Total Paid</span>
                                    <span className="text-gray-900 font-black text-xl tracking-tight">₹{getOrderTotal(order)}</span>
                                </div>
                            </div>

                            {/* Actions - Mobile Only stacked */}
                            <div className="flex lg:hidden flex-col gap-3 w-full mt-2">
                                <button 
                                    onClick={handleReorder}
                                    className="w-full bg-[#FF584A] text-white font-bold text-[16px] py-4 rounded-xl shadow-lg shadow-red-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    <RefreshCcw className="w-4 h-4" />
                                    Reorder Now
                                </button>
                                <button 
                                    onClick={() => navigate('/')}
                                    className="w-full bg-white text-gray-500 font-bold text-[15px] py-4 rounded-xl border border-gray-100 active:scale-[0.98] transition-all"
                                >
                                    Back to Home
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans pb-24">
            {/* Navbar */}
            <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-20 border-b border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="p-2 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex items-center justify-center">
                        <ArrowLeft className="w-5 h-5 text-gray-800" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Track Order</h1>
                </div>
                {/* <button onClick={() => setIsMenuOpen(true)} className="p-2 text-gray-700">
                    <Menu className="w-6 h-6" />
                </button> */}
            </div>


            <div className="max-w-md lg:max-w-[1000px] mx-auto px-4 pt-6 flex flex-col gap-6">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 w-full items-start pb-10">
               
               {/* --- Left Column --- */}
               <div className="flex flex-col gap-6 w-full lg:flex-1 lg:max-w-[48%]">
                    
                    {/* Desktop Aggregated Card */}
                    <div className="hidden lg:flex flex-col gap-0 bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8">
                        <div className="flex flex-col gap-8">
                            
                            {/* Estimated Time */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-[#FFF0EF] border border-[#FFE0DF] flex items-center justify-center rounded-2xl shrink-0">
                                        <Bike className="w-8 h-8 text-[#FF4732]" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-900 text-[18px] font-bold leading-none mb-2 tracking-tight">Estimated Delivery Time</span>
                                        <span className="text-[#FF4732] font-bold text-[22px]">{(order as any).estimatedTimeDisplay || '30-40 min'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <hr className="border-gray-50 border-t-2" />
                            
                            {/* Delivery Address */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-gray-900 font-bold text-[18px] mb-2 tracking-tight">Delivery Address</span>
                                        <span className="text-gray-400 text-[15px] font-medium w-[85%] text-pretty leading-relaxed">
                                            {getAddressDisplay(order)}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-[70px] h-[70px] rounded-full bg-[#E5F5EC] border-2 border-[#D1EEDB] flex items-center justify-center shrink-0 relative">
                                    <MapPin className="w-7 h-7 text-[#00A050]" />
                                    <div className="absolute top-[8px] right-[8px] w-3.5 h-3.5 rounded-full bg-[#00A050] animate-pulse border-2 border-white shadow-sm"></div>
                                </div>
                            </div>

                            <hr className="border-gray-50 border-t-2" />

                            {/* Contact Partner */}
                            {(order as any)?.rider && (
                                <div className="flex flex-col gap-4">
                                    <h2 className="text-[18px] font-bold text-gray-900 tracking-tight">Contact Delivery Partner</h2>
                                    <div className="bg-[#FCFCFC] rounded-[24px] p-2.5 border border-gray-100 flex items-center justify-between shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
                                        <div className="flex items-center gap-4 pl-1.5">
                                            <div className="w-14 h-14 rounded-[18px] bg-gray-200 overflow-hidden shrink-0 border border-gray-100 shadow-inner">
                                                <img src={(order as any)?.rider?.photo || "https://api.dicebear.com/7.x/avataaars/svg?seed=Anand"} alt="Delivery Partner" />
                                            </div>
                                            <div className="flex flex-col justify-center gap-1">
                                                <span className="text-[16px] font-bold text-gray-900 leading-none">{(order as any)?.rider?.name || 'Anand Kamble'}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-0.5 text-[#F7A626]">
                                                        <Star className="w-[14px] h-[14px] fill-current" />
                                                        <span className="text-[12px] font-bold">{(order as any)?.rider?.rating || '4.9'}</span>
                                                    </div>
                                                    <span className="text-gray-300 text-[12px] font-bold tracking-wider">• ID {(order as any)?.rider?.id || 'DW2125'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="w-12 h-12 bg-white rounded-[18px] border border-gray-100 shadow-sm text-[#FF4732] flex items-center justify-center hover:bg-gray-50 active:scale-[0.95] transition-all mr-1">
                                            <Phone className="w-5 h-5 fill-current" />
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {/* Order Details */}
                            <div className="flex flex-col gap-4 mt-2">
                                <h2 className="text-[18px] font-bold text-gray-900 tracking-tight">Order Details • {order?.restaurantName || 'Hotel Sandeep'}</h2>
                                <div className="flex flex-col gap-4">
                                    {(order?.items || [
                                        { name: 'Margherita Pizza', quantity: 1, unitPrice: 250 },
                                        { name: 'Garlic Breadsticks', quantity: 1, unitPrice: 120 }
                                    ]).map((item, idx, arr) => (
                                        <div key={idx} className={`flex justify-between items-center text-[16px] ${idx !== arr.length - 1 ? 'pb-5 border-b border-gray-100' : ''}`}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-3.5 h-3.5 rounded-full border-[3px] border-[#00A050] bg-white shadow-sm"></div>
                                                <span className="text-gray-700 font-semibold tracking-tight">{ item.name || (item as any).itemName || 'Item'} x {item.quantity || 1}</span>
                                            </div>
                                            <span className="text-gray-900 font-bold">₹{(item.unitPrice || 0) * (item.quantity || 1)}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                        <span className="text-gray-900 font-bold text-[18px]">Total Amount</span>
                                        <span className="text-gray-900 font-bold text-xl">₹{getOrderTotal(order)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Only Cards section (Original UI mapping) */}
                    <div className="flex flex-col gap-6 lg:hidden w-full">
                        {/* Estimated Time Card */}
                        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-[#FFF0EF] p-4 rounded-2xl">
                                    <Bike className="w-6 h-6 text-[#FF4732]" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-400 text-[13px] font-medium leading-none mb-1.5">Estimated Delivery Time</span>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-[#FF4732]" />
                                        <span className="text-[#FF4732] font-bold text-[17px]">{(order as any).estimatedTimeDisplay || '30-40 min'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Address Card */}
                        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-[#E6F5EC] p-4 rounded-2xl">
                                    <MapPin className="w-6 h-6 text-[#00A050]" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-900 font-bold text-[15px] mb-0.5">Delivery Address</span>
                                    <span className="text-gray-400 text-[13px] font-medium">
                                        {getAddressDisplay(order)}
                                    </span>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                                <div className="w-3 h-3 rounded-full bg-[#00A050] animate-pulse"></div>
                            </div>
                        </div>
                    </div> {/* End Mobile Time/Address */}
               </div> {/* End Left Column */}


               {/* --- Right Column --- */}
               <div className="flex flex-col gap-6 w-full lg:flex-1 lg:max-w-[52%] order-first lg:order-none">
                    
                    <div className="bg-white lg:rounded-[32px] overflow-hidden lg:shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:border border-gray-100 flex flex-col -mx-4 lg:mx-0 border-y lg:border-y-0">
                        {/* Dynamic Top Banner (Desktop Only) */}
                        <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-[#EGEEFC] bg-gradient-to-br from-[#EAE6FF] to-[#F1EFFF]">
                            <img src={stages[currentStageIndex].image} alt="Status" className="h-[140px] object-contain drop-shadow-xl translate-y-2 mix-blend-multiply" />
                        </div>
                        <div className="hidden lg:flex bg-[#E0D8FC] min-h-[64px] items-center justify-center border-t border-white/20 shadow-inner">
                             <h2 className="text-[#8B5CF6] font-bold text-[22px] tracking-wide">{stages[currentStageIndex].label}</h2>
                        </div>
                        
                        {/* Order Stepper */}
                        <div className="p-6 lg:p-10 relative bg-white">
                            <h2 className="text-[22px] font-bold text-gray-900 mb-10 tracking-tight text-center">Order Status</h2>
                            
                            {/* Vertical Line */}
                            <div className="absolute left-[47px] lg:left-[63px] top-[148px] lg:top-[128px] bottom-10 w-0.5 bg-gray-100"></div>
                            
                            {/* Progress Fill */}
                            <div 
                                className="absolute left-[47px] lg:left-[63px] top-[148px] lg:top-[128px] w-0.5 bg-[#00A050] transition-all duration-1000 origin-top"
                                style={{ height: `${(currentStageIndex / (stages.length - 1)) * 80}%` }}
                            ></div>

                            <div className="flex flex-col gap-10">
                                {stages.map((stage, idx) => {
                                    const isCompleted = idx < currentStageIndex;
                                    const isActive = idx === currentStageIndex;
                                    const Icon = stage.icon;

                                    return (
                                        <div key={stage.id} className="relative z-10 flex">
                                            <div className="flex items-center gap-6 lg:gap-8 bg-white py-1">
                                                <div className={`w-12 h-12 lg:w-[34px] lg:h-[34px] rounded-full flex items-center justify-center border-[3px] lg:border-[4px] transition-colors duration-500 shrink-0 ${isCompleted || isActive ? 'bg-[#00A050] border-[#E6F5EC]' : 'bg-white border-gray-100'}`}>
                                                    <Icon className={`w-5 h-5 lg:w-4 lg:h-4 ${isCompleted || isActive ? 'text-white' : 'text-gray-300'}`} />
                                                </div>
                                                <div className="flex flex-col pt-1 bg-white pr-4">
                                                    <span className={`text-[15px] lg:text-[18px] font-bold leading-none mb-1.5 transition-colors duration-500 tracking-tight ${isActive ? 'text-gray-900' : isCompleted ? 'text-gray-900' : 'text-gray-300'}`}>
                                                        {stage.label}
                                                    </span>
                                                    {(isActive || isCompleted) ? (
                                                        <span className={`text-[13px] lg:text-[14px] font-medium animate-in fade-in duration-500 ${(isActive && window.innerWidth >= 1024) ? 'text-gray-500' : 'text-gray-400'}`}>
                                                            {stage.subtext}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-[13px] lg:text-[14px] font-medium opacity-0 select-none">Placeholder</span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Dynamic Illustration for Active Phase removed on mobile as per request */}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6 lg:hidden w-full">
                    {/* Contact Partner Card */}
                    {(order as any)?.rider && (
                        <div className="flex flex-col gap-3">
                            <h2 className="text-sm font-bold text-gray-900 ml-1">Contact Delivery Partner</h2>
                            <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden">
                                        <img src={(order as any)?.rider?.photo || "https://api.dicebear.com/7.x/avataaars/svg?seed=Anand"} alt="Delivery Partner" />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[15px] font-bold text-gray-900">{(order as any)?.rider?.name || 'Anand Kamble'}</span>
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex items-center gap-0.5 text-amber-500">
                                                <Star className="w-3.5 h-3.5 fill-current" />
                                                <span className="text-[12px] font-bold">{(order as any)?.rider?.rating || '4.9'}</span>
                                            </div>
                                            <span className="text-gray-300 text-[11px] font-medium">• ID {(order as any)?.rider?.id || 'DW2125'}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm text-[#FF4732] active:scale-[0.95] transition-all">
                                    <Phone className="w-5 h-5 fill-current" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Order Details Summary */}
                    <div className="flex flex-col gap-3">
                        <h2 className="text-sm font-bold text-gray-900 ml-1">Order Details • {order?.restaurantName || 'Hotel Sandeep'}</h2>
                        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-50 flex flex-col gap-4">
                            {(order?.items || [
                                { name: 'Margherita Pizza', quantity: 1, unitPrice: 250 },
                                { name: 'Garlic Breadsticks', quantity: 1, unitPrice: 120 }
                            ]).map((item, idx, arr) => (
                                <div key={idx} className={`flex justify-between items-center text-sm ${idx !== arr.length - 1 ? 'pb-2 border-b border-dashed border-gray-100' : ''}`}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[#00A050]"></div>
                                        <span className="text-gray-700 font-bold">{ item.name || (item as any).itemName || 'Item'} x {item.quantity || 1}</span>
                                    </div>
                                    <span className="text-gray-700 font-bold">₹{(item.unitPrice || 0) * (item.quantity || 1)}</span>
                                </div>
                            ))}
                            <div className="flex justify-between items-center pt-1 border-t border-dashed border-gray-100 mt-1">
                                <span className="text-gray-900 font-bold">Total Amount</span>
                                <span className="text-gray-900 font-bold text-lg">₹{getOrderTotal(order)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Need Help Button */}
                    <button className="w-full bg-[#F2F4F7] text-gray-700 font-bold text-[16px] py-[18px] rounded-xl active:scale-[0.98] transition-all mb-6">
                        Need Help?
                    </button>
                </div>
            </div>
        </div>

            <MobileMenu 
                isOpen={isMenuOpen} 
                onClose={() => setIsMenuOpen(false)} 
            />
        </div>
    );
};
