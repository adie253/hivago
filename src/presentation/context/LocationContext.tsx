import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAddresses, isTokenValid } from '../../data/api';

interface Address {
    id: string;
    label: string;
    addressLine: string;
    landmark?: string;
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
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<Address | null>(null);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

    const refreshAddresses = useCallback(async () => {
        if (!isTokenValid()) {
            setAddresses([]);
            setSelectedLocation(null);
            return;
        }

        setIsLoadingAddresses(true);
        try {
            const data = await getAddresses();
            setAddresses(data || []);
            
            // Set default location if none selected
            if (data && data.length > 0 && !selectedLocation) {
                const defaultAdd = data.find((a: any) => a.isDefault) || data[0];
                setSelectedLocation(defaultAdd);
            }
        } catch (e) {
            console.error("Failed to fetch addresses:", e);
        } finally {
            setIsLoadingAddresses(false);
        }
    }, [selectedLocation]);

    useEffect(() => {
        refreshAddresses();
    }, []); // Initial fetch

    const selectLocation = (address: Address) => {
        setSelectedLocation(address);
    };

    return (
        <LocationContext.Provider value={{
            addresses,
            selectedLocation,
            isLoadingAddresses,
            selectLocation,
            refreshAddresses
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
