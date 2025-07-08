"use client";

import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";

interface TipoSucursal {
  id: number;
  nombre: string;
}

interface Sucursal {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  comuna: string;
  ciudad: string;
  tipo: TipoSucursal;
}

export default function SucursalesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchSucursales() {
      try {
        const response = await fetch("http://localhost:8080/api/sucursales");
        if (!response.ok) {
          throw new Error("Error al cargar las sucursales");
        }
        const data = await response.json();
        setSucursales(data);
      } catch (error) {
        console.error("Error fetching sucursales:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSucursales();
  }, []);

  // Filtrar datos según búsqueda
  const filteredData = sucursales.filter((sucursal) => {
    const lowerSearch  = searchTerm.toLowerCase();
    return (
      sucursal.nombre.toLowerCase().includes(lowerSearch) ||
      sucursal.direccion.toLowerCase().includes(lowerSearch) ||
      sucursal.telefono.includes(searchTerm) ||
      sucursal.comuna.toLowerCase().includes(lowerSearch) ||
      sucursal.ciudad.toLowerCase().includes(lowerSearch) ||
      sucursal.tipo.nombre.toLowerCase().includes(lowerSearch)
    );
  });

  const handleModificar = () => {
    alert('Abriendo formulario para modificar sucursales...');
  };
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header con título y botón */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>Gestion de Sucursales</h1>
          <button style={modificarButtonStyle} onClick={handleModificar}>
            Modificar sucursales
          </button>
        </div>

        {/* Fila de búsqueda y filtros */}
        <div style={filterRowStyle}>
          {/* Input de búsqueda con ícono */}
          <div style={searchContainerStyle}>
            <input
              type="text"
              placeholder="Escriba su búsqueda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={searchInputStyle}
            />
          </div>

          {/* Botón de búsqueda con ícono */}
          <button style={searchButtonStyle}>
            <FaSearch />
          </button>

          {/* Botón de filtros */}
          <button style={filtrosButtonStyle}>
            Filtros
          </button>
        </div>

        {/* Tabla */}
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Nombre</th>
                <th style={thStyle}>Dirección</th>
                <th style={thStyle}>Teléfono</th>
                <th style={thStyle}>Comuna</th>
                <th style={thStyle}>Ciudad</th>
                <th style={thStyle}>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={tdStyle}>Cargando...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} style={tdStyle}>
                    No hay sucursales disponibles
                  </td>
                </tr>
              ) : (
                filteredData.map((sucursal) => (
                  <tr key={sucursal.id}>
                    <td style={tdStyle}>#{sucursal.id}</td>
                    <td style={tdStyle}>{sucursal.nombre}</td>
                    <td style={tdStyle}>{sucursal.direccion}</td>
                    <td style={tdStyle}>{sucursal.telefono}</td>
                    <td style={tdStyle}>{sucursal.comuna}</td>
                    <td style={tdStyle}>{sucursal.ciudad}</td>
                    <td style={tdStyle}>{sucursal.tipo.nombre || "Sin tipo"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
};

const titleStyle: React.CSSProperties = {
  color: "#222222",
  fontSize: "2rem",
  fontWeight: "bold",
  fontFamily: "Montserrat, sans-serif",
  marginBottom: "0",
};

const modificarButtonStyle: React.CSSProperties = {
  backgroundColor: "#ff7300",
  color: "#fff",
  padding: "0.75rem 1.5rem",
  borderRadius: "10px",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: "1rem",
  fontFamily: "Montserrat, sans-serif",
};

const filterRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "0.75rem",
  flexWrap: "wrap",
  alignItems: "center",
  marginBottom: "2rem",
};

const searchContainerStyle: React.CSSProperties = {
  flex: "0 0 45%",
  position: "relative",
  maxWidth: "45%",
};

const searchInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.6rem 1rem",
  borderRadius: "10px",
  border: "1px solid #ccc",
  fontSize: "1rem",
  fontFamily: "Roboto, sans-serif",
  height: "42px",
  boxSizing: "border-box",
};

const searchButtonStyle: React.CSSProperties = {
  backgroundColor: "#ff7300",
  color: "#fff",
  padding: "0.6rem 1rem",
  borderRadius: "10px",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "Montserrat, sans-serif",
  flexShrink: 0,
  minWidth: "50px",
  height: "42px",
};

const filtrosButtonStyle: React.CSSProperties = {
  backgroundColor: "#e5e7eb",
  color: "#374151",
  padding: "0.6rem 1.2rem",
  borderRadius: "10px",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: "1rem",
  fontFamily: "Montserrat, sans-serif",
  flexShrink: 0,
  height: "42px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const tableWrapperStyle: React.CSSProperties = {
  overflowX: "auto",
  borderRadius: "12px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
  backgroundColor: "#fff",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "800px",
};

const thStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  backgroundColor: "#5C5C5C",
  color: "white",
  fontWeight: 600,
  textAlign: "left",
  fontSize: "1rem",
  fontFamily: "Montserrat, sans-serif",
  height: "auto",
};

const tdStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "0.9375rem",
  fontFamily: "Roboto, sans-serif",
  fontWeight: 400,
  textAlign: "left",
  height: "auto",
};