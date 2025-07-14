"use client";

import { useState, useCallback, useRef } from 'react';

interface UseGoogleMapOptions {
  onMapLoad?: (map: google.maps.Map) => void;
  onMapUnmount?: () => void;
}

export const useGoogleMap = (options: UseGoogleMapOptions = {}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    mapRef.current = mapInstance;
    setMap(mapInstance);
    setIsInitialized(true);
    options.onMapLoad?.(mapInstance);
  }, [options]);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
    setMap(null);
    setIsInitialized(false);
    options.onMapUnmount?.();
  }, [options]);

  return {
    map,
    isInitialized,
    onLoad,
    onUnmount,
    mapRef: mapRef.current,
  };
};

export default useGoogleMap;
