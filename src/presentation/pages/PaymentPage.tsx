import React, { useState, useEffect } from 'react';
import { getFallbackImage } from '../../utils/imageUtils';
import { useToast } from '../context/ToastContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Check, Mic, BellOff, Users, DoorOpen, ShieldCheck, Loader2, Package, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUserLocation } from '../context/LocationContext';
import { placeOrder, startPayment, verifyPayment, closePayUPopupWindow, fetchRestaurantById, reverseGeocode, isPayUPopupClosed, preOpenPayUPopup } from '../../data/api';
import { Restaurant } from '../context/FilterContext';
import { PaymentSelectionOverlay } from '../components/checkout/PaymentSelectionOverlay';
import { MobileMenu } from '../components/checkout/MobileMenu';
import { MapPicker } from '../components/checkout/MapPicker';
import orderSuccessImg from '../../assets/checkout/order_placed.svg';

import { StepperIcon } from '../components/checkout/StepperIcon';
import { LoadingScreen } from '../components/LoadingScreen';


export const PaymentPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const {
        cartItems, cartTotal, clearCart, restaurantName, restaurantId,
        deliveryQuote,
        deliveryStatus,
        deliveryError,
        isCheckingDelivery,
        fulfillmentType,
        setFulfillmentType,
        includeCutlery,
        addToCart,
        removeFromCart,
        isCartLoading
    } = useCart();
    const { selectedLocation } = useUserLocation();
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [detailsFetchAttempted, setDetailsFetchAttempted] = useState(false);
    const [isOrdered, setIsOrdered] = useState(false);
    const [instructions, setInstructions] = useState(() => {
        return sessionStorage.getItem('checkout_instructions') || '';
    });
    const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<string | null>(() => {
        return sessionStorage.getItem('checkout_delivery_option');
    });
    const [tipAmount, setTipAmount] = useState<number>(() => {
        const saved = sessionStorage.getItem('checkout_tip_amount');
        return saved ? Number(saved) : 0;
    });
    const [agreedToTerms, setAgreedToTerms] = useState<boolean>(() => {
        return sessionStorage.getItem('checkout_agreed_to_terms') === 'true';
    });

    useEffect(() => {
        sessionStorage.setItem('checkout_instructions', instructions);
    }, [instructions]);

    useEffect(() => {
        if (selectedDeliveryOption) {
            sessionStorage.setItem('checkout_delivery_option', selectedDeliveryOption);
        } else {
            sessionStorage.removeItem('checkout_delivery_option');
        }
    }, [selectedDeliveryOption]);

    useEffect(() => {
        sessionStorage.setItem('checkout_tip_amount', tipAmount.toString());
    }, [tipAmount]);

    useEffect(() => {
        sessionStorage.setItem('checkout_agreed_to_terms', agreedToTerms.toString());
    }, [agreedToTerms]);

    const [finalAmount, setFinalAmount] = useState(0);
    const [isPaymentOverlayOpen, setIsPaymentOverlayOpen] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
    const [confirmedRestaurant, setConfirmedRestaurant] = useState<string | null>(null);
    const [restaurantDetails, setRestaurantDetails] = useState<Restaurant | null>(null);
    const deliveryQuoteId = deliveryQuote?.id || '';
    const deliveryFee = fulfillmentType === 'Pickup' ? 0 : (deliveryQuote?.deliveryFee || 0);
    const platformFee = cartTotal > 0 ? 5 : 0;
    const gst = cartTotal > 0 ? Math.round(cartTotal * 0.05) : 0;
    const grandTotal = cartTotal + deliveryFee + platformFee + gst + tipAmount;

    // Enrich cart items dynamically using the fetched restaurant details (menu catalog) to preserve correct isVeg status and imageUrl
    const enrichedCartItems = React.useMemo(() => {
        return cartItems.map(item => {
            if (item.isAddon) return item;
            const menuItem = restaurantDetails?.menu?.find(m => m.id === (item.menuItemId || item.id));
            return {
                ...item,
                isVeg: menuItem ? (menuItem.type === 'Veg') : item.isVeg,
                imageUrl: menuItem ? (menuItem.imageUrl || item.imageUrl) : item.imageUrl
            };
        });
    }, [cartItems, restaurantDetails]);



    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (isPaymentPopupOpen && currentOrderId) {
            interval = setInterval(async () => {
                // If user intentionally closed the payment popup window, cancel polling and reset states
                if (isPayUPopupClosed()) {
                    clearInterval(interval);
                    setIsPaymentPopupOpen(false);
                    sessionStorage.removeItem("txnId");
                    sessionStorage.removeItem("orderId");
                    showToast("Payment failed or was cancelled.", "error");
                    return;
                }

                const txnId = sessionStorage.getItem("txnId");
                if (!txnId) return;

                const response = await verifyPayment(txnId);

                if (response && response.status === 'success') {
                    clearInterval(interval);
                    setIsPaymentPopupOpen(false);
                    closePayUPopupWindow();

                    // 🎉 success UI
                    setFinalAmount(grandTotal);
                    setIsOrdered(true);
                    clearCart();

                } else if (response && (response.status === 'failure' || response.status === 'cancelled')) {
                    clearInterval(interval);
                    setIsPaymentPopupOpen(false);
                    closePayUPopupWindow();

                    showToast("Payment failed or was cancelled.", "error");
                }
            }, 3000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPaymentPopupOpen, currentOrderId, grandTotal, clearCart]);

    // Check for payment failure on mount (if they return from PayU via back button)
    useEffect(() => {
        const txnId = sessionStorage.getItem("txnId");
        const orderId = sessionStorage.getItem("orderId");

        if (txnId && orderId && !isPaymentPopupOpen) {
            // User came back from payment page without success
            sessionStorage.removeItem("txnId");
            sessionStorage.removeItem("orderId");
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        const loadRestaurantDetails = async () => {
            if (restaurantId) {
                try {
                    const details = await fetchRestaurantById(restaurantId);
                    if (!cancelled) {
                        setRestaurantDetails(details);
                        // Force 'Delivery' if restaurant doesn't accept pickup
                        if (details && !details.acceptsPickup && fulfillmentType === 'Pickup') {
                            setFulfillmentType('Delivery');
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch restaurant details:", error);
                } finally {
                    if (!cancelled) {
                        setDetailsFetchAttempted(true);
                    }
                }
            } else {
                setDetailsFetchAttempted(true);
            }
        };
        loadRestaurantDetails();
        return () => {
            cancelled = true;
        };
    }, [restaurantId]);

    const handlePlaceOrder = async () => {
        // if (!restaurantId) {
        //     alert("Restaurant information is missing. Please try re-adding items to your cart.");
        //     return;
        // }

        setIsPlacingOrder(true);
        try {
            if (!restaurantId) {
                showToast("Restaurant information is missing. Please re-add items.", "error");
                setIsPlacingOrder(false);
                return;
            }

            if (fulfillmentType === 'Delivery' && !selectedLocation) {
                showToast("Please select a delivery address.", "warning");
                setIsPlacingOrder(false);
                return;
            }

            // Pre-open PayU popup synchronously during the user-gesture click stack (prevents Chrome Pop-up Blocker)
            if (selectedPaymentMethod && selectedPaymentMethod !== "CASH") {
                preOpenPayUPopup();
            }

            const customerPhone = localStorage.getItem('customer_phone') || "0000000000";

            // Resolve real pincode/city for the order — required by the orders API
            const [pickupGeo, dropGeo] = await Promise.all([
                restaurantDetails?.latitude && restaurantDetails?.longitude
                    ? reverseGeocode(restaurantDetails.latitude, restaurantDetails.longitude)
                    : Promise.resolve(null),
                selectedLocation?.latitude && selectedLocation?.longitude
                    ? reverseGeocode(selectedLocation.latitude, selectedLocation.longitude)
                    : Promise.resolve(null)
            ]);

            const resolvedPickupPincode = restaurantDetails?.pincode || pickupGeo?.pincode || '411001'; // Fallback to a default if both fail
            const resolvedDropCity = selectedLocation?.city || dropGeo?.city || 'Pune';
            const resolvedDropPincode = selectedLocation?.pincode || dropGeo?.pincode || '411001';

            const payload = {
                paymentId: selectedPaymentMethod || "CASH",
                paymentTransactionId: "",
                deliveryQuoteId: deliveryQuoteId,
                fulfillmentType: fulfillmentType,
                restaurantId: restaurantId,
                restaurantName: restaurantName || restaurantDetails?.name || "Unknown Restaurant",
                restaurantPhone: restaurantDetails?.phone || "0000000000",
                pickupLatitude: restaurantDetails?.latitude || 0,
                pickupLongitude: restaurantDetails?.longitude || 0,
                pickupPincode: resolvedPickupPincode,
                pickupAddress: restaurantDetails?.addressLine || "",
                deliveryAddress: {
                    street: selectedLocation?.addressLine || "",
                    city: resolvedDropCity,
                    pincode: resolvedDropPincode,
                    latitude: selectedLocation?.latitude || 0,
                    longitude: selectedLocation?.longitude || 0,
                    landmark: (selectedLocation?.landmark && selectedLocation?.landmark !== selectedLocation?.label) ? selectedLocation.landmark : null,
                    buildingName: "",
                    floor: "",
                    contactPhone: customerPhone,
                    instructions: selectedDeliveryOption || ""
                },
                items: enrichedCartItems.map(item => ({
                    menuItemId: item.menuItemId || item.id || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                    itemName: item.name,
                    itemDescription: item.description || "Description",
                    imageUrl: item.imageUrl || getFallbackImage(item.name),
                    unitPrice: item.price,
                    quantity: item.quantity,
                    specialInstructions: item.customizations || ""
                })),
                pricing: {
                    subTotal: cartTotal,
                    deliveryFee: deliveryFee,
                    tax: gst,
                    discount: 0,
                    packagingFee: 0,
                    serviceFee: platformFee,
                    tip: tipAmount,
                    discountCode: "",
                    discountDescription: ""
                },
                specialInstructions: includeCutlery
                    ? `Please include cutlery. ${instructions}`.trim()
                    : instructions
            };

            const order = await placeOrder(payload);
            setConfirmedRestaurant(payload.restaurantName);

            if (selectedPaymentMethod === "CASH") {
                setFinalAmount(grandTotal);
                setCurrentOrderId(order.id);
                setIsOrdered(true);
                clearCart();
            } else {
                await startPayment(order.id);
                setCurrentOrderId(order.id);
                setIsPaymentPopupOpen(true);
            }
            showToast("Order initiated successfully!", "success");
        } catch (error: any) {
            console.error('Failed to place order:', error);

            // Close the pre-opened PayU popup if order placement failed
            if (selectedPaymentMethod && selectedPaymentMethod !== "CASH") {
                closePayUPopupWindow();
            }

            const errorType = error.response?.data?.type;
            if (errorType === 'Order.RestaurantDoesNotAcceptPickup') {
                showToast("Pickup unavailable. Switched to Delivery.", "warning");
                setFulfillmentType('Delivery');
            } else {
                showToast(error.message || 'Something went wrong. Please try again.', "error");
            }
        } finally {
            setIsPlacingOrder(false);
        }
    };

    if (isOrdered) {
        return (
            <div className="min-h-[100dvh] bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-12 font-sans relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#00A050] opacity-[0.03] rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#FF584A] opacity-[0.03] rounded-full blur-3xl"></div>
                </div>

                <div className="w-full max-w-[480px] lg:max-w-[900px] bg-white rounded-[32px] shadow-2xl shadow-gray-200/50 p-6 sm:p-10 flex flex-col lg:flex-row items-center lg:items-stretch gap-8 lg:gap-12 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">

                    {/* Left Column: Success Animation & Illustration */}
                    <div className="flex-1 flex flex-col items-center justify-center w-full">
                        {/* Success Animation Circle */}
                        <div className="relative mb-6 lg:mb-8 flex justify-center items-center mt-2">
                            <div className="absolute w-24 h-24 bg-[#00A050] opacity-20 rounded-full animate-ping"></div>
                            <div className="absolute w-20 h-20 bg-[#00A050] opacity-30 rounded-full animate-pulse"></div>
                            <div className="relative z-10 bg-gradient-to-b from-[#00C864] to-[#00A050] w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-[#00A050]/30 transform hover:scale-105 transition-transform duration-300">
                                <Check className="w-8 h-8 text-white stroke-[3]" />
                            </div>
                        </div>

                        {/* Header Text */}
                        <div className="text-center mb-6 lg:mb-8 flex flex-col gap-2">
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                                Order Placed!
                            </h1>
                            <p className="text-gray-500 text-[15px] font-medium leading-relaxed max-w-[300px] mx-auto">
                                Your order has been successfully placed and is on its way to being prepared.
                            </p>
                        </div>

                        {/* Illustration container */}
                        <div className="w-full max-w-[220px] relative mt-auto lg:mb-4">
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none"></div>
                            <img
                                src={orderSuccessImg}
                                alt="Order Success Celebration"
                                className="w-full h-auto object-contain animate-in zoom-in duration-700 delay-150 drop-shadow-xl"
                            />
                        </div>
                    </div>

                    {/* Divider for Desktop */}
                    <div className="hidden lg:block w-px bg-gray-100 my-4"></div>
                    {/* Divider for Mobile */}
                    <div className="block lg:hidden h-px bg-gray-100 w-full my-2"></div>

                    {/* Right Column: Details & Actions */}
                    <div className="flex-1 flex flex-col justify-center w-full">
                        {/* Order Details Card */}
                        <div className="w-full bg-[#FAFBFF] border border-gray-100 rounded-2xl p-5 mb-8 transform transition-all hover:shadow-md hover:border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-50">
                                        <Package className="w-6 h-6 text-[#FF584A]" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className=" font-bold text-md uppercase tracking-wider mb-0.5">Order ID</span>
                                        <span className="text-gray-500 font-medium text-sm tracking-tight truncate w-[180px] sm:w-auto" title={currentOrderId || "1771138859799"}>
                                            {currentOrderId || "1771138859799"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-gray-100 w-full mb-4"></div>

                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center text-[15px]">
                                    <span className="text-gray-500 font-medium">Restaurant</span>
                                    <span className="text-gray-900 font-bold truncate max-w-[150px] text-right" title={confirmedRestaurant || "Unknown Restaurant"}>
                                        {confirmedRestaurant || "Unknown Restaurant"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-[15px]">
                                    <span className="text-gray-500 font-medium">Estimated Time</span>
                                    <span className="text-gray-900 font-bold">30-35 min</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-100">
                                    <span className="text-gray-500 font-bold">Total Amount</span>
                                    <span className="text-[#FF4732] font-bold text-[18px]">₹{finalAmount.toFixed(0)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="w-full flex flex-col gap-3 mt-auto">
                            <button
                                onClick={() => navigate(`/track-order?orderId=${currentOrderId}`, { replace: true })}
                                className="group w-full bg-[#FF584A] text-white font-bold text-[17px] py-[18px] rounded-2xl shadow-lg shadow-[#FF584A]/25 hover:bg-[#E5483B] hover:shadow-[#FF584A]/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                Track Order Status
                            </button>
                            <button
                                onClick={() => navigate('/', { replace: true })}
                                className="w-full bg-white text-gray-500 font-bold text-[16px] py-[16px] rounded-2xl hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-[0.98] border border-transparent hover:border-gray-200"
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isCartLoading || (restaurantId && !detailsFetchAttempted)) {
        return <LoadingScreen message="Setting up your secure checkout..." />;
    }

    return (
        <div className="min-h-screen bg-[#F5F6F8] font-sans pb-40">
            {/* Top Bar */}
            <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-gray-100 shadow-sm">
                <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center">
                    <ArrowLeft className="w-5 h-5 text-gray-800" />
                </button>
                <div className="flex-1"></div>
                {/* <button onClick={() => setIsMenuOpen(true)} className="p-2 text-gray-700">
                    <MenuIcon className="w-6 h-6" />
                </button> */}
            </div>



            {/* Main Content Wrapper */}
            <div className="max-w-md lg:max-w-6xl mx-auto px-4 flex flex-col lg:pt-4">

                {/* Stepper */}
                <div className="bg-white lg:rounded-2xl px-6 py-4 border-b lg:border border-gray-100 flex items-center justify-between shadow-sm -mx-4 lg:mx-0 mb-1 lg:mb-4">
                    {/* Menu Step - done */}
                    <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-white border border-[#E0E0E0] text-[#00A050] shadow-sm flex items-center justify-center mb-1">
                            <StepperIcon type="menu" className="text-[#00A050]" />
                        </div>
                        <span className="text-[10px] font-bold text-[#00A050]">Menu</span>
                    </div>

                    {/* Connector 1 */}
                    <div className="flex gap-[4px] items-center flex-shrink-0 mb-4 flex-1 justify-center px-1">
                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#00A050]"></div>)}
                    </div>

                    {/* Cart Step - done */}
                    <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-white border border-[#E0E0E0] text-[#00A050] shadow-sm flex items-center justify-center mb-1">
                            <StepperIcon type="cart" className="text-[#00A050]" />
                        </div>
                        <span className="text-[10px] font-bold text-[#00A050]">Cart</span>
                    </div>

                    {/* Connector 2 */}
                    <div className="flex gap-[4px] items-center flex-shrink-0 mb-4 flex-1 justify-center px-1">
                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#00A050]"></div>)}
                    </div>

                    {/* Details Step - done */}
                    <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-white border border-[#E0E0E0] text-[#00A050] shadow-sm flex items-center justify-center mb-1">
                            <StepperIcon type="address" className="text-[#00A050]" />
                        </div>
                        <span className="text-[10px] font-bold text-[#00A050]">Details</span>
                    </div>

                    {/* Connector 3 */}
                    <div className="flex gap-[4px] items-center flex-shrink-0 mb-4 flex-1 justify-center px-1">
                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#00A050]"></div>)}
                    </div>

                    {/* Checkout Step - active */}
                    <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-[#FFF0EF] border border-[#FFCCCB] text-[#FF4732] shadow-sm flex items-center justify-center mb-1">
                            <StepperIcon type="checkout" className="text-[#FF4732]" />
                        </div>
                        <span className="text-[10px] font-bold text-[#FF4732]">Checkout</span>
                    </div>
                </div>

                {/* Two Column Layout for Desktop */}
                <div className={`flex flex-col lg:flex-row gap-6 lg:items-start lg:mt-2 ${fulfillmentType === 'Pickup' ? 'lg:justify-center' : ''}`}>

                    {/* Left Column */}
                    {fulfillmentType !== 'Pickup' && (
                        <div className="flex flex-col gap-6 flex-1 w-full lg:max-w-[48%]">

                            {/* Address Map */}
                            <div className="hidden lg:flex flex-col gap-2 pt-2">
                                <h2 className="text-sm font-bold text-gray-900 ml-1">Address Map</h2>
                                <div className="w-full h-[220px] bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 relative">
                                    <MapPicker
                                        position={selectedLocation?.latitude ? { lat: selectedLocation.latitude, lng: selectedLocation.longitude } : { lat: 18.5204, lng: 73.8567 }}
                                        onPositionChange={() => { }}
                                        readOnly={true}
                                    />
                                    {isCheckingDelivery && (
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                                            <Loader2 className="w-8 h-8 animate-spin text-[#FF584A]" />
                                        </div>
                                    )}

                                    {deliveryStatus && (
                                        <div className={`absolute bottom-4 left-4 right-auto z-10 w-[calc(100%-32px)] max-w-[280px] p-3 rounded-xl shadow-lg border flex items-start gap-3 animate-in slide-in-from-bottom-2 duration-300 ${deliveryStatus === 'success' ? 'bg-[#E6F5EC] border-[#D1EEDB] text-[#00A050]' :
                                            deliveryStatus === 'error' ? 'bg-[#FFF0EF] border-[#FFCCCB] text-[#FF4732]' :
                                                'bg-amber-50 border-amber-100 text-amber-700'
                                            }`}>
                                            {deliveryStatus === 'success' ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" /> :
                                                deliveryStatus === 'error' ? <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> :
                                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                                            <div className="flex flex-col ">
                                                <span className="text-[13px] font-medium leading-snug">
                                                    {deliveryStatus === 'success'
                                                        ? `Delivers here${deliveryQuote && deliveryQuote.distanceKm > 0 ? ` (~${deliveryQuote.distanceKm} km)` : ''} • ${deliveryQuote?.estimatedMinutes || '30-40'} mins`
                                                        : deliveryError}
                                                </span>
                                                {deliveryStatus === 'error' && (
                                                    <span className="text-[11px] font-medium opacity-80 mt-1">Try a different address or pick a closer restaurant.</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Delivery Instructions */}
                            <div className="flex flex-col gap-2 pt-2">
                                <h2 className="text-sm font-bold text-gray-900 ml-1">Delivery Instructions</h2>
                                <div className="relative">
                                    <textarea
                                        value={instructions}
                                        onChange={(e) => setInstructions(e.target.value.slice(0, 200))}
                                        placeholder="Do not ring the doorbell, leave food at the doorstep."
                                        className="w-full h-32 bg-white border border-gray-200 rounded-2xl p-4 pr-12 outline-none focus:border-[#FF4732] text-sm font-medium text-gray-600 resize-none shadow-sm"
                                    />
                                    <button className="absolute top-4 right-4 text-[#FF4732]">
                                        <Mic className="w-5 h-5" />
                                    </button>
                                    <span className="absolute bottom-4 left-4 text-[11px] text-gray-300 font-medium">
                                        {instructions.length > 0 ? instructions.length : '83'}/200
                                    </span>
                                </div>
                            </div>

                            {/* Delivery Options */}
                            <div className="flex flex-col gap-3">
                                <h2 className="text-sm font-bold text-gray-900 ml-1">Delivery Options</h2>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { id: 'Door Pickup', icon: Users, label: 'Door Pickup' },
                                        { id: 'Leave at Door', icon: DoorOpen, label: 'Leave at Door' },
                                        { id: 'Leave at Security', icon: ShieldCheck, label: 'Leave at Security' },
                                        { id: 'Don\'t ring the bell', icon: BellOff, label: 'Don\'t ring the bell' }
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setSelectedDeliveryOption(opt.id)}
                                            className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all h-[76px] ${selectedDeliveryOption === opt.id ? 'border-[#FF4732] bg-[#FFF0EF] text-[#FF4732]' : 'border-gray-200 bg-white text-gray-400'}`}
                                        >
                                            <opt.icon className={`w-5 h-5 ${selectedDeliveryOption === opt.id ? 'text-[#FF4732]' : 'text-gray-400'}`} />
                                            <span className={`text-[9px] font-bold leading-tight text-center ${selectedDeliveryOption === opt.id ? 'text-[#FF4732]' : 'text-gray-400'}`}>
                                                {opt.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )} {/* End Left Column */}

                    {/* Right Column */}
                    <div className={`flex flex-col gap-6 w-full lg:flex-1 ${fulfillmentType === 'Pickup' ? 'lg:max-w-[600px]' : 'lg:max-w-[50%]'}`}>

                        {/* Cart Items */}
                        <div className="hidden flex-col gap-3">
                            <h2 className="text-sm font-bold text-gray-900 ml-1">Cart Items</h2>
                            <div className="flex flex-col gap-3">
                                {enrichedCartItems.map(item => (
                                    <div key={`dc-${item.id}`} className="bg-white rounded-2xl p-3 shadow-sm flex items-start justify-between border border-gray-100">
                                        <div className="flex gap-4 items-center w-full">
                                            {!item.isAddon && (
                                                <div className="w-14 h-14 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden relative">
                                                    <img src={item.imageUrl || getFallbackImage(item.name)} alt={item.name} className="w-full h-full object-cover" />
                                                    <div className="absolute bottom-1 left-1">
                                                        <div className={`w-3.5 h-3.5 rounded-sm border-2 ${item.isVeg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center bg-white p-0.5 shadow-sm`}>
                                                            <div className={`w-full h-full rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <h4 className="font-bold text-[14px] text-[#2D2D2D]">{item.name}</h4>
                                                {item.customizations && (
                                                    <p className="text-[11px] text-gray-500 mt-0.5 leading-snug line-clamp-2">
                                                        <span className="font-bold text-gray-600">Note:</span> {item.customizations}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-2 mt-1">
                                                    {!item.isAddon && <span className="text-gray-400 line-through text-xs font-medium">₹ {Math.round(item.price * 1.1).toFixed(2)}</span>}
                                                    <span className={`${item.isAddon ? 'text-gray-500 text-xs' : 'text-[#FF4732] font-bold text-[14px]'}`}>₹ {item.price.toFixed(2)}</span>
                                                </div>
                                            </div>
                                            {!item.isAddon ? (
                                                <div className="flex items-center bg-white border border-gray-200 rounded-full overflow-hidden shadow-sm h-[34px]">
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="font-bold w-4 text-center text-[13px]">{item.quantity}</span>
                                                    <button
                                                        onClick={() => addToCart({ ...item }, restaurantId, restaurantName)}
                                                        className="w-8 h-full flex items-center justify-center text-gray-800 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="w-5 h-5 rounded-md bg-[#00A050] flex items-center justify-center mr-1">
                                                    <CheckCircle className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Add Tip */}
                        {fulfillmentType !== 'Pickup' && (
                            <div className="bg-white lg:bg-transparent rounded-[24px] lg:rounded-none p-5 lg:p-0 shadow-sm lg:shadow-none border border-gray-50 lg:border-none flex flex-col gap-4">
                                <h2 className="text-sm font-bold text-gray-900">Add Tip for Delivery Partner</h2>
                                <div className="flex gap-2">
                                    {[
                                        { label: 'No Tip', value: 0 },
                                        { label: '₹20', value: 20 },
                                        { label: '₹30', value: 30 },
                                        { label: '₹50', value: 50 }
                                    ].map((tip) => (
                                        <button
                                            key={tip.label}
                                            onClick={() => setTipAmount(tip.value)}
                                            className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all ${tipAmount === tip.value ? 'bg-[#FF584A] text-white shadow-lg shadow-red-100' : 'bg-[#F2F4F7] text-gray-700 hover:bg-gray-100'}`}
                                        >
                                            {tip.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Add Payment Method Button */}
                        {/* <button
                            onClick={() => setIsPaymentOverlayOpen(true)}
                            className="w-full bg-[#FFEFEF] text-[#FF4732] font-bold text-[16px] py-5 rounded-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                        >
                            {selectedPaymentMethod ? (
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    <span>{selectedPaymentMethod} Selected</span>
                                </div>
                            ) : (
                                <>
                                    <Plus className="w-5 h-5 stroke-[3]" />
                                    Add Payment Method
                                </>
                            )}
                        </button> */}


                        <div className="flex flex-col gap-3">
                            <h2 className="text-sm font-bold text-gray-900 ml-1 mt-2">
                                Order Details • {restaurantName?.toUpperCase() || restaurantDetails?.name?.toUpperCase() || 'STAGE'}
                            </h2>
                            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">

                                {/* Items List */}
                                <div className="flex flex-col gap-3">
                                    {enrichedCartItems.map((item) => (
                                        <div key={`od-${item.id}`} className="flex justify-between items-center text-[15px] font-bold text-gray-800">
                                            <div className="flex items-center">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2.5 shrink-0" />
                                                <span>{item.name} x {item.quantity}</span>
                                            </div>
                                            <span className="text-gray-700 font-bold">₹{Math.round(item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-dashed border-gray-200/80 my-1" />

                                {/* Price Breakdown */}
                                <div className="flex flex-col gap-3 text-[14px]">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 font-medium">Item Total</span>
                                        <span className="text-gray-700 font-bold">₹{cartTotal.toFixed(0)}</span>
                                    </div>

                                    {fulfillmentType !== 'Pickup' && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 font-medium">Delivery Fee</span>
                                            {isCheckingDelivery ? (
                                                <div className="h-4 w-12 bg-gray-100 rounded-full animate-pulse" />
                                            ) : (
                                                <span className="text-gray-700 font-bold">
                                                    {deliveryFee > 0 ? `₹${deliveryFee.toFixed(0)}` : 'FREE'}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {tipAmount > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 font-medium">Delivery Tip</span>
                                            <span className="text-gray-700 font-bold">₹{tipAmount.toFixed(0)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 font-medium">Platform Charges</span>
                                        <span className="text-gray-700 font-bold">₹{platformFee.toFixed(0)}</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 font-medium">GST (5%)</span>
                                        <span className="text-gray-700 font-bold">₹{gst.toFixed(0)}</span>
                                    </div>
                                </div>

                                <div className="border-t border-dashed border-gray-200/80 my-1" />

                                {/* Total Paid */}
                                <div className="flex justify-between items-center pt-1">
                                    <span className="text-gray-950 font-bold text-base">Total Paid</span>
                                    {isCheckingDelivery ? (
                                        <div className="h-5 w-16 bg-red-100 rounded-full animate-pulse" />
                                    ) : deliveryStatus === 'error' ? (
                                        <span className="text-gray-400 font-bold">--</span>
                                    ) : (
                                        <span className="text-gray-950 font-bold text-[18px]">₹{grandTotal.toFixed(0)}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Cancellation Policy */}
                        <div className="flex flex-col gap-1 px-1 py-1 mt-2 mb-3">
                            <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">
                                Cancellation Policy
                            </h3>
                            <p className="text-[11px] text-slate-400/90 font-semibold leading-relaxed ml-1">
                                A 100% cancellation charge will apply. This helps us compensate the restaurant partner for food preparation.
                            </p>
                        </div>

                        {/* Footer Section */}
                        <div className="flex flex-col gap-4 pb-6 px-1">
                            <div className="flex items-start gap-3">
                                <div
                                    onClick={() => setAgreedToTerms(!agreedToTerms)}
                                    className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${agreedToTerms ? 'bg-[#FF4732] border-[#FF4732]' : 'bg-white border-gray-200'}`}
                                >
                                    {agreedToTerms && <CheckCircle className="w-4 h-4 text-white" />}
                                </div>
                                <p className="text-[12px] text-gray-400 font-medium leading-relaxed">
                                    By accepting this order, I agree to all <Link to="/privacy?doc=terms" target="_blank" rel="noopener noreferrer" className="underline cursor-pointer hover:text-[#FF4732] transition-colors">terms & conditions.</Link>
                                </p>
                            </div>

                            <p className="text-[11px] text-gray-400 font-medium leading-loose">
                                Check the payment details & restaurant information before placing your order. Business ID: 2026115526H
                            </p>
                        </div>

                        {/* Desktop Proceed Button */}
                        {isPaymentPopupOpen ? (
                            <div className="hidden lg:flex flex-col items-center justify-center gap-2 mt-2 py-4">
                                <Loader2 className="w-8 h-8 animate-spin text-[#FF584A]" />
                                <span className="font-bold text-gray-600 text-sm">Please complete payment in the popup window...</span>
                            </div>
                        ) : (
                            <button
                                onClick={handlePlaceOrder}
                                disabled={isPlacingOrder || isCheckingDelivery || !agreedToTerms || deliveryStatus === 'error'}
                                className="hidden lg:flex w-full bg-[#FF584A] text-white font-bold text-[17px] py-[18px] rounded-xl shadow-md hover:bg-[#E5483B] transition-colors justify-center items-center active:scale-[0.98] disabled:opacity-50 mt-2"
                            >
                                {isPlacingOrder ? <Loader2 className="w-5 h-5 animate-spin" /> : isCheckingDelivery ? 'Checking delivery...' : 'Proceed to pay'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Fixed Button - Mobile Only */}
            <div className="fixed lg:hidden bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-6 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-30">
                <div className="max-w-md mx-auto">
                    {isPaymentPopupOpen ? (
                        <div className="w-full flex justify-center items-center py-4">
                            <Loader2 className="w-8 h-8 animate-spin text-[#FF584A]" />
                        </div>
                    ) : (
                        <button
                            onClick={handlePlaceOrder}
                            disabled={isPlacingOrder || isCheckingDelivery || !agreedToTerms || deliveryStatus === 'error'}
                            className="w-full bg-[#FF584A] text-white font-bold text-[17px] py-[18px] rounded-xl shadow-md hover:bg-[#E5483B] transition-colors flex justify-center items-center active:scale-[0.98] disabled:opacity-50"
                        >
                            {isPlacingOrder ? <Loader2 className="w-5 h-5 animate-spin" /> : isCheckingDelivery ? 'Checking delivery...' : 'Proceed to pay'}
                        </button>
                    )}
                </div>
            </div>
            {isPaymentOverlayOpen && (
                <PaymentSelectionOverlay
                    onClose={() => setIsPaymentOverlayOpen(false)}
                    onSelect={(method) => {
                        setSelectedPaymentMethod(method);
                        setIsPaymentOverlayOpen(false);
                    }}
                />
            )}

            <MobileMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
            />
        </div>
    );
};
