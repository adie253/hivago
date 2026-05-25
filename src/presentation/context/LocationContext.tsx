import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';
import { getAddresses, isTokenValid } from '../../data/api';
import { useCart } from './CartContext';

interface Address {
    id: string;
    label: string;
    addressLine: string;
    landmark: string | null;
    isDefault: boolean;
    latitude: number;
    longitude: number;
    pincode?: string;
    city?: string;
}

interface LocationContextType {
    addresses: Address[];
    selectedLocation: Address | null;
    isLoadingAddresses: boolean;
    selectLocation: (address: Address) => void;
    refreshAddresses: () => Promise<void>;
    clearLocationData: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<Address | null>(() => {
        const saved = localStorage.getItem('selected_location');
        return saved ? JSON.parse(saved) : null;
    });
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
    const { isLoggedIn } = useCart();
    const { showToast } = useToast();
    
    // Use a ref to track selection without triggering re-renders in callbacks
    const selectedLocationRef = React.useRef<Address | null>(null);
    useEffect(() => {
        selectedLocationRef.current = selectedLocation;
        if (selectedLocation) {
            localStorage.setItem('selected_location', JSON.stringify(selectedLocation));
        } else {
            localStorage.removeItem('selected_location');
        }
    }, [selectedLocation]);

    const refreshAddresses = useCallback(async () => {
        if (!isTokenValid()) {
            setAddresses([]);
            const saved = localStorage.getItem('selected_location');
            if (saved) {
                setSelectedLocation(JSON.parse(saved));
            } else {
                setSelectedLocation(null);
            }
            return;
        }

        setIsLoadingAddresses(true);
        try {
            const data = await getAddresses();
            const addrList = data || [];
            setAddresses(addrList);
            
            if (addrList.length > 0) {
                const currentSelection = selectedLocationRef.current;
                // If we already have a selection, try to keep it (updated with latest data)
                if (currentSelection) {
                    const stillExists = addrList.find(a => a.id === currentSelection.id);
                    if (stillExists) {
                        setSelectedLocation(stillExists);
                        return;
                    }
                }
                
                // Fallback to default if no selection or selection is gone
                const defaultAdd = addrList.find(a => a.isDefault) || addrList[0];
                setSelectedLocation(defaultAdd);
            } else {
                setSelectedLocation(null);
            }
        } catch (e) {
            console.error("Failed to fetch addresses:", e);
        } finally {
            setIsLoadingAddresses(false);
        }
    }, []);

    // Auto-ask for location on app start if no location is selected
    useEffect(() => {
        const hasAsked = sessionStorage.getItem('location_asked');
        if (hasAsked) return;

        // Give logged-in sync a moment to load saved addresses first
        const timer = setTimeout(() => {
            if (!selectedLocationRef.current) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setSelectedLocation({
                            id: 'current-location',
                            label: 'Current Location',
                            addressLine: 'Using your GPS location',
                            landmark: null,
                            isDefault: false,
                            latitude,
                            longitude
                        });
                        sessionStorage.setItem('location_asked', 'true');
                    },
                    (error) => {
                        console.error("Location permission denied or failed:", error);
                        sessionStorage.setItem('location_asked', 'true');
                    },
                    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
                );
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!isLoggedIn) {
            setAddresses([]);
            const saved = localStorage.getItem('selected_location');
            if (saved) {
                setSelectedLocation(JSON.parse(saved));
            } else {
                setSelectedLocation(null);
            }
        } else {
            refreshAddresses();
        }
    }, [isLoggedIn, refreshAddresses]);

    const selectLocation = (address: Address) => {
        if (
            selectedLocationRef.current &&
            selectedLocationRef.current.latitude === address.latitude &&
            selectedLocationRef.current.longitude === address.longitude
        ) {
            return;
        }
        // Update ref SYNCHRONOUSLY to block subsequent calls in the same tick
        selectedLocationRef.current = address;
        setSelectedLocation(address);
        showToast(`Delivery address: ${address.label}`, "success");
    };

    const clearLocationData = () => {
        setAddresses([]);
        setSelectedLocation(null);
        localStorage.removeItem('selected_location');
    };

    return (
        <LocationContext.Provider value={{
            addresses,
            selectedLocation,
            isLoadingAddresses,
            selectLocation,
            refreshAddresses,
            clearLocationData
        }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useUserLocation = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useUserLocation must be used within a LocationProvider');
    }
    return context;
};
