"use client";

import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";

interface Sucursal {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  gerente: string;
  estado: string;
  fechaApertura: string;
  empleados: number;
}

export default function SucursalesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Datos de ejemplo para sucursales
  const sucursalesData: Sucursal[] = [
    { 
      id: 1, 
      nombre: 'Sucursal Centro', 
      direccion: 'Av. Principal 123, Centro', 
      telefono: '123-456-7890', 
      gerente: 'Ana López Martínez',
      estado: 'Activa',
      fechaApertura: '2020-01-15',
      empleados: 25
    },
    { 
      id: 2, 
      nombre: 'Sucursal Norte', 
      direccion: 'Calle Norte 456, Zona Norte', 
      telefono: '098-765-4321', 
      gerente: 'Carlos Méndez García',
      estado: 'Activa',
      fechaApertura: '2021-03-20',
      empleados: 18
    },
    { 
      id: 3, 
      nombre: 'Sucursal Sur', 
      direccion: 'Blvd. Sur 789, Zona Sur', 
      telefono: '555-123-4567', 
      gerente: 'María Rodríguez Silva',
      estado: 'Activa',
      fechaApertura: '2021-08-10',
      empleados: 22
    },
    { 
      id: 4, 
      nombre: 'Sucursal Este', 
      direccion: 'Av. Este 321, Zona Este', 
      telefono: '111-222-3333', 
      gerente: 'Pedro Sánchez López',
      estado: 'En Mantenimiento',
      fechaApertura: '2022-02-28',
      empleados: 15
    },
    { 
      id: 5, 
      nombre: 'Sucursal Oeste', 
      direccion: 'Calle Oeste 654, Zona Oeste', 
      telefono: '777-888-9999', 
      gerente: 'Laura Jiménez Torres',
      estado: 'Activa',
      fechaApertura: '2022-11-05',
      empleados: 20
    },
  ];

  // Filtrar datos según búsqueda
  const filteredData = sucursalesData.filter(sucursal => {
    const matchesSearch = 
      sucursal.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sucursal.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sucursal.gerente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sucursal.telefono.includes(searchTerm);

    return matchesSearch;
  });

  const handleModificar = () => {
    alert('Abriendo formulario para modificar sucursales...');
  };
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header con título y botón */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>Sucursales</h1>
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
                <th style={thStyle}>ID Sucursal</th>
                <th style={thStyle}>Nombre</th>
                <th style={thStyle}>Dirección</th>
                <th style={thStyle}>Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={4} style={tdStyle}>
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