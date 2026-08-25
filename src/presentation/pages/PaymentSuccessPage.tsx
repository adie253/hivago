import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, Package, ArrowRight, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import orderSuccessImg from '../../assets/checkout/order_placed.svg';
import { verifyPayment, getOrderById, fetchRestaurantById, restoreAuthSessionFromBackup, clearPaymentBackup } from '../../data/api';

/**
 * ⏱️ CONTROL ANIMATION TIMING HERE (in milliseconds)
 * e.g., 3000 = 3 seconds, 4000 = 4 seconds, 2500 = 2.5 seconds
 */
export const SPLASH_DURATION_MS = 1800;

const OrderPlacedSplash: React.FC<{ durationMs?: number; onSkip: () => void }> = ({ durationMs = SPLASH_DURATION_MS, onSkip }) => {
    const progressSeconds = Math.max(0.5, (durationMs - 400) / 1000);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            onClick={onSkip}
            className="fixed inset-0 z-[99999] bg-gradient-to-b from-[#B02421] via-[#AD221F] to-[#7F1715] flex flex-col items-center justify-between p-6 sm:p-10 text-white font-sans overflow-hidden select-none cursor-pointer"
        >
            {/* Ambient Animated Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[600px] h-[600px] bg-white/10 rounded-full animate-ping opacity-20 duration-1000"></div>
                <div className="w-[420px] h-[420px] bg-white/10 rounded-full animate-pulse opacity-30"></div>
                <div className="w-[280px] h-[280px] bg-white/15 rounded-full blur-3xl"></div>
            </div>

            {/* Top Brand Tag */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="mt-6 flex items-center gap-2.5 bg-white/15 backdrop-blur-md px-5 py-2 rounded-full border border-white/20 shadow-lg"
            >
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
                <span className="text-xs font-extrabold uppercase tracking-widest text-white">Hivago Food Delivery</span>
            </motion.div>

            {/* Center Animation Content */}
            <div className="flex flex-col items-center justify-center text-center relative z-10 my-auto max-w-md px-4">
                {/* Scale-in Checkmark */}
                <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                        type: 'spring', 
                        stiffness: 280, 
                        damping: 18, 
                        delay: 0.25 
                    }}
                    className="relative mb-8"
                >
                    <div className="absolute -inset-6 rounded-full bg-white/20 animate-ping opacity-30"></div>
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white text-[#AD221F] flex items-center justify-center shadow-2xl shadow-black/40">
                        <Check className="w-14 h-14 sm:w-16 sm:h-16 stroke-[3.5]" />
                    </div>
                </motion.div>

                {/* Animated Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.5 }}
                    className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-3 drop-shadow-md"
                >
                    Order Placed!
                </motion.h1>

                {/* Animated Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.5 }}
                    className="text-base sm:text-lg text-white/95 font-medium leading-relaxed max-w-sm"
                >
                    Your payment was successful and your order is on its way to being prepared.
                </motion.p>
            </div>

            {/* Bottom Progress Bar & Tap Hint */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.5 }}
                className="mb-8 w-full max-w-xs flex flex-col items-center gap-3 relative z-10"
            >
                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden backdrop-blur-xs">
                    <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: progressSeconds, ease: "linear" }}
                        className="bg-white h-full rounded-full"
                    />
                </div>
                <span className="text-xs font-semibold text-white/80 tracking-wide">
                    Tap anywhere to view order summary
                </span>
            </motion.div>
        </motion.div>
    );
};

