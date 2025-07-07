"use client";

import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";

// =====================
// 1. INTERFACES DE DATOS
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

interface DespachoBackend {
  id: number;
  cotizacion_id: number;
  camion_id: number;
  origen: number;
  destino: number;
  fecha_despacho: string;
  valor_despacho: number;
  cantidad_items: number;
  total_kg: number;
  cotizacion?: {
    cliente?: {
      nombre: string;
      email: string;
    };
    estado?: string;
  };
  camion?: {
    patente: string;
  };
  origen_sucursal?: {
    nombre: string;
  };
  destino_dir_cliente?: {
    direccion: string;
    comuna: string;
    ciudad: string;
  };
}

// =====================
// 2. COMPONENTE PRINCIPAL
// =====================
export default function DespachoPage() {
  const [despachos, setDespachos] = useState<Despacho[]>([]);
  const [loading, setLoading] = useState(true);
  const [sucursal, setSucursal] = useState("");
  const [estado, setEstado] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  // =====================
  // 3. CARGA DE DATOS
  // =====================
  useEffect(() => {
    const fetchDespachos = async () => {
      try {
        setLoading(true);
        setError("");
        
        const res = await fetch("http://localhost:8080/api/despachos");
        if (!res.ok) throw new Error("Error al cargar despachos");

        const raw = await res.json();
        console.log("Datos recibidos del backend:", raw); // Para debug

        const clean: Despacho[] = raw.map((d: DespachoBackend) => ({
          id: d.id,
          cliente: d.cotizacion?.cliente?.nombre || "Cliente no definido",
          origen: d.origen_sucursal?.nombre || "Sucursal desconocida",
          destino: d.destino_dir_cliente?.direccion || "Dirección desconocida",
          fechaDespacho: d.fecha_despacho,
          valorDespacho: Number(d.valor_despacho || 0),
          estado: d.cotizacion?.estado || "pendiente",
          camion: d.camion?.patente || "Camión no asignado",
          cantidadItems: d.cantidad_items || 0,
          totalKg: d.total_kg || 0,
        }));

        setDespachos(clean);
      } catch (error: unknown) {
        console.error("Error fetching despachos:", error);
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
        setError(errorMessage);
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

  // Filtrar despachos basado en los filtros activos
  const filteredDespachos = despachos.filter((d) => {
    const matchesSearch = search === "" || 
      `${d.cliente} ${d.origen} ${d.destino} ${d.camion} ${d.estado}`
        .toLowerCase()
        .includes(search.toLowerCase());
    
    const matchesSucursal = sucursal === "" || d.origen === sucursal;
    const matchesEstado = estado === "" || d.estado === estado;
    
    return matchesSearch && matchesSucursal && matchesEstado;
  });

  // =====================
  // 5. UI
  // =====================
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Gestión de Despachos</h1>

        {/* Filtros */}
        <div style={filterRowStyle}>
          <input
            type="text"
            placeholder="Buscar despachos..."
            style={selectStyle}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            style={selectStyle}
            value={sucursal}
            onChange={(e) => setSucursal(e.target.value)}
          >
            <option value="">Todas las Sucursales</option>
            <option value="Sucursal 1">Sucursal 1</option>
            <option value="Sucursal 2">Sucursal 2</option>
            <option value="Sucursal 3">Sucursal 3</option>
          </select>

          <select
            style={selectStyle}
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            <option value="">Todos los Estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="enviado">Enviado</option>
            <option value="aprobado">Aprobado</option>
            <option value="cancelado">Cancelado</option>
          </select>

          <button 
            style={searchButtonStyle}
            onClick={() => {
              // Aquí puedes agregar lógica adicional si es necesaria
              console.log("Filtros aplicados:", { sucursal, estado, search });
            }}
          >
            <FaSearch />
            Buscar
          </button>
        </div>

        {/* Mostrar errores si existen */}
        {error && (
          <div style={{
            backgroundColor: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1rem"
          }}>
            {error}
          </div>
        )}

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
                  "PDF",
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
                  <td colSpan={12} style={tdStyle}>
                    Cargando...
                  </td>
                </tr>
              ) : filteredDespachos.length === 0 ? (
                <tr>
                  <td colSpan={12} style={tdStyle}>
                    {despachos.length === 0 ? "No hay despachos disponibles" : "No se encontraron despachos con los filtros aplicados"}
                  </td>
                </tr>
              ) : (
                filteredDespachos.map((d) => (
                  <tr key={d.id}>
                    <td style={tdStyle}>#{d.id}</td>
                    <td style={tdStyle}>{d.cliente}</td>
                    <td style={tdStyle}>{d.origen}</td>
                    <td style={tdStyle}>{d.destino}</td>
                    <td style={tdStyle}>
                      {new Date(d.fechaDespacho).toLocaleDateString()}
                    </td>
                    <td style={tdStyle}>${d.valorDespacho.toLocaleString()}</td>
                    <td style={{
                      ...tdStyle,
                      fontWeight: "600",
                      color: d.estado === "aprobado" ? "#16a34a" : 
                             d.estado === "enviado" ? "#2563eb" :
                             d.estado === "cancelado" ? "#dc2626" : "#f59e0b"
                    }}>
                      {d.estado.charAt(0).toUpperCase() + d.estado.slice(1)}
                    </td>
                    <td style={tdStyle}>{d.camion}</td>
                    <td style={tdStyle}>{d.cantidadItems}</td>
                    <td style={tdStyle}>{d.totalKg} kg</td>
                    <td style={tdStyle}>
                      <a
                        href={`http://localhost:8080/api/despachos/${d.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#ff7300",
                          fontWeight: "bold",
                          textDecoration: "none",
                        }}
                      >
                        Ver PDF
                      </a>
                    </td>
                    <td style={tdStyle}>
                      <span
                        onClick={() => handleDelete(d.id)}
                        style={deleteIconStyle}
                        title="Eliminar despacho"
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
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "1rem",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  transition: "background-color 0.3s ease",
  fontFamily: "Roboto, sans-serif",
};

const tableWrapperStyle: React.CSSProperties = {
  overflowX: "auto",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  backgroundColor: "#ffffff",
};

const thStyle: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  padding: "1rem",
  textAlign: "left",
  fontWeight: "600",
  fontSize: "0.875rem",
  color: "#374151",
  borderBottom: "1px solid #e5e7eb",
  fontFamily: "Roboto, sans-serif",
};

const tdStyle: React.CSSProperties = {
  padding: "1rem",
  fontSize: "0.875rem",
  color: "#6b7280",
  borderBottom: "1px solid #f3f4f6",
  fontFamily: "Roboto, sans-serif",
};

const deleteIconStyle: React.CSSProperties = {
  cursor: "pointer",
  fontSize: "1.2rem",
  color: "#ef4444",
  transition: "color 0.3s ease",
};
