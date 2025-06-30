"use client";

import React, { useState } from "react";
import { FaSearch, FaPlus } from "react-icons/fa";

export default function DespachoPage() {
  const [sucursal, setSucursal] = useState("");
  const [estado, setEstado] = useState("");
  const [fecha, setFecha] = useState("");

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Gestión de Despachos</h1>

        {/* Filtros */}
        <div style={filterRowStyle}>
          <select
            style={selectStyle}
            value={sucursal}
            onChange={(e) => setSucursal(e.target.value)}
          >
            <option value="">Sucursal</option>
            <option value="Sucursal 1">Sucursal 1</option>
            <option value="Sucursal 2">Sucursal 2</option>
          </select>

          <select
            style={selectStyle}
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            <option value="">Estado</option>
            <option value="pendiente">Pendiente</option>
            <option value="enviado">Enviado</option>
          </select>

          <input
            type="text"
            placeholder="dd/mm/aaaa - dd/mm/aaaa"
            style={selectStyle}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />

          <button style={searchButtonStyle}>
            <FaSearch style={{ marginRight: "8px" }} />
            Buscar
          </button>

          <button style={createButtonStyle}>
            <FaPlus style={{ marginRight: "8px" }} />
            Nuevo Despacho
          </button>
        </div>

        {/* Tabla */}
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID Despacho</th>
                <th style={thStyle}>Cliente</th>
                <th style={thStyle}>Dirección</th>
                <th style={thStyle}>Fecha despacho</th>
                <th style={thStyle}>Sucursal</th>
                <th style={thStyle}>Estado</th>
                <th style={thStyle}>Cant. Items</th>
                <th style={thStyle}>Total kg</th>
                <th style={thStyle}>Aprobar</th>
                <th style={thStyle}>Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }).map((_, idx) => (
                <tr key={idx}>
                  <td style={tdStyle}>#00{idx + 1}</td>
                  <td style={tdStyle}>Cliente {idx + 1}</td>
                  <td style={tdStyle}>Dirección {idx + 1}</td>
                  <td style={tdStyle}>01/07/2025</td>
                  <td style={tdStyle}>Sucursal 1</td>
                  <td style={tdStyle}>Pendiente</td>
                  <td style={tdStyle}>3</td>
                  <td style={tdStyle}>25</td>
                  <td style={tdStyle}>
                    <input type="checkbox" />
                  </td>
                  <td style={tdStyle}>
                    <span style={{ cursor: "pointer", color: "crimson" }}>
                      🗑️
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== ESTILOS ====================

const containerStyle: React.CSSProperties = {
  padding: "2rem",
  minHeight: "calc(100vh - 70px)",
  backgroundColor: "#f5f5f5",
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

const selectStyle: React.CSSProperties = {
  padding: "0.6rem 1rem",
  borderRadius: "10px",
  border: "1px solid #ccc",
  fontSize: "1rem",
  flex: "1 1 200px",
};

const searchButtonStyle: React.CSSProperties = {
  backgroundColor: "#e5e5e5",
  color: "#000",
  padding: "0.6rem 1rem",
  borderRadius: "10px",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
};

const createButtonStyle: React.CSSProperties = {
  backgroundColor: "#FF7300",
  color: "#fff",
  padding: "0.6rem 1.2rem",
  borderRadius: "10px",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
};

const tableContainerStyle: React.CSSProperties = {
  overflowX: "auto",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle: React.CSSProperties = {
  backgroundColor: "#333",
  color: "#fff",
  padding: "0.8rem",
  textAlign: "left",
};

const tdStyle: React.CSSProperties = {
  padding: "0.8rem",
  borderBottom: "1px solid #ccc",
};
