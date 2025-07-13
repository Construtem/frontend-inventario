"use client";

import React, { useState, useEffect, useMemo} from "react";
import Image from "next/image";
import Swal from 'sweetalert2';

// Importaciones de imágenes
import filtrosImg from "@/styles/images/filtros.png";
import agregarImg from "@/styles/images/agregar.png";
import buscarImg from "@/styles/images/buscar.png";

// =====================
// 1. INTERFACES DE DATOS
// =====================
interface Sucursal {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  comuna?: string;
  ciudad?: string;
}

const CIUDADES = ['Santiago'];

const COMUNAS_POR_CIUDAD: { [key: string]: string[] } = {
  Santiago: [
    'Cerro Navia',
    'Conchalí',
    'El Bosque',
    'Estación Central',
    'Huechuraba',
    'Independencia',
    'La Cisterna',
    'La Florida',
    'La Granja',
    'La Pintana',
    'La Reina',
    'Las Condes',
    'Lo Barnechea',
    'Lo Espejo',
    'Lo Prado',
    'Macul',
    'Maipú',
    'Ñuñoa',
    'Pedro Aguirre Cerda',
    'Peñalolén',
    'Providencia',
    'Pudahuel',
    'Quilicura',
    'Quinta Normal',
    'Recoleta',
    'Renca',
    'San Joaquín',
    'San Miguel',
    'San Ramón',
    'Santiago',
    'Vitacura'
  ]
};

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

// Add sorting function outside the component
const sortSucursales = (data: Sucursal[]) => {
  return [...data].sort((a, b) => b.id - a.id);
};

