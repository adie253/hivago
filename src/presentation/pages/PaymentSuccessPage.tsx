import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, Package, ArrowRight, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import orderSuccessImg from '../../assets/checkout/order_placed.svg';
import { verifyPayment, getOrderById } from '../../data/api';

export const PaymentSuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { refreshCartFromServer } = useCart();
    const [isLoading, setIsLoading] = useState(true);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [orderData, setOrderData] = useState<any>(null);

    useEffect(() => {
        // Extract order info from URL, e.g. ?txnid=... or read from sessionStorage
        const queryParams = new URLSearchParams(location.search);
        let id = queryParams.get('orderId') || sessionStorage.getItem('orderId');
        let txn = queryParams.get('txnid') || sessionStorage.getItem('txnId');

        setOrderId(id || txn || "1771138859799");
        refreshCartFromServer();

        const verifyAndCheckOrder = async () => {
            try {
                // 1. Verify the payment with backend
                if (txn) {
                    await verifyPayment(txn);
                } else {
                    const storedTxn = sessionStorage.getItem('txnId');
                    if (storedTxn) {
                        await verifyPayment(storedTxn);
                    }
                }

                // 2. Double check order status from the server
                const finalOrderId = id || txn;
                if (finalOrderId) {
                    const order = await getOrderById(finalOrderId);
                    if (order) {
                        if (order.status === 'Cancelled' || order.status === 'Failed') {
                            navigate(`/payment-failed?orderId=${finalOrderId}`, { replace: true });
                            return;
                        }
                        setOrderData(order);
                    }
                }
            } catch (error) {
                console.error("Error during payment verification on success page:", error);
            } finally {
                setIsLoading(false);
                // clean up session storage
                sessionStorage.removeItem('orderId');
                sessionStorage.removeItem('txnId');

                // If we are running inside the PayU popup, close it so the parent can take over via polling
                if (window.opener && window.opener !== window) {
                    window.close();
                }
            }
        };

        verifyAndCheckOrder();
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

            <div className={`w-full ${orderData ? 'max-w-[960px]' : 'max-w-[480px]'} bg-white rounded-[32px] shadow-2xl shadow-gray-200/50 p-6 sm:p-10 flex flex-col md:flex-row gap-8 items-stretch relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out`}>
                
                {/* Left Column: Success Confirmation details */}
                <div className={`w-full ${orderData ? 'md:w-1/2' : ''} flex flex-col items-center justify-center text-center py-2`}>
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
                    <div className="w-full max-w-[200px] mb-8 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none"></div>
                        <img
                            src={orderSuccessImg}
                            alt="Order Success Celebration"
                            className="w-full h-auto object-contain animate-in zoom-in duration-700 delay-150 drop-shadow-xl"
                        />
                    </div>

                    {/* Compact Order Details (Only visible when order summary doesn't load) */}
                    {!orderData && (
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
                    )}

                    {/* Action Buttons */}
                    <div className="w-full flex flex-col gap-3 max-w-[360px]">
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

                {/* Right Column: Order Details Summary (Side-by-side on desktop, stacked on mobile) */}
                {orderData && (
                    <div className="w-full md:w-1/2 bg-[#FAFBFF] border border-gray-100 rounded-3xl p-6 sm:p-8 flex flex-col justify-between animate-in fade-in slide-in-from-right-8 duration-700 delay-100 mt-6 md:mt-0">
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
                                    <p className="text-xs text-gray-500 font-semibold">{orderData.restaurantName}</p>
                                </div>
                                <div className="bg-[#E6F5EC] text-[#00A050] px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
                                    Paid
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="flex flex-col gap-4 max-h-[220px] overflow-y-auto no-scrollbar mb-6 pr-1">
                                {orderData.items && orderData.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 bg-white border border-gray-100 rounded-md flex items-center justify-center text-[11px] font-bold text-gray-600">
                                                {item.quantity}x
                                            </span>
                                            <span className="font-semibold text-gray-800">{item.name || item.itemName}</span>
                                        </div>
                                        <span className="font-bold text-gray-900">₹{(item.unitPrice * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-dashed border-gray-200 my-4"></div>

                            {/* Billing details */}
                            <div className="flex flex-col gap-2.5">
                                <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                                    <span>Subtotal</span>
                                    <span>₹{(orderData.pricing?.subTotal || 0).toFixed(2)}</span>
                                </div>
                                {orderData.fulfillmentType !== 'Pickup' && (
                                    <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                                        <span>Delivery Fee</span>
                                        <span>{orderData.pricing?.deliveryFee > 0 ? `₹${(orderData.pricing.deliveryFee).toFixed(2)}` : 'FREE'}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                                    <span>Taxes & Charges</span>
                                    <span>₹{(orderData.pricing?.tax || 0).toFixed(2)}</span>
                                </div>
                                {orderData.pricing?.packagingFee > 0 && (
                                    <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                                        <span>Packaging Fee</span>
                                        <span>₹{(orderData.pricing.packagingFee).toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="border-t border-solid border-gray-200 my-4"></div>
                            
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-gray-900">Grand Total</span>
                                <span className="text-xl font-bold text-[#00A050]">₹{(orderData.totalAmount || orderData.pricing?.total || 0).toFixed(2)}</span>
                            </div>

                            <div className="flex items-center gap-2 mt-4 text-[11px] text-gray-400 font-semibold bg-white p-3 border border-gray-50 rounded-xl">
                                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="truncate">
                                    {orderData.fulfillmentType === 'Pickup' 
                                        ? `Pickup from: ${orderData.deliveryInfo?.pickupAddress || 'Restaurant'}`
                                        : `Deliver to: ${(orderData.deliveryInfo?.deliveryAddress?.formattedAddress || orderData.deliveryInfo?.deliveryAddress?.street || 'Selected Location')}`
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
