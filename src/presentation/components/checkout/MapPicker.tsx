import React, { useState, useEffect, useRef, useCallback } from "react";
import { GoogleMap } from "@react-google-maps/api";
import { useGoogleMaps } from "../../context/GoogleMapsContext";

type Position = {
  lat: number;
  lng: number;
};

interface MapPickerProps {
  position: Position | null;
  onPositionChange: (pos: Position) => void;
  allowGeolocation?: boolean;
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
  allowGeolocation = false
}) => {
  const { isLoaded } = useGoogleMaps();

  const [center, setCenter] = useState<Position>(position || defaultCenter);
  const [hasUserSelected, setHasUserSelected] = useState(!!position);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);


  // Get current location on first load if allowed (only center, don't pin)
  useEffect(() => {
    if (position || !allowGeolocation) return; // already provided or not allowed

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };

          setCenter(userLocation);
          // Notice: we DON'T setHasUserSelected(true) here
        },
        () => {
          console.log("Location permission denied, using default");
        }
      );
    }
  }, []);

  // Sync external position (search/GPS)
  useEffect(() => {
    if (position) {
      setCenter(position);
      setHasUserSelected(true);
    }
  }, [position]);

  // Create/update marker
  useEffect(() => {
    if (!mapRef.current || !window.google || !hasUserSelected) {
        if (markerRef.current) markerRef.current.setMap(null);
        return;
    }

    if (markerRef.current) {
      // Just move the existing marker instead of recreating it
      markerRef.current.setMap(mapRef.current);
      markerRef.current.setPosition(center);
    } else {
      // Create it the first time
      markerRef.current = new google.maps.Marker({
        map: mapRef.current,
        position: center,
        animation: google.maps.Animation.DROP
      });
    }
  }, [center, hasUserSelected]);

  // 🖱️ Click to change location
  const handleClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;

      const newPos = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };

      setCenter(newPos);
      setHasUserSelected(true);
      onPositionChange(newPos);
    },
    [onPositionChange]
  );

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
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15}
      onClick={handleClick}
      onLoad={(map) => {
        mapRef.current = map;
      }}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: "greedy"
      }}
    />
  );
};