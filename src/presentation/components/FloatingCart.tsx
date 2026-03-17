import React from 'react';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';

export const FloatingCart: React.FC = () => {
    const { cartItems, cartTotal } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    const isRestaurantPage = location.pathname.startsWith('/restaurant/');

    if (cartItems.length === 0 || !isRestaurantPage || location.pathname === '/checkout') {
        return null;
    }

    const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="sticky bottom-6 z-[100] px-4 pb-4 pointer-events-none w-full flex justify-center animate-in fade-in slide-in-from-bottom-4">
            <button
                onClick={() => navigate('/checkout')}
                className="max-w-md w-full bg-gradient-to-r from-[#CE181B] to-[#CE1830] text-white flex items-center justify-between p-4 rounded-[24px] shadow-[0_20px_40px_rgba(255,71,50,0.3)] hover:scale-[1.02] active:scale-[0.98] group overflow-hidden relative pointer-events-auto"
            >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 -translate-x-full group-hover:animate-[shine_1.5s_infinite]" />

                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-inner">
                        <ShoppingCart className="w-6 h-6 text-brand-primary" strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-tight">
                            {totalQuantity} {totalQuantity === 1 ? 'Item' : 'Items'} Added
                        </span>
                        <span className="text-lg font-black leading-tight">
                            ₹{cartTotal.toLocaleString('en-IN')}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 relative z-10">
                    <span className="text-sm font-black uppercase tracking-wider">View Cart</span>
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                        <ArrowRight className="w-4 h-4 text-[#FF4732]" strokeWidth={3} />
                    </div>
                </div>
            </button>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shine {
                    100% { transform: translateX(100%); }
                }
            `}} />
        </div>
    );
};
