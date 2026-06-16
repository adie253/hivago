import React, { useState } from 'react';
import { X, Smartphone, RefreshCw, Settings, Info } from 'lucide-react';

interface LocationSettingsGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type OSTab = 'ios' | 'android';

export const LocationSettingsGuideModal: React.FC<LocationSettingsGuideModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<OSTab>('ios');

    React.useEffect(() => {
        if (!isOpen) return;
        (window as any).__activeModalsCount = ((window as any).__activeModalsCount || 0) + 1;
        document.body.style.overflow = 'hidden';
        return () => {
            (window as any).__activeModalsCount = Math.max(0, ((window as any).__activeModalsCount || 0) - 1);
            if (((window as any).__activeModalsCount) === 0) {
                document.body.style.overflow = 'unset';
            }
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            {/* Card Container */}
            <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-[0_24px_64px_rgba(0,0,0,0.18)] border border-gray-100 flex flex-col overflow-hidden font-sans animate-in zoom-in-95 duration-300 max-h-[90vh]">
                
                {/* Header */}
                <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-50 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-[#FFF0EF] flex items-center justify-center text-[#FF4732]">
                            <Settings className="w-5 h-5 animate-spin-slow" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-gray-900 text-lg leading-tight">Enable Location</h3>
                            <p className="text-xs text-gray-400 font-medium mt-0.5">Follow steps to turn on GPS</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-gray-100 active:scale-95 rounded-full transition-all text-gray-400 hover:text-gray-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* OS Tabs Selector */}
                <div className="px-6 py-3 bg-gray-50/50 flex gap-2 border-b border-gray-100 shrink-0">
                    <button
                        onClick={() => setActiveTab('ios')}
                        className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                            activeTab === 'ios'
                                ? 'bg-white text-[#FF4732] shadow-sm border border-gray-100'
                                : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        <Smartphone className="w-4 h-4" />
                        iOS (Safari)
                    </button>
                    <button
                        onClick={() => setActiveTab('android')}
                        className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                            activeTab === 'android'
                                ? 'bg-white text-[#FF4732] shadow-sm border border-gray-100'
                                : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        <Smartphone className="w-4 h-4" />
                        Android (Chrome)
                    </button>
                </div>

                {/* Instructions Steps */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {activeTab === 'ios' ? (
                        <>
                            {/* Browser Steps */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                                    <Info className="w-3.5 h-3.5 text-[#FF4732]" />
                                    Method 1: Quick browser access
                                </h4>
                                <ol className="space-y-3">
                                    <li className="flex gap-3 text-sm font-medium text-gray-600">
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#FFF0EF] text-[#FF4732] text-xs font-bold shrink-0 mt-0.5">1</span>
                                        <span>Tap the <strong className="text-gray-900 font-extrabold">aA</strong> or page settings icon in the Safari search bar.</span>
                                    </li>
                                    <li className="flex gap-3 text-sm font-medium text-gray-600">
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#FFF0EF] text-[#FF4732] text-xs font-bold shrink-0 mt-0.5">2</span>
                                        <span>Select <strong className="text-gray-900 font-extrabold">Website Settings</strong>.</span>
                                    </li>
                                    <li className="flex gap-3 text-sm font-medium text-gray-600">
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#FFF0EF] text-[#FF4732] text-xs font-bold shrink-0 mt-0.5">3</span>
                                        <span>Tap <strong className="text-gray-900 font-extrabold">Location</strong> and select <strong className="text-[#00A859] font-extrabold">Allow</strong>.</span>
                                    </li>
                                </ol>
                            </div>

                            <div className="border-t border-gray-100 my-4" />

                            {/* System Settings Steps */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                                    <Info className="w-3.5 h-3.5 text-[#FF4732]" />
                                    Method 2: System Settings
                                </h4>
                                <ol className="space-y-3">
                                    <li className="flex gap-3 text-sm font-medium text-gray-600">
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#FFF0EF] text-[#FF4732] text-xs font-bold shrink-0 mt-0.5">1</span>
                                        <span>Open iOS <strong className="text-gray-900 font-extrabold">Settings</strong> app.</span>
                                    </li>
                                    <li className="flex gap-3 text-sm font-medium text-gray-600">
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#FFF0EF] text-[#FF4732] text-xs font-bold shrink-0 mt-0.5">2</span>
                                        <span>Go to <strong className="text-gray-900 font-extrabold">Privacy & Security</strong> &gt; <strong className="text-gray-900 font-extrabold">Location Services</strong> (Ensure they are turned ON).</span>
                                    </li>
                                    <li className="flex gap-3 text-sm font-medium text-gray-600">
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#FFF0EF] text-[#FF4732] text-xs font-bold shrink-0 mt-0.5">3</span>
                                        <span>Scroll to <strong className="text-gray-900 font-extrabold">Safari Websites</strong> and select <strong className="text-[#00A859] font-extrabold">While Using the App</strong>.</span>
                                    </li>
                                </ol>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Browser Steps */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                                    <Info className="w-3.5 h-3.5 text-[#FF4732]" />
                                    Method 1: Quick Chrome settings
                                </h4>
                                <ol className="space-y-3">
                                    <li className="flex gap-3 text-sm font-medium text-gray-600">
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#FFF0EF] text-[#FF4732] text-xs font-bold shrink-0 mt-0.5">1</span>
                                        <span>Tap the <strong className="text-gray-900 font-extrabold">Lock / tune icon</strong> in the Chrome address bar.</span>
                                    </li>
                                    <li className="flex gap-3 text-sm font-medium text-gray-600">
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#FFF0EF] text-[#FF4732] text-xs font-bold shrink-0 mt-0.5">2</span>
                                        <span>Tap <strong className="text-gray-900 font-extrabold">Permissions</strong> or <strong className="text-gray-900 font-extrabold">Site settings</strong>.</span>
                                    </li>
                                    <li className="flex gap-3 text-sm font-medium text-gray-600">
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#FFF0EF] text-[#FF4732] text-xs font-bold shrink-0 mt-0.5">3</span>
                                        <span>Turn ON/Allow the <strong className="text-gray-900 font-extrabold">Location</strong> permission.</span>
                                    </li>
                                </ol>
                            </div>

                            <div className="border-t border-gray-100 my-4" />

                            {/* System Settings Steps */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                                    <Info className="w-3.5 h-3.5 text-[#FF4732]" />
                                    Method 2: Android App Info
                                </h4>
                                <ol className="space-y-3">
                                    <li className="flex gap-3 text-sm font-medium text-gray-600">
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#FFF0EF] text-[#FF4732] text-xs font-bold shrink-0 mt-0.5">1</span>
                                        <span>Long press the <strong className="text-gray-900 font-extrabold">Chrome</strong> app icon and select <strong className="text-gray-900 font-extrabold">App Info</strong>.</span>
                                    </li>
                                    <li className="flex gap-3 text-sm font-medium text-gray-600">
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#FFF0EF] text-[#FF4732] text-xs font-bold shrink-0 mt-0.5">2</span>
                                        <span>Tap <strong className="text-gray-900 font-extrabold">Permissions</strong> &gt; <strong className="text-gray-900 font-extrabold">Location</strong>.</span>
                                    </li>
                                    <li className="flex gap-3 text-sm font-medium text-gray-600">
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#FFF0EF] text-[#FF4732] text-xs font-bold shrink-0 mt-0.5">3</span>
                                        <span>Choose <strong className="text-[#00A859] font-extrabold">Allow only while using the app</strong>.</span>
                                    </li>
                                </ol>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col gap-3 shrink-0">
                    <div className="flex items-start gap-2 bg-[#FFF0EF] p-3 rounded-2xl border border-[#FFE1DE]">
                        <RefreshCw className="w-4 h-4 text-[#FF4732] shrink-0 mt-0.5 animate-spin-slow" />
                        <p className="text-[11px] font-semibold text-gray-500 leading-snug">
                            After enabling permission, make sure to <strong className="text-gray-700 font-extrabold">reload the page</strong> to apply the changes.
                        </p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-[#FF4732] hover:bg-[#E5483B] text-white font-bold py-3.5 px-6 rounded-2xl shadow-xl shadow-red-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Reload Page Now
                    </button>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes spin-slow {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s infinite linear;
                }
            `}} />
        </div>
    );
};
