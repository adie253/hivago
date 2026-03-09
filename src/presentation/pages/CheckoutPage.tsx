import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, PhoneOff, DoorClosed, Shield, BellOff, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import DIContainer from '../../di/container';

export const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const { cartItems, addToCart, removeFromCart, cartTotal, clearCart } = useCart();
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [isOrdered, setIsOrdered] = useState(false);

    const deliveryFee = cartTotal > 0 ? 40 : 0;
    const platformFee = cartTotal > 0 ? 5 : 0;
    const gst = cartTotal > 0 ? Math.round(cartTotal * 0.05) : 0; // 5% GST
    const grandTotal = cartTotal + deliveryFee + platformFee + gst;

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) return;

        setIsPlacingOrder(true);
        try {
            const createOrderUseCase = DIContainer.getCreateOrderUseCase();
            await createOrderUseCase.execute({
                customerId: 'USER-001', // Mock user ID
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
                <p className="text-gray-500 max-w-xs">Your food will be delivered in 30-45 mins. Redirection you to your order history...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-32">
            {/* Header */}
            <div className="bg-white px-4 py-4 flex items-center gap-4 sticky top-0 z-20 border-b border-gray-100 shadow-sm">
                <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
            </div>

            <div className="max-w-2xl mx-auto mt-6 px-4 flex flex-col gap-6">

                {/* Order Items Summary */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h2 className="font-bold text-gray-800 mb-4 text-lg">Your Order</h2>

                    {cartItems.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-gray-500 font-medium mb-4">Your cart is empty.</p>
                            <button onClick={() => navigate('/')} className="text-[#FF4732] font-bold border border-[#FF4732] px-6 py-2 rounded-xl">Browse Restaurants</button>
                        </div>
                    ) : (
                        cartItems.map(item => (
                            <div key={item.id} className="flex items-center justify-between border-b border-gray-50 pb-4 mb-4">
                                <div className="flex items-start gap-3">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center mt-1 ${item.isVeg ? 'border-emerald-600' : 'border-red-600'}`}>
                                        <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`}></div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{item.name}</h4>
                                        <span className="text-sm font-semibold text-gray-600">₹{item.price}</span>
                                    </div>
                                </div>
                                {/* Quantity Counter */}
                                <div className="flex items-center bg-red-50 text-[#FF4732] rounded-lg border border-red-200 overflow-hidden shadow-sm h-8">
                                    <button onClick={() => removeFromCart(item.id)} className="px-2 h-full hover:bg-red-100 transition-colors flex items-center justify-center font-bold text-lg">-</button>
                                    <span className="font-bold w-6 text-center text-sm">{item.quantity}</span>
                                    <button onClick={() => addToCart({ ...item })} className="px-2 h-full hover:bg-red-100 transition-colors flex items-center justify-center font-bold text-lg">+</button>
                                </div>
                            </div>
                        ))
                    )}

                    {cartItems.length > 0 && (
                        <button onClick={() => navigate(-1)} className="text-[#FF4732] font-semibold text-sm hover:underline mt-2 inline-block">
                            + Add more items
                        </button>
                    )}
                </div>

                {/* Delivery Instructions */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h2 className="font-bold text-gray-800 mb-4 text-lg">Delivery Instructions</h2>

                    <div className="flex bg-gray-50 rounded-xl px-4 border border-gray-100 items-center w-full h-12 shadow-inner focus-within:ring-2 focus-within:ring-[#FF4732] transition-shadow mb-4">
                        <input
                            type="text"
                            placeholder="Add a note for your delivery partner..."
                            className="bg-transparent border-none outline-none text-gray-700 w-full placeholder-gray-400 font-medium text-sm"
                        />
                        <Mic className="text-[#FF4732] w-5 h-5 ml-2 cursor-pointer hover:scale-110 transition-transform" />
                    </div>

                    {/* Instruction Pups */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 bg-white hover:border-[#FF4732] hover:bg-red-50 transition-colors group">
                            <PhoneOff className="w-6 h-6 text-gray-500 group-hover:text-[#FF4732]" />
                            <span className="text-[10px] font-bold text-gray-600 group-hover:text-[#FF4732] text-center leading-tight">Don't Call</span>
                        </button>
                        <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-[#FF4732] bg-red-50 transition-colors group">
                            <DoorClosed className="w-6 h-6 text-[#FF4732]" />
                            <span className="text-[10px] font-bold text-[#FF4732] text-center leading-tight">Keep at Doorstep</span>
                        </button>
                        <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 bg-white hover:border-[#FF4732] hover:bg-red-50 transition-colors group">
                            <Shield className="w-6 h-6 text-gray-500 group-hover:text-[#FF4732]" />
                            <span className="text-[10px] font-bold text-gray-600 group-hover:text-[#FF4732] text-center leading-tight">Leave at Security</span>
                        </button>
                        <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 bg-white hover:border-[#FF4732] hover:bg-red-50 transition-colors group">
                            <BellOff className="w-6 h-6 text-gray-500 group-hover:text-[#FF4732]" />
                            <span className="text-[10px] font-bold text-gray-600 group-hover:text-[#FF4732] text-center leading-tight">Do not ring bell</span>
                        </button>
                    </div>
                </div>

                {/* Bill Details */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h2 className="font-bold text-gray-800 mb-4 text-lg">Bill Details</h2>

                    <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex justify-between">
                            <span>Item Total</span>
                            <span className="font-semibold text-gray-800">₹{cartTotal}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Delivery Fee</span>
                            <span className="font-semibold text-gray-800">₹{deliveryFee}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Platform Fee</span>
                            <span className="font-semibold text-gray-800">₹{platformFee}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-3">
                            <span>GST & Restaurant Charges</span>
                            <span className="font-semibold text-gray-800">₹{gst}</span>
                        </div>

                        <div className="flex justify-between pt-1">
                            <span className="font-black text-gray-900 text-base">Grand Total</span>
                            <span className="font-black text-gray-900 text-lg">₹{grandTotal}</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Floating Checkout Button */}
            {cartItems.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">
                    <div className="max-w-2xl mx-auto">
                        <button
                            onClick={handlePlaceOrder}
                            disabled={isPlacingOrder}
                            className="w-full bg-[#FF4732] text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-orange-700 transition-colors flex justify-between items-center px-6 active:scale-[0.98] disabled:opacity-50"
                        >
                            <div className="flex flex-col items-start bg-black bg-opacity-10 px-3 py-1 rounded-lg">
                                <span className="text-[10px] font-semibold text-red-100 uppercase tracking-wider">Total</span>
                                <span className="text-sm font-extrabold">₹{grandTotal}</span>
                            </div>
                            <span className="flex items-center gap-2">
                                {isPlacingOrder ? 'Processing...' : 'Proceed to Checkout'}
                                <ArrowLeft className="w-5 h-5 rotate-180" />
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
