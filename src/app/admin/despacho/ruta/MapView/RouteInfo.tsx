"use client";

import React from 'react';

interface RouteInfoProps {
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
  routeDetails?: {
    distance: string;
    duration: string;
  };
}

const RouteInfo: React.FC<RouteInfoProps> = React.memo(({ despachoInfo, routeDetails }) => {
  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'aprobada':
      case 'aprobado':
        return '#16a34a'; // Verde
      case 'rechazada':
      case 'rechazado':
      case 'cancelada':
      case 'cancelado':
        return '#ef4444'; // Rojo
      case 'enviada':
      case 'enviado':
        return '#2563eb'; // Azul
      case 'pendiente':
        return '#f59e0b'; // Amarillo
      case 'en ruta':
        return '#22c55e'; // Verde
      case 'entregado':
        return '#3b82f6'; // Azul
      default:
        return '#6b7280'; // Gris
    }
  };

  // Usar datos del backend si están disponibles, sino usar routeDetails de Google Maps
  const displayDistance = despachoInfo.distancia || routeDetails?.distance;
  const displayDuration = despachoInfo.duracion || routeDetails?.duration;
  const hasRouteData = displayDistance && displayDuration;

  return (
    <div style={{ 
      background: "#fff", 
      borderRadius: 8, 
      padding: 24, 
      marginBottom: 24,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)" 
    }}>
      <h3 style={{ 
        fontSize: "1.25rem", 
        fontWeight: 700, 
        marginBottom: "1.5rem",
        color: "#1f2937",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        letterSpacing: '-0.025em'
      }}>
        Información del Despacho
      </h3>
      
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
        gap: "1rem",
        marginBottom: hasRouteData ? "1.5rem" : "0"
      }}>
        <div style={{ padding: "0.5rem 0" }}>
          <span style={{ 
            fontWeight: 700, 
            color: "#111827",
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize: "1rem"
          }}>Cliente:</span>
          <div style={{ 
            marginTop: "0.25rem", 
            color: "#374151",
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize: "0.95rem",
            fontWeight: "500"
          }}>{despachoInfo.cliente}</div>
        </div>
        
        <div style={{ padding: "0.5rem 0" }}>
          <span style={{ 
            fontWeight: 700, 
            color: "#111827",
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize: "1rem"
          }}>Estado:</span>
          <div style={{ 
            marginTop: "0.25rem", 
            display: "inline-block",
            padding: "0.25rem 0.75rem",
            borderRadius: "9999px",
            backgroundColor: getEstadoColor(despachoInfo.estado) + "20",
            color: getEstadoColor(despachoInfo.estado),
            fontSize: "0.875rem",
            fontWeight: 600,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
          }}>
            {despachoInfo.estado}
          </div>
        </div>
        
        <div style={{ padding: "0.5rem 0" }}>
          <span style={{ 
            fontWeight: 700, 
            color: "#111827",
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize: "1rem"
          }}>Origen:</span>
          <div style={{ 
            marginTop: "0.25rem", 
            color: "#374151",
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize: "0.95rem",
            fontWeight: "500"
          }}>{despachoInfo.origen}</div>
        </div>
        
        <div style={{ padding: "0.5rem 0" }}>
          <span style={{ 
            fontWeight: 700, 
            color: "#111827",
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize: "1rem"
          }}>Destino:</span>
          <div style={{ 
            marginTop: "0.25rem", 
            color: "#374151",
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize: "0.95rem",
            fontWeight: "500"
          }}>{despachoInfo.destino}</div>
        </div>
      </div>

      {hasRouteData && (
        <div style={{
          borderTop: "1px solid #e5e7eb",
          paddingTop: "1.5rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem"
        }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            padding: "0.75rem",
            backgroundColor: "#f3f4f6",
            borderRadius: "8px"
          }}>
            <div style={{ 
              fontSize: "1.5rem",
              marginRight: "0.75rem"
            }}>📏</div>
            <div>
              <div style={{ 
                fontWeight: 700, 
                color: "#111827",
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontSize: "1rem"
              }}>Distancia</div>
              <div style={{ 
                color: "#374151", 
                fontSize: "0.925rem",
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontWeight: "500"
              }}>
                {displayDistance}
                {despachoInfo.distancia && (
                  <span style={{ fontSize: "0.75rem", color: "#9ca3af", marginLeft: "0.5rem" }}>
                    (desde backend)
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            padding: "0.75rem",
            backgroundColor: "#f3f4f6",
            borderRadius: "8px"
          }}>
            <div style={{ 
              fontSize: "1.5rem",
              marginRight: "0.75rem"
            }}>⏱️</div>
            <div>
              <div style={{ 
                fontWeight: 700, 
                color: "#111827",
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontSize: "1rem"
              }}>Tiempo estimado</div>
              <div style={{ 
                color: "#374151", 
                fontSize: "0.925rem",
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontWeight: "500"
              }}>
                {displayDuration}
                {despachoInfo.duracion && (
                  <span style={{ fontSize: "0.75rem", color: "#9ca3af", marginLeft: "0.5rem" }}>
                    (desde backend)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// Añadir nombre al componente para debugging
RouteInfo.displayName = 'RouteInfo';

export default RouteInfo;
