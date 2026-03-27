import React, { useState, useRef } from 'react';
import { ArrowLeft, MapPin, Book, ShoppingCart, Menu as MenuIcon, Wallet, Loader2 } from 'lucide-react';
import { sendOtp, verifyOtp, addAddress } from '../../../data/api';

export type DetailsFlowOverlayProps = {
    onClose: () => void;
    onComplete: (address: any) => void;
};

type Step = 'phone' | 'otp' | 'location' | 'addresses' | 'addAddress';

const addressesListMock = [
    {
        id: '1',
        type: 'Home',
        address: '6, Yash Complex, Near Metro Station, Navi...',
    },
    {
        id: '2',
        type: 'Home',
        address: '201, Aaradhya Society, Opposite...',
    }
];

export const DetailsFlowOverlay: React.FC<DetailsFlowOverlayProps> = ({ onClose, onComplete }) => {
    const [step, setStep] = useState<Step>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [isSavingAddress, setIsSavingAddress] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [addressLine, setAddressLine] = useState('');
    const [landmark, setLandmark] = useState('');
    const [isDefault, setIsDefault] = useState(true);
    const [label, setLabel] = useState('Home');

    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const renderStepper = () => {
        return (
            <div className="bg-white px-6 py-4 mb-3 border-b border-gray-100 flex items-center justify-between shadow-sm">
                {/* Menu Step - done */}
                <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-white border border-[#E0E0E0] text-[#00A050] shadow-sm flex items-center justify-center mb-1">
                        <Book className="w-4 h-4 fill-current" />
                    </div>
                    <span className="text-[10px] font-bold text-[#00A050]">Menu</span>
                </div>

                {/* Connector 1 */}
                <div className="flex gap-[4px] items-center flex-shrink-0 mb-4 flex-1 justify-center px-1">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={`c1-${i}`} className="w-1.5 h-1.5 rounded-full bg-[#00A050]"></div>)}
                </div>

                {/* Cart Step - done */}
                <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-white border border-[#E0E0E0] text-[#00A050] shadow-sm flex items-center justify-center mb-1">
                        <ShoppingCart className="w-4 h-4 fill-current" />
                    </div>
                    <span className="text-[10px] font-bold text-[#00A050]">Cart</span>
                </div>

                {/* Connector 2 */}
                <div className="flex gap-[4px] items-center flex-shrink-0 mb-4 flex-1 justify-center px-1">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={`c2-${i}`} className="w-1.5 h-1.5 rounded-full bg-[#00A050]"></div>)}
                </div>

                {/* Details Step - active */}
                <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[#FFF0EF] border border-[#FFCCCB] text-[#FF4732] shadow-sm flex items-center justify-center mb-1">
                        <MapPin className="w-4 h-4 fill-current" />
                    </div>
                    <span className="text-[10px] font-bold text-[#FF4732]">Details</span>
                </div>

                {/* Connector 3 */}
                <div className="flex gap-[4px] items-center flex-shrink-0 mb-4 flex-1 justify-center px-1">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={`c3-${i}`} className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>)}
                </div>

                {/* Checkout Step - pending */}
                <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[#F9FAFB] border border-[#E0E0E0] text-gray-300 shadow-sm flex items-center justify-center mb-1">
                        <Wallet className="w-4 h-4 fill-current text-gray-300" />
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
            <h2 className="text-[22px] font-black text-[#111] leading-tight mb-2 pr-20">Enter your phone number</h2>
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
                if (data.customerId) localStorage.setItem('customer_id', data.customerId);
                if (data.accessTokenExpiresAt) localStorage.setItem('customer_token_expires_at', data.accessTokenExpiresAt);
            }
            setStep('location');
        } catch (e: any) {
            setErrorMsg(e.message || 'Invalid OTP');
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        // Handle paste of multiple digits
        if (value.length > 1) {
            const pastedData = value.slice(0, 6).split('');
            const newOtp = [...otp];
            for (let i = 0; i < pastedData.length; i++) {
                if (index + i < 6) {
                    newOtp[index + i] = pastedData[i];
                }
            }
            setOtp(newOtp);
            // Focus last filled or next empty
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
            <h2 className="text-[22px] font-black text-[#111] leading-tight mb-2 pr-20">Enter OTP</h2>
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

    const renderLocation = () => (
        <div className="flex-1 px-6 pt-10 pb-6 flex flex-col">
            <h2 className="text-[22px] font-black text-[#111] leading-tight mb-2 pr-24">Allow Location Access</h2>
            <p className="text-gray-500 text-sm mb-10 flex-1 pr-24 leading-snug">This lets show you which restaurants you can order from.</p>

            <button
                onClick={() => setStep('addresses')}
                className="w-full bg-[#FF584A] text-white font-bold text-[16px] py-[16px] rounded-xl shadow-md hover:bg-[#E5483B] transition-colors mb-3"
            >
                Allow
            </button>
            <button
                onClick={() => setStep('addresses')}
                className="w-full bg-white border border-gray-200 text-gray-500 font-bold text-[16px] py-[16px] rounded-xl hover:bg-gray-50 transition-colors"
            >
                Reject
            </button>
        </div>
    );

    const renderAddresses = () => {
        const canApply = selectedAddressId !== null;
        return (
            <div className="flex-1 px-4 pt-6 pb-6 flex flex-col bg-[#FAFAFA]">
                <h2 className="text-xl font-black text-[#111] mb-6 px-2">Add Address Details</h2>
                <h3 className="text-sm font-bold text-[#333] mb-4 px-2">Saved Addresses</h3>

                <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                    {addressesListMock.map(add => (
                        <div
                            key={add.id}
                            onClick={() => setSelectedAddressId(add.id)}
                            className={`bg-white rounded-2xl p-4 border ${selectedAddressId === add.id ? 'border-[#FF4732]' : 'border-gray-100'} flex items-start justify-between cursor-pointer`}
                        >
                            <div className="flex flex-col gap-1.5 flex-1 pr-4">
                                <h4 className="font-bold text-[15px] text-[#222]">{add.type}</h4>
                                <p className="text-gray-500 text-[13px] leading-relaxed truncate">{add.address}</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-[1.5px] mt-1 flex items-center justify-center ${selectedAddressId === add.id ? 'border-[#FF4732]' : 'border-gray-300'}`}>
                                {selectedAddressId === add.id && <div className="w-2.5 h-2.5 bg-[#FF4732] rounded-full"></div>}
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={() => setStep('addAddress')}
                        className="flex items-center justify-center gap-2 mt-2 bg-[#FFF4F2] text-[#FF4732] p-4 rounded-2xl font-bold hover:bg-[#ffeae6] transition-colors border border-transparent border-dashed"
                    >
                        <span>+</span>
                        <span>Add New Address</span>
                    </button>
                </div>

                <button
                    onClick={() => {
                        if (canApply) {
                            onComplete(addressesListMock.find(a => a.id === selectedAddressId));
                        }
                    }}
                    disabled={!canApply}
                    className={`w-full mt-4 text-white font-bold text-[16px] py-[16px] rounded-xl shadow-md transition-colors ${canApply ? 'bg-[#FF584A] hover:bg-[#E5483B]' : 'bg-[#FFB7B0] border border-transparent'}`}
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
            await addAddress({
                addressLine,
                landmark,
                latitude: 19.033, // Mocked
                longitude: 73.029, // Mocked
                label,
                isDefault
            });
            setStep('addresses');
            // Reset form
            setAddressLine('');
            setLandmark('');
            setLabel('Home');
        } catch (e: any) {
            console.error('Failed to save address:', e);
            setErrorMsg(e.message || 'Failed to save address');
        } finally {
            setIsSavingAddress(false);
        }
    };

    const renderAddAddress = () => (
        <div className="flex-1 flex flex-col bg-[#FAFAFA] overflow-y-auto">
            <div className="px-6 pt-6 pb-2">
                <h2 className="text-[22px] font-black text-[#111] leading-tight mb-6">Add Address Details</h2>
            </div>

            <div className="px-6 flex flex-col gap-5 flex-1 pb-10">
                <div className="flex flex-col gap-2">
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

                <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mt-2">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800">Set as default address</span>
                        <span className="text-[11px] text-gray-400 font-medium">Use this address for all future orders</span>
                    </div>
                    <button
                        onClick={() => setIsDefault(!isDefault)}
                        className={`w-12 h-6 rounded-full relative transition-colors ${isDefault ? 'bg-[#00A859]' : 'bg-gray-200'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${isDefault ? 'right-1' : 'left-1'}`}></div>
                    </button>
                </div>

                {errorMsg && <p className="text-red-500 text-xs font-bold mt-2 ml-1">{errorMsg}</p>}

                <button
                    onClick={handleSaveAddress}
                    disabled={isSavingAddress || !addressLine.trim()}
                    className={`w-full mt-6 text-white font-bold text-[16px] py-[16px] rounded-2xl shadow-lg transition-all flex items-center justify-center active:scale-95 ${isSavingAddress || !addressLine.trim() ? 'bg-[#FFB7B0]' : 'bg-[#FF584A] hover:bg-[#E5483B]'}`}
                >
                    {isSavingAddress ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Address'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 bg-[#FAFAFA] flex flex-col font-sans h-screen overflow-hidden">
            {/* Top Bar shared by all steps now that map is gone */}
            <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-20 border-b border-gray-100 shadow-sm shrink-0">
                <button onClick={handleBack} className="p-2 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center">
                    <ArrowLeft className="w-5 h-5 text-gray-800" />
                </button>
                <div className="flex-1 text-center">
                    <span className="text-sm font-black text-gray-900">
                        {step === 'phone' || step === 'otp' ? 'Login' : 'Delivery Details'}
                    </span>
                </div>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
                    <MenuIcon className="w-6 h-6" />
                </button>
            </div>

            <div className="shrink-0">
                {renderStepper()}
            </div>

            <div className="flex-1 overflow-y-auto">
                {step === 'phone' && renderPhone()}
                {step === 'otp' && renderOtp()}
                {step === 'location' && renderLocation()}
                {step === 'addresses' && renderAddresses()}
                {step === 'addAddress' && renderAddAddress()}
            </div>
        </div>
    );
};
