import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, MapPin, Menu as MenuIcon, Loader2, Check, Edit2, Home, Briefcase } from 'lucide-react';
import { sendOtp, verifyOtp, addAddress, isTokenValid, updateAddress, setDefaultAddress } from '../../../data/api';
import { useCart } from '../../context/CartContext';
import { useUserLocation } from '../../context/LocationContext';
import { useToast } from '../../context/ToastContext';
import girlOnSofa from '../../../assets/checkout/girl_on_sofa.svg';
import girlWithMap from '../../../assets/girl_with_map.svg';
import { MapPicker } from './MapPicker';
import { StepperIcon } from './StepperIcon';

export type DetailsFlowOverlayProps = {
    onClose: () => void;
    onComplete: (address: any) => void;
};

type Step = 'phone' | 'otp' | 'location' | 'addresses' | 'addAddress';

export const DetailsFlowOverlay: React.FC<DetailsFlowOverlayProps> = ({ onClose, onComplete }) => {
    const { showToast } = useToast();
    const [step, setStep] = useState<Step>(() => {
        if (!isTokenValid()) return 'phone';
        const saved = sessionStorage.getItem('checkout_step');
        if (saved) return saved as Step;
        return 'addresses';
    });
    const [phone, setPhone] = useState(() => localStorage.getItem('customer_phone') || '');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(() => sessionStorage.getItem('selected_address_id'));
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [isSavingAddress, setIsSavingAddress] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [addressLine, setAddressLine] = useState(() => sessionStorage.getItem('checkout_address_line') || '');
    const [landmark, setLandmark] = useState(() => sessionStorage.getItem('checkout_landmark') || '');
    const [isDefault, setIsDefault] = useState(true);
    const [label, setLabel] = useState(() => sessionStorage.getItem('checkout_label') || 'Home');
    const [mapCoordinates, setMapCoordinates] = useState<{lat: number, lng: number} | null>(() => {
        const saved = sessionStorage.getItem('checkout_map_coords');
        return saved ? JSON.parse(saved) : null;
    });

    // Delivery check states

    const [addressToEdit, setAddressToEdit] = useState<any>(null);

    const { addresses, isLoadingAddresses, refreshAddresses, selectedLocation } = useUserLocation();
    const { refreshLoginStatus } = useCart();
    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);





    useEffect(() => {
        sessionStorage.setItem('checkout_step', step);
    }, [step]);

    useEffect(() => {
        if (selectedAddressId) {
            const addr = addresses.find(a => a.id === selectedAddressId);
            if (addr) {
                console.log('--- CHECKOUT SELECTION ---');
                console.log('ID:', addr.id);
                console.log('Label:', addr.label);
                console.log('Address:', addr.addressLine);
                console.log('---------------------------');
            }
        }
    }, [selectedAddressId, addresses]);

    useEffect(() => {
        if (selectedAddressId) {
            sessionStorage.setItem('selected_address_id', selectedAddressId);
        } else {
            sessionStorage.removeItem('selected_address_id');
        }
    }, [selectedAddressId]);

    useEffect(() => {
        sessionStorage.setItem('checkout_address_line', addressLine);
        sessionStorage.setItem('checkout_landmark', landmark);
        sessionStorage.setItem('checkout_label', label);
        if (mapCoordinates) {
            sessionStorage.setItem('checkout_map_coords', JSON.stringify(mapCoordinates));
        } else {
            sessionStorage.removeItem('checkout_map_coords');
        }
    }, [addressLine, landmark, label, mapCoordinates]);

    useEffect(() => {
        if (isTokenValid() && step === 'phone') {
            setStep('addresses');
        }
    }, []);

    const renderStepper = () => {
        return (
            <div className="bg-white px-6 py-4 mb-3 border-b border-gray-100 flex items-center justify-between shadow-sm">
                <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-white border border-[#E0E0E0] text-[#00A050] shadow-sm flex items-center justify-center mb-1">
                        <StepperIcon type="menu" className="text-[#00A050]" />
                    </div>
                    <span className="text-[10px] font-bold text-[#00A050]">Menu</span>
                </div>
                <div className="flex gap-[4px] items-center flex-shrink-0 mb-4 flex-1 justify-center px-1">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={`c1-${i}`} className="w-1.5 h-1.5 rounded-full bg-[#00A050]"></div>)}
                </div>
                <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-white border border-[#E0E0E0] text-[#00A050] shadow-sm flex items-center justify-center mb-1">
                        <StepperIcon type="cart" className="text-[#00A050]" />
                    </div>
                    <span className="text-[10px] font-bold text-[#00A050]">Cart</span>
                </div>
                <div className="flex gap-[4px] items-center flex-shrink-0 mb-4 flex-1 justify-center px-1">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={`c2-${i}`} className="w-1.5 h-1.5 rounded-full bg-[#00A050]"></div>)}
                </div>
                <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[#FFF0EF] border border-[#FFCCCB] text-[#FF4732] shadow-sm flex items-center justify-center mb-1">
                        <StepperIcon type="address" className="text-[#FF4732]" />
                    </div>
                    <span className="text-[10px] font-bold text-[#FF4732]">Details</span>
                </div>
                <div className="flex gap-[4px] items-center flex-shrink-0 mb-4 flex-1 justify-center px-1">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={`c3-${i}`} className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>)}
                </div>
                <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[#F9FAFB] border border-[#E0E0E0] text-gray-300 shadow-sm flex items-center justify-center mb-1">
                        <StepperIcon type="checkout" className="text-gray-300" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-500">Checkout</span>
                </div>
            </div>
        );
    };

    const handleBack = () => {
        switch (step) {
            case 'otp': setStep('phone'); break;
            case 'location': setStep('otp'); break;
            case 'addresses': setStep('location'); break;
            case 'addAddress': setStep('addresses'); break;
            case 'phone': onClose(); break;
        }
    };

    const handleSendOtp = async () => {
        if (phone.length !== 10) {
            setErrorMsg('Please enter a valid 10-digit phone number');
            return;
        }
        setErrorMsg('');
        setIsSendingOtp(true);
        try {
            await sendOtp(phone);
            setStep('otp');
            setOtp(['', '', '', '', '', '']);
        } catch (e: any) {
            setErrorMsg(e.message || 'Failed to send OTP');
        } finally {
            setIsSendingOtp(false);
        }
    };

    const renderPhone = () => (
        <div className="flex-1 px-6 pt-10 pb-6 flex flex-col">
            <h2 className="text-[22px] font-bold text-[#111] leading-tight mb-2 pr-20">Enter your phone number</h2>
            <p className="text-gray-500 text-sm mb-10 pb-6 pr-24 leading-snug">We'll use this to keep you updated about your order</p>
            <div className="flex flex-col mb-auto gap-2">
                <div className="flex gap-3">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[#333] font-bold flex items-center">
                        +91
                    </div>
                    <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={e => {
                            setPhone(e.target.value.replace(/\D/g, ''));
                            setErrorMsg('');
                        }}
                        placeholder="Enter 10 digit phone number"
                        className={`flex-1 bg-gray-50 border rounded-xl px-4 py-3 outline-none focus:border-[#FF4732] font-medium text-[#111] ${errorMsg ? 'border-red-500' : 'border-gray-200'}`}
                    />
                </div>
                {errorMsg && step === 'phone' && <p className="text-red-500 text-sm">{errorMsg}</p>}
            </div>
            <button
                onClick={handleSendOtp}
                disabled={isSendingOtp || phone.length !== 10}
                className={`w-full mt-10 text-white font-bold text-[16px] py-[16px] rounded-xl shadow-md transition-colors flex items-center justify-center ${isSendingOtp || phone.length !== 10 ? 'bg-[#FFB7B0]' : 'bg-[#FF584A] hover:bg-[#E5483B]'}`}
            >
                {isSendingOtp ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify number'}
            </button>
        </div>
    );

    const handleVerifyOtp = async () => {
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setErrorMsg('Please enter a valid 6-digit OTP');
            return;
        }
        setErrorMsg('');
        setIsVerifyingOtp(true);
        try {
            const data = await verifyOtp(phone, otpString);
            if (data && data.accessToken) {
                localStorage.setItem('customer_token', data.accessToken);
                localStorage.setItem('customer_phone', phone);
                const cid = data.customerId || data.id;
                if (cid) localStorage.setItem('customer_id', cid);
                if (data.accessTokenExpiresAt) localStorage.setItem('customer_token_expires_at', data.accessTokenExpiresAt);
                if (data.refreshToken) localStorage.setItem('customer_refresh_token', data.refreshToken);

                refreshLoginStatus();
                refreshAddresses();
            }
            
            // Skip location step if already have a location (from GPS or saved)
            if (selectedLocation) {
                setStep('addresses');
            } else {
                setStep('location');
            }
        } catch (e: any) {
            setErrorMsg(e.message || 'Invalid OTP');
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        if (value.length > 1) {
            const pastedData = value.slice(0, 6).split('');
            const newOtp = [...otp];
            for (let i = 0; i < pastedData.length; i++) {
                if (index + i < 6) {
                    newOtp[index + i] = pastedData[i];
                }
            }
            setOtp(newOtp);
            const nextIndex = Math.min(index + pastedData.length, 5);
            otpInputRefs.current[nextIndex]?.focus();
            return;
        }
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    const renderOtp = () => (
        <div className="flex-1 px-6 pt-10 pb-6 flex flex-col">
            <h2 className="text-[22px] font-bold text-[#111] leading-tight mb-2 pr-20">Enter OTP</h2>
            <p className="text-gray-500 text-sm mb-10 pb-6 pr-20 leading-snug">Enter the 6 digit code sent to you at +91 {phone || 'XXXXXX1234'}</p>
            <p className="text-gray-800 font-bold mb-3 text-sm">OTP</p>
            <div className="flex flex-col mb-auto gap-2">
                <div className="flex gap-2 sm:gap-4 justify-between">
                    {[0, 1, 2, 3, 4, 5].map((idx) => (
                        <input
                            key={idx}
                            ref={el => otpInputRefs.current[idx] = el}
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={otp[idx]}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            className="w-12 h-12 md:w-14 md:h-14 bg-gray-100 border border-transparent focus:border-[#FF4732] rounded-xl text-center text-xl font-bold text-[#111] outline-none transition-colors"
                        />
                    ))}
                </div>
                <p className="text-gray-400 text-xs mt-2">Enter 6 digit OTP</p>
                {errorMsg && step === 'otp' && <p className="text-red-500 text-sm mt-1">{errorMsg}</p>}
            </div>
            <button
                onClick={handleVerifyOtp}
                disabled={isVerifyingOtp || otp.join('').length !== 6}
                className={`w-full mt-10 text-white font-bold text-[16px] py-[16px] rounded-xl shadow-md transition-colors flex justify-center items-center ${isVerifyingOtp || otp.join('').length !== 6 ? 'bg-[#FFB7B0]' : 'bg-[#FF584A] hover:bg-[#E5483B]'}`}
            >
                {isVerifyingOtp ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue to address'}
            </button>
        </div>
    );

    const handleAllowLocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setMapCoordinates({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setStep('addresses');
                    refreshAddresses();
                },
                () => {
                    setStep('addresses');
                    refreshAddresses();
                }
            );
        } else {
            setStep('addresses');
            refreshAddresses();
        }
    };

    const renderLocation = () => (
        <div className="flex-1 px-6 pt-10 pb-6 flex flex-col">
            <h2 className="text-[22px] font-bold text-[#111] leading-tight mb-2 pr-24">Allow Location Access</h2>
            <p className="text-gray-500 text-sm mb-10 flex-1 pr-24 leading-snug">This lets show you which restaurants you can order from.</p>
            <button
                onClick={handleAllowLocation}
                className="w-full bg-[#FF584A] text-white font-bold text-[16px] py-[16px] rounded-xl shadow-md hover:bg-[#E5483B] transition-colors mb-3"
            >
                Allow
            </button>
            <button
                onClick={() => {
                    setStep('addresses');
                    refreshAddresses();
                }}
                className="w-full bg-white border border-gray-200 text-gray-500 font-bold text-[16px] py-[16px] rounded-xl hover:bg-gray-50 transition-colors"
            >
                Reject
            </button>
        </div>
    );

    const renderAddresses = () => {
        return (
            <div className="flex-1 px-4 pt-6 pb-6 flex flex-col bg-[#FAFAFA]">
                <h2 className="text-xl font-bold text-[#111] mb-6 px-2">Add Address Details</h2>
                <h3 className="text-sm font-bold text-[#333] mb-4 px-2">Saved Addresses</h3>
                <div className="flex flex-col gap-3 flex-1 overflow-y-auto min-h-0">
                    {isLoadingAddresses ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-[#FF4732]" />
                            <p className="text-gray-400 text-sm font-medium">Loading your addresses...</p>
                        </div>
                    ) : addresses.length === 0 ? (
                        <div className="bg-white rounded-2xl p-8 border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                            <MapPin className="w-10 h-10 text-gray-200 mb-3" />
                            <p className="text-gray-500 font-bold text-sm">No saved addresses found</p>
                            <p className="text-gray-400 text-xs mt-1">Add a new one to proceed</p>
                        </div>
                    ) : (
                        addresses.map(add => (
                            <div
                                key={add.id}
                                onClick={() => setSelectedAddressId(add.id)}
                                className={`bg-white rounded-2xl p-4 border transition-all ${selectedAddressId === add.id ? 'border-[#FF4732] bg-red-50/10' : 'border-gray-100'} flex items-start justify-between cursor-pointer`}
                            >
                                <div className="flex items-start gap-3 flex-1 pr-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#FF4732] shrink-0">
                                        {add.label?.toLowerCase() === 'home' ? <Home className="w-5 h-5" /> : 
                                         add.label?.toLowerCase() === 'work' ? <Briefcase className="w-5 h-5" /> : 
                                         <MapPin className="w-5 h-5" />}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-[15px] text-[#222] line-clamp-1">{add.addressLine}</h4>
                                            {add.isDefault && <span className="text-[10px] font-bold text-[#00A050] bg-[#E6F5EC] px-1.5 py-0.5 rounded">DEFAULT</span>}
                                        </div>
                                        <p className="text-gray-500 text-[12px] font-bold uppercase tracking-wide">{add.label || 'Other'}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 shrink-0">
                                    <div className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center ${selectedAddressId === add.id ? 'border-[#FF4732]' : 'border-gray-300'}`}>
                                        {selectedAddressId === add.id && <div className="w-2.5 h-2.5 bg-[#FF4732] rounded-full"></div>}
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setAddressToEdit(add);
                                            setAddressLine(add.addressLine);
                                            setLandmark(add.landmark || '');
                                            setLabel(add.label || 'Home');
                                            setIsDefault(add.isDefault);
                                            setMapCoordinates({lat: add.latitude, lng: add.longitude});
                                            setStep('addAddress');
                                        }}
                                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                    <button
                        onClick={() => {
                            setAddressToEdit(null);
                            setAddressLine('');
                            setLandmark('');
                            setLabel('Home');
                            setIsDefault(true);
                            setStep('addAddress');
                        }}
                        className="flex items-center justify-center gap-2 mt-2 bg-[#FFF4F2] text-[#FF4732] p-4 rounded-2xl font-bold hover:bg-[#ffeae6] transition-colors border border-transparent border-dashed"
                    >
                        <span>+</span>
                        <span>Add New Address</span>
                    </button>
                </div>
                <button
                    onClick={() => {
                        if (selectedAddressId) {
                            onComplete(addresses.find(a => a.id === selectedAddressId));
                        }
                    }}
                    disabled={!selectedAddressId || isLoadingAddresses}
                    className={`w-full mt-4 text-white font-bold text-[16px] py-[16px] rounded-xl shadow-md transition-colors ${selectedAddressId ? 'bg-[#FF584A] hover:bg-[#E5483B]' : 'bg-[#FFB7B0]'}`}
                >
                    Apply
                </button>
            </div>
        );
    };

    const handleSaveAddress = async () => {
        if (!addressLine.trim()) {
            setErrorMsg('Address line is required');
            return;
        }
        setIsSavingAddress(true);
        try {
            const payload = {
                addressLine,
                landmark,
                latitude: mapCoordinates?.lat || 19.033,
                longitude: mapCoordinates?.lng || 73.029,
                label,
                isDefault
            };

            let savedAddress;
            if (addressToEdit) {
                const res = await updateAddress(addressToEdit.id, payload);
                if (res && res.message) showToast(res.message, "success");
                savedAddress = res;
            } else {
                const res = await addAddress(payload);
                if (res && res.message) showToast(res.message, "success");
                savedAddress = res;
            }

            // If "Set as default" is checked, call the separate default API
            if (isDefault && savedAddress?.id) {
                await setDefaultAddress(savedAddress.id);
            }
            
            await refreshAddresses();
            
            // Ensure we pass a complete address object for immediate selection
            const finalAddress = {
                ...payload,
                id: savedAddress?.id || (addressToEdit ? addressToEdit.id : 'temp-id')
            };
            
            onComplete(finalAddress);
            
            // Clear session storage on success
            setAddressLine('');
            setLandmark('');
            setLabel('Home');
            setMapCoordinates(null);
            sessionStorage.removeItem('checkout_address_line');
            sessionStorage.removeItem('checkout_landmark');
            sessionStorage.removeItem('checkout_label');
            sessionStorage.removeItem('checkout_map_coords');
        } catch (e: any) {
            setErrorMsg(e.message || 'Failed to save address');
        } finally {
            setIsSavingAddress(false);
        }
    };

    const renderAddAddress = () => (
        <div className="flex-1 flex flex-col bg-[#FAFAFA] overflow-y-auto">
            <div className="px-6 pt-6 pb-2">
                <h2 className="text-[22px] font-bold text-[#111] leading-tight mb-6">Add Address Details</h2>
            </div>
            <div className="px-6 flex flex-col gap-5 flex-1 pb-10">
                <div className="flex flex-col gap-2 relative z-0">
                    <label className="text-sm font-bold text-gray-700 ml-1">Pin your exact location</label>
                    <div className="relative h-64">
                        <MapPicker position={mapCoordinates} onPositionChange={setMapCoordinates} />

                    </div>

                </div>
                <div className="flex flex-col gap-2 relative z-20">
                    <label className="text-sm font-bold text-gray-700 ml-1">Flat / House No. / Building / Area</label>
                    <input
                        type="text"
                        value={addressLine}
                        onChange={e => setAddressLine(e.target.value)}
                        placeholder="Complete address details"
                        className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-[#FF4732] shadow-sm font-medium text-sm transition-all"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Nearby Landmark (Optional)</label>
                    <input
                        type="text"
                        value={landmark}
                        onChange={e => setLandmark(e.target.value)}
                        placeholder="e.g. Near HDFC Bank"
                        className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-[#FF4732] shadow-sm font-medium text-sm transition-all"
                    />
                </div>
                <div className="flex flex-col gap-3 mt-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Save address as</label>
                    <div className="flex gap-3">
                        {['Home', 'Work', 'Other'].map(l => (
                            <button
                                key={l}
                                onClick={() => setLabel(l)}
                                className={`flex-1 py-3 rounded-xl border font-bold text-xs transition-all ${label === l ? 'bg-[#FFF0EF] border-[#FF4732] text-[#FF4732] shadow-sm scale-105' : 'bg-white border-gray-100 text-gray-400'}`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                </div>
                <div 
                    onClick={() => setIsDefault(!isDefault)}
                    className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mt-2 cursor-pointer transition-all hover:bg-gray-50"
                >
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800">Set as default address</span>
                        <span className="text-[11px] text-gray-400 font-medium">Use this address for all future orders</span>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isDefault ? 'bg-[#00A859] border-[#00A859]' : 'border-gray-200 bg-gray-50'}`}>
                        {isDefault && <Check className="w-4 h-4 text-white stroke-[3px]" />}
                    </div>
                </div>
                {errorMsg && <p className="text-red-500 text-xs font-bold mt-2 ml-1">{errorMsg}</p>}
                <button
                    onClick={handleSaveAddress}
                    disabled={isSavingAddress || !addressLine.trim()}
                    className={`w-full mt-6 text-white font-bold text-[16px] py-[16px] rounded-2xl shadow-lg transition-all flex items-center justify-center disabled:opacity-50 ${isSavingAddress || !addressLine.trim() ? 'bg-[#FFB7B0]' : 'bg-[#FF584A] hover:bg-[#E5483B]'}`}
                >
                    {isSavingAddress ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save and Continue"}
                </button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[60] bg-[#F5F6F8] flex flex-col font-sans h-screen overflow-hidden">
            {/* Top Bar */}
            <div className="bg-[#D12E27] lg:bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm shrink-0 text-white lg:text-gray-800 lg:border-b lg:border-gray-100">
                <button onClick={handleBack} className="p-2 lg:bg-white rounded-full lg:shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center transition-transform hover:scale-105">
                    <ArrowLeft className="w-5 h-5 text-white lg:text-gray-800" />
                </button>
                <div className="flex-1 text-center">
                    <span className="text-sm font-bold tracking-wide">
                        {step === 'phone' || step === 'otp' ? 'Login' : 'Delivery Details'}
                    </span>
                </div>
                <button onClick={onClose} className="p-2 text-white lg:text-gray-400 hover:text-white lg:hover:text-gray-600 transition-colors">
                    <MenuIcon className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto flex items-start justify-center w-full lg:p-8">
                <div className="w-full lg:max-w-[1000px] bg-[#FAFAFA] lg:bg-white lg:rounded-[32px] lg:shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col overflow-hidden min-h-full lg:min-h-0 border border-transparent lg:border-gray-100">
                    <div className="shrink-0 lg:px-8 lg:pt-6">
                        {renderStepper()}
                    </div>

                    <div className="flex flex-1 flex-col lg:flex-row relative">
                        {/* Form Section */}
                        <div className="flex-1 flex flex-col lg:max-w-[55%] z-10 pb-10 bg-[#FAFAFA] lg:bg-white">
                            {step === 'phone' && renderPhone()}
                            {step === 'otp' && renderOtp()}
                            {step === 'location' && renderLocation()}
                            {step === 'addresses' && renderAddresses()}
                            {step === 'addAddress' && renderAddAddress()}
                        </div>

                        {/* Image Section for Desktop */}
                        <div className="hidden lg:flex flex-1 items-center justify-center p-8 self-center relative">
                            {(step === 'phone' || step === 'otp') ? (
                                <img src={girlOnSofa} alt="Login graphic" className="w-[80%] max-w-[340px] object-contain drop-shadow-xl shrink-0 translate-y-[-10px]" />
                            ) : (
                                <img src={girlWithMap} alt="Location graphic" className="w-[80%] max-w-[340px] object-contain drop-shadow-xl shrink-0 translate-y-[-10px]" />
                            )}
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    );
};
