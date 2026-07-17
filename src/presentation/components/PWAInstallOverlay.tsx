import React from 'react';
import { usePWAInstall } from '../context/PWAInstallContext';
import { Download, X, Smartphone, Sparkles, Share, MoreVertical } from 'lucide-react';

export const PWAInstallOverlay: React.FC = () => {
    const { 
        isInstallable, 
        isStandalone, 
        showIOSInstructions, 
        setShowIOSInstructions, 
        showAndroidInstructions,
        setShowAndroidInstructions,
        installApp 
    } = usePWAInstall();

    const [dismissed, setDismissed] = React.useState(() => {
        return sessionStorage.getItem('pwa_banner_dismissed') === 'true';
    });

    if (isStandalone) return null;

    const handleDismiss = () => {
        setDismissed(true);
        sessionStorage.setItem('pwa_banner_dismissed', 'true');
    };

    const handleInstallClick = () => {
        installApp();
    };

    return (
        <>
            {/* 📱 FLOATING BOTTOM INSTALL PROMPT (Mobile-friendly) */}
            {isInstallable && !dismissed && (
                <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white border border-gray-100 rounded-3xl shadow-2xl p-5 z-[55] animate-in slide-in-from-bottom-12 duration-300 flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex gap-4 items-start">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#FF584A] to-[#D03727] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-100 shrink-0">
                            <Smartphone className="w-7 h-7" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-extrabold text-gray-900 text-base leading-tight flex items-center gap-1.5">
                                Install Hivago App
                                <Sparkles className="w-4 h-4 text-[#FF584A] animate-pulse" />
                            </h4>
                            <p className="text-xs text-gray-500 font-semibold mt-1 leading-relaxed">
                                Get a faster experience, offline access, and easy ordering right from your home screen.
                            </p>
                        </div>
                        <button 
                            onClick={handleDismiss}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleDismiss}
                            className="flex-1 py-3 text-xs font-bold text-gray-500 bg-[#F2F4F7] hover:bg-gray-100 rounded-xl transition-all"
                        >
                            Maybe Later
                        </button>
                        <button
                            onClick={handleInstallClick}
                            className="flex-[2] py-3 text-xs font-black text-white bg-[#FF4732] hover:bg-[#D03727] shadow-lg shadow-red-100 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-95"
                        >
                            <Download className="w-4 h-4" />
                            Install Now
                        </button>
                    </div>
                </div>
            )}

            {/* 🍏 iOS INSTALLATION WALKTHROUGH OVERLAY */}
            {showIOSInstructions && (
                <div 
                    className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setShowIOSInstructions(false)}
                >
                    <div 
                        className="bg-white rounded-t-[32px] rounded-b-[20px] w-full max-w-md overflow-hidden shadow-2xl p-8 animate-in slide-in-from-bottom-20 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-gray-900">Install on iPhone / iPad</h3>
                            <button 
                                onClick={() => setShowIOSInstructions(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Guide body */}
                        <div className="flex flex-col gap-6">
                            <p className="text-sm font-medium text-gray-500 leading-relaxed">
                                Install <span className="text-gray-900 font-bold">Hivago</span> on your iOS device to access it anytime directly from your home screen:
                            </p>

                            <div className="flex flex-col gap-4">
                                {/* Step 1 */}
                                <div className="flex gap-4 items-center bg-[#F9FAFB] p-4 rounded-2xl border border-gray-50">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-500 shrink-0 font-bold">
                                        1
                                    </div>
                                    <div className="flex-1 text-sm font-semibold text-gray-800 leading-normal flex items-center gap-1.5 flex-wrap">
                                        Tap the Share button 
                                        <span className="inline-flex items-center justify-center w-8 h-8 bg-white rounded-lg border border-gray-100 text-blue-500 shadow-sm">
                                            <Share className="w-4 h-4" />
                                        </span>
                                        in Safari's toolbar.
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className="flex gap-4 items-center bg-[#F9FAFB] p-4 rounded-2xl border border-gray-50">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-500 shrink-0 font-bold">
                                        2
                                    </div>
                                    <div className="flex-1 text-sm font-semibold text-gray-800 leading-normal flex items-center gap-1.5 flex-wrap">
                                        Scroll down and select
                                        <span className="bg-white border border-gray-100 px-3 py-1.5 rounded-lg text-gray-800 font-bold shadow-sm text-xs">
                                            Add to Home Screen
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowIOSInstructions(false)}
                                className="w-full py-4 text-sm font-extrabold text-white bg-gray-900 hover:bg-gray-800 rounded-2xl transition-all mt-2"
                            >
                                Got It
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🤖 ANDROID INSTALLATION WALKTHROUGH OVERLAY */}
            {showAndroidInstructions && (
                <div 
                    className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setShowAndroidInstructions(false)}
                >
                    <div 
                        className="bg-white rounded-t-[32px] rounded-b-[20px] w-full max-w-md overflow-hidden shadow-2xl p-8 animate-in slide-in-from-bottom-20 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-gray-900">Install on Android</h3>
                            <button 
                                onClick={() => setShowAndroidInstructions(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Guide body */}
                        <div className="flex flex-col gap-6">
                            <p className="text-sm font-medium text-gray-500 leading-relaxed">
                                Install <span className="text-gray-900 font-bold">Hivago</span> on your Android device to access it anytime directly from your home screen:
                            </p>

                            <div className="flex flex-col gap-4">
                                {/* Step 1 */}
                                <div className="flex gap-4 items-center bg-[#F9FAFB] p-4 rounded-2xl border border-gray-50">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#FF4732] shrink-0 font-bold">
                                        1
                                    </div>
                                    <div className="flex-1 text-sm font-semibold text-gray-800 leading-normal flex items-center gap-1.5 flex-wrap">
                                        Tap the menu button
                                        <span className="inline-flex items-center justify-center w-8 h-8 bg-white rounded-lg border border-gray-100 text-gray-800 shadow-sm">
                                            <MoreVertical className="w-4 h-4" />
                                        </span>
                                        in the browser's top-right corner.
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className="flex gap-4 items-center bg-[#F9FAFB] p-4 rounded-2xl border border-gray-50">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#FF4732] shrink-0 font-bold">
                                        2
                                    </div>
                                    <div className="flex-1 text-sm font-semibold text-gray-800 leading-normal flex items-center gap-1.5 flex-wrap">
                                        Select
                                        <span className="bg-white border border-gray-100 px-3 py-1.5 rounded-lg text-gray-800 font-bold shadow-sm text-xs">
                                            Add to Home screen
                                        </span>
                                        or
                                        <span className="bg-white border border-gray-100 px-3 py-1.5 rounded-lg text-gray-800 font-bold shadow-sm text-xs">
                                            Install app
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowAndroidInstructions(false)}
                                className="w-full py-4 text-sm font-extrabold text-white bg-gray-900 hover:bg-gray-800 rounded-2xl transition-all mt-2"
                            >
                                Got It
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
