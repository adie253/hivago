import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { sendOtp, verifyOtp } from '../../data/api';
import { useCart } from '../context/CartContext';
import { useUserLocation } from '../context/LocationContext';

export const SignInPage: React.FC = () => {
    const navigate = useNavigate();
    const { refreshLoginStatus } = useCart();
    const { refreshAddresses } = useUserLocation();
    
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    
    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
                
                refreshLoginStatus();
                refreshAddresses();
                navigate(-1); // Go back to where they came from
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

    return (
        <div className="w-full bg-[#FAFAFA] min-h-screen flex flex-col font-sans">
            <div className="bg-white px-4 py-3 flex items-center shadow-sm">
                <button 
                    onClick={() => step === 'otp' ? setStep('phone') : navigate(-1)} 
                    className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-800" />
                </button>
                <div className="flex-1 text-center pr-9">
                    <span className="text-lg font-black text-gray-900">Sign In</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-6 pt-10">
                {step === 'phone' ? (
                    <div className="flex flex-col">
                        <h2 className="text-[26px] font-black text-[#111] leading-tight mb-2">Enter your phone number</h2>
                        <p className="text-gray-500 text-[15px] mb-8 leading-relaxed">
                            We'll send you an OTP to verify your account securely.
                        </p>

                        <div className="flex flex-col gap-2">
                            <div className="flex gap-3">
                                <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 text-[#333] font-bold text-lg shadow-sm flex items-center">
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
                                    placeholder="Mobile Number"
                                    className={`flex-1 bg-white border rounded-2xl px-5 py-4 outline-none focus:border-[#FF4732] font-semibold text-lg text-[#111] shadow-sm transition-all ${errorMsg ? 'border-red-500' : 'border-gray-200'}`}
                                    autoFocus
                                />
                            </div>
                            {errorMsg && <p className="text-red-500 text-sm font-medium mt-1 ml-1">{errorMsg}</p>}
                        </div>

                        <button
                            onClick={handleSendOtp}
                            disabled={isSendingOtp || phone.length !== 10}
                            className={`w-full mt-10 text-white font-bold text-[17px] py-[18px] rounded-2xl shadow-md transition-all flex items-center justify-center active:scale-95 ${isSendingOtp || phone.length !== 10 ? 'bg-[#FFB7B0]' : 'bg-[#FF584A] hover:bg-[#E5483B]'}`}
                        >
                            {isSendingOtp ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Continue'}
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <h2 className="text-[26px] font-black text-[#111] leading-tight mb-2">Verify OTP</h2>
                        <p className="text-gray-500 text-[15px] mb-8 leading-relaxed">
                            Enter the 6-digit code sent to <span className="font-bold text-[#111]">+91 {phone}</span>
                        </p>

                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2 sm:gap-3 justify-between">
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
                                        className="w-12 h-14 sm:w-14 sm:h-16 bg-white border border-gray-200 focus:border-[#FF4732] rounded-2xl text-center text-2xl font-black text-[#111] outline-none transition-all shadow-sm focus:shadow-md"
                                        autoFocus={idx === 0}
                                    />
                                ))}
                            </div>
                            {errorMsg && <p className="text-red-500 text-sm font-medium mt-2">{errorMsg}</p>}
                        </div>

                        <button
                            onClick={handleVerifyOtp}
                            disabled={isVerifyingOtp || otp.join('').length !== 6}
                            className={`w-full mt-10 text-white font-bold text-[17px] py-[18px] rounded-2xl shadow-md transition-all flex justify-center items-center active:scale-95 ${isVerifyingOtp || otp.join('').length !== 6 ? 'bg-[#FFB7B0]' : 'bg-[#FF584A] hover:bg-[#E5483B]'}`}
                        >
                            {isVerifyingOtp ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Verify & Log In'}
                        </button>
                        
                        <div className="mt-8 text-center text-sm font-medium text-gray-500">
                            Didn't receive the code?{' '}
                            <button className="text-[#FF4732] font-bold hover:underline" onClick={handleSendOtp}>
                                Resend Now
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
