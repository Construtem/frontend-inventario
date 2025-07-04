"use client";

import React, { useState } from "react";

export default function ConfigPage() {
  const [config1, setConfig1] = useState("opcion1");
  const [config2, setConfig2] = useState(true);
  const [config3, setConfig3] = useState(false);
  const [config4, setConfig4] = useState(false);

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Configuración</h1>
        
        {/* Lista de configuraciones */}
        <div style={configListStyle}>
          
          {/* Configuración 1 - Dropdown */}
          <div style={configItemStyle}>
            <span style={configLabelStyle}>Configuración 1</span>
            <select 
              value={config1} 
              onChange={(e) => setConfig1(e.target.value)}
              style={dropdownStyle}
            >
              <option value="opcion1">Opción 1</option>
              <option value="opcion2">Opción 2</option>
              <option value="opcion3">Opción 3</option>
            </select>
          </div>

          {/* Configuración 2 - Toggle Switch */}
          <div style={configItemStyle}>
            <span style={configLabelStyle}>Configuración 2</span>
            <div 
              style={{
                ...toggleContainerStyle,
                backgroundColor: config2 ? '#ff7300' : '#d1d5db'
              }}
              onClick={() => setConfig2(!config2)}
            >
              <div 
                style={{
                  ...toggleButtonStyle,
                  transform: config2 ? 'translateX(24px)' : 'translateX(2px)'
                }}
              />
            </div>
          </div>

          {/* Configuración 3 - Modo Oscuro/Claro */}
          <div style={configItemStyle}>
            <span style={configLabelStyle}>Configuración 3</span>
            <div 
              style={themeToggleStyle}
              onClick={() => setConfig3(!config3)}
            >
              <span style={themeIconStyle}>
                {config3 ? '🌙' : '☀️'}
              </span>
            </div>
          </div>

          {/* Configuración 4 - Checkbox */}
          <div style={configItemStyle}>
            <span style={configLabelStyle}>Configuración 4</span>
            <div 
              style={{
                ...checkboxContainerStyle,
                backgroundColor: config4 ? '#ff7300' : 'transparent',
                borderColor: config4 ? '#ff7300' : '#d1d5db'
              }}
              onClick={() => setConfig4(!config4)}
            >
              {config4 && <span style={checkmarkStyle}>✓</span>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- Estilos en variables ---
const containerStyle: React.CSSProperties = {
  padding: "2rem",
  minHeight: "calc(100vh - 70px)",
  backgroundColor: "#f3f4f6",
  borderRadius: "20px",
  marginTop: "40px",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "2rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const titleStyle: React.CSSProperties = {
  color: "#222222",
  fontSize: "2rem",
  fontWeight: "bold",
  fontFamily: "Montserrat, sans-serif",
  marginBottom: "2rem",
};

const configListStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
};

const configItemStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "1rem 0",
  borderBottom: "1px solid #e5e7eb",
};

const configLabelStyle: React.CSSProperties = {
  fontSize: "1rem",
  fontWeight: "500",
  color: "#374151",
  fontFamily: "Roboto, sans-serif",
};

const dropdownStyle: React.CSSProperties = {
  padding: "0.5rem 1rem",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  backgroundColor: "#f9fafb",
  fontSize: "0.9rem",
  fontFamily: "Roboto, sans-serif",
  color: "#374151",
  cursor: "pointer",
  minWidth: "120px",
};

const toggleContainerStyle: React.CSSProperties = {
  width: "48px",
  height: "24px",
  borderRadius: "12px",
  position: "relative",
  cursor: "pointer",
  transition: "background-color 0.2s ease",
};

const toggleButtonStyle: React.CSSProperties = {
  width: "20px",
  height: "20px",
  backgroundColor: "white",
  borderRadius: "50%",
  position: "absolute",
  top: "2px",
  transition: "transform 0.2s ease",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
};

const themeToggleStyle: React.CSSProperties = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  backgroundColor: "#f3f4f6",
  border: "2px solid #d1d5db",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const themeIconStyle: React.CSSProperties = {
  fontSize: "1.2rem",
};

const checkboxContainerStyle: React.CSSProperties = {
  width: "24px",
  height: "24px",
  borderRadius: "4px",
  border: "2px solid",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const checkmarkStyle: React.CSSProperties = {
  color: "white",
  fontSize: "0.8rem",
  fontWeight: "bold",
};