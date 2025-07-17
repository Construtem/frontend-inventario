"use client";

import React, { useState, useCallback, useMemo } from 'react';
import GoogleMapComponent from './GoogleMapComponent';
import RouteInfo from './RouteInfo';
import GoogleMapsLoader from './GoogleMapsLoader';

interface MapViewProps {
  despachoInfo: {
    id: string;
    cliente: string;
    origen: string;
    destino: string;
    estado: string;
    distancia?: string;
    duracion?: string;
    precio?: string;
  };
}

const MapView: React.FC<MapViewProps> = React.memo(({ despachoInfo }) => {
  const [routeDetails, setRouteDetails] = useState<{
    distance: string;
    duration: string;
  } | undefined>();

  // Inicializar con datos del backend si están disponibles
  React.useEffect(() => {
    if (despachoInfo.distancia && despachoInfo.duracion) {
      setRouteDetails({
        distance: despachoInfo.distancia,
        duration: despachoInfo.duracion
      });
    }
  }, [despachoInfo.distancia, despachoInfo.duracion]);

  // Memoizar el callback para evitar re-renders del GoogleMapComponent
  const handleDirectionsLoaded = useCallback((distance: string, duration: string) => {
    // Solo actualizar si no tenemos datos del backend
    if (!despachoInfo.distancia || !despachoInfo.duracion) {
      setRouteDetails({ distance, duration });
    }
  }, [despachoInfo.distancia, despachoInfo.duracion]);

  // Memoizar los estilos para evitar re-creación en cada render
  const containerStyle = useMemo(() => ({ 
    background: "#fff", 
    borderRadius: 8, 
    padding: 24, 
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  }), []);

  const headerStyle = useMemo(() => ({ 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: "1.5rem" 
  }), []);

  const titleStyle = useMemo(() => ({ 
    fontSize: "1.35rem", 
    fontWeight: 700, 
    color: "#1f2937",
    margin: 0,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    letterSpacing: '-0.025em'
  }), []);

  const badgeStyle = useMemo(() => ({
    fontSize: "0.875rem",
    color: "#6b7280",
    backgroundColor: "#f3f4f6",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontWeight: "500"
  }), []);

  const noteStyle = useMemo(() => ({ 
    marginTop: "1rem", 
    padding: "0.75rem",
    backgroundColor: "#f9fafb",
    borderRadius: "6px",
    fontSize: "0.9rem",
    color: "#6b7280",
    borderLeft: "4px solid #3b82f6",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontWeight: "500",
    lineHeight: "1.5"
  }), []);

  return (
    <div>
      <RouteInfo despachoInfo={despachoInfo} routeDetails={routeDetails} />
      
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h3 style={titleStyle}>
            🗺️ Ruta del Despacho
          </h3>
          
          <div style={badgeStyle}>
            Google Maps Integration
          </div>
        </div>

        <GoogleMapsLoader>
          <GoogleMapComponent
            origen={despachoInfo.origen}
            destino={despachoInfo.destino}
            onDirectionsLoaded={handleDirectionsLoaded}
          />
        </GoogleMapsLoader>

        <div style={noteStyle}>
          <strong>Nota:</strong> La ruta se calcula automáticamente entre el origen y destino proporcionados. 
          El tiempo y distancia son estimados basados en condiciones normales de tráfico.
        </div>
      </div>
    </div>
  );
});

// Añadir nombre al componente para debugging
MapView.displayName = 'MapView';

export default MapView;