export const PaymentSuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { clearCart } = useCart();
    const [isLoading, setIsLoading] = useState(true);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [orderData, setOrderData] = useState<any>(null);
    const [restaurantAddress, setRestaurantAddress] = useState<string | null>(null);
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        if (!isLoading) {
            const timer = setTimeout(() => {
                setShowSplash(false);
            }, SPLASH_DURATION_MS);
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    useEffect(() => {
        console.log("[Diagnostic] PaymentSuccessPage mounted.");

        // Restore auth session if it was lost during the cross-site redirect
        const restored = restoreAuthSessionFromBackup();
        console.log("[Diagnostic] restoreAuthSessionFromBackup status:", restored);

        // Extract order info from URL, e.g. ?txnid=... or read from sessionStorage/localStorage
        const queryParams = new URLSearchParams(location.search);
        let id = queryParams.get('orderId') || sessionStorage.getItem('orderId') || localStorage.getItem('pay_orderId');
        let txn = queryParams.get('txnid') || sessionStorage.getItem('txnId') || localStorage.getItem('pay_txnId');

        if (id) {
            sessionStorage.setItem('last_placed_order_id', id);
            localStorage.setItem('last_placed_order_id', id);
        }

        console.log("[Diagnostic] Query params - orderId:", queryParams.get('orderId'), "txnid:", queryParams.get('txnid'));
        console.log("[Diagnostic] Session storage - orderId:", sessionStorage.getItem('orderId'), "txnId:", sessionStorage.getItem('txnId'));
        console.log("[Diagnostic] Local storage - pay_orderId:", localStorage.getItem('pay_orderId'), "pay_txnId:", localStorage.getItem('pay_txnId'));
        console.log("[Diagnostic] Resolved id:", id, "Resolved txn:", txn);

        setOrderId(id || txn || "1771138859799");

        const verifyAndCheckOrder = async () => {
            try {
                console.log("[Diagnostic] Starting verifyAndCheckOrder. txn:", txn, "id:", id);
                // 1. Verify the payment with backend
                if (txn) {
                    console.log("[Diagnostic] Calling verifyPayment with txn:", txn);
                    await verifyPayment(txn, id);
                } else {
                    const storedTxn = sessionStorage.getItem('txnId') || localStorage.getItem('pay_txnId');
                    console.log("[Diagnostic] txn is empty. Checking storedTxn:", storedTxn);
                    if (storedTxn) {
                        await verifyPayment(storedTxn, id);
                    } else {
                        console.warn("[Diagnostic] No transaction ID found. verifyPayment skipped.");
                    }
                }

                // 2. Double check order status from the server
                const finalOrderId = id || txn;
                if (finalOrderId) {
                    sessionStorage.setItem('last_placed_order_id', finalOrderId);
                    localStorage.setItem('last_placed_order_id', finalOrderId);
                    console.log("[Diagnostic] Fetching final order details for id:", finalOrderId);
                    const order = await getOrderById(finalOrderId);
                    console.log("[Diagnostic] Fetched order status:", order?.status, "paymentId:", order?.paymentId);
                    if (order) {
                        if (order.status === 'Cancelled' || order.status === 'Failed') {
                            console.warn("[Diagnostic] Order status is cancelled/failed. Redirecting to payment-failed.");
                            navigate(`/payment-failed?orderId=${finalOrderId}`, { replace: true });
                            return;
                        }
                        setOrderData(order);
                        
                        // Clear frontend/backend cart since the order is placed
                        clearCart(true);

                        try {
                            const restaurant = await fetchRestaurantById(order.restaurantId);
                            if (restaurant && restaurant.addressLine) {
                                setRestaurantAddress(restaurant.addressLine);
                            }
                        } catch (err) {
                            console.error("[Diagnostic] Failed to fetch restaurant details for address:", err);
                        }
                    } else {
                        console.error("[Diagnostic] Order data fetched from server is null.");
                    }
                } else {
                    console.warn("[Diagnostic] finalOrderId is missing, skipped getOrderById.");
                }
            } catch (error) {
                console.error("Error during payment verification on success page:", error);
            } finally {
                setIsLoading(false);
                // clean up session storage and localStorage backup
                sessionStorage.removeItem('orderId');
                sessionStorage.removeItem('txnId');
                clearPaymentBackup();

                // If we are running inside the PayU popup, close it so the parent can take over via polling
                if (window.opener && window.opener !== window) {
                    window.close();
                }
            }
        };

        verifyAndCheckOrder();
    }, [location]);

    // Handle browser back button on PaymentSuccessPage
    useEffect(() => {
        window.history.pushState({ page: 'payment-success' }, '', window.location.href);

        const handlePopState = () => {
            console.log("[Diagnostic] Back button intercepted on PaymentSuccessPage!");
            // Re-push state immediately so the browser history cannot pop back to payubiz.in or /payment
            window.history.pushState({ page: 'payment-success' }, '', window.location.href);

            const queryParams = new URLSearchParams(location.search);
            const resolvedOrderId = orderId || queryParams.get('orderId') || sessionStorage.getItem('last_placed_order_id') || localStorage.getItem('last_placed_order_id');
            if (resolvedOrderId) {
                navigate(`/track-order?orderId=${resolvedOrderId}`);
            } else {
                navigate('/');
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [orderId, location.search, navigate]);

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

    const getPricingDetails = () => {
        if (!orderData) return { subTotal: 0, deliveryFee: 0, platformFee: 0, tax: 0, packagingFee: 0, tip: 0, discount: 0, total: 0 };
        const total = orderData.totalAmount || orderData.pricing?.total || 0;
        const subTotal = orderData.pricing?.subTotal || 0;
        const deliveryFee = orderData.pricing?.deliveryFee || 0;
        const platformFee = orderData.pricing?.serviceFee || 0;
        const packagingFee = orderData.pricing?.packagingFee || 0;
        const tip = orderData.pricing?.tip || 0;
        const discount = orderData.pricing?.discount || 0;

        // Dynamic tax calculation: total = subTotal + deliveryFee + platformFee + packagingFee + tip + tax - discount
        // => tax = total - subTotal - deliveryFee - platformFee - packagingFee - tip + discount
        const tax = Math.max(0, total - (subTotal + deliveryFee + platformFee + packagingFee + tip) + discount);

        return { subTotal, deliveryFee, platformFee, tax, packagingFee, tip, discount, total };
    };

    const pricing = getPricingDetails();

    return (
        <>
            <AnimatePresence>
                {showSplash && (
                    <OrderPlacedSplash onSkip={() => setShowSplash(false)} />
                )}
            </AnimatePresence>

            <div className="min-h-[100dvh] bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#00A050] opacity-[0.03] rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-brand-primary opacity-[0.03] rounded-full blur-3xl"></div>
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
                                        <Package className="w-6 h-6 text-brand-primary" />
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
                            className="group w-full bg-brand-primary text-white font-bold text-[17px] py-[18px] rounded-2xl shadow-lg shadow-brand-primary/25 hover:bg-brand-secondary hover:shadow-brand-primary/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
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
                                    <span>₹{pricing.subTotal.toFixed(2)}</span>
                                </div>
                                {orderData.fulfillmentType !== 'Pickup' && pricing.deliveryFee > 0 && (
                                    <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                                        <span>Delivery Fee</span>
                                        <span>₹{pricing.deliveryFee.toFixed(2)}</span>
                                    </div>
                                )}
                                {pricing.platformFee > 0 && (
                                    <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                                        <span>Platform Fee</span>
                                        <span>₹{pricing.platformFee.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                                    <span>Taxes & Charges</span>
                                    <span>₹{pricing.tax.toFixed(2)}</span>
                                </div>
                                {pricing.packagingFee > 0 && (
                                    <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                                        <span>Packaging Fee</span>
                                        <span>₹{pricing.packagingFee.toFixed(2)}</span>
                                    </div>
                                )}
                                {pricing.tip > 0 && (
                                    <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                                        <span>Driver Tip</span>
                                        <span>₹{pricing.tip.toFixed(2)}</span>
                                    </div>
                                )}
                                {pricing.discount > 0 && (
                                    <div className="flex justify-between items-center text-xs text-[#00A050] font-bold">
                                        <span>Discount Applied</span>
                                        <span>-₹{pricing.discount.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="border-t border-solid border-gray-200 my-4"></div>

                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-gray-900">Grand Total</span>
                                <span className="text-xl font-bold text-[#00A050]">₹{pricing.total.toFixed(2)}</span>
                            </div>

                            <div className="flex items-center gap-2 mt-4 text-[11px] text-gray-400 font-semibold bg-white p-3 border border-gray-50 rounded-xl">
                                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="truncate">
                                    {orderData.fulfillmentType === 'Pickup'
                                        ? `Pickup from: ${restaurantAddress || orderData.deliveryInfo?.pickupAddress || 'Restaurant'}`
                                        : `Deliver to: ${(orderData.deliveryInfo?.deliveryAddress?.formattedAddress || orderData.deliveryInfo?.deliveryAddress?.street || 'Selected Location')}`
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </>
    );
};
