import React, { useState, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, Check } from 'lucide-react';
import { sendOtp, verifyOtp, setAuthSession } from '../../data/api';
import { useCart } from '../context/CartContext';
import { useUserLocation } from '../context/LocationContext';
import girlOnSofa from '../../assets/checkout/girl_on_sofa.svg';

export const SignInPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { refreshLoginStatus } = useCart();
    const { refreshAddresses } = useUserLocation();
    const { showToast } = useToast();

    // Check if we were redirected here or just came directly
    const from = (location.state as any)?.from?.pathname || '/';

    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [rememberMe, setRememberMe] = useState(true);

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
            showToast("OTP sent successfully!", "success");
            setStep('otp');
            setOtp(['', '', '', '', '', '']);
        } catch (e: any) {
            const msg = e.message || 'Failed to send OTP';
            setErrorMsg(msg);
            showToast(msg, "error");
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
                setAuthSession(data.accessToken, data.refreshToken, data.accessTokenExpiresAt, rememberMe);
                localStorage.setItem('customer_phone', phone);
                const cid = data.customerId || data.id;
                if (cid) localStorage.setItem('customer_id', cid);

                refreshLoginStatus();
                refreshAddresses();
                showToast("Signed in successfully!", "success");

                // Redirect back to where they came from
                navigate(from, { replace: true });
            }
        } catch (e: any) {
            const msg = e.message || 'Invalid OTP';
            setErrorMsg(msg);
            showToast(msg, "error");
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

    // const handleBack = () => {
    //     if (step === 'otp') {
    //         setStep('phone');
    //     } else {
    //         navigate(-1);
    //     }
    // };

    // const renderStepper = () => (
    //     <div className="bg-white px-6 py-4 mb-3 border-b border-gray-100 flex items-center justify-between shadow-sm rounded-t-[32px]">
    //         {/* Menu Step - done */}
    //         <div className="flex flex-col items-center flex-shrink-0 opacity-50">
    //             <div className="w-8 h-8 rounded-full bg-white border border-[#E0E0E0] text-gray-400 shadow-sm flex items-center justify-center mb-1">
    //                 <Book className="w-4 h-4 fill-current" />
    //             </div>
    //             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Browse</span>
    //         </div>

    //         <div className="flex gap-[4px] items-center flex-shrink-0 mb-4 flex-1 justify-center px-1">
    //             {[1, 2, 3].map(i => <div key={`c1-${i}`} className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>)}
    //         </div>

    //         {/* Login Step - active */}
    //         <div className="flex flex-col items-center flex-shrink-0">
    //             <div className="w-8 h-8 rounded-full bg-[#FFF0EF] border border-[#FFCCCB] text-[#FF4732] shadow-sm flex items-center justify-center mb-1 scale-110">
    //                 <MapPin className="w-4 h-4 fill-current" />
    //             </div>
    //             <span className="text-[10px] font-bold text-[#FF4732] uppercase tracking-tighter">Sign In</span>
    //         </div>

    //         <div className="flex gap-[4px] items-center flex-shrink-0 mb-4 flex-1 justify-center px-1">
    //             {[1, 2, 3].map(i => <div key={`c3-${i}`} className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>)}
    //         </div>

    //         {/* Done Step */}
    //         <div className="flex flex-col items-center flex-shrink-0 opacity-50">
    //             <div className="w-8 h-8 rounded-full bg-[#F9FAFB] border border-[#E0E0E0] text-gray-300 shadow-sm flex items-center justify-center mb-1">
    //                 <Wallet className="w-4 h-4 fill-current text-gray-300" />
    //             </div>
    //             <span className="text-[10px] font-medium text-gray-400 uppercase tracking-tighter">Success</span>
    //         </div>
    //     </div>
    // );

    return (
        <div className="min-h-screen bg-[#F5F6F8] flex flex-col font-sans overflow-hidden">
            {/* Top Bar */}
            {/* <div className="bg-[#D12E27] lg:bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm shrink-0 text-white lg:text-gray-800 lg:border-b lg:border-gray-100">
                <button onClick={handleBack} className="p-2 lg:bg-white rounded-full lg:shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center transition-transform hover:scale-105">
                    <ArrowLeft className="w-5 h-5 text-white lg:text-gray-800" />
                </button>
                <div className="flex-1 text-center">
                    <span className="text-sm font-bold tracking-widest uppercase">Sign In</span>
                </div>
                <button className="p-2 text-white/50 lg:text-gray-300 pointer-events-none">
                    <MenuIcon className="w-6 h-6" />
                </button>
            </div> */}

            <div className="flex-1 overflow-y-auto flex items-start justify-center w-full p-0 lg:p-8">
                <div className="w-full lg:max-w-[1000px] bg-[#FAFAFA] lg:bg-white lg:rounded-[32px] lg:shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col overflow-hidden min-h-full lg:min-h-0 border border-transparent lg:border-gray-100">

                    {/* <div className="shrink-0 lg:px-8 lg:pt-6">
                        {renderStepper()}
                    </div> */}

                    <div className="flex flex-1 flex-col lg:flex-row relative">
                        {/* Form Section */}
                        <div className="flex-1 flex flex-col lg:max-w-[55%] z-10 pb-10 px-6 pt-10">
                            {step === 'phone' ? (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (phone.length === 10) handleSendOtp();
                                    }}
                                    className="flex flex-col h-full"
                                >
                                    <h2 className="text-[28px] font-bold text-[#111] leading-tight mb-2 pr-10">Welcome Back</h2>
                                    <p className="text-gray-500 text-[15px] mb-10 pb-4 pr-10 leading-snug font-medium">
                                        Enter your phone number to continue your culinary journey with Hivago.
                                    </p>

                                    <div className="flex flex-col gap-3">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
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
                                                placeholder="Enter 10 digit number"
                                                className={`flex-1 min-w-0 bg-white border rounded-2xl px-5 py-4 outline-none focus:border-[#FF4732] font-bold text-lg text-[#111] shadow-sm transition-all ${errorMsg ? 'border-red-500' : 'border-gray-200'}`}
                                                autoFocus
                                            />
                                        </div>
                                        {errorMsg && <p className="text-[#FF4732] text-sm font-bold mt-1 ml-1">{errorMsg}</p>}
                                    </div>

                                    {/* Stay Signed In Checkbox */}
                                    <div 
                                        onClick={() => setRememberMe(!rememberMe)}
                                        className="flex items-center gap-2.5 mt-4 ml-1 cursor-pointer select-none group"
                                    >
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${rememberMe ? 'bg-[#FF4732] border-[#FF4732]' : 'bg-white border-gray-300 group-hover:border-[#FF4732]'}`}>
                                            {rememberMe && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                                        </div>
                                        <span className="text-sm font-bold text-gray-600 group-hover:text-gray-800 transition-colors">Stay signed in</span>
                                    </div>

                                    <div className="mt-auto">
                                        <button
                                            type="submit"
                                            disabled={isSendingOtp || phone.length !== 10}
                                            className={`w-full mt-10 text-white font-bold text-[18px] py-[20px] rounded-2xl shadow-xl transition-all flex items-center justify-center active:scale-95 ${isSendingOtp || phone.length !== 10 ? 'bg-[#FFB7B0]' : 'bg-[#FF584A] hover:bg-[#E5483B] shadow-red-100'}`}
                                        >
                                            {isSendingOtp ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Get OTP Code'}
                                        </button>
                                        <p className="text-center text-[11px] text-gray-400 mt-6 font-medium px-10">
                                            By continuing, you agree to our <span className="text-[#111] underline">Terms of Service</span> and <span className="text-[#111] underline">Privacy Policy</span>.
                                        </p>
                                    </div>
                                </form>
                            ) : (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (otp.join('').length === 6) handleVerifyOtp();
                                    }}
                                    className="flex flex-col h-full"
                                >
                                    <h2 className="text-[28px] font-bold text-[#111] leading-tight mb-2 pr-10">Verify Identity</h2>
                                    <p className="text-gray-500 text-[15px] mb-10 pb-4 pr-10 leading-snug font-medium">
                                        We've sent a 6-digit verification code to <span className="text-[#111] font-bold">+91 {phone}</span>
                                    </p>

                                    <div className="flex flex-col gap-3">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">OTP Code</label>
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
                                                    className="w-12 h-14 sm:w-14 sm:h-16 bg-white border border-gray-200 focus:border-[#FF4732] rounded-2xl text-center text-2xl font-bold text-[#111] outline-none transition-all shadow-sm focus:shadow-md"
                                                    autoFocus={idx === 0}
                                                />
                                            ))}
                                        </div>
                                        {errorMsg && <p className="text-[#FF4732] text-sm font-bold mt-2">{errorMsg}</p>}
                                    </div>

                                    <div className="mt-auto">
                                        <button
                                            type="submit"
                                            disabled={isVerifyingOtp || otp.join('').length !== 6}
                                            className={`w-full mt-10 text-white font-bold text-[18px] py-[20px] rounded-2xl shadow-xl transition-all flex justify-center items-center active:scale-95 ${isVerifyingOtp || otp.join('').length !== 6 ? 'bg-[#FFB7B0]' : 'bg-[#FF584A] hover:bg-[#E5483B] shadow-red-100'}`}
                                        >
                                            {isVerifyingOtp ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Verify & Sign In'}
                                        </button>
                                        <div className="mt-8 text-center text-sm font-bold text-gray-500">
                                            Didn't receive the code?{' '}
                                            <button type="button" className="text-[#FF4732] font-bold hover:underline" onClick={handleSendOtp}>
                                                Resend Now
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Image Section for Desktop */}
                        <div className="hidden lg:flex flex-1 items-center justify-center p-12 bg-[#FFF9F9] relative overflow-hidden group">
                            {/* Decorative circles */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFEFEF] rounded-full translate-x-1/3 -translate-y-1/3 transition-transform group-hover:scale-110 duration-1000"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FFEFEF] rounded-full -translate-x-1/2 translate-y-1/2 transition-transform group-hover:scale-125 duration-1000"></div>

                            <img
                                src={girlOnSofa}
                                alt="Welcome Illustration"
                                className="w-[100%] max-w-[380px] object-contain drop-shadow-[0_20px_50px_rgba(255,71,50,0.15)] z-10 relative transition-transform hover:translate-y-[-5px] duration-500"
                            />
                        </div>

                    </div>
                </div>
            </div>

            {/* Style override for glassmorphism and animations */}
            <style>{`
                @keyframes slideIn {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .lg\\:max-w-\\[1000px\\] {
                    animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </div>
    );
};
