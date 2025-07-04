"use client";

import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";

interface InventarioProveedor {
  id: number;
  sku: string;
  nombreProducto: string;
  proveedor: string;
  pesoKg: number;
  largoCm: number;
  anchoCm: number;
  altoCm: number;
  precioCU: number;
  stock: number;
  fechaIngreso: string;
}

export default function InventarioProveedoresPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Datos de ejemplo para inventario de proveedores
  const inventarioData: InventarioProveedor[] = [
    {
      id: 1,
      sku: "SKU001",
      nombreProducto: "Laptop Dell Inspiron",
      proveedor: "Tech Solutions",
      pesoKg: 2.5,
      largoCm: 35.6,
      anchoCm: 23.4,
      altoCm: 2.1,
      precioCU: 850.00,
      stock: 15,
      fechaIngreso: "2025-01-15"
    },
    {
      id: 2,
      sku: "SKU002",
      nombreProducto: "Mouse Logitech MX",
      proveedor: "Periféricos SA",
      pesoKg: 0.1,
      largoCm: 12.5,
      anchoCm: 8.5,
      altoCm: 4.2,
      precioCU: 75.00,
      stock: 50,
      fechaIngreso: "2025-02-10"
    },
    {
      id: 3,
      sku: "SKU003",
      nombreProducto: "Monitor Samsung 27\"",
      proveedor: "Displays Corp",
      pesoKg: 5.8,
      largoCm: 61.3,
      anchoCm: 20.5,
      altoCm: 45.7,
      precioCU: 320.00,
      stock: 8,
      fechaIngreso: "2025-03-05"
    },
    {
      id: 4,
      sku: "SKU004",
      nombreProducto: "Teclado Mecánico RGB",
      proveedor: "Gaming Gear",
      pesoKg: 1.2,
      largoCm: 44.0,
      anchoCm: 13.5,
      altoCm: 3.8,
      precioCU: 120.00,
      stock: 25,
      fechaIngreso: "2025-04-12"
    },
    {
      id: 5,
      sku: "SKU005",
      nombreProducto: "Impresora HP LaserJet",
      proveedor: "Office Solutions",
      pesoKg: 18.5,
      largoCm: 42.0,
      anchoCm: 39.8,
      altoCm: 31.2,
      precioCU: 450.00,
      stock: 5,
      fechaIngreso: "2025-05-20"
    }
  ];

  // Filtrar datos según búsqueda
  const filteredData = inventarioData.filter(item => {
    const matchesSearch = 
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nombreProducto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.proveedor.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleModificar = () => {
    alert('Abriendo formulario para modificar inventario...');
  };
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header con título y botón */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>Inventario de Proveedores</h1>
          <button style={modificarButtonStyle} onClick={handleModificar}>
            Modificar Inventario
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
                <th style={thStyle}>SKU</th>
                <th style={thStyle}>Nombre Producto</th>
                <th style={thStyle}>Proveedor</th>
                <th style={thStyle}>Peso (KG)</th>
                <th style={thStyle}>Largo (CM)</th>
                <th style={thStyle}>Ancho (CM)</th>
                <th style={thStyle}>Alto (CM)</th>
                <th style={thStyle}>Precio(C/U)</th>
                <th style={thStyle}>Stock</th>
                <th style={thStyle}>Fecha Ingreso</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={10} style={tdStyle}>
                    No hay productos disponibles
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id}>
                    <td style={tdStyle}>{item.sku}</td>
                    <td style={tdStyle}>{item.nombreProducto}</td>
                    <td style={tdStyle}>{item.proveedor}</td>
                    <td style={tdStyle}>{item.pesoKg}</td>
                    <td style={tdStyle}>{item.largoCm}</td>
                    <td style={tdStyle}>{item.anchoCm}</td>
                    <td style={tdStyle}>{item.altoCm}</td>
                    <td style={tdStyle}>${item.precioCU.toFixed(2)}</td>
                    <td style={tdStyle}>{item.stock}</td>
                    <td style={tdStyle}>{new Date(item.fechaIngreso).toLocaleDateString()}</td>
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
  marginBottom: "1rem",
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