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

            <div className="max-w-md lg:max-w-[1000px] mx-auto px-4 pt-6 flex flex-col lg:flex-row gap-8 lg:gap-10 w-full items-start pb-10">
               
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
                                        <span className="text-gray-900 text-[18px] font-black leading-none mb-2 tracking-tight">Estimated Delivery Time</span>
                                        <span className="text-[#FF4732] font-black text-[22px]">30-35 min</span>
                                    </div>
                                </div>
                            </div>
                            
                            <hr className="border-gray-50 border-t-2" />
                            
                            {/* Delivery Address */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-gray-900 font-black text-[18px] mb-2 tracking-tight">Delivery Address</span>
                                        <span className="text-gray-400 text-[15px] font-medium w-[85%] text-pretty leading-relaxed">Plot No.7, Arenja Chambers, Navi Mumbai</span>
                                    </div>
                                </div>
                                <div className="w-[70px] h-[70px] rounded-full bg-[#E5F5EC] border-2 border-[#D1EEDB] flex items-center justify-center shrink-0 relative">
                                    <MapPin className="w-7 h-7 text-[#00A050]" />
                                    <div className="absolute top-[8px] right-[8px] w-3.5 h-3.5 rounded-full bg-[#00A050] animate-pulse border-2 border-white shadow-sm"></div>
                                </div>
                            </div>

                            <hr className="border-gray-50 border-t-2" />

                            {/* Contact Partner */}
                            <div className="flex flex-col gap-4">
                                <h2 className="text-[18px] font-black text-gray-900 tracking-tight">Contact Delivery Partner</h2>
                                <div className="bg-[#FCFCFC] rounded-[24px] p-2.5 border border-gray-100 flex items-center justify-between shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
                                    <div className="flex items-center gap-4 pl-1.5">
                                        <div className="w-14 h-14 rounded-[18px] bg-gray-200 overflow-hidden shrink-0 border border-gray-100 shadow-inner">
                                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Anand" alt="Delivery Partner" />
                                        </div>
                                        <div className="flex flex-col justify-center gap-1">
                                            <span className="text-[16px] font-black text-gray-900 leading-none">Anand Kamble</span>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-0.5 text-[#F7A626]">
                                                    <Star className="w-[14px] h-[14px] fill-current" />
                                                    <span className="text-[12px] font-bold">4.9</span>
                                                </div>
                                                <span className="text-gray-300 text-[12px] font-bold tracking-wider">• ID DW2125</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="w-12 h-12 bg-white rounded-[18px] border border-gray-100 shadow-sm text-[#FF4732] flex items-center justify-center hover:bg-gray-50 active:scale-[0.95] transition-all mr-1">
                                        <Phone className="w-5 h-5 fill-current" />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Order Details */}
                            <div className="flex flex-col gap-4 mt-2">
                                <h2 className="text-[18px] font-black text-gray-900 tracking-tight">Order Details</h2>
                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-between items-center text-[16px]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3.5 h-3.5 rounded-full border-[3px] border-[#00A050] bg-white shadow-sm"></div>
                                            <span className="text-gray-700 font-semibold tracking-tight">Margherita Pizza x 1</span>
                                        </div>
                                        <span className="text-gray-900 font-bold">₹250</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[16px] pb-5 border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3.5 h-3.5 rounded-full border-[3px] border-[#00A050] bg-white shadow-sm"></div>
                                            <span className="text-gray-700 font-semibold tracking-tight">Garlic Breadsticks x 1</span>
                                        </div>
                                        <span className="text-gray-900 font-bold">₹120</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-gray-900 font-black text-[18px]">Total Amount</span>
                                        <span className="text-gray-900 font-black text-xl">₹370</span>
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
                             <h2 className="text-[#8B5CF6] font-black text-[22px] tracking-wide">{stages[currentStageIndex].label}</h2>
                        </div>
                        
                        {/* Order Stepper */}
                        <div className="p-6 lg:p-10 relative bg-white">
                            <h2 className="text-[22px] font-black text-gray-900 mb-10 tracking-tight text-center">Order Status</h2>
                            
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
                                                    <span className={`text-[15px] lg:text-[18px] font-black leading-none mb-1.5 transition-colors duration-500 tracking-tight ${isActive ? 'text-gray-900' : isCompleted ? 'text-gray-900' : 'text-gray-300'}`}>
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
                                            
                                            {/* Dynamic Illustration for Active Phase (Mobile Only now!) */}
                                            {isActive && (
                                                <div className="absolute left-[36px] top-[50%] -translate-y-[50%] h-32 w-full lg:hidden flex items-center justify-end animate-in slide-in-from-right duration-700 pointer-events-none opacity-80 z-[-1] pr-4 mix-blend-multiply">
                                                    <img src={stage.image} alt={stage.label} className="h-full max-w-[140px] object-contain drop-shadow-lg" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6 lg:hidden w-full">
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
                
            </div>

            <MobileMenu 
                isOpen={isMenuOpen} 
                onClose={() => setIsMenuOpen(false)} 
            />
        </div>
    );
};
