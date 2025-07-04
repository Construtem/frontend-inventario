"use client";

import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";

interface Proveedor {
  id: number;
  idProveedor: string;
  nombre: string;
  correoElectronico: string;
  telefono: string;
  direccion: string;
}

export default function GestionProveedoresPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Datos de ejemplo para gestión de proveedores
  const proveedoresData: Proveedor[] = [
    {
      id: 1,
      idProveedor: "PROV001",
      nombre: "Tech Solutions S.A.",
      correoElectronico: "contacto@techsolutions.com",
      telefono: "+1-555-0123",
      direccion: "Av. Principal 123, Ciudad Tech"
    },
    {
      id: 2,
      idProveedor: "PROV002",
      nombre: "Periféricos SA",
      correoElectronico: "ventas@perifericos.com",
      telefono: "+1-555-0456",
      direccion: "Calle Comercio 456, Zona Industrial"
    },
    {
      id: 3,
      idProveedor: "PROV003",
      nombre: "Displays Corp",
      correoElectronico: "info@displayscorp.com",
      telefono: "+1-555-0789",
      direccion: "Boulevard Digital 789, Centro Empresarial"
    },
    {
      id: 4,
      idProveedor: "PROV004",
      nombre: "Gaming Gear",
      correoElectronico: "soporte@gaminggear.com",
      telefono: "+1-555-0321",
      direccion: "Plaza Gaming 321, Distrito Tecnológico"
    },
    {
      id: 5,
      idProveedor: "PROV005",
      nombre: "Office Solutions",
      correoElectronico: "admin@officesol.com",
      telefono: "+1-555-0654",
      direccion: "Sector Oficinas 654, Complejo Corporativo"
    }
  ];

  // Filtrar datos según búsqueda
  const filteredData = proveedoresData.filter(item => {
    const matchesSearch = 
      item.idProveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.correoElectronico.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.telefono.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.direccion.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleModificar = () => {
    alert('Abriendo formulario para modificar proveedor...');
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header con título y botón */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>Gestión de proveedores</h1>
          <button style={modificarButtonStyle} onClick={handleModificar}>
            Modificar Proveedor
          </button>
        </div>

        {/* Fila de búsqueda y filtros */}
        <div style={filterRowStyle}>
          {/* Input de búsqueda */}
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
                <th style={thStyle}>ID Proveedor</th>
                <th style={thStyle}>Nombre</th>
                <th style={thStyle}>Correo electrónico</th>
                <th style={thStyle}>Teléfono</th>
                <th style={thStyle}>Dirección</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} style={tdStyle}>
                    No hay proveedores disponibles
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id}>
                    <td style={tdStyle}>{item.idProveedor}</td>
                    <td style={tdStyle}>{item.nombre}</td>
                    <td style={tdStyle}>{item.correoElectronico}</td>
                    <td style={tdStyle}>{item.telefono}</td>
                    <td style={tdStyle}>{item.direccion}</td>
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
  marginLeft: "0px",
  marginTop: "70px",
  padding: "2rem",
  boxSizing: "border-box",
  minHeight: "calc(100vh - 70px)",
  backgroundColor: "#f5f5f5",
  borderRadius: "20px",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "white",
  borderRadius: "12px",
  padding: "2rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const titleStyle: React.CSSProperties = {
  fontSize: "1.75rem",
  fontWeight: "bold",
  marginBottom: "0",
  color: "#1f2937",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1.5rem",
};

const modificarButtonStyle: React.CSSProperties = {
  backgroundColor: "#ff7300",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "10px 20px",
  fontSize: "14px",
  fontWeight: "500",
  cursor: "pointer",
  transition: "background-color 0.2s",
};

const filterRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "1.5rem",
};

const searchContainerStyle: React.CSSProperties = {
  flex: "1",
  maxWidth: "45%",
};

const searchInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 15px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

const searchButtonStyle: React.CSSProperties = {
  backgroundColor: "#ff7300",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "10px 15px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "14px",
  minWidth: "45px",
  height: "42px",
};

const filtrosButtonStyle: React.CSSProperties = {
  backgroundColor: "#6b7280",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "10px 15px",
  fontSize: "14px",
  cursor: "pointer",
  height: "42px",
};

const tableWrapperStyle: React.CSSProperties = {
  overflowX: "auto",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  backgroundColor: "white",
};

const thStyle: React.CSSProperties = {
  backgroundColor: "#374151",
  color: "white",
  padding: "12px 16px",
  textAlign: "left",
  fontSize: "14px",
  fontWeight: "600",
  borderBottom: "1px solid #4b5563",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "14px",
  color: "#374151",
};