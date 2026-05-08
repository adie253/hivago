import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, Package, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import orderSuccessImg from '../../assets/checkout/order_placed.svg';

export const PaymentSuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { refreshCartFromServer } = useCart();
    const [isLoading, setIsLoading] = useState(true);
    const [orderId, setOrderId] = useState<string | null>(null);

    useEffect(() => {
        // Extract order info from URL, e.g. ?txnid=... or read from sessionStorage
        const queryParams = new URLSearchParams(location.search);
        let id = queryParams.get('orderId') || sessionStorage.getItem('orderId');
        let txn = queryParams.get('txnid') || sessionStorage.getItem('txnId');

        // Use standard ID if none found
        setOrderId(id || txn || "1771138859799");
        refreshCartFromServer();
        
        // Simulate a slight delay to show loading state
        const timer = setTimeout(() => {
            setIsLoading(false);
            // clean up session storage
            sessionStorage.removeItem('orderId');
            sessionStorage.removeItem('txnId');

            // If we are running inside the PayU popup, close it so the parent can take over via polling
            if (window.opener && window.opener !== window) {
                window.close();
            }
        }, 1200);

        return () => clearTimeout(timer);
    }, [location]);

    if (isLoading) {
        return (
            <div className="min-h-[100dvh] bg-gray-50 flex flex-col items-center justify-center font-sans">
                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 flex flex-col items-center gap-6 animate-pulse">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-gray-100 rounded-full"></div>
                        <div className="w-16 h-16 border-4 border-[#00A050] rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                    </div>
                    <p className="text-gray-500 font-bold text-lg tracking-tight">Confirming your order...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#00A050] opacity-[0.03] rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#FF584A] opacity-[0.03] rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-[480px] bg-white rounded-[32px] shadow-2xl shadow-gray-200/50 p-6 sm:p-10 flex flex-col items-center relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
                
                {/* Success Animation Circle */}
                <div className="relative mb-8 flex justify-center items-center mt-2">
                    <div className="absolute w-24 h-24 bg-[#00A050] opacity-20 rounded-full animate-ping"></div>
                    <div className="absolute w-20 h-20 bg-[#00A050] opacity-30 rounded-full animate-pulse"></div>
                    <div className="relative z-10 bg-gradient-to-b from-[#00C864] to-[#00A050] w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-[#00A050]/30 transform hover:scale-105 transition-transform duration-300">
                        <Check className="w-8 h-8 text-white stroke-[3]" />
                    </div>
                </div>

                {/* Header Text */}
                <div className="text-center mb-8 flex flex-col gap-2">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                        Order Placed!
                    </h1>
                    <p className="text-gray-500 text-[15px] font-medium leading-relaxed max-w-[300px] mx-auto">
                        Your payment is successful and your order is on its way to being prepared.
                    </p>
                </div>

                {/* Illustration container - improved styling */}
                <div className="w-full max-w-[220px] mb-8 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none"></div>
                    <img
                        src={orderSuccessImg}
                        alt="Order Success Celebration"
                        className="w-full h-auto object-contain animate-in zoom-in duration-700 delay-150 drop-shadow-xl"
                    />
                </div>

                {/* Order Details Card */}
                <div className="w-full bg-[#FAFBFF] border border-gray-100 rounded-2xl p-5 mb-8 transform transition-all hover:shadow-md hover:border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-50">
                                <Package className="w-6 h-6 text-[#FF584A]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-400 text-[13px] font-bold uppercase tracking-wider mb-0.5">Order ID</span>
                                <span className="text-gray-900 font-bold text-lg tracking-tight">{orderId}</span>
                            </div>
                        </div>
                        <div className="bg-[#E6F5EC] text-[#00A050] px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
                            Paid
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="w-full flex flex-col gap-3">
                    <button
                        onClick={() => navigate(`/track-order?orderId=${orderId}`, { replace: true })}
                        className="group w-full bg-[#FF584A] text-white font-bold text-[17px] py-[18px] rounded-2xl shadow-lg shadow-[#FF584A]/25 hover:bg-[#E5483B] hover:shadow-[#FF584A]/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        Track Order Status
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => navigate('/', { replace: true })}
                        className="w-full bg-white text-gray-500 font-bold text-[16px] py-[16px] rounded-2xl hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-[0.98]"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

