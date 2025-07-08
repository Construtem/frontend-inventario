"use client";

import React, { Suspense } from "react";
import { FaSearch } from "react-icons/fa";

// =====================
// 1. INTERFAZ DE DATOS
// =====================
interface Bodega {
  id: number;
  idBodega: string;
  nombre: string;
  direccion: string;
  telefono: string;
}

// =====================
// 2. COMPONENTE PRINCIPAL
// =====================
export default function ListaBodegasPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ListaBodegasContent />
    </Suspense>
  );
}

// =====================
// 3. COMPONENTE DE CONTENIDO
// =====================
const ListaBodegasContent = () => {
  const [searchTerm, setSearchTerm] = React.useState("");

  // =====================
  // 3. DATOS DE EJEMPLO
  // =====================
  const bodegasData: Bodega[] = [
    {
      id: 1,
      idBodega: "BOD001",
      nombre: "Bodega Central Norte",
      direccion: "Av. Industrial 123, Zona Norte",
      telefono: "+1-555-1001"
    },
    {
      id: 2,
      idBodega: "BOD002",
      nombre: "Bodega Central Sur",
      direccion: "Calle Logística 456, Sector Sur",
      telefono: "+1-555-1002"
    },
    {
      id: 3,
      idBodega: "BOD003",
      nombre: "Bodega Central Este",
      direccion: "Boulevard Comercial 789, Zona Este",
      telefono: "+1-555-1003"
    },
    {
      id: 4,
      idBodega: "BOD004",
      nombre: "Bodega Central Oeste",
      direccion: "Av. Distribución 321, Sector Oeste",
      telefono: "+1-555-1004"
    },
    {
      id: 5,
      idBodega: "BOD005",
      nombre: "Bodega Central Principal",
      direccion: "Plaza Industrial 654, Centro",
      telefono: "+1-555-1005"
    },
    {
      id: 6,
      idBodega: "BOD006",
      nombre: "Bodega Auxiliar A",
      direccion: "Parque Empresarial 987, Zona A",
      telefono: "+1-555-1006"
    }
  ];

  // =====================
  // 4. FILTRAR DATOS
  // =====================
  const filteredData = bodegasData.filter(item => {
    const matchesSearch = 
      item.idBodega.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.telefono.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleModificar = () => {
    alert('Abriendo formulario para modificar bodegas...');
  };

  // =====================
  // 5. UI
  // =====================
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header con título y botón */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>Lista de bodegas centrales</h1>
          <button style={modificarButtonStyle} onClick={handleModificar}>
            Modificar Bodegas
          </button>
        </div>

        {/* Filtros */}
        <div style={filterRowStyle}>
          <input
            type="text"
            placeholder="Escriba su búsqueda..."
            style={searchInputStyle}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button style={searchButtonStyle}>
            <FaSearch />
          </button>

          <button style={filtrosButtonStyle}>
            Filtros
          </button>
        </div>

        {/* Tabla */}
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID Bodega</th>
                <th style={thStyle}>Nombre</th>
                <th style={thStyle}>Dirección</th>
                <th style={thStyle}>Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={4} style={tdStyle}>
                    No hay bodegas disponibles
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id}>
                    <td style={tdStyle}>{item.idBodega}</td>
                    <td style={tdStyle}>{item.nombre}</td>
                    <td style={tdStyle}>{item.direccion}</td>
                    <td style={tdStyle}>{item.telefono}</td>
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

// =====================
// 6. ESTILOS
// =====================

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
  marginBottom: "0",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "2rem",
};

const modificarButtonStyle: React.CSSProperties = {
  backgroundColor: "#ff7300",
  color: "#fff",
  padding: "0.6rem 1.2rem",
  borderRadius: "10px",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
  fontFamily: "Montserrat, sans-serif",
  fontSize: "1rem",
};

const filterRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "1rem",
  flexWrap: "wrap",
  alignItems: "center",
  marginBottom: "2rem",
};

const searchInputStyle: React.CSSProperties = {
  padding: "0.6rem 1rem",
  borderRadius: "10px",
  border: "1px solid #ccc",
  fontSize: "1rem",
  flex: "1 1 300px",
  fontFamily: "Roboto, sans-serif",
  maxWidth: "400px",
};

const searchButtonStyle: React.CSSProperties = {
  backgroundColor: "#ff7300",
  color: "#fff",
  padding: "0.6rem 1.2rem",
  borderRadius: "10px",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontFamily: "Montserrat, sans-serif",
  minWidth: "50px",
  justifyContent: "center",
};

const filtrosButtonStyle: React.CSSProperties = {
  backgroundColor: "#6b7280",
  color: "#fff",
  padding: "0.6rem 1.2rem",
  borderRadius: "10px",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
  fontFamily: "Montserrat, sans-serif",
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
  minWidth: "700px",
};

const thStyle: React.CSSProperties = {
  padding: "0.55rem 0.9rem",
  backgroundColor: "#5C5C5C",
  color: "white",
  fontWeight: 600,
  textAlign: "center",
  fontSize: "1rem",
  fontFamily: "Montserrat, sans-serif",
  height: "38px",
};

const tdStyle: React.CSSProperties = {
  padding: "0.55rem 0.9rem",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "0.9375rem",
  fontFamily: "Roboto, sans-serif",
  fontWeight: 400,
  textAlign: "center",
  height: "38px",
};