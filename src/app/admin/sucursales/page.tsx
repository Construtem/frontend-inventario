/*
"use client";

import React, { useState, useEffect } from "react";
// import { FaSearch } from "react-icons/fa";
import Image from "next/image";

interface TipoSucursal {
  id: number;
  nombre: string;
}

interface Sucursal {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  comuna: string;
  ciudad: string;
  tipo: TipoSucursal;

}

export default function SucursalesPage() {
  const { isExtraLarge, isLarge, isMedium, isSmall, isMobile } = useWindowSize();
  const [searchTerm, setSearchTerm] = useState("");
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchSucursales() {
      try {
        const response = await fetch("http://localhost:8080/api/sucursales");
        if (!response.ok) {
          throw new Error("Error al cargar las sucursales");
        }
        const data = await response.json();
        setSucursales(data);
      } catch (error) {
        console.error("Error fetching sucursales:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSucursales();
  }, []);

  // Filtrar datos según búsqueda
  const filteredData = sucursales.filter((sucursal) => {
    const lowerSearch  = searchTerm.toLowerCase();
    return (
      sucursal.nombre.toLowerCase().includes(lowerSearch) ||
      sucursal.direccion.toLowerCase().includes(lowerSearch) ||
      sucursal.telefono.includes(searchTerm) ||
      sucursal.comuna.toLowerCase().includes(lowerSearch) ||
      sucursal.ciudad.toLowerCase().includes(lowerSearch) ||
      sucursal.tipo.nombre.toLowerCase().includes(lowerSearch)
    );
  });

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

  // Calcular ancho de búsqueda basado en el tamaño de la ventana
  const getSearchWidth = () => {
    if (isExtraLarge) return "700px";
    if (isLarge) return "600px";
    if (isMedium) return "500px";
    if (isSmall) return "400px";
    return "100%";
  };

  const getToolbarLayout = () => {
    if (isMobile) {
      return {
        flexDirection: "column" as const,
        alignItems: "stretch" as const
      };
    }
    if (isSmall) {
      return {
        flexDirection: "row" as const,
        flexWrap: "wrap" as const,
        alignItems: "flex-start" as const
      };
    }
    return {
      flexDirection: "row" as const,
      alignItems: "center" as const
    };
  };

  const getControlsLayout = () => {
    if (isMobile) {
      return {
        flexDirection: "column" as const,
        width: "100%"
      };
    }
    if (isSmall) {
      return {
        flexDirection: "row" as const,
        flexWrap: "wrap" as const,
        width: "100%"
      };
    }
    return {
      flexDirection: "row" as const,
      width: "auto"
    };
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header con título y botón */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>Gestion de Sucursales</h1>
          <button style={modificarButtonStyle} onClick={handleModificar}>
            Modificar sucursales
          </button>
        </div>

        {/* Fila de búsqueda y filtros */}
        <div style={filterRowStyle}>
          {/* Input de búsqueda con ícono */}
          <div style={searchContainerStyle}>
            <input
              type="text"
              placeholder="Escriba su búsqueda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={searchInputStyle}
            />
          </div>

          <div style={{
            ...rightControlsWrapperStyle,
            width: isMobile ? "100%" : "auto",
            marginTop: isMobile ? "1rem" : isSmall ? "1rem" : "0"
          }}>
            <button style={{
              ...editButtonStyle,
              width: isMobile ? "100%" : "auto",
              fontSize: isMobile ? "0.875rem" : "1rem",
              padding: isMobile ? "0.75rem" : "0.5rem 1.2rem"
            }}>
              <Image
                src={agregarImg.src}
                alt="Agregar sucursal"
                width={20}
                height={20}
                style={filterIconStyle}
              />
              AGREGAR SUCURSAL
            </button>
          </div>
        </div>

        <div style={{
          ...tableContainerStyle,
          maxWidth: "100%",
          marginTop: "1rem"
        }}>
          <table style={{
            ...tableStyle,
            fontSize: isMobile ? "0.875rem" : "1rem",
            maxWidth: "100%"
          }}>
            <thead style={{ 
              position: "sticky", 
              top: 0, 
              zIndex: 2, 
              background: "#5C5C5C",
              fontSize: isMobile ? "0.75rem" : "0.875rem"
            }}>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Nombre</th>
                <th style={thStyle}>Dirección</th>
                <th style={thStyle}>Teléfono</th>
                <th style={thStyle}>Comuna</th>
                <th style={thStyle}>Ciudad</th>
                <th style={thStyle}>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (

                <tr>
                  <td colSpan={7} style={tdStyle}>Cargando...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} style={tdStyle}>

                    No hay sucursales disponibles
                  </td>
                </tr>
              ) : (
                currentTableData.map((sucursal) => (
                  <tr key={sucursal.id}>
                    <td style={tdStyle}>#{sucursal.id}</td>
                    <td style={tdStyle}>{sucursal.nombre}</td>
                    <td style={tdStyle}>{sucursal.direccion}</td>
                    <td style={tdStyle}>{sucursal.telefono}</td>
                    <td style={tdStyle}>{sucursal.comuna}</td>
                    <td style={tdStyle}>{sucursal.ciudad}</td>
                    <td style={tdStyle}>{sucursal.tipo.nombre || "Sin tipo"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredData.length > 0 && (
          <div style={{
            ...paginationContainerStyle,
            flexDirection: isMobile ? "column" : "row",
            padding: "1rem",
            marginTop: "1rem",
            width: "100%",
            boxSizing: "border-box"
          }}>
            <div style={{
              ...paginationControlsStyle,
              flexWrap: "wrap",
              gap: isMobile ? "0.5rem" : "0.75rem"
            }}>
              <button onClick={handlePrevPage} disabled={currentPage === 1} style={paginationButtonBaseStyle}>
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
            <div style={{ 
              fontSize: isMobile ? "0.75rem" : "0.9rem", 
              color: "#666",
              marginTop: isMobile ? "0.5rem" : 0
            }}>
              Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} de {filteredData.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Estilos
const containerStyle: React.CSSProperties = {
  marginTop: "70px",
  marginRight: "0",
  marginBottom: "1.5rem",
  marginLeft: "0",
  boxSizing: "border-box",
  minHeight: "calc(100vh - 70px)",
  backgroundColor: "#f0f2f5",
  borderRadius: "20px",
  transition: "all 0.3s ease",
  width: "100%",
  overflowX: "hidden",
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column"
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "white",
  borderRadius: "12px",
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease",
  width: "100%",
  maxWidth: "100%",
  display: "flex",
  flexDirection: "column",
  padding: "1.5rem",
  border: "1px solid rgba(0, 0, 0, 0.05)",
  boxSizing: "border-box",
  margin: "0 auto"
};

const titleStyle: React.CSSProperties = {
  color: "rgb(34, 34, 34)",
  fontSize: "2rem",
  fontWeight: "bold",
  marginBottom: "1.5rem",
  fontFamily: "Montserrat, sans-serif"
};

const toolbarStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "1rem",
  gap: "1rem",
  transition: "all 0.3s ease"
};

const leftControlsGroupStyle: React.CSSProperties = {
  display: "flex",
  gap: "1rem",
  transition: "all 0.3s ease"
};

const searchContainerStyle: React.CSSProperties = {
  position: 'relative',
  height: '40px',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
  transition: "all 0.3s ease"
};

const rightControlsWrapperStyle: React.CSSProperties = {
  display: "flex",
  gap: "1rem",
  transition: "all 0.3s ease"
};

const tableContainerStyle: React.CSSProperties = {
  width: "100%",
  overflowX: "auto",
  borderRadius: "10px",
  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  transition: "all 0.3s ease",
  marginTop: "1rem",
  border: "1px solid rgba(0, 0, 0, 0.05)",
  backgroundColor: "#ffffff",
  boxSizing: "border-box"
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  border: "none",
  backgroundColor: "#fff",
  minWidth: "1000px",
  transition: "all 0.3s ease"
};

const thStyle: React.CSSProperties = {
  padding: "0.55rem 0.9rem",
  backgroundColor: "#5C5C5C",
  color: "white",
  fontWeight: 600,
  textAlign: "center",
  fontSize: "1rem",
  fontFamily: "Montserrat, sans-serif",
  minHeight: "38px",
  height: "38px",
  lineHeight: "1.15",
  verticalAlign: "middle",
};

const tdStyle: React.CSSProperties = {
  padding: "0.55rem 0.9rem",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "0.9375rem",
  fontFamily: "roboto, sans-serif",
  fontWeight: 400,
  minHeight: "38px",
  height: "38px",
  lineHeight: "1.15",
  verticalAlign: "middle",
  textAlign: "center",
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  flexGrow: 1,
  padding: "0.3rem 2.5rem 0.3rem 1rem",
  borderTop: "1px solid #ccc",
  borderRight: "1px solid #ccc",
  borderBottom: "1px solid #ccc",
  borderLeft: "1px solid #ccc",
  outline: "none",
  height: '40px',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxSizing: 'border-box',
  fontSize: '0.875rem',
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
};

const lupaButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  right: 0,
  height: '40px',
  width: '2.2rem',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
};

const editButtonStyle: React.CSSProperties = {
  backgroundColor: "#ff7300",
  color: "white",
  padding: "0.5rem 1.2rem",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  height: "40px",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontFamily: "Montserrat, sans-serif",
  fontSize: "1rem",
  fontWeight: 'semibold',
  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
};

const filterButtonStyle: React.CSSProperties = {
  ...editButtonStyle,
  backgroundColor: '#5c5c5c',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
};

const filterIconStyle: React.CSSProperties = {
  width: '1.2rem',
  height: '1.2rem',
  color: 'white',
};

const searchIconStyle: React.CSSProperties = {
  width: '30px',
  height: '30px',
};


const paginationContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '10px',
  padding: '1rem',
  backgroundColor: "#f8fafc",
  borderRadius: '12px',
  marginTop: '1rem',
  border: "1px solid rgba(0, 0, 0, 0.05)",
  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
};

const paginationControlsStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '10px',
  width: '100%',
};

const paginationButtonBaseStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderTop: '1px solid #ddd',
  borderRight: '1px solid #ddd',
  borderBottom: '1px solid #ddd',
  borderLeft: '1px solid #ddd',
  borderRadius: '5px',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease, border-color 0.2s ease',
  minWidth: '35px',
  textAlign: 'center',
  color: '#333',
};

const paginationDotsStyle: React.CSSProperties = {
  padding: '8px 0',
  color: '#555',
  justifyContent: 'center',
};

const paginationButtonActiveStyle: React.CSSProperties = {
  backgroundColor: '#ff7300',
  color: 'white',
  borderTop: '1px solid #ff7300',
  borderRight: '1px solid #ff7300',
  borderBottom: '1px solid #ff7300',
  borderLeft: '1px solid #ff7300',
};

const paginationNextButtonStyle: React.CSSProperties = {
  marginRight: '16px',
  justifyContent: 'center',
};

const paginationButtonsWrapperStyle: React.CSSProperties = {
  display: 'flex',
  gap: '5px',
  flexWrap: 'wrap',
  justifyContent: 'center'
};

*/