export default function SucursalesPage() {
  const { isExtraLarge, isLarge, isMedium, isSmall, isMobile } = useWindowSize();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sucursalesData, setSucursalesData] = useState<Sucursal[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedComuna, setSelectedComuna] = useState("");
  const [selectedCiudad, setSelectedCiudad] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("");

  // Agregar estados temporales para los filtros
  const [tempCiudad, setTempCiudad] = useState("");
  const [tempComuna, setTempComuna] = useState("");
  const [tempTipo, setTempTipo] = useState("");

  // =====================
  // 2. LLAMADA A LA API
  // =====================
  useEffect(() => {
    // Agregar estilos CSS para la animación de carga
    if (typeof document !== 'undefined') {
      const existingStyle = document.getElementById('spin-animation-style');
      if (!existingStyle) {
        const style = document.createElement('style');
        style.id = 'spin-animation-style';
        style.textContent = `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `;
        document.head.appendChild(style);
      }
    }

    const fetchSucursales = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Intentando conectar con la API de sucursales...');
        
        // Timeout manual con AbortController
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
        
        const response = await fetch('http://localhost:8080/api/sucursales', {
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
          setSucursalesData(sortSucursales(data)); // Apply sorting here
        } else {
          console.warn('⚠️ Los datos no son un array:', data);
          setSucursalesData([]);
        }
        
      } catch (err) {
        console.error('❌ Error al cargar datos de sucursales:', err);
        
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

    fetchSucursales();
  }, []);

  // Función para reintentar la carga de datos
  const retryFetch = () => {
    setError(null);
    setLoading(true);
    
    const fetchSucursales = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Reintentando conexión con la API...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('http://localhost:8080/api/sucursales', {
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
          setSucursalesData(sortSucursales(data)); // Apply sorting here
        } else {
          console.warn('⚠️ Los datos no son un array:', data);
          setSucursalesData([]);
        }
        
      } catch (err) {
        console.error('❌ Error al cargar datos de sucursales:', err);
        
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
    
    fetchSucursales();
  };

  // Modificar la función de filtrado para que solo busque por nombre
  const filteredData = useMemo(() => {
    return sortSucursales(sucursalesData.filter(sucursal => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = sucursal.nombre.toLowerCase().includes(searchLower);

      const matchesCiudad = selectedCiudad ? sucursal.ciudad === selectedCiudad : true;
      const matchesComuna = selectedComuna ? sucursal.comuna === selectedComuna : true;
      const matchesTipo = selectedTipo 
        ? (selectedTipo === 'bodega' 
          ? sucursal.nombre.toLowerCase().includes('bodega')
          : !sucursal.nombre.toLowerCase().includes('bodega'))
        : true;

      return matchesSearch && matchesCiudad && matchesComuna && matchesTipo;
    }));
  }, [sucursalesData, searchTerm, selectedCiudad, selectedComuna, selectedTipo]);

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

  // Agregar función para aplicar filtros
  const handleApplyFilters = () => {
    const filtersApplied = Boolean(tempCiudad || tempComuna || tempTipo);
    
    if (!filtersApplied) {
      Swal.fire({
        title: 'Sin filtros',
        text: 'No has seleccionado ningún filtro',
        icon: 'info',
        confirmButtonColor: '#ff7300'
      });
      return;
    }

    // Aplicar los filtros temporales a los estados reales
    setSelectedCiudad(tempCiudad);
    setSelectedComuna(tempComuna);
    setSelectedTipo(tempTipo);
    setShowFilterModal(false);
    
    // Mostrar mensaje de éxito con los filtros aplicados
    Swal.fire({
      title: 'Filtros aplicados',
      html: `
        ${tempCiudad ? `<p>Ciudad: ${tempCiudad}</p>` : ''}
        ${tempComuna ? `<p>Comuna: ${tempComuna}</p>` : ''}
        ${tempTipo ? `<p>Tipo: ${tempTipo}</p>` : ''}
      `,
      icon: 'success',
      confirmButtonColor: '#ff7300'
    });
  };

  // Estados para el modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSucursal, setSelectedSucursal] = useState<Sucursal | null>(null);
  const [editFormData, setEditFormData] = useState<Sucursal | null>(null);

  // Agregar función para manejar la edición
  const handleEdit = (sucursal: Sucursal) => {
    setSelectedSucursal(sucursal);
    setEditFormData(sucursal);
    setShowEditModal(true);
  };

  // Función para guardar cambios
  const handleSaveChanges = async () => {
    if (!editFormData) return;

    try {
      const response = await fetch(`http://localhost:8080/api/sucursales/${editFormData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) throw new Error('Error al actualizar');

      // Update and sort the data
      setSucursalesData(prevData => 
        sortSucursales(prevData.map(item => 
          item.id === editFormData.id ? editFormData : item
        ))
      );

      setShowEditModal(false);
      Swal.fire({
        title: 'Éxito',
        text: 'Sucursal actualizada correctamente',
        icon: 'success',
        confirmButtonColor: '#ff7300'
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar la sucursal',
        icon: 'error',
        confirmButtonColor: '#ff7300'
      });
    }
  };

  // Agregar función para manejar la eliminación
  const handleDelete = (sucursal: Sucursal) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la sucursal "${sucursal.nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`http://localhost:8080/api/sucursales/${sucursal.id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) throw new Error('Error al eliminar');

          // Actualizar el estado eliminando la sucursal
          setSucursalesData(prevData => prevData.filter(item => item.id !== sucursal.id));

          Swal.fire({
            title: 'Eliminado',
            text: 'La sucursal ha sido eliminada correctamente',
            icon: 'success',
            confirmButtonColor: '#ff7300'
          });
        } catch (error) {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo eliminar la sucursal',
            icon: 'error',
            confirmButtonColor: '#ff7300'
          });
        }
      }
    });
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
                placeholder="Buscar por Nombre..."
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
            
            <button 
              style={{
                ...filterButtonStyle,
                width: isMobile ? "100%" : "auto",
                fontSize: isMobile ? "0.875rem" : "1rem",
                padding: isMobile ? "0.75rem" : "0.5rem 1.2rem"
              }}
              onClick={() => setShowFilterModal(true)}
            >
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
              <div style={{ fontSize: '1.1rem', color: '#666' }}>Cargando sucursales...</div>
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
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>❌ Error al cargar las sucursales</div>
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
                    console.log('• URL del backend:', 'http://localhost:8080/api/sucursales');
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
                  <li>Intentar acceder directamente a: <a href="http://localhost:8080/api/sucursales" target="_blank" style={{ color: '#3b82f6' }}>http://localhost:8080/api/sucursales</a></li>
                </ul>
              </div>
            </div>
          ) : (
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
                  <th style={thStyle}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentTableData.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ ...tdStyle, textAlign: "center", padding: "2rem" }}>
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
                      <td style={tdStyle}>{sucursal.comuna || 'N/A'}</td>
                      <td style={tdStyle}>{sucursal.ciudad || 'N/A'}</td>
                      <td style={tdStyle}>
                        <span style={{
                          backgroundColor: sucursal.nombre?.toLowerCase()?.includes('bodega') ? '#10b981' : '#3b82f6',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 'semibold'
                        }}>
                          {sucursal.nombre?.toLowerCase()?.includes('bodega') ? 'Bodega' : 'Sucursal'}
                        </span>
                      </td>
                      <td style={{...tdStyle, minWidth: '200px'}}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}>
                          <button
                            onClick={() => handleEdit(sucursal)}
                            style={{
                              ...editButtonStyle,
                              padding: '0.25rem 0.75rem',
                              height: 'auto',
                              fontSize: '0.875rem'
                            }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(sucursal)}
                            style={{
                              ...editButtonStyle,
                              padding: '0.25rem 0.75rem',
                              height: 'auto',
                              fontSize: '0.875rem',
                              backgroundColor: '#ef4444',
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {!loading && !error && filteredData.length > 0 && (
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
                style={paginationButtonBaseStyle}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Filtros */}
      {showFilterModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2 style={modalTitleStyle}>Filtros</h2>
            
            <div style={modalFormStyle}>
              <div style={selectGroupStyle}>
                <label style={labelStyle}>Ciudad</label>
                <select 
                  value={tempCiudad} 
                  onChange={(e) => {
                    setTempCiudad(e.target.value);
                    setTempComuna(''); // Reset comuna temporal when city changes
                  }}
                  style={selectStyle}
                >
                  <option value="">Todas las ciudades</option>
                  {CIUDADES.map(ciudad => (
                    <option key={ciudad} value={ciudad}>{ciudad}</option>
                  ))}
                </select>
              </div>

              <div style={selectGroupStyle}>
                <label style={labelStyle}>Comuna</label>
                <select 
                  value={tempComuna} 
                  onChange={(e) => setTempComuna(e.target.value)}
                  style={selectStyle}
                  disabled={!tempCiudad}
                >
                  <option value="">Todas las comunas</option>
                  {tempCiudad && COMUNAS_POR_CIUDAD[tempCiudad]?.map(comuna => (
                    <option key={comuna} value={comuna}>{comuna}</option>
                  ))}
                </select>
              </div>

              <div style={selectGroupStyle}>
                <label style={labelStyle}>Tipo</label>
                <select 
                  value={tempTipo} 
                  onChange={(e) => setTempTipo(e.target.value)}
                  style={selectStyle}
                >
                  <option value="">Todos los tipos</option>
                  <option value="sucursal">Sucursal</option>
                  <option value="bodega">Bodega</option>
                </select>
              </div>
            </div>

            <div style={modalButtonsStyle}>
              <button 
                onClick={() => {
                  // Limpiar tanto los estados temporales como los reales
                  setTempCiudad('');
                  setTempComuna('');
                  setTempTipo('');
                  setSelectedCiudad('');
                  setSelectedComuna('');
                  setSelectedTipo('');
                  setShowFilterModal(false);
                  Swal.fire({
                    title: 'Filtros reiniciados',
                    text: 'Se han eliminado todos los filtros',
                    icon: 'info',
                    confirmButtonColor: '#ff7300'
                  });
                }} 
                style={{...modalButtonStyle, backgroundColor: '#6b7280'}}
              >
                Limpiar filtros
              </button>
              <button 
                onClick={handleApplyFilters}
                style={modalButtonStyle}
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición */}
      {showEditModal && editFormData && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2 style={modalTitleStyle}>Editar Sucursal</h2>
            
            <div style={modalFormStyle}>
              <div style={selectGroupStyle}>
                <label style={labelStyle}>Nombre</label>
                <input
                  type="text"
                  value={editFormData.nombre}
                  onChange={(e) => setEditFormData({...editFormData, nombre: e.target.value})}
                  style={inputStyle}
                />
              </div>

              <div style={selectGroupStyle}>
                <label style={labelStyle}>Dirección</label>
                <input
                  type="text"
                  value={editFormData.direccion}
                  onChange={(e) => setEditFormData({...editFormData, direccion: e.target.value})}
                  style={inputStyle}
                />
              </div>

              <div style={selectGroupStyle}>
                <label style={labelStyle}>Teléfono</label>
                <input
                  type="text"
                  value={editFormData.telefono}
                  onChange={(e) => setEditFormData({...editFormData, telefono: e.target.value})}
                  style={inputStyle}
                />
              </div>

              <div style={selectGroupStyle}>
                <label style={labelStyle}>Ciudad</label>
                <select 
                  value={editFormData.ciudad || ''}
                  onChange={(e) => {
                    setEditFormData({
                      ...editFormData,
                      ciudad: e.target.value,
                      comuna: '' // Reset comuna when city changes
                    });
                  }}
                  style={selectStyle}
                >
                  <option value="">Seleccionar ciudad</option>
                  {CIUDADES.map(ciudad => (
                    <option key={ciudad} value={ciudad}>{ciudad}</option>
                  ))}
                </select>
              </div>

              <div style={selectGroupStyle}>
                <label style={labelStyle}>Comuna</label>
                <select 
                  value={editFormData.comuna || ''}
                  onChange={(e) => setEditFormData({...editFormData, comuna: e.target.value})}
                  style={selectStyle}
                  disabled={!editFormData.ciudad}
                >
                  <option value="">Seleccionar comuna</option>
                  {editFormData.ciudad && COMUNAS_POR_CIUDAD[editFormData.ciudad]?.map(comuna => (
                    <option key={comuna} value={comuna}>{comuna}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={modalButtonsStyle}>
              <button 
                onClick={() => setShowEditModal(false)} 
                style={{...modalButtonStyle, backgroundColor: '#6b7280'}}
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveChanges}
                style={modalButtonStyle}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
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
  minWidth: "1400px",
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

const paginationDotsStyle: React.CSSProperties = {
  color: '#5c5c5c',
  fontSize: '1rem',
  fontFamily: 'Montserrat, sans-serif',
};

const paginationButtonActiveStyle: React.CSSProperties = {
  backgroundColor: '#5c5c5c',
  color: '#fff',
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '2rem',
  borderRadius: '12px',
  width: '90%',
  maxWidth: '500px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

const modalTitleStyle: React.CSSProperties = {
  color: '#374151',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  marginBottom: '1.5rem',
  textAlign: 'center',
};

const modalFormStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const selectGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const labelStyle: React.CSSProperties = {
  color: '#374151',
  fontSize: '0.875rem',
  fontWeight: '500',
};

const selectStyle: React.CSSProperties = {
  padding: '0.5rem',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  fontSize: '0.875rem',
  width: '100%',
};

const modalButtonsStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '1rem',
  marginTop: '2rem',
};

const modalButtonStyle: React.CSSProperties = {
  backgroundColor: '#ff7300',
  color: 'white',
  padding: '0.5rem 1rem',
  borderRadius: '6px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: '500',
};