import React, { useState } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { useUserLocation } from '../context/LocationContext';
import { getCurrentPositionWithFallback, isMobileDevice } from '../../utils/geolocation';
import { LocationSettingsGuideModal } from './LocationSettingsGuideModal';

export const LocationRequiredModal: React.FC = () => {
    const { selectLocation } = useUserLocation();
    const [isDetecting, setIsDetecting] = useState(false);
    const [gpsError, setGpsError] = useState<string | null>(null);
    const [isGuideOpen, setIsGuideOpen] = useState(false);

    React.useEffect(() => {
        (window as any).__activeModalsCount = ((window as any).__activeModalsCount || 0) + 1;
        document.body.style.overflow = 'hidden';
        return () => {
            (window as any).__activeModalsCount = Math.max(0, ((window as any).__activeModalsCount || 0) - 1);
            if (((window as any).__activeModalsCount) === 0) {
                document.body.style.overflow = 'unset';
            }
        };
    }, []);

    // Automated listener for browser address bar permission changes
    React.useEffect(() => {
        if ('permissions' in navigator) {
            let activeStatus: PermissionStatus | null = null;

            const handlePermissionChange = () => {
                if (activeStatus && activeStatus.state === 'granted') {
                    setIsDetecting(true);
                    getCurrentPositionWithFallback(
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
                            console.error("Auto GPS failed after permission change:", err);
                            setIsDetecting(false);
                        }
                    );
                }
            };

            navigator.permissions.query({ name: 'geolocation' }).then((status) => {
                activeStatus = status;
                status.addEventListener('change', handlePermissionChange);
                // Trigger once if it was already granted but state hasn't resolved
                if (status.state === 'granted') {
                    handlePermissionChange();
                }
            }).catch((err) => console.error("Permission query failed:", err));

            return () => {
                if (activeStatus) {
                    activeStatus.removeEventListener('change', handlePermissionChange);
                }
            };
        }
    }, [selectLocation]);

    const handleShareLocation = () => {
        setIsDetecting(true);
        setGpsError(null);
        getCurrentPositionWithFallback(
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
            (err, friendlyMessage) => {
                console.error("GPS detection failed:", err);
                setGpsError(friendlyMessage);
                setIsDetecting(false);
            }
        );
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
            {/* Modal Card */}
            <div className="w-full max-w-md p-8 bg-white rounded-[32px] shadow-[0_24px_64px_rgba(0,0,0,0.12)] border border-gray-100/50 text-center flex flex-col items-center justify-center font-sans animate-in zoom-in-95 duration-300">
                {/* Visual Icon with pulsating glowing rings */}
                <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                    <div className="absolute inset-0 bg-[#FFF0EF] rounded-full animate-ping opacity-70 duration-2000" />
                    <div className="absolute inset-2 bg-[#FFE1DE] rounded-full animate-pulse" />
                    <div className="relative w-16 h-16 rounded-full bg-[#FF4732] flex items-center justify-center shadow-lg shadow-red-500/20">
                        <MapPin className="w-8 h-8 text-white" />
                    </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-3 leading-snug">
                    Share your location
                </h3>
                
                <p className="text-gray-500 text-sm md:text-base font-medium leading-relaxed mb-8 px-2">
                    To show you nearby restaurants and ensure hot, fresh deliveries, we need access to your GPS location. We only deliver within 5 km!
                </p>

                {gpsError && (
                    <div className="w-full mb-6 flex flex-col gap-2">
                        <div className="w-full p-4 bg-red-50 text-[#FF4732] text-xs md:text-sm font-semibold rounded-2xl border border-red-100 leading-relaxed text-center animate-in shake duration-300">
                            {gpsError}
                        </div>
                        {isMobileDevice() && (
                            <button
                                type="button"
                                onClick={() => setIsGuideOpen(true)}
                                className="text-xs font-bold text-[#FF4732] hover:underline transition-all mt-1"
                            >
                                Location blocked? See how to enable
                            </button>
                        )}
                    </div>
                )}

                {/* Single Premium CTA Button */}
                <button
                    onClick={handleShareLocation}
                    disabled={isDetecting}
                    className="w-full bg-[#FF4732] hover:bg-[#E5483B] disabled:bg-red-200 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-red-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 text-base"
                >
                    {isDetecting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Accessing GPS...</span>
                        </>
                    ) : (
                        <>
                            <Navigation className="w-5 h-5 fill-current" />
                            <span>Share Current Location</span>
                        </>
                    )}
                </button>
            </div>

            <LocationSettingsGuideModal 
                isOpen={isGuideOpen} 
                onClose={() => setIsGuideOpen(false)} 
            />
        </div>
    );
};
