"use client";

import React, { Suspense, useState, useEffect } from "react";
import Image from "next/image";

// Importar imágenes
import buscarImg from "@/styles/images/buscar.png";
import filtrosImg from "@/styles/images/filtros.png";

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
  return (
    <Suspense fallback={<div style={loadingStyle}>Cargando...</div>}>
      <StockBodegaCentralContent />
    </Suspense>
  );
}

// =====================
// 3. COMPONENTE DE CONTENIDO
// =====================
const StockBodegaCentralContent = () => {
  const { isExtraLarge, isLarge, isMedium, isSmall, isMobile } = useWindowSize();
  
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [hasActiveFilters, setHasActiveFilters] = React.useState(false);
  const itemsPerPage = 15; // 15 resultados por página

  // Calcular estilos dinámicos basados en el ancho
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

  // Funciones de manejo
  const handleFiltersProduct = () => {
    setHasActiveFilters(!hasActiveFilters);
    alert('Abriendo filtros...');
  };

  // Función para limpiar filtros desde la barra de herramientas
  const handleClearFiltersFromToolbar = () => {
    setHasActiveFilters(false);
    setCurrentPage(1);
    alert('Filtros eliminados');
  };

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

  // Calcular datos paginados y total de páginas
  const currentTableData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

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



  // =====================
  // 5. UI
  // =====================
  return (
    <div style={{
      ...containerStyle
    }}>
      <div style={{
        ...cardStyle
      }}>
        <h1 style={{
          ...titleStyle,
          fontSize: isMobile ? "1.5rem" : isSmall ? "1.75rem" : "2rem",
          marginBottom: "1.5rem"
        }}>Stock bodega central</h1>

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
              placeholder="Escriba su búsqueda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                ...inputStyle,
                fontSize: isMobile ? "0.875rem" : "1rem"
              }}
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
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button style={{
              ...filterButtonStyle,
              width: isMobile ? "100%" : "auto",
              fontSize: isMobile ? "0.875rem" : "1rem",
              padding: isMobile ? "0.75rem" : "0.5rem 1.2rem",
              backgroundColor: hasActiveFilters ? '#ff7300' : '#5c5c5c',
              position: 'relative'
            }} onClick={handleFiltersProduct}>
              <Image
                src={filtrosImg.src}
                alt="Filtros"
                width={20}
                height={20}
                style={filterIconStyle}
              />
              Filtros
              {hasActiveFilters && (
                <div style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  width: '10px',
                  height: '10px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  border: '2px solid white'
                }} />
              )}
            </button>

            {hasActiveFilters && (
              <button 
                onClick={handleClearFiltersFromToolbar}
                style={{
                  ...filterButtonStyle,
                  backgroundColor: '#ef4444',
                  width: isMobile ? "100%" : "auto",
                  fontSize: isMobile ? "0.875rem" : "1rem",
                  padding: isMobile ? "0.75rem" : "0.5rem 1.2rem",
                }}
              >
                Limpiar
              </button>
            )}
          </div>
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
          <colgroup>
            <col style={{ width: isMobile ? "20%" : "18%" }} />
            <col style={{ width: isMobile ? "25%" : "22%" }} />
            <col style={{ width: isMobile ? "30%" : "35%" }} />
            <col style={{ width: isMobile ? "25%" : "25%" }} />
          </colgroup>
          <thead style={{ 
            position: "sticky", 
            top: 0, 
            zIndex: 2, 
            background: "#5C5C5C",
            fontSize: isMobile ? "0.75rem" : "0.875rem"
          }}>
            <tr>
              <th style={thStyle}>ID Stock</th>
              <th style={thStyle}>ID Bodega</th>
              <th style={thStyle}>ID Producto</th>
              <th style={thStyle}>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {currentTableData.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ ...tdStyle, textAlign: 'center', color: '#888', padding: "2rem" }}>
                  No hay registros de stock disponibles
                </td>
              </tr>
            ) : (
              currentTableData.map((item) => (
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

      {/* Paginación */}
      {filteredData.length > 0 && (
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
              style={paginationButtonBaseStyle}
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

const loadingStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  width: '100%',
  backgroundColor: '#f0f2f5',
  borderRadius: '20px',
  marginTop: '40px',
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

const searchIconStyle: React.CSSProperties = {
  width: '30px',
  height: '30px',
};

const filterButtonStyle: React.CSSProperties = {
  backgroundColor: "#5c5c5c",
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
  fontSize:"1rem",
  fontWeight: 'semibold',
  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
};

const filterIconStyle: React.CSSProperties = {
  width: '1.2rem',
  height: '1.2rem',
  color: 'white',
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
  fontFamily:"roboto, sans-serif",
  fontWeight:400,
  minHeight: "38px",
  height: "38px",
  lineHeight: "1.15",
  verticalAlign: "middle",
  textAlign: "center",
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
  alignItems: 'center',
  gap: '0.5rem',
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
