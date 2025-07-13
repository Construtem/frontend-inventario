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
interface Proveedor {
  id: number;
  marca: string;
}

interface Producto {
  sku: string;
  nombre: string;
  descripcion: string;
  proveedor_id: number;
  peso: number;
  largo: number;
  ancho: number;
  alto: number;
  precio: number;
  proveedor: Proveedor;
}

interface TipoSucursal {
  id: number;
  nombre: string;
}

interface Sucursal {
  id: number;
  nombre: string;
  telefono: string;
  direccion: string;
  comuna: string;
  ciudad: string;
  tipo_id: number;
  tipo: TipoSucursal;
}

interface StockBodega {
  sku: string;
  sucursal_id: number;
  cantidad: number;
  descuento: number;
  producto: Producto;
  sucursal: Sucursal;
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
  const [activeFilters, setActiveFilters] = React.useState<{ categoria: string; estado: string }>({
    categoria: "",
    estado: ""
  });
  const [stockBodegaData, setStockBodegaData] = React.useState<StockBodega[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const itemsPerPage = 15; // 15 resultados por página

  // =====================
  // 3. LLAMADA A LA API
  // =====================
  React.useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Intentando conectar con la API...');
        
        // Timeout manual con AbortController como en despacho
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
        
        const response = await fetch('http://localhost:8080/api/stock-sucursal', { // Sin la barra final
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        clearTimeout(timeoutId);
        
        console.log('📡 Respuesta de la API:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Datos recibidos:', data);
        
        // Validar que los datos tengan la estructura esperada
        if (Array.isArray(data)) {
          setStockBodegaData(data);
        } else {
          console.warn('⚠️ Los datos no son un array:', data);
          setStockBodegaData([]);
        }
        
      } catch (err) {
        console.error('❌ Error al cargar datos de stock:', err);
        
        // Manejo específico de diferentes tipos de errores como en despacho
        let errorMessage = "Error desconocido al cargar datos";
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            errorMessage = 'Tiempo de espera agotado al conectar con el servidor';
          } else if (err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
            errorMessage = 'No se pudo conectar al servidor backend. Verifique que:\n• El backend esté ejecutándose en http://localhost:8080\n• No haya problemas de CORS\n• Su conexión a internet funcione correctamente';
          } else {
            errorMessage = err.message;
          }
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, []);

  // Función para reintentar la carga de datos
  const retryFetch = () => {
    setError(null);
    setLoading(true);
    // Re-ejecutar la función fetch en lugar de recargar la página
    const fetchStockData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Reintentando conexión con la API...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('http://localhost:8080/api/stock-sucursal', {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        clearTimeout(timeoutId);
        
        console.log('📡 Respuesta de la API:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Datos recibidos:', data);
        
        if (Array.isArray(data)) {
          setStockBodegaData(data);
        } else {
          console.warn('⚠️ Los datos no son un array:', data);
          setStockBodegaData([]);
        }
        
      } catch (err) {
        console.error('❌ Error al cargar datos de stock:', err);
        
        let errorMessage = "Error desconocido al cargar datos";
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            errorMessage = 'Tiempo de espera agotado al conectar con el servidor';
          } else if (err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
            errorMessage = 'No se pudo conectar al servidor backend. Verifique que:\n• El backend esté ejecutándose en http://localhost:8080\n• No haya problemas de CORS\n• Su conexión a internet funcione correctamente';
          } else {
            errorMessage = err.message;
          }
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStockData();
  };

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
  // 4. FILTRAR DATOS
  // =====================
  const filteredData = stockBodegaData.filter(item => {
    const matchesSearch = 
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sucursal.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sucursal.comuna.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sucursal_id.toString().includes(searchTerm) ||
      item.cantidad.toString().includes(searchTerm) ||
      item.descuento.toString().includes(searchTerm) ||
      item.producto.precio.toString().includes(searchTerm);

    return matchesSearch;
  });

  // Funciones de manejo
  const handleFiltersProduct = () => {
    setHasActiveFilters(!hasActiveFilters);
    alert('Abriendo filtros...');
  };

  // Función para limpiar filtros desde la barra de herramientas
  const handleClearFiltersFromToolbar = () => {
    setActiveFilters({ categoria: "", estado: "" });
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
        }}>Stock de Inventario por Sucursales</h1>

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
        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '3rem',
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #ff7300',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '1rem'
            }} />
            <div style={{ fontSize: '1.1rem', color: '#666' }}>Cargando datos del stock...</div>
            <div style={{ fontSize: '0.9rem', color: '#999', marginTop: '0.5rem' }}>
              Conectando con http://localhost:8080
            </div>
          </div>
        ) : error ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '3rem',
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <div style={{ 
              fontSize: '1.1rem', 
              color: '#ef4444',
              textAlign: 'center',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>❌ Error al cargar los datos</div>
              <div style={{ 
                fontSize: '0.9rem', 
                marginTop: '0.5rem',
                whiteSpace: 'pre-line',
                lineHeight: '1.5',
                color: '#666'
              }}>
                {error}
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '1rem',
              flexDirection: isMobile ? 'column' : 'row',
              width: isMobile ? '100%' : 'auto'
            }}>
              <button
                onClick={retryFetch}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 'semibold',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                  transition: 'all 0.3s ease',
                  minWidth: '120px'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
              >
                🔄 Reintentar
              </button>
              
              <button
                onClick={() => {
                  console.log('🔍 Diagnóstico de red:');
                  console.log('• URL del backend:', 'http://localhost:8080/api/stock-sucursal');
                  console.log('• User Agent:', navigator.userAgent);
                  console.log('• Conexión:', navigator.onLine ? 'En línea' : 'Sin conexión');
                  alert('Información de diagnóstico enviada a la consola del navegador (F12)');
                }}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 'semibold',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                  transition: 'all 0.3s ease',
                  minWidth: '120px'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
              >
                🔍 Diagnóstico
              </button>
            </div>
            
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              fontSize: '0.875rem',
              color: '#666',
              textAlign: 'left',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>💡 Posibles soluciones:</div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                <li>Verificar que el backend esté ejecutándose en el puerto 8080</li>
                <li>Comprobar que la URL de la API sea correcta</li>
                <li>Revisar la configuración de CORS en el backend</li>
                <li>Verificar la conexión a internet</li>
                <li>Intentar acceder directamente a: <a href="http://localhost:8080/api/stock-sucursal" target="_blank" style={{ color: '#3b82f6' }}>http://localhost:8080/api/stock-sucursal</a></li>
              </ul>
            </div>
          </div>
        ) : (
          <table style={{
            ...tableStyle,
            fontSize: isMobile ? "0.875rem" : "1rem",
            maxWidth: "100%"
          }}>
            <colgroup>
              <col style={{ width: isMobile ? "15%" : "12%" }} />
              <col style={{ width: isMobile ? "25%" : "20%" }} />
              <col style={{ width: isMobile ? "20%" : "18%" }} />
              <col style={{ width: isMobile ? "15%" : "12%" }} />
              <col style={{ width: isMobile ? "10%" : "8%" }} />
              <col style={{ width: isMobile ? "15%" : "12%" }} />
              <col style={{ width: isMobile ? "0%" : "18%" }} />
            </colgroup>
            <thead style={{ 
              position: "sticky", 
              top: 0, 
              zIndex: 2, 
              background: "#5C5C5C",
              fontSize: isMobile ? "0.7rem" : "0.875rem"
            }}>
              <tr>
                <th style={thStyle}>SKU</th>
                <th style={thStyle}>Producto</th>
                <th style={thStyle}>Sucursal</th>
                <th style={thStyle}>Precio</th>
                <th style={thStyle}>Stock</th>
                <th style={thStyle}>Descuento</th>
                {!isMobile && <th style={thStyle}>Ubicación</th>}
              </tr>
            </thead>
            <tbody>
              {currentTableData.length === 0 ? (
                <tr>
                  <td colSpan={isMobile ? 6 : 7} style={{ ...tdStyle, textAlign: 'center', color: '#888', padding: "2rem" }}>
                    No hay registros de stock disponibles
                  </td>
                </tr>
              ) : (
                currentTableData.map((item, index) => (
                  <tr key={`${item.sku}-${item.sucursal_id}-${index}`}>
                    <td style={tdStyle}>
                      <span style={{ 
                        fontWeight: 'bold', 
                        color: '#374151',
                        fontSize: isMobile ? '0.8rem' : '0.9rem'
                      }}>
                        {item.sku}
                      </span>
                    </td>
                    <td style={{...tdStyle, textAlign: 'left', padding: '0.4rem 0.6rem'}}>
                      <div>
                        <div style={{ 
                          fontWeight: 'semibold', 
                          color: '#1f2937',
                          fontSize: isMobile ? '0.8rem' : '0.9rem',
                          marginBottom: '0.1rem'
                        }}>
                          {item.producto.nombre}
                        </div>
                        <div style={{ 
                          color: '#6b7280', 
                          fontSize: isMobile ? '0.7rem' : '0.8rem',
                          lineHeight: '1.2'
                        }}>
                          {item.producto.descripcion}
                        </div>
                      </div>
                    </td>
                    <td style={{...tdStyle, textAlign: 'left', padding: '0.4rem 0.6rem'}}>
                      <div>
                        <div style={{ 
                          fontWeight: 'semibold', 
                          color: '#1f2937',
                          fontSize: isMobile ? '0.8rem' : '0.9rem',
                          marginBottom: '0.1rem'
                        }}>
                          {item.sucursal.nombre}
                        </div>
                        <div style={{ 
                          color: '#6b7280', 
                          fontSize: isMobile ? '0.7rem' : '0.8rem'
                        }}>
                          ID: {item.sucursal_id}
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ 
                        fontWeight: 'bold', 
                        color: '#059669',
                        fontSize: isMobile ? '0.8rem' : '0.9rem'
                      }}>
                        ${item.producto.precio.toLocaleString('es-CL')}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ 
                        backgroundColor: item.cantidad > 20 ? '#dcfce7' : item.cantidad > 10 ? '#fef3c7' : '#fee2e2',
                        color: item.cantidad > 20 ? '#166534' : item.cantidad > 10 ? '#92400e' : '#dc2626',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '0.375rem',
                        fontSize: isMobile ? '0.75rem' : '0.8rem',
                        fontWeight: 'bold'
                      }}>
                        {item.cantidad}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {item.descuento > 0 ? (
                        <span style={{
                          backgroundColor: '#fee2e2',
                          color: '#dc2626',
                          padding: '0.2rem 0.4rem',
                          borderRadius: '0.375rem',
                          fontSize: isMobile ? '0.75rem' : '0.8rem',
                          fontWeight: 'bold'
                        }}>
                          -{item.descuento}%
                        </span>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: isMobile ? '0.75rem' : '0.8rem' }}>
                          Sin descuento
                        </span>
                      )}
                    </td>
                    {!isMobile && (
                      <td style={{...tdStyle, textAlign: 'left', padding: '0.4rem 0.6rem'}}>
                        <div style={{ 
                          color: '#6b7280', 
                          fontSize: '0.8rem',
                          lineHeight: '1.2'
                        }}>
                          {item.sucursal.comuna}, {item.sucursal.ciudad}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {!loading && !error && filteredData.length > 0 && (
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
  minWidth: "1200px",
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

// Agregar estilos CSS globales para la animación de carga
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}