import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Menu as MenuIcon, CheckCircle, Check, ShoppingCart, MapPin, Wallet, Book, Mic, BellOff, Users, DoorOpen, ShieldCheck, Loader2, Package, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUserLocation } from '../context/LocationContext';
import { placeOrder, startPayment, verifyPayment, closePayUPopupWindow, fetchRawRestaurantById, ApiRestaurant, checkDeliveryAvailability } from '../../data/api';
import { PaymentSelectionOverlay } from '../components/checkout/PaymentSelectionOverlay';
import { MobileMenu } from '../components/checkout/MobileMenu';
import { MapPicker } from '../components/checkout/MapPicker';
import orderSuccessImg from '../../assets/checkout/order_placed.svg';

import menuIcon from '../../assets/stepper_icons/menu_gray.svg';
import cartIcon from '../../assets/stepper_icons/cart_gray.svg';
import addressIcon from '../../assets/stepper_icons/address_gray.svg';
import checkoutIcon from '../../assets/stepper_icons/checkout_gray.svg';

const StepperIcon = ({ src, active }: { src: string, active?: boolean }) => (
    <div 
        className={`w-[18px] h-[18px] ${active ? 'bg-[#FF4732]' : 'bg-[#00A050]'}`}
        style={{
            WebkitMaskImage: `url(${src})`,
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskImage: `url(${src})`,
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
        }}
    />
);

