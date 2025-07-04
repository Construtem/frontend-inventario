"use client";

import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";

// =====================
// 1. INTERFAZ DE DATOS
// =====================
interface StockBodega {
  id: number;
  idStock: string;
  idBodega: string;
  idProducto: string;
  cantidad: number;
}

// =====================
// 2. COMPONENTE PRINCIPAL
// =====================
export default function StockBodegaCentralPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // =====================
  // 3. DATOS DE EJEMPLO
  // =====================
  const stockBodegaData: StockBodega[] = [
    {
      id: 1,
      idStock: "STK001",
      idBodega: "BOD001",
      idProducto: "PROD001",
      cantidad: 150
    },
    {
      id: 2,
      idStock: "STK002",
      idBodega: "BOD001",
      idProducto: "PROD002",
      cantidad: 85
    },
    {
      id: 3,
      idStock: "STK003",
      idBodega: "BOD002",
      idProducto: "PROD003",
      cantidad: 230
    },
    {
      id: 4,
      idStock: "STK004",
      idBodega: "BOD001",
      idProducto: "PROD004",
      cantidad: 42
    },
    {
      id: 5,
      idStock: "STK005",
      idBodega: "BOD003",
      idProducto: "PROD005",
      cantidad: 76
    },
    {
      id: 6,
      idStock: "STK006",
      idBodega: "BOD002",
      idProducto: "PROD006",
      cantidad: 199
    },
    {
      id: 7,
      idStock: "STK007",
      idBodega: "BOD001",
      idProducto: "PROD007",
      cantidad: 312
    },
    {
      id: 8,
      idStock: "STK008",
      idBodega: "BOD003",
      idProducto: "PROD008",
      cantidad: 58
    }
  ];

  // =====================
  // 4. FILTRAR DATOS
  // =====================
  const filteredData = stockBodegaData.filter(item => {
    const matchesSearch = 
      item.idStock.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.idBodega.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.idProducto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cantidad.toString().includes(searchTerm);

    return matchesSearch;
  });

  // =====================
  // 5. UI
  // =====================
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Stock bodega central</h1>

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
                <th style={thStyle}>ID Stock</th>
                <th style={thStyle}>ID Bodega</th>
                <th style={thStyle}>ID Producto</th>
                <th style={thStyle}>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={4} style={tdStyle}>
                    No hay registros de stock disponibles
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id}>
                    <td style={tdStyle}>{item.idStock}</td>
                    <td style={tdStyle}>{item.idBodega}</td>
                    <td style={tdStyle}>{item.idProducto}</td>
                    <td style={tdStyle}>{item.cantidad}</td>
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
  marginBottom: "2rem",
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
  minWidth: "600px",
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