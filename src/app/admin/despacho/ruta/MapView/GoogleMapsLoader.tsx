"use client";

import React, { memo } from 'react';
import { LoadScript } from '@react-google-maps/api';
import { GOOGLE_MAPS_CONFIG } from './config';

interface GoogleMapsLoaderProps {
  children: React.ReactNode;
}

// Configuración constante para evitar re-renders
const libraries: Array<"geometry" | "drawing"> = ["geometry", "drawing"];

const loadingElementStyle = {
  height: '400px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#6b7280',
  fontSize: '1rem'
};

const GoogleMapsLoader: React.FC<GoogleMapsLoaderProps> = memo(({ children }) => {
  return (
    <LoadScript 
      googleMapsApiKey={GOOGLE_MAPS_CONFIG.apiKey}
      libraries={libraries}
      loadingElement={
        <div style={loadingElementStyle}>
          Cargando mapa...
        </div>
      }
      preventGoogleFontsLoading={true}
    >
      {children}
    </LoadScript>
  );
});

GoogleMapsLoader.displayName = 'GoogleMapsLoader';

export default GoogleMapsLoader;
