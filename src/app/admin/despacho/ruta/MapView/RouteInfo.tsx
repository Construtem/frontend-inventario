"use client";

import React from 'react';

interface RouteInfoProps {
  despachoInfo: {
    id: string;
    cliente: string;
    origen: string;
    destino: string;
    estado: string;
  };
  routeDetails?: {
    distance: string;
    duration: string;
  };
}

const RouteInfo: React.FC<RouteInfoProps> = React.memo(({ despachoInfo, routeDetails }) => {
  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'en ruta':
        return '#22c55e'; // Verde
      case 'pendiente':
        return '#f59e0b'; // Amarillo
      case 'entregado':
        return '#3b82f6'; // Azul
      case 'cancelado':
        return '#ef4444'; // Rojo
      default:
        return '#6b7280'; // Gris
    }
  };

  return (
    <div style={{ 
      background: "#fff", 
      borderRadius: 8, 
      padding: 24, 
      marginBottom: 24,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)" 
    }}>
      <h3 style={{ 
        fontSize: "1.2rem", 
        fontWeight: 600, 
        marginBottom: "1.5rem",
        color: "#1f2937"
      }}>
        Información del Despacho
      </h3>
      
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
        gap: "1rem",
        marginBottom: routeDetails ? "1.5rem" : "0"
      }}>
        <div style={{ padding: "0.5rem 0" }}>
          <span style={{ fontWeight: 600, color: "#374151" }}>Cliente:</span>
          <div style={{ marginTop: "0.25rem", color: "#6b7280" }}>{despachoInfo.cliente}</div>
        </div>
        
        <div style={{ padding: "0.5rem 0" }}>
          <span style={{ fontWeight: 600, color: "#374151" }}>Estado:</span>
          <div style={{ 
            marginTop: "0.25rem", 
            display: "inline-block",
            padding: "0.25rem 0.75rem",
            borderRadius: "9999px",
            backgroundColor: getEstadoColor(despachoInfo.estado) + "20",
            color: getEstadoColor(despachoInfo.estado),
            fontSize: "0.875rem",
            fontWeight: 500
          }}>
            {despachoInfo.estado}
          </div>
        </div>
        
        <div style={{ padding: "0.5rem 0" }}>
          <span style={{ fontWeight: 600, color: "#374151" }}>Origen:</span>
          <div style={{ marginTop: "0.25rem", color: "#6b7280" }}>{despachoInfo.origen}</div>
        </div>
        
        <div style={{ padding: "0.5rem 0" }}>
          <span style={{ fontWeight: 600, color: "#374151" }}>Destino:</span>
          <div style={{ marginTop: "0.25rem", color: "#6b7280" }}>{despachoInfo.destino}</div>
        </div>
      </div>

      {routeDetails && (
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
              <div style={{ fontWeight: 600, color: "#374151" }}>Distancia</div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>{routeDetails.distance}</div>
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
              <div style={{ fontWeight: 600, color: "#374151" }}>Tiempo estimado</div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>{routeDetails.duration}</div>
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
