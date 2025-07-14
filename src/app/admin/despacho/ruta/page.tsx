"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MapView } from "./MapView";

interface DespachoInfo {
  id: string;
  cliente: string;
  origen: string;
  destino: string;
  estado: string;
}

export default function RutaDespachoPage() {
  const searchParams = useSearchParams();
  const despachoId = searchParams.get('despachoId');
  const [despachoInfo, setDespachoInfo] = useState<DespachoInfo | null>(null);

  useEffect(() => {
    if (despachoId) {
      // Aquí podrás hacer fetch de la información del despacho específico
      // Por ahora usamos datos de ejemplo
      setDespachoInfo({
        id: despachoId,
        cliente: "Cliente Ejemplo S.A.",
        origen: "Av. Libertador Bernardo O'Higgins 1234, Santiago",
        destino: "Av. Providencia 5678, Providencia",
        estado: "En ruta"
      });
    }
  }, [despachoId]);

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>
          Vista de Ruta de Despacho {despachoId ? `#${despachoId}` : ""}
        </h1>
        
        {despachoInfo ? (
          <MapView despachoInfo={despachoInfo} />
        ) : (
          <div style={loadingContainerStyle}>
            <p style={loadingTextStyle}>
              Cargando información del despacho...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// === Estilos Globales ===

const containerStyle: React.CSSProperties = {
  marginTop: "70px",
  padding: "1.5rem",
  boxSizing: "border-box",
  minHeight: "calc(100vh - 70px)",
  backgroundColor: "#f5f5f5",
  borderRadius: '20px',
  width: "100%",
  overflowX: "hidden",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "white",
  borderRadius: "12px",
  padding: "2rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  maxWidth: "100%",
  overflowX: "hidden",
  marginTop: "1.5rem",
  marginLeft: '1.5rem',
  marginRight: '1.5rem',
};

const titleStyle: React.CSSProperties = {
  color: '#222222',
  fontSize: "2rem",
  fontWeight: "bold",
  marginBottom: "2rem",
  fontFamily: 'Montserrat, sans-serif',
  borderRadius: '20px',
};

const loadingContainerStyle: React.CSSProperties = {
  textAlign: "center",
  padding: "2rem",
};

const loadingTextStyle: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "1.1rem",
  fontFamily: "Roboto, sans-serif",
};
