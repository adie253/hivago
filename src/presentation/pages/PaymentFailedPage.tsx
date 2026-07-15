import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { XCircle, RefreshCw, Home, AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';
import { getOrderById, restoreAuthSessionFromBackup, clearPaymentBackup } from '../../data/api';
import { useCart } from '../context/CartContext';

export const PaymentFailedPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { reorder } = useCart();
    const [orderId, setOrderId] = useState<string | null>(null);
    const [isRetrying, setIsRetrying] = useState(false);
    const [retryError, setRetryError] = useState<string | null>(null);

    useEffect(() => {
        // Restore auth session if it was lost during the cross-site redirect
        restoreAuthSessionFromBackup();

        const queryParams = new URLSearchParams(location.search);
        const id = queryParams.get('orderId') || sessionStorage.getItem('orderId') || localStorage.getItem('pay_orderId');
        setOrderId(id);

        return () => {
            // Clean up backups on unmount so we don't pollute storage
            clearPaymentBackup();
        };
    }, [location]);

    const handleRetry = async () => {
        if (!orderId) {
            navigate('/', { replace: true });
            return;
        }

        setIsRetrying(true);
        setRetryError(null);

        try {
            const order = await getOrderById(orderId);
            if (!order || !order.items || order.items.length === 0) {
                throw new Error("Invalid order details or no items found.");
            }

            const cartItems = order.items.map((item: any) => ({
                id: item.menuItemId || item.id,
                menuItemId: item.menuItemId,
                name: item.name || item.itemName,
                price: item.unitPrice,
                quantity: item.quantity,
                isVeg: true,
                isAddon: false,
                customizations: item.specialInstructions || undefined,
                description: item.itemDescription || ""
            }));

            await reorder(cartItems, order.restaurantId, order.restaurantName || "Restaurant");
            navigate('/payment', { replace: true });
        } catch (error) {
            console.error("Failed to retry payment:", error);
            setRetryError("Could not retrieve order details. Please try again.");
            setIsRetrying(false);
        }
    };

    return (
        <div className="min-h-[100dvh] bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#FF584A] opacity-[0.03] rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-[960px] bg-white rounded-[32px] shadow-2xl shadow-gray-200/50 p-6 sm:p-10 flex flex-col md:flex-row gap-8 items-stretch relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
                
                {/* Left Column: Failure details */}
                <div className="w-full md:w-1/2 flex flex-col items-center justify-center text-center py-2">
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
                        <div className="w-full bg-[#FFF5F5] border border-[#FFE3E3] rounded-2xl p-5 mb-8 flex flex-col gap-2 max-w-[360px] text-left">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 text-[#FF584A]" />
                                <div className="flex flex-col">
                                    <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Order ID</span>
                                    <span className="text-gray-900 font-bold text-base tracking-tight">{orderId}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error display if retry fails */}
                    {retryError && (
                        <p className="text-sm font-semibold text-[#FF584A] mb-4 animate-shake">
                            {retryError}
                        </p>
                    )}

                    {/* Action Buttons */}
                    <div className="w-full flex flex-col gap-3 max-w-[360px]">
                        <button
                            onClick={handleRetry}
                            disabled={isRetrying}
                            className="group w-full bg-[#FF584A] text-white font-bold text-[17px] py-[18px] rounded-2xl shadow-lg shadow-[#FF584A]/25 hover:bg-[#E5483B] hover:shadow-[#FF584A]/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isRetrying ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                            )}
                            {isRetrying ? "Repopulating Cart..." : "Retry Payment"}
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

                {/* Right Column: Troubleshooting & Help */}
                <div className="w-full md:w-1/2 bg-[#FAFBFF] border border-gray-100 rounded-3xl p-6 sm:p-8 flex flex-col justify-between animate-in fade-in slide-in-from-right-8 duration-700 delay-100 mt-6 md:mt-0">
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <HelpCircle className="w-5 h-5 text-gray-400" />
                            <h2 className="text-xl font-bold text-gray-900">Troubleshooting</h2>
                        </div>

                        <div className="flex flex-col gap-4 text-xs text-gray-600 font-medium">
                            <div className="flex gap-3 items-start">
                                <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 flex-shrink-0">1</span>
                                <div>
                                    <h4 className="font-bold text-gray-800 mb-0.5">Incorrect Payment Credentials</h4>
                                    <p className="text-gray-400 leading-normal font-normal">Double-check card numbers, expiry dates, or UPI IDs entered during checkout.</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 flex-shrink-0">2</span>
                                <div>
                                    <h4 className="font-bold text-gray-800 mb-0.5">Insufficient Funds / Bank Limits</h4>
                                    <p className="text-gray-400 leading-normal font-normal">Ensure your account has sufficient balance or that you haven't exceeded transaction limits.</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 flex-shrink-0">3</span>
                                <div>
                                    <h4 className="font-bold text-gray-800 mb-0.5">Network or Gateway Timeout</h4>
                                    <p className="text-gray-400 leading-normal font-normal">The connection between the gateway and your bank might have timed out. Please try again.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="border-t border-solid border-gray-200 my-5"></div>
                        <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex gap-3">
                            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">Deducted Amount?</span>
                                <p className="text-[10px] text-amber-700 leading-normal font-medium">
                                    If any amount was debited from your account, it will automatically be auto-refunded to your source account within 3-5 business days.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
