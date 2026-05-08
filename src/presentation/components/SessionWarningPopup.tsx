import React from 'react';
import { Clock, LogOut, ShieldCheck, Loader2 } from 'lucide-react';

interface SessionWarningPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onStayLoggedIn: () => void;
    onLogout: () => void;
    isRefreshing: boolean;
    expiresInSeconds: number;
    error?: string | null;
}

export const SessionWarningPopup: React.FC<SessionWarningPopupProps> = ({
    isOpen,
    onClose,
    onStayLoggedIn,
    onLogout,
    isRefreshing,
    expiresInSeconds,
    error
}) => {
    if (!isOpen) return null;

    const minutes = Math.floor(expiresInSeconds / 60);
    const seconds = expiresInSeconds % 60;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl relative animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                <div className="p-8 flex flex-col items-center text-center">
                    {/* Icon Header */}
                    <div className="w-20 h-20 rounded-full bg-[#FFF0EF] flex items-center justify-center mb-6 relative">
                        <Clock className="w-10 h-10 text-[#FF4732]" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#FF4732] border-4 border-white animate-pulse" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Expiring</h2>
                    <p className="text-gray-500 mb-8 max-w-[260px] leading-relaxed">
                        Your session is about to expire in <span className="text-[#FF4732] font-bold">{minutes}:{seconds.toString().padStart(2, '0')}</span>. 
                        Would you like to stay logged in?
                    </p>

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-[#FF4732] text-xs font-bold animate-in fade-in slide-in-from-top-1 duration-300">
                            {error}
                        </div>
                    )}

                    <div className="w-full flex flex-col gap-3">
                        <button
                            onClick={onStayLoggedIn}
                            disabled={isRefreshing}
                            className="w-full bg-[#FF4732] text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-100 hover:bg-[#E5483B] transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70"
                        >
                            {isRefreshing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <ShieldCheck className="w-5 h-5" />
                                    <span>Stay Logged In</span>
                                </>
                            )}
                        </button>
                        
                        <button
                            onClick={onLogout}
                            className="w-full bg-gray-50 text-gray-600 font-bold py-4 rounded-2xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>

                    <p className="mt-6 text-[11px] text-gray-400 font-medium">
                        For your security, we'll automatically log you out if no action is taken.
                    </p>
                </div>
                
                {/* Decorative bottom bar */}
                <div className="h-2 bg-gradient-to-r from-[#FF4732] to-[#FF8A00]" />
            </div>
        </div>
    );
};
