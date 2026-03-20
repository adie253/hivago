import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Menu as MenuIcon, ChevronDown, ChevronUp, CheckCircle, BookOpen, ShoppingCart, MapPin, Wallet, Check, Ticket, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import DIContainer from '../../di/container';

const frequentlyBought = [
    { id: 'f1', name: 'Power Bowl', restaurant: 'Green Garden', time: '20-25 min', distance: '0.8 km', priceForTwo: '₹300 for two', price: 150, originalPrice: 300, discount: '50% off', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&dpr=2&q=80' },
    { id: 'f2', name: 'Margherita Pizza', restaurant: 'Pizza Paradise', time: '20-25 min', distance: '0.8 km', priceForTwo: '₹500 for two', price: 400, originalPrice: 500, discount: '20% off', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&dpr=2&q=80' }
];

export const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const { cartItems, addToCart, removeFromCart, cartTotal, clearCart } = useCart();
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [isOrdered, setIsOrdered] = useState(false);
    const [cutlery, setCutlery] = useState(false);
    const [isToPayExpanded, setIsToPayExpanded] = useState(true);

    const deliveryFee = cartTotal > 0 ? 40 : 0;
    const platformFee = cartTotal > 0 ? 5 : 0;
    const gst = cartTotal > 0 ? Math.round(cartTotal * 0.05) : 0; 
    const grandTotal = cartTotal + deliveryFee + platformFee + gst;

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) return;

        setIsPlacingOrder(true);
        try {
            const createOrderUseCase = DIContainer.getCreateOrderUseCase();
            await createOrderUseCase.execute({
                customerId: 'USER-001', 
                items: cartItems.map(i => i.name),
                totalAmount: grandTotal,
                status: 'pending'
            });

            setIsOrdered(true);
            setTimeout(() => {
                clearCart();
                navigate('/profile');
            }, 2000);
        } catch (error) {
            console.error('Failed to place order:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    if (isOrdered) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans gap-4 p-6 text-center">
                <div className="bg-emerald-100 p-6 rounded-full">
                    <CheckCircle className="w-16 h-16 text-emerald-600" />
                </div>
                <h1 className="text-3xl font-black text-gray-900">Order Placed!</h1>
                <p className="text-gray-500 max-w-xs">Your food will be delivered in 30-45 mins. Redirecting you to your profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F6F8] font-sans pb-32">
            {/* Top Bar */}
            <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-20 border-b border-gray-100 shadow-sm">
                <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center">
                    <ArrowLeft className="w-5 h-5 text-gray-800" />
                </button>
                <div className="w-8 h-8 rounded-full bg-[#DD352E] text-white flex items-center justify-center font-bold text-lg italic shadow-md">
                    H
                </div>
                <button className="p-2 text-gray-700">
                    <MenuIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Stepper */}
            <div className="bg-white px-2 py-4 mb-3 border-b border-gray-100 flex items-center justify-between shadow-sm overflow-x-auto gap-2">
                <div className="flex flex-col items-center flex-shrink-0 w-16">
                    <div className="w-8 h-8 rounded-full bg-green-50 text-[#00A050] border border-green-100 flex items-center justify-center mb-1">
                        <BookOpen className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-[#00A050]">Menu</span>
                </div>
                
                <div className="flex gap-1 items-center flex-shrink-0 mb-4 px-2">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="w-1 h-1 rounded-full bg-[#00A050]"></div>)}
                </div>

                <div className="flex flex-col items-center flex-shrink-0 w-16">
                    <div className="w-8 h-8 rounded-full bg-red-50 text-[#FF4732] flex items-center justify-center mb-1 relative border border-red-100 shadow-sm">
                        <ShoppingCart className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-[#FF4732]">Cart</span>
                </div>

                <div className="flex gap-1 items-center flex-shrink-0 mb-4 px-2">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="w-1 h-1 rounded-full bg-gray-200"></div>)}
                </div>

                <div className="flex flex-col items-center flex-shrink-0 w-16 opacity-50">
                    <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 text-gray-500 flex items-center justify-center mb-1">
                        <MapPin className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-500">Details</span>
                </div>

                <div className="flex gap-1 items-center flex-shrink-0 mb-4 px-2">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="w-1 h-1 rounded-full bg-gray-200"></div>)}
                </div>

                <div className="flex flex-col items-center flex-shrink-0 w-16 opacity-50">
                    <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 text-gray-500 flex items-center justify-center mb-1">
                        <Wallet className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-500">Checkout</span>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 flex flex-col gap-4">

                {/* Cart Items List */}
                <div className="flex flex-col gap-3">
                    {cartItems.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-gray-500 font-medium mb-4">Your cart is empty.</p>
                            <button onClick={() => navigate('/')} className="text-[#FF4732] font-bold border border-[#FF4732] px-6 py-2 rounded-xl">Browse Restaurants</button>
                        </div>
                    ) : (
                        cartItems.map((item, index) => (
                            <div key={item.id} className="bg-white rounded-2xl p-3 shadow-sm flex items-start justify-between border border-gray-50">
                                <div className="flex gap-4 items-center w-full">
                                    {/* Mock Image for Demo based on index, real app might use item.image */}
                                    {index < 2 ? (
                                        <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden relative">
                                            <img src={`https://images.unsplash.com/photo-${index === 0 ? '1544025162-831514eb3176' : '1552611052-33e04de081de'}?w=150&dpr=2&q=80`} alt={item.name} className="w-full h-full object-cover" />
                                            <div className="absolute bottom-1 left-1 bg-white p-[2px] rounded-sm">
                                                <div className={`w-2 h-2 rounded-sm border flex items-center justify-center ${item.isVeg ? 'border-emerald-600' : 'border-red-600'}`}>
                                                    <div className={`w-1 h-1 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`}></div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                    
                                    <div className="flex-1">
                                        <h4 className="font-bold text-[15px] text-[#2D2D2D]">{item.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-gray-400 line-through text-sm font-medium">Rs. {Math.round(item.price * 1.1).toFixed(2)}</span>
                                            <span className="text-[#FF4732] font-bold text-[15px]">Rs. {item.price.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    
                                    {index < 2 ? (
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
                        ))
                    )}
                </div>

                {/* Add more items */}
                {cartItems.length > 0 && (
                    <div className="bg-white rounded-2xl p-4 flex items-center gap-2 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors border border-gray-50 justify-center">
                        <div className="text-gray-600 font-medium text-[15px] flex items-center gap-1.5 w-full">
                            <span>+</span>
                            <span>Add more items</span>
                        </div>
                    </div>
                )}

                {/* Frequently Bought Section */}
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h2 className="font-extrabold text-[#111] text-xl">Frequently Bought</h2>
                        <ChevronRight className="w-5 h-5 text-gray-800" />
                    </div>
                    
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 snap-x">
                        {frequentlyBought.map(item => (
                            <div key={item.id} className="bg-white rounded-2xl w-[220px] flex-shrink-0 overflow-hidden shadow-sm border border-gray-100 snap-start pb-3 flex flex-col">
                                <div className="h-32 w-full overflow-hidden">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="px-3 py-3 flex flex-col flex-1">
                                    <h4 className="font-bold text-[15px] text-[#222] truncate">{item.name}</h4>
                                    <p className="text-gray-500 text-xs mt-0.5">{item.restaurant}</p>
                                    
                                    <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-500 font-medium">
                                        <span className="flex items-center"><span className="w-3 h-3 mr-1 opacity-60"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></span>{item.time}</span>
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

                {/* Coupon */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer mt-4">
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
                        <h3 className="font-bold text-[17px] text-[#333]">To Pay</h3>
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
                                <span className="text-[#333] text-[14px]">{cartTotal}</span>
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
                                <span className="text-[#333] text-[14px]">{gst + platformFee}</span>
                            </div>

                            <div className="border-t border-dashed border-gray-200 mt-2 mb-4"></div>

                            <div className="flex justify-between items-center">
                                <span className="text-[#444] text-[15px]">To Pay</span>
                                <span className="text-[#333] text-[15px]">{grandTotal}</span>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Bottom Fixed Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-6 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-30">
                <div className="max-w-md mx-auto">
                    <button
                        onClick={handlePlaceOrder}
                        disabled={isPlacingOrder || cartItems.length === 0}
                        className="w-full bg-[#FF584A] text-white font-bold text-[17px] py-[18px] rounded-xl shadow-md hover:bg-[#E5483B] transition-colors flex justify-center items-center active:scale-[0.98] disabled:opacity-50"
                    >
                        {isPlacingOrder ? 'Processing...' : 'Add phone and address details'}
                    </button>
                </div>
            </div>
            
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
