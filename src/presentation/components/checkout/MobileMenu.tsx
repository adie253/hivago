import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import homeIcon from "../../../assets/icons/home_icon.png";
import searchIcon from "../../../assets/icons/search_icon.png";
import profileIcon from "../../../assets/icons/profile_icon.png";
import ordersIcon from "../../../assets/icons/orders_icon.png";
import hivagoLogo from "../../../assets/footer/footer_logo.svg";

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
    const location = useLocation();

    return (
        <div
            className={`fixed inset-0 bg-black/50 z-[60] md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            onClick={onClose}
        >
            <div
                className={`fixed top-0 right-0 bottom-0 w-[280px] bg-white shadow-2xl transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className='flex items-center justify-between w-full h-30 bg-gradient-to-b from-[#D03727] to-[#AD2523] '>
                    <div className="flex flex-col gap-2 p-6">
                        <span className="text-l ml-1 text-white">Welcome to</span>
                        <img src={hivagoLogo} alt="Hivago Logo" className="w-30" />
                    </div>
                    <div className="flex items-center justify-between mb-8">
                        <button
                            onClick={onClose}
                            className="p-2 mr-5 text-white hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                <div className="p-3 flex flex-col h-full overflow-y-auto">

                    <div className="flex flex-col gap-2 flex-1 font-inter font-weight-500 text-sm">
                        <Link to="/" className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${location.pathname === '/' ? 'text-brand-primary bg-brand-light' : 'text-gray-800 hover:bg-gray-50'}`}>
                            <img src={homeIcon} alt="home icon" className='w-5 h-5 p-0' />
                            Home
                        </Link>
                        <Link to="/restaurants" className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${location.pathname === '/restaurants' ? 'text-brand-primary bg-brand-light' : 'text-gray-800 hover:bg-gray-50'}`}>
                            <img src={searchIcon} alt="search icon" className='w-5 h-5 p-0' />
                            Search Restaurants
                        </Link>
                        <Link to="/profile" className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${location.pathname === '/profile' ? 'text-brand-primary bg-brand-light' : 'text-gray-800 hover:bg-gray-50'}`}>
                            <img src={ordersIcon} alt="orders icon" className='w-5 h-5 p-0' />
                            My Orders
                        </Link>
                        <Link to="/profile" className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${location.pathname === '/profile' ? 'text-brand-primary bg-brand-light' : 'text-gray-800 hover:bg-gray-50'}`}>
                            <img src={profileIcon} alt="profile icon" className='w-5 h-5 p-0' />
                            Profile <span className="text-[10px] bg-brand-primary text-white px-2 py-0.5 rounded-full ml-auto">New</span>
                        </Link>
                        <div className='flex p-3 border-t-2 border-gray-100 mt-3 pt-6'>
                            <p className='text-xs'>
                                <span className='text-gray-700'>Need help? </span>
                                <br />
                                <span className='text-gray-500'>call : 1800-123-4567</span>
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
