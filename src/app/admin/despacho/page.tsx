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
  const [isOffline, setIsOffline] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // =====================
  // 3. DATOS DE EJEMPLO (MOCK DATA)
  // =====================
  const getMockDespachos = (): Despacho[] => [
    {
      id: 1,
      cliente: "Empresa ABC",
      origen: "Sucursal 1",
      destino: "Av. Principal 123, Santiago",
      fechaDespacho: "2024-01-15",
      valorDespacho: 45000,
      estado: "pendiente",
      camion: "AB-1234",
      cantidadItems: 15,
      totalKg: 250.5
    },
    {
      id: 2,
      cliente: "Corporación XYZ",
      origen: "Sucursal 2",
      destino: "Calle Norte 456, Valparaíso",
      fechaDespacho: "2024-01-16",
      valorDespacho: 67000,
      estado: "enviado",
      camion: "CD-5678",
      cantidadItems: 23,
      totalKg: 189.3
    },
    {
      id: 3,
      cliente: "Distribuidora DEF",
      origen: "Sucursal 3",
      destino: "Ruta Sur 789, Concepción",
      fechaDespacho: "2024-01-17",
      valorDespacho: 38000,
      estado: "aprobado",
      camion: "EF-9012",
      cantidadItems: 12,
      totalKg: 156.8
    }
  ];

  // =====================
  // 4. CARGA DE DATOS CON MANEJO DE ERRORES
  // =====================
  useEffect(() => {
    const fetchDespachos = async () => {
      try {
        setLoading(true);
        setError("");
        setIsOffline(false);
        
        // Intentar conectar al backend con timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
        
        const res = await fetch("https://api-inventario.tssw.cl/api/despachos", {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) {
          throw new Error(`Error del servidor: ${res.status} ${res.statusText}`);
        }

        const raw = await res.json();
        console.log("Datos recibidos del backend:", raw);

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
        console.warn("Backend no disponible, usando datos de ejemplo:", error);
        
        // Determinar tipo de error
        let errorMessage = "Error desconocido al cargar datos";
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            errorMessage = "Tiempo de espera agotado al conectar con el servidor";
          } else if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
            errorMessage = "No se pudo conectar al servidor backend";
          } else {
            errorMessage = error.message;
          }
        }
        
        setError(errorMessage);
        setIsOffline(true);
        // Cargar datos de ejemplo cuando el backend no esté disponible
        setDespachos(getMockDespachos());
        
      } finally {
        setLoading(false);
      }
    };

    fetchDespachos();
  }, []);

  // =====================
  // 5. FUNCIÓN PARA REINTENTAR CONEXIÓN
  // =====================
  const handleRetry = () => {
    setError("");
    setIsOffline(false);
    window.location.reload(); // Recargar la página para reintentar
  };

  // =====================
  // 6. ELIMINAR DESPACHO CON MANEJO DE ERRORES
  // =====================
  const handleDelete = async (id: number) => {
    if (!confirm("¿Deseas eliminar este despacho?")) return;

    if (isOffline) {
      alert("No se puede eliminar en modo offline. Reconecta al servidor.");
      return;
    }

    try {
      const res = await fetch(`https://api-inventario.tssw.cl/api/despachos/${id}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        throw new Error(`Error al eliminar despacho: ${res.status} ${res.statusText}`);
      }
      
      setDespachos((prev) => prev.filter((d) => d.id !== id));
      
    } catch (error) {
      console.error("Error al eliminar despacho:", error);
      const message = error instanceof Error ? error.message : "Error desconocido al eliminar";
      alert(`Error: ${message}`);
    }
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

  // Funciones de paginación
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handlePageClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Renderizar botones de paginación
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtonsToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtonsToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxButtonsToShow - 1);

    if (endPage - startPage + 1 < maxButtonsToShow) {
      startPage = Math.max(1, endPage - maxButtonsToShow + 1);
    }

    if (startPage > 1) {
      buttons.push(
        <button key="1" onClick={() => handlePageClick(1)} style={paginationButtonBaseStyle}>
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(<span key="dots-start" style={paginationDotsStyle}>...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageClick(i)}
          style={{
            ...paginationButtonBaseStyle,
            ...(currentPage === i ? paginationButtonActiveStyle : {}),
          }}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="dots-end" style={paginationDotsStyle}>...</span>);
      }
      buttons.push(
        <button key={totalPages} onClick={() => handlePageClick(totalPages)} style={paginationButtonBaseStyle}>
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  // Calcular datos paginados y total de páginas
  const currentTableData = filteredDespachos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredDespachos.length / itemsPerPage);

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

        {/* Mostrar errores y estado offline */}
        {error && (
          <div style={{
            backgroundColor: isOffline ? "#fef3c7" : "#fee2e2",
            border: `1px solid ${isOffline ? "#f59e0b" : "#fecaca"}`,
            color: isOffline ? "#92400e" : "#dc2626",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <strong>{isOffline ? "⚠️ Modo Offline" : "❌ Error de conexión"}</strong>
              <br />
              {error}
              {isOffline && (
                <>
                  <br />
                  <small>Mostrando datos de ejemplo. Los cambios no se guardarán.</small>
                </>
              )}
            </div>
            <button 
              onClick={handleRetry}
              style={{
                backgroundColor: isOffline ? "#f59e0b" : "#dc2626",
                color: "white",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.9rem"
              }}
            >
              🔄 Reintentar
            </button>
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
                currentTableData.map((d) => (
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
                        href={`https://api-inventario.tssw.cl/api/despachos/${d.id}/pdf`}
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

        {/* Paginación */}
        {filteredDespachos.length > 0 && (
          <div style={paginationContainerStyle}>
            <div style={paginationControlsStyle}>
              <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1} 
                style={paginationButtonBaseStyle}
              >
                Anterior
              </button>
              <div style={paginationButtonsWrapperStyle}>
                {renderPaginationButtons()}
              </div>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                style={{ ...paginationButtonBaseStyle, ...paginationNextButtonStyle }}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
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
  backgroundColor: "#5c5c5c",
  padding: "1rem",
  textAlign: "left",
  fontWeight: "600",
  fontSize: "0.875rem",
  color: "#fff",
  borderBottom: "1px solid #e5e7eb",
  fontFamily: "Roboto, sans-serif",
};

const tdStyle: React.CSSProperties = {
  padding: "1rem",
  fontSize: "0.875rem",
  color: "#2d2d2d",
  borderBottom: "1px solid #f3f4f6",
  fontFamily: "Roboto, sans-serif",
};

const deleteIconStyle: React.CSSProperties = {
  cursor: "pointer",
  fontSize: "1.2rem",
  color: "#ef4444",
  transition: "color 0.3s ease",
};

const paginationContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  marginTop: '2rem',
  padding: '1rem',
  backgroundColor: '#f3f4f6',
  borderRadius: '10px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
};

const paginationControlsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  backgroundColor: '#fff',
  borderRadius: '8px',
  padding: '0.5rem 1rem',
  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
};

const paginationButtonsWrapperStyle: React.CSSProperties = {
  display: 'flex',
  gap: '5px',
  flexWrap: 'wrap',
  justifyContent: 'center'
};

const paginationButtonBaseStyle: React.CSSProperties = {
  backgroundColor: '#ff7300',
  color: '#fff',
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '0.9375rem',
  fontWeight: 'semibold',
  minWidth: '50px',
  justifyContent: 'center',
  display: 'flex',
  alignItems: 'center',
};

const paginationButtonActiveStyle: React.CSSProperties = {
  backgroundColor: '#5c5c5c',
  color: '#fff',
};

const paginationDotsStyle: React.CSSProperties = {
  color: '#5c5c5c',
  fontSize: '1rem',
  fontFamily: 'Montserrat, sans-serif',
};

const paginationNextButtonStyle: React.CSSProperties = {
  backgroundColor: '#ff7300',
  color: '#fff',
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '0.9375rem',
  fontWeight: 'semibold',
  minWidth: '50px',
  justifyContent: 'center',
  display: 'flex',
  alignItems: 'center',
};
