import React, { useState } from 'react';
import { MapPin, Navigation, Map, Loader2 } from 'lucide-react';
import { useUserLocation } from '../context/LocationContext';
import { LocationSelectorOverlay } from './LocationSelectorOverlay';

interface LocationRequiredCardProps {
    title?: string;
    description?: string;
}

export const LocationRequiredCard: React.FC<LocationRequiredCardProps> = ({ 
    title = "Enter your delivery address to see nearby restaurants",
    description = "We only show and deliver from restaurants within 5 km of your location to ensure your food arrives hot, fresh, and on time."
}) => {
    const { selectLocation } = useUserLocation();
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const [gpsError, setGpsError] = useState<string | null>(null);

    const handleShareLocation = () => {
        if ('geolocation' in navigator) {
            setIsDetecting(true);
            setGpsError(null);
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    selectLocation({
                        id: 'current-location',
                        label: 'Current Location',
                        addressLine: 'Using your GPS location',
                        landmark: null,
                        isDefault: false,
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude
                    });
                    setIsDetecting(false);
                },
                (err) => {
                    console.error("GPS detection failed:", err);
                    setGpsError("Please allow GPS access or select your location manually.");
                    setIsDetecting(false);
                    // Automatically fallback to showing the manual selector
                    setTimeout(() => setIsSelectorOpen(true), 1500);
                },
                { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
            );
        } else {
            setGpsError("Geolocation is not supported by your browser.");
            setIsSelectorOpen(true);
        }
    };

    return (
        <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-gray-100 rounded-[32px] shadow-[0_16px_40px_rgba(0,0,0,0.04)] text-center flex flex-col items-center justify-center font-sans animate-in fade-in slide-in-from-bottom-6 duration-500">
            {/* Visual Icon with pulsating rings */}
            <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 bg-[#FFF0EF] rounded-full animate-ping opacity-70 duration-2000" />
                <div className="absolute inset-2 bg-[#FFE1DE] rounded-full animate-pulse" />
                <div className="relative w-16 h-16 rounded-full bg-[#FF4732] flex items-center justify-center shadow-lg shadow-red-500/20">
                    <MapPin className="w-8 h-8 text-white" />
                </div>
            </div>

            {/* Content text */}
            <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight mb-3 px-2 leading-[1.25]">
                {title}
            </h3>
            
            <p className="text-gray-500 text-sm md:text-base font-medium max-w-sm leading-relaxed mb-8 px-4">
                {description}
            </p>

            {gpsError && (
                <div className="w-full mb-4 p-3.5 bg-red-50 text-[#FF4732] text-xs md:text-sm font-semibold rounded-2xl border border-red-100 animate-in shake duration-300">
                    {gpsError}
                </div>
            )}

            {/* CTA Buttons */}
            <div className="w-full flex flex-col sm:flex-row gap-3 px-4">
                <button
                    onClick={handleShareLocation}
                    disabled={isDetecting}
                    className="flex-1 bg-[#FF4732] hover:bg-[#E5483B] disabled:bg-red-200 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-red-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-[15px]"
                >
                    {isDetecting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Detecting...</span>
                        </>
                    ) : (
                        <>
                            <Navigation className="w-5 h-5 fill-current" />
                            <span>Share Current Location</span>
                        </>
                    )}
                </button>

                <button
                    onClick={() => setIsSelectorOpen(true)}
                    className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-4 px-6 rounded-2xl border border-gray-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-[15px]"
                >
                    <Map className="w-5 h-5" />
                    <span>Select Manually</span>
                </button>
            </div>

            <LocationSelectorOverlay 
                isOpen={isSelectorOpen} 
                onClose={() => setIsSelectorOpen(false)} 
            />
        </div>
    );
};
