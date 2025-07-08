"use client";

import React, { useState, useEffect, useMemo} from "react";
import Image from "next/image";

// Importaciones de imágenes
import filtrosImg from "@/styles/images/filtros.png";
import agregarImg from "@/styles/images/agregar.png";
import buscarImg from "@/styles/images/buscar.png";


// Hook para manejar el tamaño de la ventana
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      handleResize();
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return {
    ...windowSize,
    isExtraLarge: windowSize.width > 1440,
    isLarge: windowSize.width <= 1440 && windowSize.width > 1200,
    isMedium: windowSize.width <= 1200 && windowSize.width > 992,
    isSmall: windowSize.width <= 992 && windowSize.width > 768,
    isMobile: windowSize.width <= 768
  };
}

export default function SucursalesPage() {
  const { isExtraLarge, isLarge, isMedium, isSmall, isMobile } = useWindowSize();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Datos de ejemplo para sucursales
  const sucursalesData = useMemo(() => [
    { 
      id: 1, 
      nombre: 'Tienda Centro', 
      direccion: 'Av. Principal 123, Centro', 
      telefono: '123-456-7890', 
      estado: 'Activa',
      fechaApertura: '2020-01-15',
      empleados: 25
    },
    { 
      id: 2, 
      nombre: 'Tienda Norte', 
      direccion: 'Calle Norte 456, Zona Norte', 
      telefono: '098-765-4321', 
      estado: 'Activa',
      fechaApertura: '2021-03-20',
      empleados: 18
    },
    { 
      id: 3, 
      nombre: 'Tienda Sur', 
      direccion: 'Blvd. Sur 789, Zona Sur', 
      telefono: '555-123-4567', 

      estado: 'Activa',
      fechaApertura: '2021-08-10',
      empleados: 22
    },
    { 
      id: 4, 
      nombre: 'Bodega Central', 
      direccion: 'Calle Oeste 654, Zona Oeste', 
      telefono: '777-888-9999', 
      estado: 'Activa',
      fechaApertura: '2022-11-05',
      empleados: 20
    },
  ], []);

  // Filtrar datos según búsqueda
  const filteredData = useMemo(() => {
    return sucursalesData.filter(sucursal => {
      const searchLower = searchTerm.toLowerCase();
      return (
        sucursal.nombre.toLowerCase().includes(searchLower) ||
        sucursal.direccion.toLowerCase().includes(searchLower) ||
        sucursal.telefono.includes(searchLower)
      );
    });
  }, [sucursalesData, searchTerm]);

  // Calcular datos paginados
  const currentTableData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, itemsPerPage]);

  // Calcular total de páginas
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

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
        <h1 style={{
          ...titleStyle,
          fontSize: isMobile ? "1.5rem" : isSmall ? "1.75rem" : "2rem",
          marginBottom: "1.5rem"
        }}>Gestión de Sucursales</h1>
        
        <div style={{
          ...toolbarStyle,
          ...getToolbarLayout(),
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1rem",
          width: "100%",
          boxSizing: "border-box"
        }}>
          <div style={{
            ...leftControlsGroupStyle,
            ...getControlsLayout(),
            gap: isMobile ? "1rem" : "0.75rem",
            boxSizing: "border-box"
          }}>
            <div style={{
              ...searchContainerStyle,
              width: getSearchWidth(),
              minWidth: isMobile ? "unset" : "300px",
              marginBottom: isMobile ? "1rem" : "0",
              boxSizing: "border-box"
            }}>
              <input
                type="text"
                placeholder="Buscar por Nombre, Dirección..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={inputStyle}
              />
              <button style={lupaButtonStyle}>
                <Image
                  src={buscarImg.src}
                  alt="Buscar"
                  width={isMobile ? 30 : 40}
                  height={isMobile ? 30 : 40}
                  style={searchIconStyle}
                />
              </button>
            </div>
            
            <button style={{
              ...filterButtonStyle,
              width: isMobile ? "100%" : "auto",
              fontSize: isMobile ? "0.875rem" : "1rem",
              padding: isMobile ? "0.75rem" : "0.5rem 1.2rem"
            }}>
              <Image
                src={filtrosImg.src}
                alt="Filtros"
                width={20}
                height={20}
                style={filterIconStyle}
              />
              Filtros
            </button>
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
                <th style={thStyle}>ID Sucursal</th>
                <th style={thStyle}>Nombre</th>
                <th style={thStyle}>Dirección</th>
                <th style={thStyle}>Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ ...tdStyle, textAlign: "center", padding: "2rem" }}>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
                      <div style={{ 
                        width: "20px", 
                        height: "20px", 
                        border: "2px solid #f3f3f3", 
                        borderTop: "2px solid #ff7300", 
                        borderRadius: "50%", 
                        animation: "spin 1s linear infinite" 
                      }}></div>
                      Cargando sucursales...
                    </div>
                  </td>
                </tr>
              ) : currentTableData.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ ...tdStyle, textAlign: "center", padding: "2rem" }}>
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

const paginationDotsStyle: React.CSSProperties = {
  color: '#5c5c5c',
  fontSize: '1rem',
  fontFamily: 'Montserrat, sans-serif',
};

const paginationButtonActiveStyle: React.CSSProperties = {
  backgroundColor: '#5c5c5c ',
  color: '#fff',
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

const paginationButtonsWrapperStyle: React.CSSProperties = {
  display: 'flex',
  gap: '5px',
  flexWrap: 'wrap',
  justifyContent: 'center'
};