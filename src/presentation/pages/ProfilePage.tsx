import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, ChevronRight, User, Trash2, Bell, HelpCircle, Check, Edit2, Plus, Home, Briefcase, LogOut } from 'lucide-react';
import { getCustomerProfile, deleteAddress, isTokenValid, getMyOrders, setDefaultAddress, updateCustomerProfile } from '../../data/api';
import { useCart } from '../../presentation/context/CartContext';
import { useUserLocation } from '../../presentation/context/LocationContext';
import { AddAddressOverlay } from '../components/AddAddressOverlay';
import { useToast } from '../context/ToastContext';

export const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [profilePhone, setProfilePhone] = useState(() => isTokenValid() ? (localStorage.getItem('customer_phone') || "") : "");
    const [profileName, setProfileName] = useState(() => isTokenValid() ? (localStorage.getItem('customer_name') || "User") : "User");
    const [profileEmail, setProfileEmail] = useState("");
    const [totalOrders, setTotalOrders] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isAddressOverlayOpen, setIsAddressOverlayOpen] = useState(() => {
        return sessionStorage.getItem('profile_address_overlay_open') === 'true';
    });
    const [addressToEdit, setAddressToEdit] = useState<any>(() => {
        const saved = sessionStorage.getItem('profile_address_to_edit');
        return saved ? JSON.parse(saved) : null;
    });
    const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
    const { refreshLoginStatus } = useCart();
    const { addresses, isLoadingAddresses, refreshAddresses } = useUserLocation();
    const { showToast } = useToast();

    useEffect(() => {
        sessionStorage.setItem('profile_address_overlay_open', isAddressOverlayOpen.toString());
        if (addressToEdit) {
            sessionStorage.setItem('profile_address_to_edit', JSON.stringify(addressToEdit));
        } else {
            sessionStorage.removeItem('profile_address_to_edit');
        }
    }, [isAddressOverlayOpen, addressToEdit]);

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
                        if (profileData.email) {
                            setProfileEmail(profileData.email);
                            localStorage.setItem('customer_email', profileData.email);
                        }
                    }

                    const ordersData = await getMyOrders(0, 1);
                    if (ordersData && typeof ordersData.totalCount !== 'undefined') {
                        setTotalOrders(ordersData.totalCount);
                    } else if (Array.isArray(ordersData)) {
                        setTotalOrders(ordersData.length);
                    } else if (ordersData && Array.isArray(ordersData.orders)) {
                        setTotalOrders(ordersData.totalCount || ordersData.orders.length);
                    }
                } catch (e) {
                    console.error("Could not load profile/addresses from backend", e);
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
        localStorage.removeItem('customer_email');
        localStorage.removeItem('hivago_cart_v2');
        localStorage.removeItem('customer_refresh_token');
        refreshLoginStatus();
        navigate('/');
    };

    const handleDeleteAddress = (id: string) => {
        setAddressToDelete(id);
    };

    const confirmDeleteAddress = async () => {
        if (!addressToDelete) return;
        
        try {
            const success = await deleteAddress(addressToDelete);
            if (success) {
                showToast("Address deleted successfully", "success");
                refreshAddresses();
            } else {
                showToast("Failed to delete address", "error");
            }
        } catch (error) {
            showToast("An error occurred while deleting", "error");
        } finally {
            setAddressToDelete(null);
        }
    };

    const handleToggleDefault = async (address: any) => {
        try {
            const res = await setDefaultAddress(address.id);
            if (res && res.message) {
                showToast(res.message, "success");
            }
            refreshAddresses();
        } catch (error: any) {
            console.error("Failed to update default address", error);
            showToast(error.message || "Failed to update default address", "error");
            refreshAddresses();
        }
    };

    const handleEditAddress = (address: any) => {
        setAddressToEdit(address);
        setIsAddressOverlayOpen(true);
    };

    const handleAddNewAddress = () => {
        setAddressToEdit(null);
        setIsAddressOverlayOpen(true);
    };

    const handleSaveProfile = async () => {
        if (!editName.trim()) return;
        setIsUpdatingProfile(true);
        try {
            const response = await updateCustomerProfile({ name: editName, email: editEmail });
            setProfileName(editName);
            setProfileEmail(editEmail);
            localStorage.setItem('customer_name', editName);
            localStorage.setItem('customer_email', editEmail);
            setIsEditing(false);
            
            // Show success toast from API response
            if (response && response.message) {
                showToast(response.message, "success");
            } else {
                showToast("Profile updated", "success");
            }
        } catch (e: any) {
            console.error("Failed to update profile", e);
            showToast(e.message || "Failed to update profile", "error");
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const openEditModal = () => {
        setEditName(profileName);
        setEditEmail(profileEmail);
        setIsEditing(true);
    };

    return (
        <div className="w-full bg-[#FAFAFA] min-h-screen pb-24 font-sans flex flex-col items-center">
            {/* Main responsive container */}
            <div className="w-full max-w-6xl px-4 md:px-8 py-8 md:py-12 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Header Banner Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* User Info Card */}
                    <div className="lg:col-span-2 bg-white rounded-[28px] p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:shadow-md duration-300">
                        <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
                            <div className="w-20 h-20 rounded-full bg-[#FFEED4] flex items-center justify-center text-[#FF9800] ring-4 ring-[#FFEED4]/50 shadow-inner">
                                <User className="w-10 h-10 stroke-[1.5]" />
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-xl md:text-2xl font-bold text-[#111] tracking-tight">{profileName || "User"}</h2>
                                <p className="text-sm text-gray-500 font-semibold mt-1 flex items-center justify-center md:justify-start gap-1">
                                    <span>{profilePhone || "No Phone Number"}</span>
                                </p>
                                {profileEmail && (
                                    <p className="text-xs text-gray-400 mt-1 font-medium">{profileEmail}</p>
                                )}
                            </div>
                        </div>
                        <button 
                            onClick={openEditModal}
                            className="w-full md:w-auto text-[#FF4732] hover:text-white font-semibold text-sm px-6 py-3 bg-[#FFF0EF] hover:bg-[#FF4732] rounded-full transition-all duration-300 transform active:scale-95 shadow-sm hover:shadow-md"
                        >
                            Edit Profile
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Total Orders Card */}
                        <div className="bg-[#FFFDF5] rounded-[28px] p-5 shadow-sm border border-amber-100 flex flex-col justify-between h-[140px] transition-all hover:shadow-md hover:scale-[1.02] duration-300 group">
                            <div className="flex items-center gap-2 text-amber-600">
                                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
                            </div>
                            <span className="text-3xl md:text-4xl font-bold text-[#111] leading-none mb-1">
                                {isTokenValid() ? totalOrders : 0}
                            </span>
                        </div>

                        {/* Saved Addresses Card */}
                        <div className="bg-[#F4FBF7] rounded-[28px] p-5 shadow-sm border border-emerald-100 flex flex-col justify-between h-[140px] transition-all hover:shadow-md hover:scale-[1.02] duration-300 group">
                            <div className="flex items-center gap-2 text-emerald-600">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <span className="text-[11px] font-bold uppercase tracking-wider">Saved Addr</span>
                            </div>
                            <span className="text-3xl md:text-4xl font-bold text-[#111] leading-none mb-1">
                                {addresses.length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Two Column Layout (Desktop Split) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* LEFT COLUMN: Saved Addresses (2/3 width on desktop) */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="flex items-center justify-between mb-1 px-1">
                            <div className="flex flex-col">
                                <h3 className="font-bold text-lg md:text-xl text-[#111] tracking-tight">Saved Addresses</h3>
                                <p className="text-xs text-gray-400 font-medium mt-0.5">Manage your delivery locations</p>
                            </div>
                            <button 
                                onClick={handleAddNewAddress}
                                className="flex items-center gap-1.5 text-white font-semibold text-xs md:text-sm bg-[#FF4732] hover:bg-[#E53935] px-4 py-2.5 rounded-full transition-all duration-300 transform active:scale-95 shadow-md shadow-red-100"
                            >
                                <Plus className="w-4 h-4 stroke-[3px]" />
                                <span>Add New</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {isLoadingAddresses ? (
                                <div className="col-span-full bg-white rounded-[28px] border border-gray-100 p-12 text-center shadow-sm">
                                    <div className="w-8 h-8 border-2 border-[#FF4732]/30 border-t-[#FF4732] rounded-full animate-spin mx-auto mb-3"></div>
                                    <p className="text-gray-400 text-sm font-semibold">Loading your addresses...</p>
                                </div>
                            ) : addresses.length === 0 ? (
                                <div className="col-span-full bg-white rounded-[28px] border border-gray-100 p-12 text-center shadow-sm flex flex-col items-center">
                                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-3">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <p className="font-bold text-gray-700 text-sm">No addresses found</p>
                                    <p className="text-xs text-gray-400 font-medium mt-1 mb-4">Add an address to checkout faster next time.</p>
                                    <button
                                        onClick={handleAddNewAddress}
                                        className="text-[#FF4732] hover:text-white font-semibold text-xs px-4 py-2 bg-[#FFF0EF] hover:bg-[#FF4732] rounded-full transition-all"
                                    >
                                        Add Address
                                    </button>
                                </div>
                            ) : (
                                addresses.map((add, idx) => {
                                    const labelLower = add.label?.toLowerCase() || '';
                                    const themes = [
                                        { bg: 'from-[#FF584A] to-[#E5483B]', text: 'text-[#FF584A]', accentBtn: 'text-[#FF584A] hover:text-[#E5483B]' },
                                        { bg: 'from-[#FF584A] to-[#E5483B]', text: 'text-[#FF584A]', accentBtn: 'text-[#FF584A] hover:text-[#E5483B]' },
                                        // { bg: 'from-[#FF8A00] to-[#E67B00]', text: 'text-[#FF8A00]', accentBtn: 'text-[#FF8A00] hover:text-[#E67B00]' },
                                        // { bg: 'from-[#2B7FFF] to-[#1A6EEB]', text: 'text-[#2B7FFF]', accentBtn: 'text-[#2B7FFF] hover:text-[#1A6EEB]' },
                                        // { bg: 'from-[#8B5CF6] to-[#7C3AED]', text: 'text-[#8B5CF6]', accentBtn: 'text-[#8B5CF6] hover:text-[#7C3AED]' },
                                    ];
                                    const themeIndex = labelLower === 'home' ? 0 : labelLower === 'work' ? 1 : (idx % themes.length);
                                    const theme = themes[themeIndex];
                                    const isHome = labelLower === 'home';
                                    const isWork = labelLower === 'work';
                                    
                                    return (
                                        <div 
                                            key={add.id} 
                                            className={`bg-white rounded-xl shadow-xs border transition-all duration-300 flex overflow-hidden group hover:shadow-md ${
                                                add.isDefault ? 'border-[#FF584A] ring-1 ring-[#FF584A]/20' : 'border-gray-100'
                                            }`}
                                        >
                                            {/* Left Colorful Solid Block with Icon */}
                                            <div className={`w-11 sm:w-12 bg-gradient-to-b ${theme.bg} flex items-center justify-center shrink-0 p-2`}>
                                                {isHome ? (
                                                    <Home className="w-5 h-5 text-white stroke-[2.2]" />
                                                ) : isWork ? (
                                                    <Briefcase className="w-5 h-5 text-white stroke-[2.2]" />
                                                ) : (
                                                    <MapPin className="w-5 h-5 text-white stroke-[2.2]" />
                                                )}
                                            </div>

                                            {/* Right Card Body */}
                                            <div className="flex-1 p-2.5 sm:p-3 flex flex-col justify-between bg-white min-w-0">
                                                <div>
                                                    {/* Header Row: Label & Action Icons */}
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className={`text-[10px] font-extrabold uppercase tracking-wider ${theme.text}`}>
                                                            {add.label || 'Other'}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => handleEditAddress(add)}
                                                                className="p-0.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                                                title="Edit Address"
                                                            >
                                                                <Edit2 className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteAddress(add.id)}
                                                                className="p-0.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                                title="Delete Address"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Address Text */}
                                                    <h4 className="font-bold text-gray-900 text-xs sm:text-sm leading-snug line-clamp-1">
                                                        {add.addressLine}
                                                    </h4>
                                                    {add.landmark ? (
                                                        <p className="text-[11px] text-gray-400 font-medium line-clamp-1 mt-0.5">
                                                            Near {add.landmark}
                                                        </p>
                                                    ) : add.formattedAddress ? (
                                                        <p className="text-[11px] text-gray-400 font-medium line-clamp-1 mt-0.5">
                                                            {add.formattedAddress}
                                                        </p>
                                                    ) : null}
                                                </div>

                                                {/* Footer Row: Default Status & Check Radio Circle */}
                                                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-50">
                                                    {add.isDefault ? (
                                                        <span className="text-[9px] font-extrabold text-[#FF584A] bg-[#FFF0EF] border border-[#FF584A]/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                            DEFAULT ADDRESS
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleDefault(add)}
                                                            className={`text-[10px] font-bold uppercase tracking-wider ${theme.accentBtn} transition-colors`}
                                                        >
                                                            SET AS DEFAULT
                                                        </button>
                                                    )}

                                                    <div 
                                                        onClick={() => handleToggleDefault(add)}
                                                        className={`w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                                                            add.isDefault
                                                                ? 'bg-[#FF584A] text-white shadow-xs'
                                                                : 'border border-gray-300 hover:border-gray-400'
                                                        }`}
                                                    >
                                                        {add.isDefault && <Check className="w-3 h-3 stroke-[3]" />}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Settings & Danger Zone (1/3 width on desktop) */}
                    <div className="flex flex-col gap-6">
                        {/* Settings Card */}
                        <div>
                            <div className="mb-2 px-1">
                                <h3 className="font-bold text-lg text-[#111] tracking-tight">Settings</h3>
                                <p className="text-xs text-gray-400 font-medium mt-0.5">Preferences & support options</p>
                            </div>

                            <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 flex flex-col p-2 gap-0.5 mt-3">
                                {/* <button 
                                    onClick={() => showToast("Payment Methods feature is coming soon!", "success")}
                                    className="flex items-center justify-between p-4 hover:bg-[#FFF9F9]/50 text-gray-700 hover:text-[#FF4732] rounded-2xl transition-all duration-300 group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-[#FFF0EF] transition-colors">
                                            <CreditCard className="w-4.5 h-4.5 stroke-[1.5]" />
                                        </div>
                                        <span className="font-semibold text-sm">Payment Methods</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                                </button> */}

                                <button 
                                    onClick={() => showToast("Notification configurations coming soon!", "success")}
                                    className="flex items-center justify-between p-4 hover:bg-[#FFF9F9]/50 text-gray-700 hover:text-[#FF4732] rounded-2xl transition-all duration-300 group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-[#FFF0EF] transition-colors">
                                            <Bell className="w-4.5 h-4.5 stroke-[1.5]" />
                                        </div>
                                        <span className="font-semibold text-sm">Notifications</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                                </button>

                                <a 
                                    href="https://wa.me/919082220155?text=Need%20HELP!" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 hover:bg-[#FFF9F9]/50 text-gray-700 hover:text-[#FF4732] rounded-2xl transition-all duration-300 group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-[#FFF0EF] transition-colors">
                                            <HelpCircle className="w-4.5 h-4.5 stroke-[1.5]" />
                                        </div>
                                        <span className="font-semibold text-sm">Help & Support</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                                </a>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div>
                            <div className="mb-2 px-1">
                                <h3 className="font-bold text-lg text-[#E53935] tracking-tight">Danger Zone</h3>
                                <p className="text-xs text-gray-400 font-medium mt-0.5">Sensitive account operations</p>
                            </div>

                            <div className="bg-[#FFFDFD] rounded-[28px] shadow-sm border border-red-50 flex flex-col p-5 items-center mt-3 text-center">
                                <p className="text-gray-400 text-xs font-semibold leading-relaxed mb-4 max-w-[85%]">
                                    Sign out of your active Hivago account on this device.
                                </p>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 bg-[#FFF0EF] hover:bg-[#FF4732] text-[#E53935] hover:text-white font-semibold text-sm py-4 rounded-2xl transition-all duration-300 shadow-sm active:scale-[0.98]"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout Account</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-[#111]">Edit Profile</h3>
                            <button 
                                onClick={() => setIsEditing(false)}
                                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100"
                            >
                                ✕
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (!isUpdatingProfile && editName.trim()) {
                                    handleSaveProfile();
                                }
                            }}
                            className="flex flex-col gap-5"
                        >
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-[#FF4732] focus:bg-white transition-all font-medium"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    value={editEmail}
                                    onChange={e => setEditEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-[#FF4732] focus:bg-white transition-all font-medium"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isUpdatingProfile || !editName.trim()}
                                className={`w-full mt-2 text-white font-semibold text-[16px] py-[16px] rounded-2xl shadow-lg transition-all flex items-center justify-center ${isUpdatingProfile || !editName.trim() ? 'bg-[#FFB7B0]' : 'bg-[#FF584A] hover:bg-[#E5483B]'}`}
                            >
                                {isUpdatingProfile ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <AddAddressOverlay 
                isOpen={isAddressOverlayOpen}
                onClose={() => {
                    setIsAddressOverlayOpen(false);
                    setAddressToEdit(null);
                }}
                addressToEdit={addressToEdit}
            />

            {/* Custom Delete Confirmation Modal */}
            {addressToDelete && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] w-full max-w-[340px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-[#FF4732] mb-5">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        
                        <h3 className="text-xl font-bold text-[#111] mb-2">Delete Address?</h3>
                        <p className="text-gray-500 text-sm leading-relaxed mb-8">
                            Are you sure you want to delete this address? This action cannot be undone.
                        </p>

                        <div className="flex flex-col w-full gap-3">
                            <button
                                onClick={confirmDeleteAddress}
                                className="w-full bg-[#FF4732] text-white font-semibold py-4 rounded-2xl hover:bg-[#E53935] transition-all shadow-lg shadow-red-100 active:scale-[0.98]"
                            >
                                Yes, Delete
                            </button>
                            <button
                                onClick={() => setAddressToDelete(null)}
                                className="w-full bg-gray-50 text-gray-500 font-semibold py-4 rounded-2xl hover:bg-gray-100 transition-all active:scale-[0.98]"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
