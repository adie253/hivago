import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, ChevronRight, User, Trash2, Bell, HelpCircle, Check, Edit2, Plus, Home, Briefcase } from 'lucide-react';
import { getCustomerProfile, getAddresses, deleteAddress, isTokenValid, getMyOrders, setDefaultAddress, updateCustomerProfile } from '../../data/api';
import { useCart } from '../../presentation/context/CartContext';
import { useUserLocation } from '../../presentation/context/LocationContext';
import { AddAddressOverlay } from '../components/AddAddressOverlay';
import toast from 'react-hot-toast';

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
    const [isAddressOverlayOpen, setIsAddressOverlayOpen] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState<any>(null);
    const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
    const { refreshLoginStatus } = useCart();
    const { addresses, isLoadingAddresses, refreshAddresses } = useUserLocation();

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
                } finally {
                    setIsLoadingAddresses(false);
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
                toast.success("Address deleted successfully");
                refreshAddresses();
            } else {
                toast.error("Failed to delete address");
            }
        } catch (error) {
            toast.error("An error occurred while deleting");
        } finally {
            setAddressToDelete(null);
        }
    };

    const handleToggleDefault = async (address: any) => {
        try {
            const res = await setDefaultAddress(address.id);
            if (res && res.message) {
                toast.success(res.message);
            }
            refreshAddresses();
        } catch (error: any) {
            console.error("Failed to update default address", error);
            toast.error(error.message || "Failed to update default address");
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
                toast.success(response.message, {
                    style: { borderRadius: '16px', fontWeight: '600' }
                });
            } else {
                toast.success("Profile updated", {
                    style: { borderRadius: '16px', fontWeight: '600' }
                });
            }
        } catch (e: any) {
            console.error("Failed to update profile", e);
            toast.error(e.message || "Failed to update profile", {
                style: { borderRadius: '16px', fontWeight: '600' }
            });
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
                                <h2 className="text-[18px] font-bold text-[#111]">{profileName || "User"}</h2>
                                <p className="text-[13px] text-gray-500 font-medium mt-0.5">{profilePhone || "No Phone Number"}</p>
                                {profileEmail && <p className="text-[12px] text-gray-400 mt-0.5 font-medium">{profileEmail}</p>}
                            </div>
                        </div>
                        <button 
                            onClick={openEditModal}
                            className="text-gray-400 font-medium text-sm px-2"
                        >
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
                            <span className="text-[28px] font-bold text-[#111] mt-2 leading-none">{isTokenValid() ? totalOrders : 0}</span>
                        </div>

                        <div className="bg-white rounded-[24px] p-5 py-6 shadow-sm border border-gray-50 flex-1 flex flex-col justify-between h-[120px]">
                            <div className="flex items-center gap-2 text-gray-500">
                                <MapPin className="w-4 h-4" />
                                <span className="text-[13px] font-medium">Saved Addresses</span>
                            </div>
                            <span className="text-[28px] font-bold text-[#111] mt-2 leading-none">{addresses.length}</span>
                        </div>
                    </div>

                    {/* Saved Addresses Section */}
                    <div className="mt-2">
                        <div className="flex items-center justify-between mb-3 px-1">
                            <h3 className="font-bold text-[17px] text-[#111]">Saved Addresses</h3>
                            <button 
                                onClick={handleAddNewAddress}
                                className="flex items-center gap-1.5 text-[#FF4732] font-bold text-sm bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add New</span>
                            </button>
                        </div>

                        <div className="bg-white rounded-[24px] shadow-sm border border-gray-50 flex flex-col p-2 gap-2">
                            {isLoadingAddresses ? (
                                <p className="text-center py-4 text-gray-400 text-sm">Loading addresses...</p>
                            ) : addresses.length === 0 ? (
                                <p className="text-center py-4 text-gray-400 text-sm">No saved addresses</p>
                            ) : (
                                addresses.map(add => (
                                    <div key={add.id} className="p-4 border border-gray-100 rounded-[20px] bg-[#FAFAFA]">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[#FF4732]">
                                                    {add.label?.toLowerCase() === 'home' ? <Home className="w-5 h-5" /> : 
                                                     add.label?.toLowerCase() === 'work' ? <Briefcase className="w-5 h-5" /> : 
                                                     <MapPin className="w-5 h-5" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[15px] font-bold text-[#111]  tracking-tight">
                                                        {add.addressLine}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEditAddress(add)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAddress(add.id)}
                                                    className="p-1.5 text-gray-400 hover:text-[#FF4732] hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        {/* <div className="flex flex-col pl-[52px]">
                                            <p className="text-gray-500 text-[13px] font-medium leading-[1.4]">
                                                {add.addressLine}
                                            </p>
                                        </div> */}
                                        <div 
                                            onClick={() => handleToggleDefault(add)}
                                            className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 cursor-pointer group"
                                        >
                                            <span className="text-[12px] font-medium text-gray-500 group-hover:text-gray-700 transition-colors">Set as Default</span>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${add.isDefault ? 'bg-[#00A859] border-[#00A859]' : 'border-gray-200'}`}>
                                                {add.isDefault && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                                            </div>
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
                            {/* <button className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-t-xl transition-colors">
                                <div className="flex items-center gap-3">
                                    <CreditCard className="w-5 h-5 text-gray-500 stroke-[1.5]" />
                                    <span className="font-semibold text-[#222] text-[15px]">Payment Methods</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                            </button> */}

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

                        <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-[#FF4732] focus:bg-white transition-all font-medium"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    value={editEmail}
                                    onChange={e => setEditEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-[#FF4732] focus:bg-white transition-all font-medium"
                                />
                            </div>

                            <button
                                onClick={handleSaveProfile}
                                disabled={isUpdatingProfile || !editName.trim()}
                                className={`w-full mt-2 text-white font-bold text-[16px] py-[16px] rounded-2xl shadow-lg transition-all flex items-center justify-center ${isUpdatingProfile || !editName.trim() ? 'bg-[#FFB7B0]' : 'bg-[#FF584A] hover:bg-[#E5483B]'}`}
                            >
                                {isUpdatingProfile ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <AddAddressOverlay 
                isOpen={isAddressOverlayOpen}
                onClose={() => setIsAddressOverlayOpen(false)}
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
                                className="w-full bg-[#FF4732] text-white font-bold py-4 rounded-2xl hover:bg-[#E53935] transition-all shadow-lg shadow-red-100 active:scale-[0.98]"
                            >
                                Yes, Delete
                            </button>
                            <button
                                onClick={() => setAddressToDelete(null)}
                                className="w-full bg-gray-50 text-gray-500 font-bold py-4 rounded-2xl hover:bg-gray-100 transition-all active:scale-[0.98]"
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
