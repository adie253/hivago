import React from 'react';
import hivagoLogo from '../../assets/nav_logo.svg';

interface LoadingScreenProps {
    message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading checkout details...' }) => {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white font-sans">
            <div className="flex flex-col items-center gap-6 max-w-xs text-center animate-in fade-in zoom-in duration-500">
                {/* Logo and Spinner Container */}
                <div className="relative flex items-center justify-center w-28 h-28">
                    {/* Background track circle */}
                    <div className="absolute inset-0 rounded-full border-4 border-gray-100/80"></div>
                    
                    {/* Spinning lines */}
                    <div className="absolute inset-0 rounded-full border-4 border-t-[#FF584A] border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                    
                    {/* Logo inside */}
                    <img src={hivagoLogo} alt="Hivago Logo" className="w-16 h-auto object-contain z-10" />
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5 mt-2">
                    <p className="text-gray-800 font-bold text-base tracking-tight">
                        Please wait
                    </p>
                    <p className="text-gray-400 text-sm font-medium leading-relaxed">
                        {message}
                    </p>
                </div>
            </div>
        </div>
    );
};
