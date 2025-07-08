"use client";

import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";

// =====================
// 1. INTERFAZ DE DATOS
// =====================
interface Despacho {
  id: number;
  cliente: string;
  origen: string;
  destino: string;
  fechaDespacho: string;
  valorDespacho: number;
  estado: string;
  camion: string;
  cantidadItems: number;
  totalKg: number;
}

// =====================
// 2. COMPONENTE PRINCIPAL
// =====================
export default function DespachoPage() {
  const [despachos, setDespachos] = useState<Despacho[]>([]);
  const [loading, setLoading] = useState(true);
  const [sucursal, setSucursal] = useState("");
  const [estado, setEstado] = useState("");
  const [fecha, setFecha] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  // =====================
  // 3. CARGA DE DATOS
  // =====================
  useEffect(() => {
    const fetchDespachos = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/despachos");
        if (!res.ok) throw new Error("Error al cargar despachos");

        const raw = await res.json();

        const clean: Despacho[] = raw.map((d: any) => ({
          id: d.id,
          cliente: d.cotizacion?.cliente?.rut || "Cliente no definido",
          origen: d.origen_sucursal?.nombre || "Sucursal desconocida",
          destino: d.destino_dir_cliente?.direccion || "Direccion desconocida",
          fechaDespacho: d.fecha_despacho,
          valorDespacho: Number(d.valor_despacho),
          estado: d.cotizacion?.estado || "Estado no definido",
          camion: d.camion?.patente || "Camión no asignado",
          cantidadItems: d.cantidad_items ?? 0,
          totalKg: d.total_kg ?? 0,
        }));

        setDespachos(clean);
      } catch (error: any) {
        console.error("Error fetching despachos:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDespachos();
  }, []);

  // =====================
  // 4. ELIMINAR DESPACHO
  // =====================
  const handleDelete = (id: number) => {
    if (!confirm("¿Deseas eliminar este despacho?")) return;

    fetch(`http://localhost:8080/api/despachos/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al eliminar despacho");
        setDespachos((prev) => prev.filter((d) => d.id !== id));
      })
      .catch((err) => alert(err.message));
  };

  const filtered = despachos.filter((d) => 
    '${d.cliente} ${d.origen} ${d.destino} ${d.camion} ${d.estado}'
    .toLowerCase()
    .includes(search.toLowerCase())
  );

  // =====================
  // 5. UI  aaaaaa
  // =====================
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
            <option value="Sucursal 1">Sucursal 1</option>
            <option value="Sucursal 2">Sucursal 2</option>
            <option value="Sucursal 3">Sucursal 3</option>
          </select>

          <select
            style={selectStyle}
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            <option value="pendiente">Pendiente</option>
            <option value="enviado">Enviado</option>
            <option value="aprobado">Aprobado</option>
            <option value="cancelado">Cancelado</option>
          </select>

          <input
            type="text"
            placeholder="Buscar por fecha..."
            style={selectStyle}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />

          <button style={searchButtonStyle}>
            <FaSearch />
            Buscar
          </button>
        </div>

        {/* Tabla */}
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                {[
                  "ID",
                  "Cliente",
                  "Origen",
                  "Destino",
                  "Fecha Despacho",
                  "Valor Despacho",
                  "Estado",
                  "Camión",
                  "Items",
                  "Total Kg",
                  "Accion",
                ].map((col) => (
                  <th key={col} style={thStyle}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} style={tdStyle}>
                    Cargando...
                  </td>
                </tr>
              ) : despachos.length === 0 ? (
                <tr>
                  <td colSpan={11} style={tdStyle}>
                    No hay despachos disponibles
                  </td>
                </tr>
              ) : (
                despachos.map((d) => (
                  <tr key={d.id}>
                    <td style={tdStyle}>#{d.id}</td>
                    <td style={tdStyle}>{d.cliente}</td>
                    <td style={tdStyle}>{d.origen}</td>
                    <td style={tdStyle}>{d.destino}</td>
                    <td style={tdStyle}>
                      {new Date(d.fechaDespacho).toLocaleDateString()}
                    </td>
                    <td style={tdStyle}>${d.valorDespacho.toLocaleString()}</td>
                    <td style={tdStyle}>{d.estado}</td>
                    <td style={tdStyle}>{d.camion}</td>
                    <td style={tdStyle}>{d.cantidadItems}</td>
                    <td style={tdStyle}>{d.totalKg} kg</td>
                    <td style={tdStyle}>
                      <span
                        onClick={() => handleDelete(d.id)}
                        style={deleteIconStyle}
                      >
                        🗑️
                      </span>
                    </td>
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

const selectStyle: React.CSSProperties = {
  padding: "0.6rem 1rem",
  borderRadius: "10px",
  border: "1px solid #ccc",
  fontSize: "1rem",
  flex: "1 1 200px",
  fontFamily: "Roboto, sans-serif",
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
  minWidth: "1100px",
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

const deleteIconStyle: React.CSSProperties = {
  cursor: "pointer",
  color: "crimson",
  fontSize: "1.2rem",
};
