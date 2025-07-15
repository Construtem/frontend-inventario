"use client";

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { GoogleMap, DirectionsRenderer } from '@react-google-maps/api';
import { GOOGLE_MAPS_CONFIG, formatChileanAddress } from './config';

interface GoogleMapComponentProps {
  origen: string;
  destino: string;
  onDirectionsLoaded?: (distance: string, duration: string) => void;
}

// Mover estilos fuera del componente para evitar re-creación
const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px'
};

// Opciones del mapa como constante para evitar re-creación
const mapOptions = {
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  disableDefaultUI: false,
  clickableIcons: false,
  gestureHandling: 'cooperative',
  restriction: {
    latLngBounds: {
      north: -17.5, // Norte de Chile
      south: -56.5, // Sur de Chile
      west: -109.5, // Oeste de Chile (Isla de Pascua)
      east: -66.5,  // Este de Chile
    },
    strictBounds: false,
  },
};

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({ 
  origen, 
  destino, 
  onDirectionsLoaded 
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoizar las direcciones formateadas para evitar recálculos
  const formattedOrigen = useMemo(() => formatChileanAddress(origen), [origen]);
  const formattedDestino = useMemo(() => formatChileanAddress(destino), [destino]);

  const onLoad = useCallback((map: google.maps.Map) => {
    // Configuraciones adicionales para estabilidad
    map.setTilt(0);
    setMap(map);
    setIsInitialized(true);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
    setIsInitialized(false);
  }, []);

  // Función para calcular la ruta (optimizada y estable)
  const calculateRoute = useCallback(async () => {
    if (!map || !formattedOrigen || !formattedDestino) return;
    
    const directionsService = new google.maps.DirectionsService();
    
    try {
      const result = await directionsService.route({
        origin: formattedOrigen,
        destination: formattedDestino,
        travelMode: google.maps.TravelMode.DRIVING,
      });

      setDirectionsResponse(result);
      
      // Obtener distancia y duración
      const route = result.routes[0];
      if (route && route.legs[0]) {
        const distance = route.legs[0].distance?.text || '';
        const duration = route.legs[0].duration?.text || '';
        onDirectionsLoaded?.(distance, duration);
      }
    } catch (error) {
      console.error('Error calculando la ruta:', error);
    }
  }, [map, formattedOrigen, formattedDestino, onDirectionsLoaded]);

  // Calcular ruta cuando cambian origen o destino (optimizado y estable)
  useEffect(() => {
    if (isInitialized && map && formattedOrigen && formattedDestino) {
      // Usar requestAnimationFrame para mejor rendimiento
      const animationFrame = requestAnimationFrame(() => {
        const timeoutId = setTimeout(() => {
          calculateRoute();
        }, 200); // Aumentar delay para mayor estabilidad

        return () => clearTimeout(timeoutId);
      });

      return () => {
        cancelAnimationFrame(animationFrame);
      };
    }
  }, [isInitialized, map, formattedOrigen, formattedDestino, calculateRoute]);

  // Memoizar las opciones del DirectionsRenderer para evitar re-renders
  const directionsOptions = useMemo(() => ({
    suppressMarkers: false,
    polylineOptions: {
      strokeColor: '#10B981', // Verde claro (emerald-500)
      strokeWeight: 5,
      strokeOpacity: 0.9,
    },
  }), []);

  return (
    <div style={{ position: 'relative' }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={GOOGLE_MAPS_CONFIG.defaultCenter}
        zoom={GOOGLE_MAPS_CONFIG.defaultZoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {directionsResponse && (
          <DirectionsRenderer
            directions={directionsResponse}
            options={directionsOptions}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default GoogleMapComponent;
