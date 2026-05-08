import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Search, Navigation2, MapPin, Loader2 } from 'lucide-react';
import { getPlacesAutocomplete, getPlaceDetails, addAddress } from '../../data/api';
import { useUserLocation } from '../context/LocationContext';
import { MapPicker } from './checkout/MapPicker';

interface AddAddressOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    initialStep?: Step;
    initialLocation?: { lat: number; lng: number };
}

type Step = 'search' | 'details';

export const AddAddressOverlay: React.FC<AddAddressOverlayProps> = ({ isOpen, onClose, initialStep, initialLocation }) => {
    const { refreshAddresses } = useUserLocation();

    // Search Step States
    const [step, setStep] = useState<Step>('search');
    const [searchQuery, setSearchQuery] = useState('');
    const [predictions, setPredictions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Details Step States
    const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
    const [selectedAddressText, setSelectedAddressText] = useState(''); // E.g. formatted address
    const [latitude, setLatitude] = useState<number>(0);
    const [longitude, setLongitude] = useState<number>(0);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    // Form States
    const [addressLine, setAddressLine] = useState('');
    const [landmark, setLandmark] = useState('');
    const [label, setLabel] = useState('Home');
    const [isDefault, setIsDefault] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Reset state on open
            if (initialStep && initialLocation) {
                setStep(initialStep);
                setLatitude(initialLocation.lat);
                setLongitude(initialLocation.lng);
                setSelectedAddressText('Current Location');
            } else {
                setStep('search');
                setLatitude(0);
                setLongitude(0);
                setSelectedAddressText('');
            }
            setSearchQuery('');
            setPredictions([]);
            setAddressLine('');
            setLandmark('');
            setLabel('Home');
            setIsDefault(true);
            setErrorMsg('');
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        if (searchQuery.length < 3) {
            setPredictions([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            const results = await getPlacesAutocomplete(searchQuery);
            setPredictions(results || []);
            setIsSearching(false);
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [searchQuery]);

    if (!isOpen) return null;

    const handleUseCurrentLocation = () => {
        if ('geolocation' in navigator) {
            setIsSearching(true);
            setErrorMsg('');
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLatitude(pos.coords.latitude);
                    setLongitude(pos.coords.longitude);
                    setSelectedAddressText('Current Location');
                    setStep('details');
                    setIsSearching(false);
                },
                (err) => {
                    console.error("Error fetching GPS:", err);
                    setErrorMsg("Please enable location access to use this feature.");
                    setIsSearching(false);
                },
                { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
            );
        } else {
            setErrorMsg("Geolocation is not supported by your browser.");
        }
    };

    const handleSelectPrediction = async (placeId: string, description: string) => {
        setSelectedPlaceId(placeId);
        setSelectedAddressText(description);
        setStep('details');
        setIsLoadingDetails(true);

        try {
            const details = await getPlaceDetails(placeId);
            if (details) {
                // Determine lat/lng from various typical Google API proxy backend formats
                const lat = details.geometry?.location?.lat || details.latitude || details.lat || 0;
                const lng = details.geometry?.location?.lng || details.longitude || details.lng || 0;
                setLatitude(parseFloat(lat));
                setLongitude(parseFloat(lng));
            }
        } catch (e) {
            console.error('Failed to parse place details', e);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleSaveAddress = async () => {
        if (!addressLine.trim()) {
            setErrorMsg('Flat/House No. is required');
            return;
        }
        setIsSaving(true);
        setErrorMsg('');
        try {
            await addAddress({
                addressLine,
                landmark,
                latitude,
                longitude,
                label,
                isDefault,
                placeId: selectedPlaceId
            });
            await refreshAddresses();
            onClose(); // Close this overlay on success
        } catch (e: any) {
            setErrorMsg(e.message || 'Failed to save address');
        } finally {
            setIsSaving(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[10000] bg-[#FAFAFA] flex flex-col font-sans animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-20 border-b border-gray-100 shadow-sm shrink-0">
                <button 
                    onClick={() => step === 'details' ? setStep('search') : onClose()} 
                    className="p-2 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center transition-transform active:scale-95"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-800" />
                </button>
                <div className="flex-1 text-center">
                    <span className="text-[16px] font-bold text-gray-900">
                        {step === 'search' ? 'Add New Address' : 'Enter Details'}
                    </span>
                </div>
                <div className="w-9 h-9"></div> {/* Balancer for flex-between */}
            </div>

            <div className="flex-1 overflow-y-auto w-full">
                {step === 'search' ? (
                    <div className="p-4 md:p-6 flex flex-col h-full bg-white">
                        <div className="relative flex items-center mb-6">
                            <Search className="absolute left-4 w-5 h-5 text-[#FF4732]" />
                            <input
                                autoFocus
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search building, area, or street name..."
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-gray-800 font-medium focus:outline-none focus:border-[#FF4732] focus:bg-white shadow-sm transition-all"
                            />
                        </div>

                        {errorMsg && step === 'search' && (
                            <div className="mb-4 p-3 bg-red-50 text-[#FF4732] text-sm font-semibold rounded-xl border border-red-100">
                                {errorMsg}
                            </div>
                        )}

                        <div className="flex flex-col gap-3 mb-4">
                            <button 
                                onClick={handleUseCurrentLocation}
                                disabled={isSearching}
                                className={`flex items-center gap-3 p-4 border border-gray-100 rounded-2xl transition-colors group ${isSearching ? 'opacity-70 cursor-wait bg-gray-50' : 'hover:bg-red-50'}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                    <Navigation2 className="w-5 h-5 text-[#FF4732]" />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="font-bold text-[#FF4732] text-[15px]">Use Current Location</span>
                                    <span className="text-[#FF4732]/70 text-[12px] font-medium mt-0.5">Using GPS</span>
                                </div>
                            </button>
                            
                            <button 
                                onClick={() => {
                                    setSelectedAddressText('Selected via Map');
                                    setStep('details');
                                }}
                                disabled={isSearching}
                                className={`flex items-center gap-3 p-4 border border-gray-100 rounded-2xl transition-colors group ${isSearching ? 'opacity-70 cursor-wait bg-gray-50' : 'hover:bg-gray-50'}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                    <MapPin className="w-5 h-5 text-gray-700" />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="font-bold text-gray-800 text-[15px]">Select location on Map</span>
                                    <span className="text-gray-400 text-[12px] font-medium mt-0.5">Pin your exact address coordinates</span>
                                </div>
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
                            {isSearching ? (
                                <div className="py-10 flex flex-col items-center justify-center gap-3">
                                    <Loader2 className="w-6 h-6 animate-spin text-[#FF4732]" />
                                    <p className="text-gray-400 text-sm font-medium">Searching...</p>
                                </div>
                            ) : predictions.length > 0 ? (
                                predictions.map((pred, i) => (
                                    <button 
                                        key={pred.placeId || pred.place_id || i}
                                        onClick={() => handleSelectPrediction(pred.placeId || pred.place_id || pred.id, pred.description || pred.name)}
                                        className="flex items-start gap-4 p-4 border-b border-gray-50 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left group"
                                    >
                                        <div className="mt-0.5 text-gray-300 group-hover:text-[#FF4732] transition-colors">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <span className="font-bold text-gray-800 text-sm">{pred.mainText || pred.structured_formatting?.main_text || pred.description?.split(',')[0] || pred.name}</span>
                                            <span className="text-xs text-gray-500 font-medium leading-[1.4] mt-0.5 line-clamp-2">
                                                {pred.secondaryText || pred.structured_formatting?.secondary_text || (pred.description && pred.description.substring(pred.description.indexOf(',') + 1).trim())}
                                            </span>
                                        </div>
                                    </button>
                                ))
                            ) : searchQuery.length >= 3 ? (
                                <p className="text-center text-gray-400 text-sm mt-8">No results found for "{searchQuery}"</p>
                            ) : (
                                <div className="text-center flex flex-col items-center pt-10 px-6 opacity-40">
                                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                        <Search className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="font-bold text-gray-600 mb-1">Search for an area</p>
                                    <p className="text-xs text-gray-400">Find the exact location to deliver your food faster</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col bg-[#FAFAFA] min-h-full">
                        {/* Map stub or location pin snippet */}
                        <div className="bg-[#FFF4F2] px-6 py-5 border-b border-red-50 flex items-start gap-3">
                            <MapPin className="w-6 h-6 text-[#FF4732] shrink-0 mt-0.5" />
                            <div className="flex flex-col">
                                <span className="text-[15px] font-bold text-[#111] leading-tight mb-1">Delivering to</span>
                                <span className="text-sm font-medium text-gray-500 leading-snug">{selectedAddressText}</span>
                            </div>
                        </div>

                        {isLoadingDetails ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-[#FF4732]" />
                                <p className="text-gray-400 text-sm font-medium">Fetching exact coordinates...</p>
                            </div>
                        ) : (
                            <div className="px-5 py-6 flex flex-col gap-6 flex-1 bg-white mx-3 mt-4 rounded-3xl shadow-sm border border-gray-100 relative">
                                <div className="flex flex-col gap-2 relative z-0">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Confirm exact location</label>
                                    <MapPicker 
                                        position={latitude && longitude ? { lat: latitude, lng: longitude } : null} 
                                        onPositionChange={(pos) => { setLatitude(pos.lat); setLongitude(pos.lng); }} 
                                    />
                                    <p className="text-[11px] font-medium text-gray-400 ml-1 mt-0.5">Move the map or point your exact location using the pin</p>
                                </div>

                                <div className="flex flex-col gap-2 relative z-20">
                                    <label className="text-sm font-bold text-gray-800 ml-1">Flat / House No. / Floor / Building <span className="text-[#FF4732]">*</span></label>
                                    <input
                                        type="text"
                                        value={addressLine}
                                        onChange={e => setAddressLine(e.target.value)}
                                        placeholder="e.g. Flat 101, A Wing, Yash Tower"
                                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 outline-none focus:border-[#FF4732] focus:bg-white text-[15px] font-medium text-gray-800 transition-all placeholder:text-gray-400"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-gray-800 ml-1">Nearby Landmark (Optional)</label>
                                    <input
                                        type="text"
                                        value={landmark}
                                        onChange={e => setLandmark(e.target.value)}
                                        placeholder="e.g. Near Metro Station"
                                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 outline-none focus:border-[#FF4732] focus:bg-white text-[15px] font-medium text-gray-800 transition-all placeholder:text-gray-400"
                                    />
                                </div>

                                <div className="flex flex-col gap-3 mt-2">
                                    <label className="text-sm font-bold text-gray-800 ml-1">Save this address as</label>
                                    <div className="flex gap-3">
                                        {['Home', 'Work', 'Other'].map(l => (
                                            <button
                                                key={l}
                                                onClick={() => setLabel(l)}
                                                className={`flex-1 py-3.5 rounded-2xl border-2 font-bold text-sm transition-all shadow-sm ${label === l ? 'bg-[#FFF0EF] border-[#FF4732] text-[#FF4732] scale-[1.02]' : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                                            >
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between bg-[#FAFAFA] p-5 rounded-2xl border border-gray-100 mt-2">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[15px] font-bold text-gray-900">Set as default</span>
                                        <span className="text-xs text-gray-500 font-medium leading-[1.3] max-w-[200px]">We'll automatically deliver here next time</span>
                                    </div>
                                    <button
                                        onClick={() => setIsDefault(!isDefault)}
                                        className={`w-14 h-7 rounded-full relative transition-colors shadow-inner ${isDefault ? 'bg-[#ff5a4c]' : 'bg-gray-200'}`}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all shadow-md ${isDefault ? 'left-[30px]' : 'left-1'}`}></div>
                                    </button>
                                </div>

                                {errorMsg && (
                                    <div className="bg-red-50 text-red-600 text-sm font-bold p-4 rounded-xl text-center border border-red-100 mb-1">
                                        {errorMsg}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <div className="mt-auto px-4 pb-6 pt-4 bg-transparent shrink-0">
                            <button
                                onClick={handleSaveAddress}
                                disabled={isSaving || !addressLine.trim() || isLoadingDetails}
                                className={`w-full text-white font-bold text-[17px] py-[18px] rounded-2xl shadow-xl transition-all flex items-center justify-center active:scale-[0.98]
                                    ${isSaving || !addressLine.trim() || isLoadingDetails ? 'bg-[#FFB7B0] shadow-none' : 'bg-[#FF584A] hover:bg-[#E5483B] shadow-[#FF584A]/30'}`}
                            >
                                {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Save Address'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};
