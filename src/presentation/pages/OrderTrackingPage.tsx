import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, CheckCircle, ChefHat, Bike, ShoppingBag, Phone, Star, Menu } from 'lucide-react';

// Using the assets we moved/generated
import orderPlacedImg from '../../assets/checkout/order_placed.svg';
import preparingImg from '../../assets/checkout/preparing.png';
import deliveryImg from '../../assets/checkout/delivery.png';
import deliveredImg from '../../assets/checkout/delivered.png';
import { MobileMenu } from '../components/checkout/MobileMenu';

export const OrderTrackingPage: React.FC = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'placed' | 'preparing' | 'delivery' | 'delivered'>('placed');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Automatically transition through states for demo purposes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (status === 'placed') setStatus('preparing');
            else if (status === 'preparing') setStatus('delivery');
            else if (status === 'delivery') setStatus('delivered');
        }, 8000);
        return () => clearTimeout(timer);
    }, [status]);

    const stages = [
        { 
            id: 'placed', 
            label: 'Order Placed', 
            subtext: 'Your order has been placed successfully', 
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

    const currentStageIndex = stages.findIndex(s => s.id === status);

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans pb-24">
            {/* Navbar */}
            <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-20 border-b border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex items-center justify-center">
                        <ArrowLeft className="w-5 h-5 text-gray-800" />
                    </button>
                    <h1 className="text-lg font-black text-gray-900">Track Order</h1>
                </div>
                <button onClick={() => setIsMenuOpen(true)} className="p-2 text-gray-700">
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            <div className="max-w-md mx-auto px-4 pt-6 flex flex-col gap-6">
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
                                <span className="text-[#FF4732] font-black text-[17px]">30-35 min</span>
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
                            <span className="text-gray-400 text-[13px] font-medium">Plot No.7, Arenja Chambers, Navi Mumbai</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                         <div className="w-3 h-3 rounded-full bg-[#00A050] animate-pulse"></div>
                    </div>
                </div>

                {/* Order Status Section */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-sm font-black text-gray-900 ml-1">Order Status</h2>
                    <div className="bg-white rounded-[28px] overflow-hidden shadow-sm border border-gray-50">
                        <div className="p-6 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-[47px] top-10 bottom-10 w-0.5 bg-gray-100"></div>
                            
                            {/* Progress Fill */}
                            <div 
                                className="absolute left-[47px] top-10 w-0.5 bg-[#00A050] transition-all duration-1000 origin-top"
                                style={{ height: `${(currentStageIndex / (stages.length - 1)) * 80}%` }}
                            ></div>

                            <div className="flex flex-col gap-10">
                                {stages.map((stage, idx) => {
                                    const isCompleted = idx < currentStageIndex;
                                    const isActive = idx === currentStageIndex;
                                    const Icon = stage.icon;

                                    return (
                                        <div key={stage.id} className="relative z-10">
                                            <div className="flex items-center gap-6">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors duration-500 ${isCompleted || isActive ? 'bg-[#00A050] border-[#E6F5EC]' : 'bg-white border-gray-100'}`}>
                                                    <Icon className={`w-5 h-5 ${isCompleted || isActive ? 'text-white' : 'text-gray-300'}`} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-[15px] font-black leading-none mb-1 transition-colors duration-500 ${isActive ? 'text-gray-900' : isCompleted ? 'text-gray-900' : 'text-gray-300'}`}>
                                                        {stage.label}
                                                    </span>
                                                    {isActive && (
                                                        <span className="text-gray-400 text-[12px] font-medium animate-in fade-in duration-500">
                                                            {stage.subtext}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Dynamic Illustration for Active Phase */}
                                            {isActive && (
                                                <div className="ml-[72px] mt-4 h-32 flex items-center justify-start animate-in slide-in-from-left duration-700">
                                                    <img src={stage.image} alt={stage.label} className="h-full object-contain" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Partner Card */}
                <div className="flex flex-col gap-3">
                    <h2 className="text-sm font-black text-gray-900 ml-1">Contact Delivery Partner</h2>
                    <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Anand" alt="Delivery Partner" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[15px] font-bold text-gray-900">Anand Kamble</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="flex items-center gap-0.5 text-amber-500">
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                        <span className="text-[12px] font-bold">4.9</span>
                                    </div>
                                    <span className="text-gray-300 text-[11px] font-medium">• ID DW2125</span>
                                </div>
                            </div>
                        </div>
                        <button className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm text-[#FF4732] active:scale-[0.95] transition-all">
                            <Phone className="w-5 h-5 fill-current" />
                        </button>
                    </div>
                </div>

                {/* Order Details Summary */}
                <div className="flex flex-col gap-3">
                    <h2 className="text-sm font-black text-gray-900 ml-1">Order Details</h2>
                    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-50 flex flex-col gap-4">
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#00A050]"></div>
                                <span className="text-gray-700 font-bold">Margherita Pizza x 1</span>
                            </div>
                            <span className="text-gray-700 font-bold">₹250</span>
                        </div>
                        <div className="flex justify-between items-center text-sm pb-2 border-b border-dashed border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#00A050]"></div>
                                <span className="text-gray-700 font-bold">Garlic Breadsticks x 1</span>
                            </div>
                            <span className="text-gray-700 font-bold">₹120</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                            <span className="text-gray-900 font-black">Total Amount</span>
                            <span className="text-gray-900 font-black text-lg">₹370</span>
                        </div>
                    </div>
                </div>

                {/* Need Help Button */}
                <button className="w-full bg-[#F2F4F7] text-gray-700 font-black text-[16px] py-[18px] rounded-xl active:scale-[0.98] transition-all mb-6">
                    Need Help?
                </button>
            </div>

            <MobileMenu 
                isOpen={isMenuOpen} 
                onClose={() => setIsMenuOpen(false)} 
            />
        </div>
    );
};
