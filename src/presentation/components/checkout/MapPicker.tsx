import React, { useState, useEffect, useRef, useCallback } from "react";
import { GoogleMap } from "@react-google-maps/api";
import { useGoogleMaps } from "../../context/GoogleMapsContext";
import { Locate } from "lucide-react";

type Position = {
  lat: number;
  lng: number;
};

interface MapPickerProps {
  position: Position | null;
  onPositionChange: (pos: Position) => void;
  allowGeolocation?: boolean;
  readOnly?: boolean;
}

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "16px"
};

const defaultCenter: Position = {
  lat: 18.5204,
  lng: 73.8567
};

export const MapPicker: React.FC<MapPickerProps> = ({
  position,
  onPositionChange,
  allowGeolocation = false,
  readOnly = false
}) => {
  const { isLoaded } = useGoogleMaps();

  const [center, setCenter] = useState<Position>(position || defaultCenter);
  const [isDragging, setIsDragging] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  // Get current location on first load if allowed
  useEffect(() => {
    if (position || !allowGeolocation || readOnly) return; // already provided, not allowed, or readOnly

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };

          setCenter(userLocation);
          onPositionChange(userLocation);
        },
        () => {
          console.log("Location permission denied, using default");
        }
      );
    }
  }, []);

  // Sync external position (search/GPS/edit)
  useEffect(() => {
    if (position) {
      if (mapRef.current) {
        const currentCenter = mapRef.current.getCenter();
        if (currentCenter) {
          const latDiff = Math.abs(currentCenter.lat() - position.lat);
          const lngDiff = Math.abs(currentCenter.lng() - position.lng);
          if (latDiff < 0.0001 && lngDiff < 0.0001) {
            // Already centered near this position, skip to avoid fighting
            return;
          }
        }
      }
      setCenter(position);
    }
  }, [position?.lat, position?.lng]);

  // Create/update marker for readOnly mode only
  useEffect(() => {
    if (!readOnly) {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      return;
    }

    if (!mapRef.current || !window.google || !position) {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      return;
    }

    if (markerRef.current) {
      markerRef.current.setMap(mapRef.current);
      markerRef.current.setPosition(position);
    } else {
      markerRef.current = new google.maps.Marker({
        map: mapRef.current,
        position: position,
        animation: google.maps.Animation.DROP
      });
    }
  }, [position?.lat, position?.lng, readOnly, isLoaded]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    if (mapRef.current) {
      const newCenter = mapRef.current.getCenter();
      if (newCenter) {
        const newPos = {
          lat: newCenter.lat(),
          lng: newCenter.lng()
        };
        setCenter(newPos);
        onPositionChange(newPos);
      }
    }
  }, [onPositionChange]);

  const handleLocateUser = useCallback(() => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
          setCenter(userLocation);
          onPositionChange(userLocation);
          setIsLocating(false);
        },
        (err) => {
          console.error("Locate User failed:", err);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, [onPositionChange]);

  if (!isLoaded) {
    return (
      <div className="h-full min-h-[250px] bg-gray-50 flex items-center justify-center relative overflow-hidden rounded-[16px]">
        {/* Animated Skeleton Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
        
        {/* Mock Map UI elements */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-sm">
            <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse"></div>
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest opacity-50">Initializing Map</span>
        </div>

        {/* CSS for shimmer */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .animate-shimmer {
            animation: shimmer 2s infinite linear;
          }
        `}} />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        onLoad={(map) => {
          mapRef.current = map;
          if (!position && !readOnly) {
            // Trigger initial position change so the parent has the default/GPS center coordinates
            const initialCenter = map.getCenter();
            if (initialCenter) {
              onPositionChange({
                lat: initialCenter.lat(),
                lng: initialCenter.lng()
              });
            }
          }
        }}
        onDragStart={() => {
          if (!readOnly) setIsDragging(true);
        }}
        onDragEnd={handleDragEnd}
        options={{
          disableDefaultUI: true,
          zoomControl: !readOnly,
          gestureHandling: readOnly ? "none" : "greedy"
        }}
      />

      {/* Stationary Center Pin for interactive mode */}
      {!readOnly && (
        <div 
          className="absolute top-1/2 left-1/2 pointer-events-none z-10 flex flex-col items-center"
          style={{
            transform: "translate(-50%, -100%)"
          }}
        >
          {/* Floating Pin Icon with drag bobble animation */}
          <div 
            className="transition-transform duration-200 ease-out"
            style={{
              transform: `translateY(${isDragging ? "-12px" : "0px"})`
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#FF4732" stroke="#FFFFFF" strokeWidth="1.5"/>
              <circle cx="12" cy="9" r="3" fill="#FFFFFF"/>
            </svg>
          </div>

          {/* Pulse / Shadow element */}
          <div 
            className="w-2.5 h-1 bg-black/20 rounded-full blur-[1px] transition-all duration-200 ease-out"
            style={{
              transform: "scale(0.8)",
              opacity: isDragging ? 0.3 : 1
            }}
          />
        </div>
      )}

      {/* Locate Me Button */}
      {!readOnly && (
        <button
          type="button"
          onClick={handleLocateUser}
          disabled={isLocating}
          className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-700 p-3 rounded-full shadow-lg border border-gray-100 transition-all flex items-center justify-center cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
          title="Use current location"
        >
          {isLocating ? (
            <div className="w-5 h-5 border-2 border-[#FF4732] border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Locate className="w-5 h-5 text-[#FF4732] group-hover:scale-110 transition-transform duration-200" />
          )}
        </button>
      )}
    </div>
  );
};