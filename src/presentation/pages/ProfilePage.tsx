import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Settings, ChevronRight, LogOut, Heart, User, Trash2, CreditCard, Bell, HelpCircle, Menu } from 'lucide-react';
import { getCustomerProfile, getAddresses, deleteAddress, isTokenValid } from '../../data/api';

export const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [profilePhone, setProfilePhone] = useState(localStorage.getItem('customer_phone') || "");
    const [profileName, setProfileName] = useState(localStorage.getItem('customer_name') || "User");
    const [addresses, setAddresses] = useState<any[]>([]);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
    
    useEffect(() => {
        const fetchUserData = async () => {
            if (isTokenValid()) {
                try {
                    const profileData = await getCustomerProfile();
                    if (profileData) {
                        if (profileData.id) localStorage.setItem('customer_id', profileData.id);
                        if (profileData.phoneNumber) {
                            setProfilePhone(profileData.phoneNumber);
                            localStorage.setItem('customer_phone', profileData.phoneNumber);
                        }
                        if (profileData.name) {
                            setProfileName(profileData.name);
                            localStorage.setItem('customer_name', profileData.name);
                        }
                    }
                    
                    setIsLoadingAddresses(true);
                    const adds = await getAddresses();
                    setAddresses(adds || []);
                } catch (e) {
                    console.error("Could not load profile/addresses from backend", e);
                } finally {
                    setIsLoadingAddresses(false);
                }
            } else {
                // If token is invalid and no phone is found, clear and redirect or stay restricted
                const token = localStorage.getItem('customer_token');
                if (!token) {
                    navigate('/'); 
                }
            }
        };
        fetchUserData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_token_expires_at');
        localStorage.removeItem('customer_id');
        localStorage.removeItem('customer_phone');
        localStorage.removeItem('customer_name');
        navigate('/');
    };

    const handleDeleteAddress = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this address?")) {
            const success = await deleteAddress(id);
            if (success) {
                setAddresses(addresses.filter(a => a.id !== id));
            }
        }
    };

    return (
        <div className="w-full bg-[#FAFAFA] min-h-screen pb-20 font-sans flex flex-col items-center">
            
            <div className="w-full mt-10 max-w-md bg-[#FAFAFA] min-h-screen flex flex-col">
                {/* Header Navbar */}
                {/* <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm border-b border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-[#FF4732] flex items-center justify-center text-white font-bold text-lg">
                        H
                    </div>
                    <button className="p-2 text-[#111]">
                        <Menu className="w-6 h-6" />
                    </button>
                </div> */}
                
                {/* Location Selector */}
                {/* <div className="bg-white px-4 py-3 border-b border-gray-100 mb-4">
                    <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div className="flex flex-col flex-1">
                            <span className="text-[12px] text-gray-400 font-medium">Your Location</span>
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-[#111] text-sm">Vikroli, Mumbai</span>
                                <ChevronRight className="w-4 h-4 text-gray-500 rotate-90" />
                            </div>
                        </div>
                    </div>
                </div> */}

                <div className="px-4 flex flex-col gap-4">
                    
                    {/* User Info Card */}
                    <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-[#FFEED4] flex items-center justify-center text-gray-500">
                                <User className="w-8 h-8 stroke-[1.5]" />
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-[18px] font-bold text-[#111]">{profileName || "Ashok Lele"}</h2>
                                <p className="text-[13px] text-gray-500 font-medium mt-0.5">{profilePhone || "9856342534"}</p>
                            </div>
                        </div>
                        <button className="text-gray-400 font-medium text-sm px-2">
                            Edit
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="flex items-center gap-4">
                        <div className="bg-white rounded-[24px] p-5 py-6 shadow-sm border border-gray-50 flex-1 flex flex-col justify-between h-[120px]">
                            <div className="flex items-center gap-2 text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span className="text-[13px] font-medium">Total Orders</span>
                            </div>
                            <span className="text-[28px] font-black text-[#111] mt-2 leading-none">4</span>
                        </div>
                        
                        <div className="bg-white rounded-[24px] p-5 py-6 shadow-sm border border-gray-50 flex-1 flex flex-col justify-between h-[120px]">
                            <div className="flex items-center gap-2 text-gray-500">
                                <MapPin className="w-4 h-4" />
                                <span className="text-[13px] font-medium">Saved Addresses</span>
                            </div>
                            <span className="text-[28px] font-black text-[#111] mt-2 leading-none">{addresses.length || 2}</span>
                        </div>
                    </div>

                    {/* Saved Addresses Section */}
                    <div className="mt-2">
                        <h3 className="font-bold text-[17px] text-[#111] mb-3 px-1">Saved Addresses</h3>
                        
                        <div className="bg-white rounded-[24px] shadow-sm border border-gray-50 flex flex-col p-2 gap-2">
                            {isLoadingAddresses ? (
                                <p className="text-center py-4 text-gray-400 text-sm">Loading addresses...</p>
                            ) : addresses.length === 0 ? (
                                <div className="p-4 border border-gray-100 rounded-[20px] bg-[#FAFAFA]">
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="text-[11px] font-bold text-[#FF8A00] bg-[#FFF3E0] px-2 py-0.5 rounded uppercase tracking-wide">HOME</span>
                                        <button className="p-1 text-[#FF4732] hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex flex-col mt-2">
                                        <h4 className="font-bold text-[15px] text-[#222]">8, Yash Complex</h4>
                                        <p className="text-gray-500 text-[13px] mt-1 leading-[1.4]">Rasne Nagar, Navi Mumbai<br/>Near Metro Station<br/>411265</p>
                                    </div>
                                </div>
                            ) : (
                                addresses.map(add => (
                                    <div key={add.id} className="p-4 border border-gray-100 rounded-[20px] bg-[#FAFAFA]">
                                        <div className="flex items-start justify-between mb-2">
                                            <span className="text-[11px] font-bold text-[#FF8A00] bg-[#FFF3E0] px-2 py-0.5 rounded uppercase tracking-wide">
                                                {add.type || 'HOME'}
                                            </span>
                                            <button 
                                                onClick={() => handleDeleteAddress(add.id)}
                                                className="p-1 text-[#FF4732] hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex flex-col mt-2">
                                            <h4 className="font-bold text-[15px] text-[#222]">
                                                {add.addressLine || 'Address'}
                                            </h4>
                                            <p className="text-gray-500 text-[13px] mt-1 leading-[1.4]">
                                                {add.pincode && <span>{add.pincode}</span>}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Settings Section */}
                    <div className="mt-2">
                        <h3 className="font-bold text-[17px] text-[#111] mb-3 px-1">Settings</h3>
                        
                        <div className="bg-white rounded-[24px] shadow-sm border border-gray-50 flex flex-col p-2">
                            <button className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-t-xl transition-colors">
                                <div className="flex items-center gap-3">
                                    <CreditCard className="w-5 h-5 text-gray-500 stroke-[1.5]" />
                                    <span className="font-semibold text-[#222] text-[15px]">Payment Methods</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                            </button>
                            
                            <button className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Bell className="w-5 h-5 text-gray-500 stroke-[1.5]" />
                                    <span className="font-semibold text-[#222] text-[15px]">Notifications</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                            </button>
                            
                            <button className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-b-xl transition-colors">
                                <div className="flex items-center gap-3">
                                    <HelpCircle className="w-5 h-5 text-gray-500 stroke-[1.5]" />
                                    <span className="font-semibold text-[#222] text-[15px]">Help & Support</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="mt-2 mb-8">
                        <h3 className="font-bold text-[17px] text-[#E53935] mb-3 px-1">Danger Zone</h3>
                        
                        <div className="bg-white rounded-[24px] shadow-sm border border-gray-50 flex flex-col p-5 items-center">
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 bg-[#FFF0EF] text-[#E53935] font-bold text-[15px] py-4 rounded-[16px] hover:bg-[#ffe5e4] transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                                <span>Clear All Data</span>
                            </button>
                            <p className="text-gray-400 text-[11px] text-center mt-4 max-w-[80%] leading-[1.4]">
                                This will delete all your orders, addresses, and preferences
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
