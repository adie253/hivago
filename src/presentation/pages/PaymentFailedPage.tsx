import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { XCircle, RefreshCw, Home, AlertTriangle } from 'lucide-react';

export const PaymentFailedPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [orderId, setOrderId] = useState<string | null>(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const id = queryParams.get('orderId');
        setOrderId(id);
    }, [location]);

    return (
        <div className="min-h-[100dvh] bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#FF584A] opacity-[0.03] rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-[480px] bg-white rounded-[32px] shadow-2xl shadow-gray-200/50 p-6 sm:p-10 flex flex-col items-center relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
                
                {/* Failure Icon */}
                <div className="relative mb-8 flex justify-center items-center mt-2">
                    <div className="absolute w-24 h-24 bg-[#FF584A] opacity-20 rounded-full animate-ping"></div>
                    <div className="absolute w-20 h-20 bg-[#FF584A] opacity-30 rounded-full animate-pulse"></div>
                    <div className="relative z-10 bg-gradient-to-b from-[#FF584A] to-[#E5483B] w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-[#FF584A]/30">
                        <XCircle className="w-8 h-8 text-white stroke-[3]" />
                    </div>
                </div>

                {/* Header Text */}
                <div className="text-center mb-8 flex flex-col gap-2">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                        Payment Failed
                    </h1>
                    <p className="text-gray-500 text-[15px] font-medium leading-relaxed max-w-[300px] mx-auto">
                        We couldn't process your payment. Don't worry, your money is safe and no amount was charged.
                    </p>
                </div>

                {/* Order Details Card */}
                {orderId && (
                    <div className="w-full bg-[#FFF5F5] border border-[#FFE3E3] rounded-2xl p-5 mb-8 flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-[#FF584A]" />
                            <div className="flex flex-col">
                                <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Order ID</span>
                                <span className="text-gray-900 font-bold text-base tracking-tight">{orderId}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="w-full flex flex-col gap-3">
                    <button
                        onClick={() => navigate('/payment', { replace: true })}
                        className="group w-full bg-[#FF584A] text-white font-bold text-[17px] py-[18px] rounded-2xl shadow-lg shadow-[#FF584A]/25 hover:bg-[#E5483B] hover:shadow-[#FF584A]/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-5 h-5 animate-hover-spin" />
                        Retry Payment
                    </button>
                    <button
                        onClick={() => navigate('/', { replace: true })}
                        className="w-full bg-white text-gray-500 font-bold text-[16px] py-[16px] rounded-2xl hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};
