import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Search, Navigation2, MapPin, Loader2, Check } from 'lucide-react';
import { getPlacesAutocomplete, getPlaceDetails, addAddress, updateAddress, setDefaultAddress, isTokenValid, reverseGeocode } from '../../data/api';
import { useUserLocation } from '../context/LocationContext';
import { MapPicker } from './checkout/MapPicker';
import { useToast } from '../context/ToastContext';
import { getCurrentPositionWithFallback } from '../../utils/geolocation';
import { LocationSettingsGuideModal } from './LocationSettingsGuideModal';

interface AddAddressOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    initialStep?: Step;
    initialLocation?: { lat: number; lng: number };
    addressToEdit?: any;
}

type Step = 'search' | 'details';

export const AddAddressOverlay: React.FC<AddAddressOverlayProps> = ({ isOpen, onClose, initialStep, initialLocation, addressToEdit }) => {
    const { refreshAddresses, selectLocation } = useUserLocation();
    const { showToast } = useToast();

    // Search Step States
    const [step, setStep] = useState<Step>(() => (sessionStorage.getItem('add_addr_step') as Step) || 'search');
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
    const [addressLine, setAddressLine] = useState(() => sessionStorage.getItem('add_addr_line') || '');
    const [landmark, setLandmark] = useState(() => sessionStorage.getItem('add_addr_landmark') || '');
    const [label, setLabel] = useState(() => sessionStorage.getItem('add_addr_label') || 'Home');
    const [isDefault, setIsDefault] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isGuideOpen, setIsGuideOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            if (addressToEdit) {
                setStep('details');
                setLatitude(addressToEdit.latitude);
                setLongitude(addressToEdit.longitude);
                setSelectedAddressText(addressToEdit.addressLine);
                setAddressLine(addressToEdit.addressLine);
                setLandmark(addressToEdit.landmark || '');
                setLabel(addressToEdit.label || 'Home');
                setIsDefault(addressToEdit.isDefault);
            } else if (initialStep && initialLocation) {
                // If provided via props, use them (might be fresh from GPS)
                setStep(initialStep);
                setLatitude(initialLocation.lat);
                setLongitude(initialLocation.lng);
                setSelectedAddressText('Current Location');
            } else {
                // Try loading from session if not editing and no initial props
                const savedStep = sessionStorage.getItem('add_addr_step') as Step;
                if (savedStep) setStep(savedStep);
                
                const savedLat = sessionStorage.getItem('add_addr_lat');
                const savedLng = sessionStorage.getItem('add_addr_lng');
                if (savedLat && savedLng) {
                    setLatitude(parseFloat(savedLat));
                    setLongitude(parseFloat(savedLng));
                }
                
                const savedText = sessionStorage.getItem('add_addr_text');
                if (savedText) setSelectedAddressText(savedText);
            }
            setErrorMsg('');
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen, addressToEdit]);

    useEffect(() => {
        if (!isOpen) return;
        sessionStorage.setItem('add_addr_step', step);
        sessionStorage.setItem('add_addr_line', addressLine);
        sessionStorage.setItem('add_addr_landmark', landmark);
        sessionStorage.setItem('add_addr_label', label);
        sessionStorage.setItem('add_addr_lat', latitude.toString());
        sessionStorage.setItem('add_addr_lng', longitude.toString());
        sessionStorage.setItem('add_addr_text', selectedAddressText);
    }, [step, addressLine, landmark, label, latitude, longitude, selectedAddressText, isOpen]);

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
        setIsSearching(true);
        setErrorMsg('');
        getCurrentPositionWithFallback(
            (pos) => {
                setLatitude(pos.coords.latitude);
                setLongitude(pos.coords.longitude);
                setSelectedAddressText('Current Location');
                setStep('details');
                setIsSearching(false);
            },
            (err, friendlyMessage) => {
                console.error("Error fetching GPS:", err);
                setErrorMsg(friendlyMessage);
                setIsSearching(false);
            }
        );
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
                
                const parsedLat = typeof lat === 'function' ? lat() : parseFloat(lat);
                const parsedLng = typeof lng === 'function' ? lng() : parseFloat(lng);
                
                setLatitude(parsedLat);
                setLongitude(parsedLng);
            }
        } catch (e) {
            console.error('Failed to parse place details', e);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleMapPositionChange = async (pos: { lat: number; lng: number }) => {
        setLatitude(pos.lat);
        setLongitude(pos.lng);
        try {
            const geoResult = await reverseGeocode(pos.lat, pos.lng);
            if (geoResult && geoResult.addressLine) {
                setSelectedAddressText(geoResult.addressLine);
            }
        } catch (err) {
            console.error("Failed to reverse geocode:", err);
        }
    };

    const clearSessionData = () => {
        sessionStorage.removeItem('add_addr_step');
        sessionStorage.removeItem('add_addr_line');
        sessionStorage.removeItem('add_addr_landmark');
        sessionStorage.removeItem('add_addr_label');
        sessionStorage.removeItem('add_addr_lat');
        sessionStorage.removeItem('add_addr_lng');
        sessionStorage.removeItem('add_addr_text');
        
        setStep('search');
        setAddressLine('');
        setLandmark('');
        setLabel('Home');
        setLatitude(0);
        setLongitude(0);
        setSelectedAddressText('');
    };

    const handleSaveAddress = async () => {
        if (!addressLine.trim()) {
            setErrorMsg('Flat/House No. is required');
            return;
        }
        setIsSaving(true);
        setErrorMsg('');
        try {
            const finalLandmark = (landmark && landmark !== label) ? landmark : null;

            if (!isTokenValid()) {
                selectLocation({
                    id: 'guest-selected',
                    label: label || 'Selected Location',
                    addressLine: `${addressLine}${finalLandmark ? `, Near ${finalLandmark}` : ''}`,
                    landmark: finalLandmark || null,
                    isDefault: false,
                    latitude,
                    longitude
                });
                clearSessionData();
                onClose();
                return;
            }

            const payload = {
                addressLine,
                landmark: finalLandmark,
                latitude,
                longitude,
                label,
                isDefault,
                placeId: selectedPlaceId
            };

            let savedAddressId = addressToEdit?.id;

            if (addressToEdit) {
                const res = await updateAddress(addressToEdit.id, payload);
                console.log("AddAddressOverlay updateAddress response:", res);
                if (res && res.message) showToast(res.message, "success");
                else showToast("Address updated", "success");
                const updatedId = res?.id || res?.address?.id || res?.data?.id || res?.data?.address?.id || res?._id || res?.addressId || (Array.isArray(res) && (res[res.length - 1]?.id || res[res.length - 1]?._id));
                if (updatedId) savedAddressId = updatedId;
            } else {
                const res = await addAddress(payload);
                console.log("AddAddressOverlay addAddress response:", res);
                if (res && res.message) showToast(res.message, "success");
                else showToast("Address added", "success");
                const newId = res?.id || res?.address?.id || res?.data?.id || res?.data?.address?.id || res?._id || res?.addressId || (Array.isArray(res) && (res[res.length - 1]?.id || res[res.length - 1]?._id));
                if (newId) savedAddressId = newId;
            }

            console.log("AddAddressOverlay resolved savedAddressId for default setting:", savedAddressId);

            // If "Set as default" is checked, call the separate default API
            if (isDefault && savedAddressId) {
                await setDefaultAddress(savedAddressId);
            }
            
            await refreshAddresses();
            clearSessionData();
            onClose(); // Close this overlay on success
        } catch (e: any) {
            setErrorMsg(e.message || 'Failed to save address');
        } finally {
            setIsSaving(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-0 md:p-6 font-sans">
            <div className="w-full h-full md:max-w-4xl md:h-[80vh] md:max-h-[700px] bg-[#FAFAFA] flex flex-col relative animate-in slide-in-from-bottom-4 duration-300 md:rounded-[32px] md:overflow-hidden md:shadow-2xl">
            {/* Header */}
            <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-gray-100 shadow-sm shrink-0">
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

            <div className="flex-1 overflow-y-auto w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {step === 'search' ? (
                    <div className="p-4 md:p-12 flex flex-col h-full bg-white max-w-4xl mx-auto w-full">
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
                            <div className="mb-4 flex flex-col gap-2">
                                <div className="p-3 bg-red-50 text-[#FF4732] text-sm font-semibold rounded-xl border border-red-100">
                                    {errorMsg}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsGuideOpen(true)}
                                    className="text-xs font-bold text-[#FF4732] hover:underline text-left self-start mt-0.5 ml-1"
                                >
                                    Location blocked? See how to enable
                                </button>
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
                                    setIsSearching(true);
                                    getCurrentPositionWithFallback(
                                        (pos) => {
                                            const lat = pos.coords.latitude;
                                            const lng = pos.coords.longitude;
                                            setLatitude(lat);
                                            setLongitude(lng);
                                            setStep('details');
                                            setIsSearching(false);
                                            // Trigger reverse geocoding to fill address text immediately
                                            reverseGeocode(lat, lng).then(geo => {
                                                if (geo && geo.addressLine) {
                                                    setSelectedAddressText(geo.addressLine);
                                                }
                                            }).catch(err => console.error("Failed to reverse geocode in Map Select:", err));
                                        },
                                        () => {
                                            // Fallback to Pune or default coordinates, just go to details
                                            setStep('details');
                                            setIsSearching(false);
                                        },
                                        { timeout: 5000 }
                                    );
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

                        <div className="flex-1 flex flex-col gap-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                    <div className="flex flex-col md:flex-row bg-[#FAFAFA] h-full overflow-hidden">
                        {/* Desktop: Left side map */}
                        <div className="hidden md:flex flex-col flex-1 relative bg-white border-r border-gray-100">
                            <div className="flex-1">
                                <MapPicker 
                                    position={latitude && longitude ? { lat: latitude, lng: longitude } : null} 
                                    onPositionChange={handleMapPositionChange} 
                                    allowGeolocation={true}
                                />
                            </div>
                        </div>

                        {/* Right side form */}
                        <div className="flex-1 flex flex-col h-full overflow-y-auto bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

                            {isLoadingDetails ? (
                                <div className="py-20 flex flex-col items-center justify-center gap-3">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#FF4732]" />
                                    <p className="text-gray-400 text-sm font-medium">Fetching exact coordinates...</p>
                                </div>
                            ) : (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (!isSaving && addressLine.trim() && !isLoadingDetails) {
                                            handleSaveAddress();
                                        }
                                    }}
                                    className="px-5 py-5 md:px-8 md:py-6 flex flex-col gap-4"
                                >
                                    {/* Mobile-only map picker */}
                                    <div className="md:hidden flex flex-col gap-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Confirm exact location</label>
                                        <div className="h-[250px]">
                                            <MapPicker 
                                                position={latitude && longitude ? { lat: latitude, lng: longitude } : null} 
                                                onPositionChange={handleMapPositionChange} 
                                                allowGeolocation={true}
                                            />
                                        </div>
                                        <p className="text-[11px] font-medium text-gray-400 ml-1 mt-0.5">Move the map or point your exact location using the pin</p>
                                    </div>

                                <div className="flex flex-col gap-1.5 relative z-30">
                                    <label className="text-sm font-bold text-gray-800 ml-1">Delivery Area</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={selectedAddressText}
                                            onChange={(e) => {
                                                setSelectedAddressText(e.target.value);
                                                setSearchQuery(e.target.value);
                                            }}
                                            onFocus={() => {
                                                if (selectedAddressText.length >= 3) {
                                                    setSearchQuery(selectedAddressText);
                                                }
                                            }}
                                            onBlur={() => setTimeout(() => setPredictions([]), 200)}
                                            placeholder="Search area, building, street name..."
                                            className="w-full bg-white border-2 border-gray-100 focus:border-[#FF4732] rounded-2xl px-4 py-3 outline-none text-sm font-semibold text-gray-800 transition-all placeholder:text-gray-400"
                                        />

                                        {predictions.length > 0 && (
                                            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl z-[100] max-h-60 overflow-y-auto">
                                                {predictions.map((pred, i) => (
                                                    <button
                                                        key={pred.placeId || pred.place_id || i}
                                                        type="button"
                                                        onClick={() => {
                                                            handleSelectPrediction(pred.placeId || pred.place_id || pred.id, pred.description || pred.name);
                                                            setPredictions([]);
                                                        }}
                                                        className="w-full flex items-start gap-3 p-4 border-b border-gray-50 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left group"
                                                    >
                                                        <MapPin className="w-5 h-5 text-gray-400 group-hover:text-[#FF4732] transition-colors mt-0.5 shrink-0" />
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-gray-800 text-sm">{pred.mainText || pred.structured_formatting?.main_text || pred.description?.split(',')[0]}</span>
                                                            <span className="text-xs text-gray-500 font-medium line-clamp-1">{pred.secondaryText || pred.structured_formatting?.secondary_text}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5 relative z-20">
                                    <label className="text-sm font-bold text-gray-800 ml-1">Flat / House No. / Floor / Building <span className="text-[#FF4732]">*</span></label>
                                    <input
                                        type="text"
                                        value={addressLine}
                                        onChange={e => setAddressLine(e.target.value)}
                                        placeholder="e.g. Flat 101, A Wing, Yash Tower"
                                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-4 py-3 outline-none focus:border-[#FF4732] focus:bg-white text-sm font-medium text-gray-800 transition-all placeholder:text-gray-400"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-bold text-gray-800 ml-1">Nearby Landmark (Optional)</label>
                                    <input
                                        type="text"
                                        value={landmark}
                                        onChange={e => setLandmark(e.target.value)}
                                        placeholder="e.g. Near Metro Station"
                                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-4 py-3 outline-none focus:border-[#FF4732] focus:bg-white text-sm font-medium text-gray-800 transition-all placeholder:text-gray-400"
                                    />
                                </div>

                                <div className="flex flex-col gap-2 mt-1">
                                    <label className="text-sm font-bold text-gray-800 ml-1">Save this address as</label>
                                    <div className="flex gap-3">
                                        {['Home', 'Work', 'Other'].map(l => (
                                            <button
                                                key={l}
                                                type="button"
                                                onClick={() => setLabel(l)}
                                                className={`flex-1 py-2.5 rounded-2xl border-2 font-bold text-sm transition-all shadow-sm ${label === l ? 'bg-[#FFF0EF] border-[#FF4732] text-[#FF4732] scale-[1.02]' : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                                            >
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div 
                                    onClick={() => setIsDefault(!isDefault)}
                                    className="flex items-center justify-between bg-[#FAFAFA] px-4 py-3.5 rounded-2xl border border-gray-100 mt-1 cursor-pointer transition-all hover:bg-gray-50"
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[14px] font-bold text-gray-900">Set as default</span>
                                        <span className="text-xs text-gray-500 font-medium leading-[1.3] max-w-[200px]">We'll automatically deliver here next time</span>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isDefault ? 'bg-[#00A859] border-[#00A859]' : 'border-gray-200 bg-white'}`}>
                                        {isDefault && <Check className="w-4 h-4 text-white stroke-[3px]" />}
                                    </div>
                                </div>

                                    {errorMsg && (
                                        <div className="bg-red-50 text-red-600 text-sm font-bold p-3 rounded-xl text-center border border-red-100 mb-0">
                                            {errorMsg}
                                        </div>
                                    )}

                                    <div className="mt-2 pb-2 bg-transparent shrink-0">
                                        <button
                                            type="submit"
                                            disabled={isSaving || !addressLine.trim() || isLoadingDetails || !latitude || !longitude}
                                            className={`w-full text-white font-bold text-base py-3.5 rounded-2xl shadow-xl transition-all flex items-center justify-center active:scale-[0.98]
                                                ${isSaving || !addressLine.trim() || isLoadingDetails || !latitude || !longitude ? 'bg-[#FFB7B0] shadow-none' : 'bg-[#FF584A] hover:bg-[#E5483B] shadow-[#FF584A]/30'}`}
                                        >
                                            {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Save Address'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            <LocationSettingsGuideModal 
                isOpen={isGuideOpen} 
                onClose={() => setIsGuideOpen(false)} 
            />
            </div>
        </div>,
        document.body
    );
};
