import React, { useState, useEffect, useRef, useCallback } from "react";
import { GoogleMap, useLoadScript } from "@react-google-maps/api";

type Position = {
  lat: number;
  lng: number;
};

interface MapPickerProps {
  position: Position | null;
  onPositionChange: (pos: Position) => void;
}

const LIBRARIES: ("marker")[] = ["marker"];

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
  onPositionChange
}) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: LIBRARIES
  });

  const [center, setCenter] = useState<Position>(defaultCenter);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  // Get current location on first load
  useEffect(() => {
    if (position) return; // already provided from parent

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

  // Sync external position (search/GPS)
  useEffect(() => {
    if (position) {
      setCenter(position);
    }
  }, [position]);

  // Create/update marker
  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    if (markerRef.current) {
      // Just move the existing marker instead of recreating it
      markerRef.current.setPosition(center);
    } else {
      // Create it the first time
      markerRef.current = new google.maps.Marker({
        map: mapRef.current,
        position: center,
        animation: google.maps.Animation.DROP
      });
    }
  }, [center]);

  // 🖱️ Click to change location
  const handleClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;

      const newPos = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };

      setCenter(newPos);
      onPositionChange(newPos);
    },
    [onPositionChange]
  );

  if (!isLoaded) {
    return (
      <div className="h-full min-h-[250px] flex items-center justify-center text-gray-400">
        Loading map...
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
        zoomControl: true
      }}
    />
  );
};