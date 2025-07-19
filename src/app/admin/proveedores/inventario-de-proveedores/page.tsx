"use client";

import React, { useState, useEffect, useMemo } from "react";
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

export default function InventarioProveedoresPage() {
  const { isExtraLarge, isLarge, isMedium, isSmall, isMobile } = useWindowSize();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const apiInventarioUrl = process.env.NEXT_PUBLIC_API_INVENTARIO || 'https://api-inventario.tssw.cl';
  const itemsPerPage = 15;
  const [inventarioData, setInventarioData] = useState<Array<{
  id: number;
  sku: string;
  nombreProducto: string;
  proveedor: string;
  pesoKg: string | number;
  largoCm: string | number;
  anchoCm: string | number;
  altoCm: string | number;
  precioCU: number;
  stock: number;
  fechaIngreso: string;
}>>([]);


  useEffect(() => {
    const fetchInventario = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiInventarioUrl}/api/stock-proveedor`);
        if (!response.ok) throw new Error("Error al cargar inventario");
        const data = await response.json();
        // Mapear los datos para la tabla
        const mapped = Array.isArray(data) ? data.map((item, idx) => ({
          id: idx + 1,
          sku: item.sku,
          nombreProducto: item.producto?.nombre || "",
          proveedor: item.proveedor?.marca || "",
          pesoKg: item.producto?.peso || "",
          largoCm: item.producto?.largo || "",
          anchoCm: item.producto?.ancho || "",
          altoCm: item.producto?.alto || "",
          precioCU: item.producto?.precio || "",
          stock: item.stock,
          fechaIngreso: item.fecha_ingreso
        })) : [];
        setInventarioData(mapped);
      } catch (err) {
        setInventarioData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInventario();
  }, []);

  // Filtrar datos según búsqueda
  const filteredData = useMemo(() => {
    return inventarioData.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.sku.toLowerCase().includes(searchLower) ||
        item.nombreProducto.toLowerCase().includes(searchLower) ||
        item.proveedor.toLowerCase().includes(searchLower)
      );
    });
  }, [inventarioData, searchTerm]);

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
        }}>Inventario de Proveedores</h1>
        
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
                placeholder="Buscar por SKU, Nombre, Proveedor..."
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
                alt="Agregar productos"
                width={20}
                height={20}
                style={filterIconStyle}
              />
              AGREGAR PRODUCTOS
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
                <th style={thStyle}>SKU</th>
                <th style={thStyle}>Nombre Producto</th>
                <th style={thStyle}>Proveedor</th>
                <th style={thStyle}>Peso (KG)</th>
                <th style={thStyle}>Largo (CM)</th>
                <th style={thStyle}>Ancho (CM)</th>
                <th style={thStyle}>Alto (CM)</th>
                <th style={thStyle}>Precio(C/U)</th>
                <th style={thStyle}>Stock</th>
                <th style={thStyle}>Fecha Ingreso</th>
                <th style={thStyle}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} style={{ ...tdStyle, textAlign: "center", padding: "2rem" }}>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
                      <div style={{ 
                        width: "20px", 
                        height: "20px", 
                        border: "2px solid #f3f3f3", 
                        borderTop: "2px solid #ff7300", 
                        borderRadius: "50%", 
                        animation: "spin 1s linear infinite" 
                      }}></div>
                      Cargando productos...
                    </div>
                  </td>
                </tr>
              ) : currentTableData.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ ...tdStyle, textAlign: "center", padding: "2rem" }}>
                    No hay productos disponibles
                  </td>
                </tr>
              ) : (
                currentTableData.map((item) => (
                  <tr key={item.id}>
                    <td style={tdStyle}>{item.sku}</td>
                    <td style={tdStyle}>{item.nombreProducto}</td>
                    <td style={tdStyle}>{item.proveedor}</td>
                    <td style={tdStyle}>{item.pesoKg}</td>
                    <td style={tdStyle}>{item.largoCm}</td>
                    <td style={tdStyle}>{item.anchoCm}</td>
                    <td style={tdStyle}>{item.altoCm}</td>
                    <td style={tdStyle}>${item.precioCU.toFixed(2)}</td>
                    <td style={tdStyle}>{item.stock}</td>
                    <td style={tdStyle}>{new Date(item.fechaIngreso).toLocaleDateString()}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", justifyContent: "center", gap: "5px" }}>
                        <button style={{
                          ...modifyProductButtonStyle,
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          maxWidth: '60px'
                        }}>
                          EDITAR
                        </button>
                        <button style={{
                          ...modifyProductButtonStyle,
                          backgroundColor: '#ef4444',
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          maxWidth: '60px'
                        }}>
                          ELIMINAR
                        </button>
                      </div>
                    </td>
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

const modifyProductButtonStyle: React.CSSProperties = {
  backgroundColor: '#ff7300',
  color: 'white',
  padding: '0.2rem 0.4rem',
  borderRadius: '4px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: 'semibold',
  fontFamily: 'Montserrat, sans-serif',
  transition: 'background-color 0.2s ease',
  whiteSpace: 'nowrap',
  boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
  maxWidth: '120px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: 'block',
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
  backgroundColor: '#5c5c5c',
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