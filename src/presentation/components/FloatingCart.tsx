import React, { useState } from 'react';
import { ShoppingCart, ArrowRight, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatPrice } from '../../utils/formatUtils';
import { ClearCartConfirmModal } from './ClearCartConfirmModal';

export const FloatingCart: React.FC = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const isRestaurantPage = location.pathname.startsWith('/restaurant/');

    if (cartItems.length === 0 || !isRestaurantPage || location.pathname === '/checkout') {
        return null;
    }

    const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <>
            <div className="floating-cart sticky bottom-6 z-[100] px-4 pb-4 pointer-events-none w-full flex justify-center animate-in fade-in slide-in-from-bottom-4">
                <div
                    role="button"
                    tabIndex={0}
                    aria-label="View Cart and Checkout"
                    onClick={() => navigate('/checkout')}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            navigate('/checkout');
                        }
                    }}
                    className="max-w-md w-full bg-gradient-to-r from-[#CE181B]/85 to-[#CE1830]/85 backdrop-blur-md border border-white/20 text-white flex items-center justify-between p-4 rounded-[24px] shadow-[0_20px_40px_rgba(206,24,27,0.25)] hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/40 group overflow-hidden relative pointer-events-auto cursor-pointer"
                >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 -translate-x-full group-hover:animate-[shine_1.5s_infinite]" />

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-inner">
                            <ShoppingCart className="w-6 h-6 text-brand-primary" strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 leading-tight">
                                {totalQuantity} {totalQuantity === 1 ? 'Item' : 'Items'} Added
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold leading-tight">
                                    ₹{formatPrice(cartTotal)}
                                </span>
                                {cartTotal < 150 && (
                                    <span className="text-[9px] font-extrabold text-[#CE181B] bg-white px-1.5 py-0.5 rounded-full shadow-sm">
                                        Min. ₹150
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 relative z-10">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowClearConfirm(true);
                            }}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/90 hover:text-white"
                            title="Clear Cart"
                            aria-label="Clear Cart"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-bold uppercase tracking-wider">View Cart</span>
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                            <ArrowRight className="w-4 h-4 text-[#FF4732]" strokeWidth={3} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Clear Cart Confirmation Modal */}
            <ClearCartConfirmModal
                isOpen={showClearConfirm}
                onClose={() => setShowClearConfirm(false)}
                onConfirm={() => clearCart()}
            />
        </>
    );
};
