"use client";

export default function SucursalesPage() {
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Lista de sucursales</h1>
        <p style={textStyle}>
          Informacion de las sucursales
        </p>
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

const textStyle: React.CSSProperties = {
  color: "#4b5563",
  lineHeight: "1.6",
};