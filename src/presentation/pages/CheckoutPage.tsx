import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Menu as MenuIcon, ChevronDown, ChevronUp, ShoppingCart, MapPin, Wallet, Check, Ticket, ReceiptText, ChevronRight, Book } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { CouponOverlay } from '../components/CouponOverlay';
import { DetailsFlowOverlay } from '../components/checkout/DetailsFlowOverlay';
import { MobileMenu } from '../components/checkout/MobileMenu';
import emptyCart from '../../assets/cart/empty_cartt.svg';
import { isTokenValid } from '../../data/api';
import { useUserLocation } from '../context/LocationContext';

const frequentlyBought = [
    { id: 'f1', name: 'Power Bowl', restaurant: 'Green Garden', time: '20-25 min', distance: '0.8 km', priceForTwo: '₹300 for two', price: 150, originalPrice: 300, discount: '50% off', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&dpr=2&q=80' },
    { id: 'f2', name: 'Margherita Pizza', restaurant: 'Pizza Paradise', time: '20-25 min', distance: '0.8 km', priceForTwo: '₹500 for two', price: 400, originalPrice: 500, discount: '20% off', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&dpr=2&q=80' }
];

export const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const { cartItems, addToCart, removeFromCart, cartTotal } = useCart();
    const [cutlery, setCutlery] = useState(false);
    const [isToPayExpanded, setIsToPayExpanded] = useState(true);
    const [isCouponOverlayOpen, setIsCouponOverlayOpen] = useState(false);
    const [isDetailsFlowOpen, setIsDetailsFlowOpen] = useState(false);
    const { addresses, selectedLocation, isLoadingAddresses, selectLocation } = useUserLocation();
    const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const isLoggedIn = isTokenValid();



    const deliveryFee = 0; // Match FREE delivery shown in UI
    const platformFee = cartTotal > 0 ? 5 : 0;
    const gst = cartTotal > 0 ? Math.round(cartTotal * 0.05) : 0;
    const grandTotal = cartTotal + deliveryFee + platformFee + gst;

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) return;

        if (!isLoggedIn) {
            setIsDetailsFlowOpen(true);
        } else {
            navigate('/demo-checkout');
        }
    };

    const handleDetailsComplete = async (address: any) => {
        setIsDetailsFlowOpen(false);
        selectLocation(address);
        navigate('/demo-checkout');
    };

    return (
        <div className="min-h-screen bg-[#F5F6F8] font-sans pb-40">
            {/* Top Bar */}
            <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-20 border-b border-gray-100 shadow-sm">
                <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center">
                    <ArrowLeft className="w-5 h-5 text-gray-800" />
                </button>
                <div className="flex-1"></div>
                <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-700">
                    <MenuIcon className="w-6 h-6" />
                </button>
            </div>
            {cartItems.length === 0 ? (
                <div className="max-w-md mx-auto px-6 flex flex-col  items-center justify-center pt-24 text-center">
                    <div className="p-12 rounded-[40px] w-full flex flex-col items-center">
                        <h2 className="text-2xl font-inter font-bold text-gray-900 mb-3 tracking-tight">Your Cart is Empty</h2>
                        <p className="text-gray-400 font-inter font-regular text-sm mb-10 leading-relaxed max-w-[200px]">
                            Add items to get started
                        </p>
                        <img src={emptyCart} alt="Empty Cart" className='w-full h-full object-cover scale-110 opacity-80 mb-10' />
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-[#F36259] text-white font-inter py-5 rounded-[24px] shadow-xl shadow-red-100 hover:scale-[1.02] active:scale-95 transition-all mb-4"
                        >
                            Browse Restaurants
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="max-w-md lg:max-w-6xl mx-auto px-4 flex flex-col lg:flex-row gap-6 lg:items-start lg:pt-4">

                        {/* Left Column for Desktop */}
                        <div className="flex flex-col gap-4 flex-1 w-full">

                            {/* Stepper */}
                            <div className="bg-white lg:rounded-2xl px-6 py-4 border-b lg:border border-gray-100 flex items-center justify-between shadow-sm -mx-4 lg:mx-0 mb-1 lg:mb-0">
                                {/* Menu Step - done */}
                                <div className="flex flex-col items-center flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-white border border-[#E0E0E0] text-[#00A050] shadow-sm flex items-center justify-center mb-1">
                                        <Book className="w-4 h-4 fill-current" />
                                    </div>
                                    <span className="text-[10px] font-bold text-[#00A050]">Menu</span>
                                </div>

                                {/* Connector 1 */}
                                <div className="flex gap-[4px] items-center flex-shrink-0 mb-4 flex-1 justify-center px-1">
                                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#00A050]"></div>)}
                                </div>

                                {/* Cart Step - active */}
                                <div className="flex flex-col items-center flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-[#FFF0EF] border border-[#FFCCCB] text-[#FF4732] shadow-sm flex items-center justify-center mb-1">
                                        <ShoppingCart className="w-4 h-4 fill-current" />
                                    </div>
                                    <span className="text-[10px] font-bold text-[#FF4732]">Cart</span>
                                </div>

                                {!isLoggedIn && (
                                    <>
                                        {/* Connector 2 */}
                                        <div className="flex gap-[4px] items-center flex-shrink-0 mb-4 flex-1 justify-center px-1">
                                            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>)}
                                        </div>

                                        {/* Details Step - pending */}
                                        <div className="flex flex-col items-center flex-shrink-0">
                                            <div className="w-8 h-8 rounded-full bg-[#F9FAFB] border border-[#E0E0E0] text-gray-300 shadow-sm flex items-center justify-center mb-1">
                                                <MapPin className="w-4 h-4 fill-current" />
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-500">Details</span>
                                        </div>
                                    </>
                                )}

                                {/* Connector 3 */}
                                <div className="flex gap-[4px] items-center flex-shrink-0 mb-4 flex-1 justify-center px-1">
                                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>)}
                                </div>

                                {/* Checkout Step - pending */}
                                <div className="flex flex-col items-center flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-[#F9FAFB] border border-[#E0E0E0] text-gray-300 shadow-sm flex items-center justify-center mb-1">
                                        <Wallet className="w-4 h-4 fill-current text-gray-300" />
                                    </div>
                                    <span className="text-[10px] font-medium text-gray-500">Checkout</span>
                                </div>
                            </div>

                            {/* Cart Items List */}
                            <div className="flex flex-col gap-3 lg:mt-2">
                                {cartItems.map((item, index) => (
                                    <div key={item.id} className="bg-white rounded-2xl p-3 shadow-sm flex items-start justify-between border border-gray-50">
                                        <div className="flex gap-4 items-center w-full">
                                            {/* Item Image */}
                                            {!item.isAddon && (
                                                <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden relative">
                                                    <img src={`https://images.unsplash.com/photo-${index % 2 === 0 ? '1544025162-831514eb3176' : '1552611052-33e04de081de'}?w=150&dpr=2&q=80`} alt={item.name} className="w-full h-full object-cover" />
                                                    <div className="absolute bottom-1 left-1 bg-white p-[2px] rounded-sm">
                                                        <div className={`w-2 h-2 rounded-sm border flex items-center justify-center ${item.isVeg ? 'border-emerald-600' : 'border-red-600'}`}>
                                                            <div className={`w-1 h-1 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex-1">
                                                <h4 className="font-bold text-[15px] text-[#2D2D2D]">{item.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {!item.isAddon && <span className="text-gray-400 line-through text-sm font-medium">Rs. {Math.round(item.price * 1.1).toFixed(2)}</span>}
                                                    <span className={`${item.isAddon ? 'text-gray-500 text-sm' : 'text-[#FF4732] font-bold text-[15px]'}`}>Rs. {item.price.toFixed(2)}</span>
                                                </div>
                                            </div>

                                            {!item.isAddon ? (
                                                <div className="flex items-center bg-white border border-gray-200 rounded-full overflow-hidden shadow-sm h-[34px]">
                                                    <button onClick={() => removeFromCart(item.id)} className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50">-</button>
                                                    <span className="font-bold w-4 text-center text-[15px]">{item.quantity}</span>
                                                    <button onClick={() => addToCart({ ...item })} className="w-8 h-full flex items-center justify-center text-gray-800 hover:bg-gray-50">+</button>
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-md bg-[#00A050] flex items-center justify-center">
                                                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add more items */}
                            <div className="bg-white rounded-2xl p-4 flex items-center gap-2 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors border border-gray-50 justify-center">
                                <div className="text-gray-600 font-medium text-[15px] flex items-center gap-1.5 w-full">
                                    <span>+</span>
                                    <span>Add more items</span>
                                </div>
                            </div>

                            {/* Frequently Bought Section */}
                            <div className="mt-4">
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <h2 className="font-extrabold text-[#111] text-xl">Frequently Bought</h2>
                                    <ChevronRight className="w-5 h-5 text-gray-800" />
                                </div>

                                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-4 snap-x">
                                    {frequentlyBought.map(item => (
                                        <div key={item.id} className="bg-white rounded-2xl w-[220px] flex-shrink-0 overflow-hidden shadow-sm border border-gray-100 snap-start pb-3 flex flex-col">
                                            <div className="h-32 w-full overflow-hidden">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="px-3 py-3 flex flex-col flex-1">
                                                <h4 className="font-bold text-[15px] text-[#222] truncate">{item.name}</h4>
                                                <p className="text-gray-500 text-xs mt-0.5">{item.restaurant}</p>

                                                <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-500 font-medium">
                                                    <span className="flex items-center"><span className="w-3 h-3 mr-1 opacity-60"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg></span>{item.time}</span>
                                                    <span className="flex items-center"><MapPin className="w-3 h-3 mr-1 opacity-60" />{item.distance}</span>
                                                    <span>{item.priceForTwo}</span>
                                                </div>

                                                <div className="flex items-center justify-between mt-auto pt-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[#00A050] font-bold text-sm">Rs.{item.price.toFixed(2)}</span>
                                                        <span className="text-gray-400 line-through text-[11px]">Rs.{item.originalPrice.toFixed(2)}</span>
                                                    </div>
                                                    <div className="bg-[#E6F5EC] text-[#00A050] flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                                        <Ticket className="w-2.5 h-2.5" />
                                                        {item.discount}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>



                        </div>

                        {/* Right Column for Desktop */}
                        <div className="flex flex-col gap-0 w-full lg:w-[420px] lg:sticky lg:top-28">

                            {/* Cutlery Toggle */}
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between mt-2">
                                <div className="flex-1 pr-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-bold text-[17px] text-[#222]">Cutlery</h3>
                                        {/* Simple Toggle Switch */}
                                        <div
                                            onClick={() => setCutlery(!cutlery)}
                                            className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors flex items-center ${cutlery ? 'bg-[#FF4732]' : 'bg-gray-200'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${cutlery ? 'translate-x-[20px]' : 'translate-x-0'}`}></div>
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-[13px] leading-tight font-medium w-[80%]">
                                        No cutlery provided. Thanks for reducing waste
                                    </p>
                                </div>
                                <div className="flex items-center opacity-80 gap-[2px]">
                                    <div className="w-3 h-10 border-l-[1.5px] border-b-[1.5px] border-r-[1.5px] border-gray-300 rounded-b-md flex justify-around p-[1px]">
                                        <div className="w-[1px] h-3 bg-gray-300"></div><div className="w-[1px] h-3 bg-gray-300"></div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full border-[5px] border-[#FBD267] bg-[#F7A626]"></div>
                                    <div className="w-2 h-10 bg-gray-300 rounded-t-full rounded-b-sm translate-y-1"></div>
                                </div>
                            </div>

                            {/* Delivery Address */}
                            <div
                                onClick={() => isLoggedIn && setIsAddressDropdownOpen(!isAddressDropdownOpen)}
                                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-1 mt-4 cursor-pointer hover:bg-gray-50 transition-all relative"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-[#FFEFEF] p-1.5 rounded-lg text-[#FF4732]">
                                            <MapPin className="w-5 h-5 fill-current" />
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[15px]">
                                            <span className="font-medium text-gray-600">Deliver to</span>
                                            <span className="text-gray-900 font-bold">-&gt;</span>
                                            <span className="font-bold text-gray-900">{selectedLocation?.label || (isLoggedIn ? 'Select Address' : 'Home')}</span>
                                        </div>
                                    </div>
                                    {isLoggedIn && (
                                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isAddressDropdownOpen ? 'rotate-180' : ''}`} />
                                    )}
                                </div>
                                <div className="pl-11 text-gray-500 text-[13px] font-medium leading-relaxed truncate">
                                    {selectedLocation?.addressLine || (isLoggedIn ? (isLoadingAddresses ? 'Loading...' : 'Please select a delivery address') : '6, Yash Complex, Near Metro Station, Navi...')}
                                </div>

                                {/* Address Dropdown Overlay/List */}
                                {isAddressDropdownOpen && isLoggedIn && (
                                    <div className="absolute top-[105%] left-0 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 z-40 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                        <div className="p-2 flex flex-col max-h-[240px] overflow-y-auto">
                                            {addresses.length === 0 ? (
                                                <div className="p-4 text-center text-gray-400 text-sm">No saved addresses found</div>
                                            ) : (
                                                addresses.map(add => (
                                                    <div
                                                        key={add.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            selectLocation(add);
                                                            setIsAddressDropdownOpen(false);
                                                        }}
                                                        className={`p-3 rounded-xl hover:bg-gray-50 transition-colors flex flex-col gap-0.5 mb-1 last:mb-0 ${selectedLocation?.id === add.id ? 'bg-red-50/50' : ''}`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-bold text-sm text-gray-800">{add.label}</span>
                                                            {selectedLocation?.id === add.id && <Check className="w-4 h-4 text-[#FF4732]" />}
                                                        </div>
                                                        <span className="text-xs text-gray-500 truncate">{add.addressLine}</span>
                                                    </div>
                                                ))
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsDetailsFlowOpen(true);
                                                    setIsAddressDropdownOpen(false);
                                                }}
                                                className="mt-2 text-[#FF4732] text-sm font-bold p-3 border-t border-gray-50 hover:bg-red-50/30 transition-colors text-center"
                                            >
                                                + Add New Address
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Payment Method */}
                            {/* <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-1 mt-4 cursor-pointer hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="bg-[#FFEFEF] p-1.5 rounded-lg text-[#FF4732]">
                                    <Wallet className="w-5 h-5 fill-current" />
                                </div>
                                <span className="font-medium text-gray-600 text-[15px]">Payment method</span>
                            </div>
                            <div className="pl-11 text-gray-900 text-[15px] font-bold">
                                Cash
                            </div>
                        </div> */}

                            {/* Coupon */}
                            <div
                                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer mt-4"
                                onClick={() => setIsCouponOverlayOpen(true)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-[#FFEFEF] p-1.5 rounded-lg text-[#FF4732]">
                                        <Ticket className="w-5 h-5 fill-current" />
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="font-bold text-[17px] text-[#333]">Coupon</h3>
                                        <span className="text-gray-400 text-[13px] font-medium mt-0.5">Select Your Discounts</span>
                                    </div>
                                </div>
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                            </div>

                            {/* To Pay */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col mt-4 overflow-hidden mb-4">
                                <div
                                    className="p-4 flex items-center justify-between cursor-pointer"
                                    onClick={() => setIsToPayExpanded(!isToPayExpanded)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-[#FFEFEF] p-1.5 rounded-lg text-[#FF4732]">
                                            <ReceiptText className="w-5 h-5 fill-current" />
                                        </div>
                                        <h3 className="font-bold text-[17px] text-[#333]">To Pay</h3>
                                    </div>
                                    {isToPayExpanded ? (
                                        <ChevronUp className="w-5 h-5 text-gray-400 stroke-2" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-400 stroke-2" />
                                    )}
                                </div>

                                {isToPayExpanded && (
                                    <div className="px-4 pb-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-[#555] text-[14px]">Item Total</span>
                                            <span className="text-[#333] text-[14px] font-bold">₹{cartTotal.toFixed(2)}</span>
                                        </div>

                                        <div className="border-t border-dashed border-gray-200 mt-2 mb-4"></div>

                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[#555] text-[14px]">Delivery Fee for x kms</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-gray-400 line-through text-[14px]">20</span>
                                                <span className="text-[#64C27B] text-[14px] font-medium">FREE</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[#555] text-[14px]">Delivery Tip</span>
                                            <span className="text-[#333] text-[14px]">00.00</span>
                                        </div>

                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-[#555] text-[14px]">GST and Restaurant Charges</span>
                                            <span className="text-[#333] text-[14px] font-bold">₹{(gst + platformFee).toFixed(2)}</span>
                                        </div>

                                        <div className="border-t border-dashed border-gray-200 mt-2 mb-4"></div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-[#444] text-[15px] font-bold">To Pay</span>
                                            <span className="text-[#333] text-[15px] font-bold">₹{grandTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Desktop Checkout Button */}
                            <button
                                onClick={handlePlaceOrder}
                                disabled={cartItems.length === 0}
                                className="hidden lg:flex w-full bg-[#FF584A] text-white font-bold text-[17px] py-[18px] rounded-xl shadow-md hover:bg-[#E5483B] transition-colors justify-center items-center active:scale-[0.98] disabled:opacity-50 mt-2"
                            >
                                {isLoggedIn ? "Proceed to pay" : "Add phone and address details"}
                            </button>

                        </div>
                    </div>

                    {/* Bottom Fixed Button - Mobile Only */}
                    <div className="fixed lg:hidden bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-6 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-30">
                        <div className="max-w-md mx-auto">
                            <button
                                onClick={handlePlaceOrder}
                                disabled={cartItems.length === 0}
                                className="w-full bg-[#FF584A] text-white font-bold text-[17px] py-[18px] rounded-xl shadow-md hover:bg-[#E5483B] transition-colors flex justify-center items-center active:scale-[0.98] disabled:opacity-50"
                            >
                                {isLoggedIn ? "Proceed to pay" : "Add phone and address details"}
                            </button>
                        </div>
                    </div>
                </>
            )}
            {isCouponOverlayOpen && (
                <CouponOverlay onClose={() => setIsCouponOverlayOpen(false)} />
            )}

            {isDetailsFlowOpen && (
                <DetailsFlowOverlay
                    onClose={() => setIsDetailsFlowOpen(false)}
                    onComplete={handleDetailsComplete}
                />
            )}

            <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none; /* IE and Edge */
                    scrollbar-width: none; /* Firefox */
                }
            `}</style>
        </div>
    );
};
