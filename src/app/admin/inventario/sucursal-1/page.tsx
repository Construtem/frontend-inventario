"use client";

import React from "react";

export default function Sucursal1Page() {
  // Aquí puedes traer los datos reales del inventario con un fetch o similar
  // const inventario = [...]

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Inventario Sucursal 1</h1>

        <div style={toolbarStyle}>
          <div style={searchContainerStyle}>
            <input
              type="text"
              placeholder="Escriba su búsqueda..."
              style={inputStyle}
            />
            <button style={addButtonStyle}>+</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <button style={editButtonStyle}>
              Modificar Inventario
            </button>
            <select style={selectStyle}>
              <option value="">Filtrar por</option>
              {/* Agrega opciones reales aquí */}
            </select>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                {[
                  "SKU",
                  "Nombre",
                  "Descripción",
                  "Peso (KG)",
                  "Largo (CM)",
                  "Ancho (CM)",
                  "Alto (CM)",
                  "Precio (C/U)",
                  "Stock",
                  "Sucursal",
                ].map((col) => (
                  <th key={col} style={thStyle}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Aquí puedes mapear tus datos reales */}
              {[...Array(8)].map((_, index) => (
                <tr key={index}>
                  {Array(10)
                    .fill(null)
                    .map((_, colIndex) => (
                      <td
                        key={colIndex}
                        style={{
                          ...tdStyle,
                          backgroundColor:
                            index % 2 === 0 ? "#f9fafb" : "#ffffff",
                        }}
                      >
                        {/* Inserta datos reales aquí */}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Estilos en variables ---
const containerStyle: React.CSSProperties = {
  marginLeft: "180px",
  marginTop: "70px",
  padding: "2rem",
  boxSizing: "border-box",
  minHeight: "calc(100vh - 70px)",
  backgroundColor: "#f5f5f5",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "white",
  borderRadius: "12px",
  padding: "2rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

// ...existing code...
const titleStyle: React.CSSProperties = {
  color: "rgb(34, 34, 34)",
  fontSize: "2rem",
  fontWeight: "bold",
  marginBottom: "2rem",
  fontFamily: "Montserrat, sans-serif",
};
// ...existing code...

const toolbarStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "1rem",
  flexWrap: "wrap",
  gap: "1rem",
};

const searchContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  flex: 1,
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: "0.5rem 1rem",
  border: "1px solid #ccc",
  borderRadius: "8px 0 0 8px",
  outline: "none",
};

const addButtonStyle: React.CSSProperties = {
  backgroundColor: "#5C5C5C",
  color: "white",
  padding: "0.5rem 1rem",
  border: "none",
  borderRadius: "0 8px 8px 0",
  cursor: "pointer",
};

const editButtonStyle: React.CSSProperties = {
  backgroundColor: "#5C5C5C",
  color: "white",
  padding: "0.5rem 1.2rem",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  height: "40px",
};

const selectStyle: React.CSSProperties = {
  padding: "0.5rem 1rem",
  borderRadius: "8px",
  border: "1px solid #ccc",
  outline: "none",
  height: "40px",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "900px",
};

const thStyle: React.CSSProperties = {
  padding: "0.75rem",
  backgroundColor: "#5C5C5C",
  color: "white",
  fontWeight: "bold",
  textAlign: "left",
  fontSize: "0.875rem",
};

const tdStyle: React.CSSProperties = {
  padding: "0.75rem",
  borderBottom: "1px solid #e5e7eb",
};