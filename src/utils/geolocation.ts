export interface GeolocationOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
}

export const getCurrentPositionWithFallback = (
    onSuccess: (position: GeolocationPosition) => void,
    onError: (error: GeolocationPositionError, message: string) => void,
    options?: GeolocationOptions
) => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
        const errorObj = {
            code: 0,
            message: "Geolocation not supported",
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3
        } as unknown as GeolocationPositionError;
        onError(errorObj, "Geolocation is not supported by your browser.");
        return;
    }

    const highAccuracyOptions = {
        enableHighAccuracy: true,
        timeout: options?.timeout ?? 6000, // Try high accuracy for 6 seconds
        maximumAge: options?.maximumAge ?? 0
    };

    const lowAccuracyOptions = {
        enableHighAccuracy: false,
        timeout: options?.timeout ?? 10000, // Fallback low accuracy for 10 seconds
        maximumAge: options?.maximumAge ?? 300000 // Allow up to 5 mins old cache
    };

    const getFriendlyErrorMessage = (err: GeolocationPositionError): string => {
        switch (err.code) {
            case err.PERMISSION_DENIED:
                return "Location access is required to show nearby restaurants. Please enable GPS permissions in your browser settings and try again.";
            case err.POSITION_UNAVAILABLE:
                return "Location unavailable. Please make sure your GPS is turned on and try again.";
            case err.TIMEOUT:
                return "Location request timed out. Please check your signal and try again.";
            default:
                return "Unable to detect your location. Please try again or select it manually.";
        }
    };

    // Try high accuracy first
    navigator.geolocation.getCurrentPosition(
        (pos) => onSuccess(pos),
        (highErr) => {
            console.warn("High accuracy geolocation failed, trying low accuracy fallback...", highErr);
            
            // If the user denied permission, do not retry low accuracy as it will fail immediately
            if (highErr.code === highErr.PERMISSION_DENIED) {
                onError(highErr, getFriendlyErrorMessage(highErr));
                return;
            }

            // Retry with low accuracy
            navigator.geolocation.getCurrentPosition(
                (pos) => onSuccess(pos),
                (lowErr) => {
                    console.error("Both high and low accuracy geolocation failed:", lowErr);
                    onError(lowErr, getFriendlyErrorMessage(lowErr));
                },
                lowAccuracyOptions
            );
        },
        highAccuracyOptions
    );
};

export const isMobileDevice = (): boolean => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
};
