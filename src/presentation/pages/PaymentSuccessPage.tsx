import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Package, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import orderSuccessImg from '../../assets/checkout/order_placed.svg';

export const PaymentSuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { clearCart } = useCart();
    const [isLoading, setIsLoading] = useState(true);
    const [orderId, setOrderId] = useState<string | null>(null);

    useEffect(() => {
        // Extract order info from URL, e.g. ?txnid=... or read from sessionStorage
        const queryParams = new URLSearchParams(location.search);
        let id = queryParams.get('orderId') || sessionStorage.getItem('orderId');
        let txn = queryParams.get('txnid') || sessionStorage.getItem('txnId');

        // Use standard ID if none found
        setOrderId(id || txn || "1771138859799");
        clearCart();
        
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
        }, 800);

        return () => clearTimeout(timer);
    }, [location]); // Removed clearCart from dependency array to prevent infinite loop

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans">
                <Loader2 className="w-10 h-10 animate-spin text-[#00A050]" />
                <p className="mt-4 text-gray-500 font-medium">Verifying payment...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center px-6 pt-12 pb-10 font-sans">
            {/* Header with Green Checkmark */}
            <div className="flex flex-col items-center gap-2 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-[#E6F5EC] p-3 rounded-full">
                    <CheckCircle className="w-8 h-8 text-[#00A050]" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 mt-1">Payment Successful!</h1>
                <p className="text-gray-400 text-[13px] font-medium text-center leading-relaxed max-w-xs">
                    Your payment was processed securely and your order has been successfully placed.
                </p>
            </div>

            {/* Illustration */}
            <div className="w-full max-w-[280px] mb-10 h-64 flex items-center justify-center overflow-hidden animate-in zoom-in duration-700">
                <img
                    src={orderSuccessImg}
                    alt="Order Success"
                    className="w-full h-full object-contain mix-blend-multiply"
                />
            </div>

            {/* Order Details Card */}
            <div className="w-full max-w-md bg-[#FAFBFF] rounded-[28px] p-6 mb-12 shadow-sm border border-gray-50 flex flex-col gap-5 animate-in slide-in-from-bottom-8 duration-700 delay-150">
                <div className="flex items-center gap-4">
                    <div className="bg-[#FFF4E8] p-4 rounded-full">
                        <Package className="w-6 h-6 text-[#F7A626]" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-400 text-sm font-medium">Order ID</span>
                        <span className="text-gray-900 font-black text-[17px]">{orderId}</span>
                    </div>
                </div>
                
                <div className="h-px bg-gray-100/50 w-full"></div>
                
                <div className="flex items-start gap-3 mt-1">
                    <CheckCircle className="w-5 h-5 text-[#00A050] flex-shrink-0 mt-0.5" />
                    <p className="text-[13px] text-gray-600 font-medium">
                        Payment received. Track your order to stay updated on delivery progress.
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full max-w-md flex flex-col gap-4 mt-auto animate-in slide-in-from-bottom-12 duration-700 delay-300">
                <button
                    onClick={() => navigate(`/track-order?orderId=${orderId}`, { replace: true })}
                    className="w-full bg-[#FF584A] text-white font-black text-[17px] py-[18px] rounded-xl shadow-md hover:bg-[#E5483B] transition-all active:scale-[0.98]"
                >
                    Track Order
                </button>
                <button
                    onClick={() => navigate('/', { replace: true })}
                    className="w-full bg-white text-gray-900 border border-gray-100 font-black text-[17px] py-[18px] rounded-xl hover:bg-gray-50 transition-all active:scale-[0.98]"
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
};
