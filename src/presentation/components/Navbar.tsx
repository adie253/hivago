import React, { useState } from 'react';
import { MapPin, ChevronDown, User, ShoppingCart, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import homeIcon from "../../assets/icons/home_icon.png";
import searchIcon from "../../assets/icons/search_icon.png";
import profileIcon from "../../assets/icons/profile_icon.png";
import cartIcon from "../../assets/icons/cart_icon.png";
import ordersIcon from "../../assets/icons/orders_icon.png";

export const Navbar: React.FC = () => {
    const { cartItems } = useCart();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    // Close menu when route changes
    React.useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <>
            <nav className="flex items-center justify-between px-4 md:px-30 py-4 bg-white border-b border-gray-100 font-sans z-50 relative sticky top-0">
                {/* Logo and Mobile Menu */}
                <div className="flex items-center gap-3 md:gap-4">
                    <Link to="/" className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg md:text-xl">
                        <img src="../src/assets/nav_logo.svg" alt="Logo" className="w-8 h-8" />

                    </Link>
                    <Link to="/" className="text-xl md:text-2xl font-bold text-brand-primary hidden sm:block">Hivago</Link>
                </div>

                {/* Location - Hidden on small mobile */}
                <div className="hidden sm:flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 md:px-3 md:py-1.5 rounded-lg transition-colors overflow-hidden whitespace-nowrap">
                    <MapPin className="text-gray-400 w-5 h-5 flex-shrink-0" />
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-[10px] md:text-xs text-gray-500 font-medium tracking-wide">Deliver to</span>
                        <div className="flex items-center gap-1">
                            <span className="text-xs md:text-sm font-semibold text-gray-800 truncate max-w-[120px] md:max-w-[200px]">Koramangala, Bangalore</span>
                            <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-gray-600 flex-shrink-0" />
                        </div>
                    </div>
                </div>

                {/* Links */}
                <div className="hidden lg:flex items-center gap-8 font-semibold text-base">
                    <Link to="/" className={`transition-colors ${location.pathname === '/' ? 'text-brand-primary' : 'text-gray-500 hover:text-gray-800'}`}>Home</Link>
                    <Link to="/restaurants" className={`transition-colors ${location.pathname === '/restaurants' ? 'text-brand-primary' : 'text-gray-500 hover:text-gray-800'}`}>Restaurants</Link>
                    <Link to="/profile" className={`transition-colors ${location.pathname === '/profile' ? 'text-brand-primary' : 'text-gray-500 hover:text-gray-800'}`}>Orders</Link>
                </div>

                {/* Icons */}
                <div className="flex items-center gap-4 md:gap-6">
                    <Link to="/profile" className={`transition-colors hidden sm:block ${location.pathname === '/profile' ? 'text-brand-primary' : 'text-gray-400 hover:text-gray-700'}`}>
                        <User className="w-5 h-5 md:w-6 md:h-6" />
                    </Link>
                    <Link to="/checkout" className={`relative transition-colors rounded-full focus:outline-none ${location.pathname === '/checkout' ? 'text-brand-primary' : 'text-gray-400 hover:text-brand-primary'}`}>
                        <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                        {cartItems.length > 0 && (
                            <span className="absolute -top-1.5 -right-2 bg-brand-primary text-white text-[10px] font-bold w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full border-2 border-white">
                                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                            </span>
                        )}
                    </Link>

                    {/* Mobile Menu Button - Now on the right */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="md:hidden text-gray-600 hover:text-gray-900 transition-colors focus:outline-none"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-[60] md:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMobileMenuOpen(false)}
            >
                <div
                    className={`fixed top-0 right-0 bottom-0 w-[280px] bg-white shadow-2xl transition-transform duration-300 ease-in-out transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6 flex flex-col h-full overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-400 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                                    <img src="..src/assets/nav_logo.svg" alt="Logo" className="w-7 h-7" />
                                </div>
                                <span className="text-2xl font-bold text-brand-primary">Hivago</span>
                            </div>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Mobile Location Details */}
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl mb-8 border border-gray-100">
                            <MapPin className="text-brand-primary w-5 h-5 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500 font-medium mb-1">Delivering to</p>
                                <p className="text-sm font-bold text-gray-900">Koramangala, Bangalore</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 flex-1">
                            <Link to="/" className={`flex items-center gap-4 p-4 rounded-xl font-bold transition-colors ${location.pathname === '/' ? 'text-brand-primary bg-brand-light' : 'text-gray-800 hover:bg-gray-50'}`}>
                                <img src={homeIcon} alt="home icon" className='w-5 h-5 p-0' />
                                Home
                            </Link>
                            <Link to="/restaurants" className={`flex items-center gap-4 p-4 rounded-xl font-bold transition-colors ${location.pathname === '/restaurants' ? 'text-brand-primary bg-brand-light' : 'text-gray-800 hover:bg-gray-50'}`}>
                                <img src={searchIcon} alt="search icon" className='w-5 h-5 p-0' />
                                Search Restaurants
                            </Link>
                            <Link to="/profile" className={`flex items-center gap-4 p-4 rounded-xl font-bold transition-colors ${location.pathname === '/profile' ? 'text-brand-primary bg-brand-light' : 'text-gray-800 hover:bg-gray-50'}`}>
                                <img src={ordersIcon} alt="orders icon" className='w-5 h-5 p-0' />
                                My Orders
                            </Link>
                            <Link to="/profile" className={`flex items-center gap-4 p-4 rounded-xl font-bold transition-colors ${location.pathname === '/profile' ? 'text-brand-primary bg-brand-light' : 'text-gray-800 hover:bg-gray-50'}`}>
                                <img src={profileIcon} alt="profile icon" className='w-5 h-5 p-0' />
                                Profile <span className="text-[10px] bg-brand-primary text-white px-2 py-0.5 rounded-full ml-auto">New</span>
                            </Link>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <Link to="/signin" className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white px-4 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors">
                                <User className="w-4 h-4" />
                                Sign In / Register
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
