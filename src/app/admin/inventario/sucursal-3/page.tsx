"use client";

export default function Sucursal3Page() {
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Sucursal 3</h2>
        <p style={textStyle}>
          Aquí puedes mostrar el inventario, estadísticas o información relevante de la Sucursal 3.
        </p>
      </div>
    </div>
  );
}

// --- CSS en JS ---
const containerStyle: React.CSSProperties = {
  marginLeft: "180px", // ancho del sidebar
  marginTop: "70px",   // alto del header
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

const titleStyle: React.CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: "bold",
  marginBottom: "1rem",
  color: "#1f2937",
};

const textStyle: React.CSSProperties = {
  color: "#4b5563",
  lineHeight: "1.6",
};