export const DemoCheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const { cartItems, cartTotal, clearCart, restaurantName, restaurantId } = useCart();
    const { selectedLocation } = useUserLocation();
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [isOrdered, setIsOrdered] = useState(false);
    const [instructions, setInstructions] = useState('');
    const [selectedDeliveryOption, setSelectedDeliveryOption] = useState('Leave at Door');
    const [tipAmount, setTipAmount] = useState(0);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [finalAmount, setFinalAmount] = useState(0);
    const [isPaymentOverlayOpen, setIsPaymentOverlayOpen] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
    const [confirmedRestaurant, setConfirmedRestaurant] = useState<string | null>(null);
    const [restaurantDetails, setRestaurantDetails] = useState<ApiRestaurant | null>(null);
    const deliveryFee = cartTotal > 0 ? 0 : 0; // Set to 0 to match "FREE" in image
    const platformFee = cartTotal > 0 ? 5 : 0;
    const gst = cartTotal > 0 ? Math.round(cartTotal * 0.05) : 0;
    const grandTotal = cartTotal + deliveryFee + platformFee + gst + tipAmount;

    const [deliveryCheck, setDeliveryCheck] = useState<{
        canDeliver: boolean;
        distanceKm: number;
        maxDistanceKm: number;
    } | null>(null);
    const [isCheckingDelivery, setIsCheckingDelivery] = useState(false);
    const [deliveryError, setDeliveryError] = useState<string | null>(null);
    const [deliveryStatus, setDeliveryStatus] = useState<'success' | 'error' | 'warning' | null>(null);

    useEffect(() => {
        if (selectedLocation?.latitude && restaurantId) {
            const check = async () => {
                setIsCheckingDelivery(true);
                setDeliveryError(null);
                setDeliveryStatus(null);
                try {
                    const result = await checkDeliveryAvailability(restaurantId, selectedLocation.latitude, selectedLocation.longitude);
                    if (result) {
                        setDeliveryCheck(result);
                        if (result.canDeliver) {
                            setDeliveryStatus('success');
                        } else {
                            setDeliveryStatus('error');
                            setDeliveryError(`Sorry, this restaurant doesn't deliver to your location. You're ${result.distanceKm} km away — they only deliver up to ${result.maxDistanceKm} km.`);
                        }
                    } else {
                        setDeliveryStatus('warning');
                        setDeliveryError("Couldn't verify delivery to this address.");
                    }
                } catch (e) {
                    setDeliveryStatus('warning');
                    setDeliveryError("Couldn't verify delivery to this address.");
                } finally {
                    setIsCheckingDelivery(false);
                }
            };
            check();
        }
    }, [selectedLocation, restaurantId]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (isPaymentPopupOpen && currentOrderId) {
            interval = setInterval(async () => {
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

                    alert("Payment failed or was cancelled.");
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
        const loadRestaurantDetails = async () => {
            if (restaurantId) {
                try {
                    const details = await fetchRawRestaurantById(restaurantId);
                    setRestaurantDetails(details);
                } catch (error) {
                    console.error("Failed to fetch restaurant details:", error);
                }
            }
        };
        loadRestaurantDetails();
    }, [restaurantId]);

    const handlePlaceOrder = async () => {
        // if (!restaurantId) {
        //     alert("Restaurant information is missing. Please try re-adding items to your cart.");
        //     return;
        // }

        setIsPlacingOrder(true);
        try {
            if (!restaurantId) {
                alert("Restaurant information is missing. Please try re-adding items to your cart.");
                return;
            }
            const customerPhone = localStorage.getItem('customer_phone') || "0000000000";

              const payload = {
                paymentId: selectedPaymentMethod || "CASH",
                paymentTransactionId: "",
                deliveryQuoteId: "",
                restaurantId: restaurantId,
                restaurantName: restaurantName || restaurantDetails?.name || "Unknown Restaurant",
                restaurantPhone: restaurantDetails?.phone || "0000000000",
                pickupLatitude: restaurantDetails?.latitude || 19.0760,
                pickupLongitude: restaurantDetails?.longitude || 72.8777,
                pickupPincode: restaurantDetails?.pincode || "400001",
                pickupAddress: restaurantDetails?.addressLine || "Restaurant Address",
                deliveryAddress: {
                    street: selectedLocation?.addressLine || "Unknown Street",
                    city: "Unknown City",
                    pincode: "000000",
                    latitude: selectedLocation?.latitude || 0,
                    longitude: selectedLocation?.longitude || 0,
                    landmark: selectedLocation?.label || "",
                    buildingName: "",
                    floor: "",
                    contactPhone: customerPhone,
                    instructions: selectedDeliveryOption
                },
                items: cartItems.map(item => ({
                    menuItemId: item.id || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                    itemName: item.name,
                    itemDescription: item.description || "Description",
                    imageUrl: item.imageUrl || "https://example.com/image.jpg",
                    unitPrice: item.price,
                    quantity: item.quantity,
                    specialInstructions: ""
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
                specialInstructions: instructions
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
        } catch (error) {
            console.error('Failed to place order:', error);
            alert('Something went wrong. Please try again.');
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
                                        <span className="text-gray-400 text-[13px] font-bold uppercase tracking-wider mb-0.5">Order ID</span>
                                        <span className="text-gray-900 font-bold text-lg tracking-tight truncate w-[180px] sm:w-auto" title={currentOrderId || "1771138859799"}>
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

    return (
        <div className="min-h-screen bg-[#F5F6F8] font-sans pb-40">
            {/* Top Bar */}
            <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-20 border-b border-gray-100 shadow-sm">
                <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center">
                    <ArrowLeft className="w-5 h-5 text-gray-800" />
                </button>
                <div className="flex-1"></div>
                <button onClick={() => setIsMenuOpen(true)} className="p-2 text-gray-700">
                    <MenuIcon className="w-6 h-6" />
                </button>
            </div>



            {/* Main Content Wrapper */}
            <div className="max-w-md lg:max-w-6xl mx-auto px-4 flex flex-col lg:pt-4">

                {/* Stepper */}
                <div className="bg-white lg:rounded-2xl px-6 py-4 border-b lg:border border-gray-100 flex items-center justify-between shadow-sm -mx-4 lg:mx-0 mb-1 lg:mb-4">
                    {/* Menu Step - done */}
                    <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-white border border-[#E0E0E0] text-[#00A050] shadow-sm flex items-center justify-center mb-1">
                            <StepperIcon src={menuIcon} />
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
                            <StepperIcon src={cartIcon} />
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
                            <StepperIcon src={addressIcon} />
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
                            <StepperIcon src={checkoutIcon} active />
                        </div>
                        <span className="text-[10px] font-bold text-[#FF4732]">Checkout</span>
                    </div>
                </div>

                {/* Two Column Layout for Desktop */}
                <div className="flex flex-col lg:flex-row gap-6 lg:items-start lg:mt-2">

                    {/* Left Column */}
                    <div className="flex flex-col gap-6 flex-1 w-full lg:max-w-[48%]">

                        {/* Address Map */}
                        <div className="hidden lg:flex flex-col gap-2 pt-2">
                            <h2 className="text-sm font-bold text-gray-900 ml-1">Address Map</h2>
                            <div className="w-full h-[220px] bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 relative">
                                <MapPicker
                                    position={selectedLocation?.latitude ? { lat: selectedLocation.latitude, lng: selectedLocation.longitude } : { lat: 18.5204, lng: 73.8567 }}
                                    onPositionChange={() => { }}
                                />
                                {isCheckingDelivery && (
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                                        <Loader2 className="w-8 h-8 animate-spin text-[#FF584A]" />
                                    </div>
                                )}
                                
                                {deliveryStatus && (
                                    <div className={`absolute bottom-4 left-4 right-4 p-3 rounded-xl shadow-lg border flex items-start gap-3 z-20 animate-in slide-in-from-bottom-2 duration-300 ${
                                        deliveryStatus === 'success' ? 'bg-[#E6F5EC] border-[#D1EEDB] text-[#00A050]' : 
                                        deliveryStatus === 'error' ? 'bg-[#FFF0EF] border-[#FFCCCB] text-[#FF4732]' : 
                                        'bg-amber-50 border-amber-100 text-amber-700'
                                    }`}>
                                        {deliveryStatus === 'success' ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" /> : 
                                         deliveryStatus === 'error' ? <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> : 
                                         <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-bold leading-snug">
                                                {deliveryStatus === 'success' ? `Delivers in ~${deliveryCheck?.distanceKm} km` : deliveryError}
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
                    </div> {/* End Left Column */}

                    {/* Right Column */}
                    <div className="flex flex-col gap-6 w-full lg:flex-1 lg:max-w-[50%] lg:bg-white lg:p-6 lg:rounded-[24px] lg:shadow-sm lg:border lg:border-gray-50">

                        {/* Cart Items */}
                        <div className="hidden lg:flex flex-col gap-3">
                            <h2 className="text-sm font-bold text-gray-900 ml-1">Cart Items</h2>
                            <div className="flex flex-col gap-3">
                                {cartItems.map((item, index) => (
                                    <div key={`dc-${item.id}`} className="bg-white rounded-2xl p-3 shadow-sm flex items-start justify-between border border-gray-100">
                                        <div className="flex gap-4 items-center w-full">
                                            {!item.isAddon && (
                                                <div className="w-14 h-14 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden relative">
                                                    <img src={`https://images.unsplash.com/photo-${index % 2 === 0 ? '1544025162-831514eb3176' : '1552611052-33e04de081de'}?w=150&dpr=2&q=80`} alt={item.name} className="w-full h-full object-cover" />
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
                                                    {!item.isAddon && <span className="text-gray-400 line-through text-xs font-medium">Rs. {Math.round(item.price * 1.1).toFixed(2)}</span>}
                                                    <span className={`${item.isAddon ? 'text-gray-500 text-xs' : 'text-[#FF4732] font-bold text-[14px]'}`}>Rs. {item.price.toFixed(2)}</span>
                                                </div>
                                            </div>
                                            {!item.isAddon ? (
                                                <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm px-3 py-1">
                                                    <span className="font-bold text-xs">Qty: {item.quantity}</span>
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

                        {/* Order Summary */}
                        <div className="flex flex-col gap-3">
                            <h2 className="text-sm font-bold text-gray-900 ml-1">Order Summary</h2>
                            <div className="bg-white lg:bg-transparent rounded-[24px] lg:rounded-none p-6 lg:p-2 shadow-sm lg:shadow-none border border-gray-50 lg:border-none flex flex-col gap-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400 font-medium">Item Total</span>
                                    <span className="text-gray-700 font-bold">{cartTotal.toFixed(0)}</span>
                                </div>

                                <div className="border-t border-dashed border-gray-100"></div>

                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400 font-medium">Delivery Fee for x kms</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-300 line-through text-xs font-bold">20</span>
                                        <span className="text-[#64C27B] font-bold">FREE</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400 font-medium">Delivery Tip</span>
                                    <span className="text-gray-700 font-bold">{tipAmount.toFixed(2).padStart(5, '0')}</span>
                                </div>

                                <div className="flex justify-between items-center text-sm border-b border-dashed border-gray-100 pb-4">
                                    <span className="text-gray-400 font-medium">GST and Restaurant Charges</span>
                                    <span className="text-gray-700 font-bold">{(gst + platformFee).toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between items-center pt-1">
                                    <span className="text-[#FF4732] font-bold">To Pay</span>
                                    <span className="text-[#FF4732] font-bold">{grandTotal.toFixed(0)}</span>
                                </div>
                            </div>
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
                                    By accepting this order, I agree to all <span className="underline cursor-pointer">terms & conditions.</span>
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
                                disabled={isPlacingOrder || !agreedToTerms || deliveryStatus === 'error'}
                                className="hidden lg:flex w-full bg-[#FF584A] text-white font-bold text-[17px] py-[18px] rounded-xl shadow-md hover:bg-[#E5483B] transition-colors justify-center items-center active:scale-[0.98] disabled:opacity-50 mt-2"
                            >
                                {isPlacingOrder ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Proceed to checkout'}
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
                            disabled={isPlacingOrder || !agreedToTerms || deliveryStatus === 'error'}
                            className="w-full bg-[#FF584A] text-white font-bold text-[17px] py-[18px] rounded-xl shadow-md hover:bg-[#E5483B] transition-colors flex justify-center items-center active:scale-[0.98] disabled:opacity-50"
                        >
                            {isPlacingOrder ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Proceed to checkout'}
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
