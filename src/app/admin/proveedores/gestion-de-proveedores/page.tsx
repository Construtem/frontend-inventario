"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Swal from 'sweetalert2';

// Importaciones de imágenes
import filtrosImg from "@/styles/images/filtros.png";
import agregarImg from "@/styles/images/agregar.png";
import buscarImg from "@/styles/images/buscar.png";


// Interfaz para los datos de proveedores
interface Proveedor {
  id: number;
  marca: string;
  email: string;
  telefono: string;
  direccion: string;
}

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

export default function GestionProveedoresPage() {
  const { isExtraLarge, isLarge, isMedium, isSmall, isMobile } = useWindowSize();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proveedoresData, setProveedoresData] = useState<Proveedor[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [filtroFechas, setFiltroFechas] = useState(false);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // Efecto para cargar los datos
  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Intentando conectar con la API de proveedores...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('http://localhost:8080/api/proveedores', {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Datos recibidos:', data);
        
        if (Array.isArray(data)) {
          setProveedoresData(data);
        } else {
          console.warn('⚠️ Los datos no son un array:', data);
          setProveedoresData([]);
        }
        
      } catch (err) {
        console.error('❌ Error al cargar datos de proveedores:', err);
        
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

    fetchProveedores();
  }, []);

  // Función para reintentar la carga de datos
  const retryFetch = () => {
    setError(null);
    setLoading(true);
    
    const fetchProveedores = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/proveedores', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setProveedoresData(data);
          setError(null);
        } else {
          throw new Error('Los datos recibidos no tienen el formato esperado');
        }
      } catch (err) {
        console.error('Error al recargar datos:', err);
        setError(err instanceof Error ? err.message : 'Error al recargar los datos');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProveedores();
  };

  // Función para manejar el botón de filtros
  const handleFiltros = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Filtros',
      html: `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <label for="fecha-inicio" style="display: block; margin-bottom: 0.5rem;">Fecha Inicio:</label>
            <input type="date" id="fecha-inicio" class="swal2-input" ${fechaInicio ? `value="${fechaInicio}"` : ''}>
          </div>
          <div>
            <label for="fecha-fin" style="display: block; margin-bottom: 0.5rem;">Fecha Fin:</label>
            <input type="date" id="fecha-fin" class="swal2-input" ${fechaFin ? `value="${fechaFin}"` : ''}>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Aplicar Filtros',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ff7300',
      preConfirm: () => {
        const inicio = (document.getElementById('fecha-inicio') as HTMLInputElement).value;
        const fin = (document.getElementById('fecha-fin') as HTMLInputElement).value;
        if (inicio && fin && new Date(inicio) > new Date(fin)) {
          Swal.showValidationMessage('La fecha de inicio no puede ser mayor que la fecha fin');
          return false;
        }
        return [inicio, fin];
      }
    });

    if (formValues) {
      const [inicio, fin] = formValues;
      setFechaInicio(inicio);
      setFechaFin(fin);
      setFiltroFechas(true);
      // Aquí implementarías la lógica para filtrar por fechas
    }
  };

  // Función para agregar un nuevo proveedor
  const handleAgregarProveedor = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Agregar Nuevo Proveedor',
      html: `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <input type="text" id="marca" class="swal2-input" placeholder="Marca">
          <input type="email" id="email" class="swal2-input" placeholder="Email">
          <input type="tel" id="telefono" class="swal2-input" placeholder="Teléfono">
          <input type="text" id="direccion" class="swal2-input" placeholder="Dirección">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ff7300',
      preConfirm: () => {
        const marca = (document.getElementById('marca') as HTMLInputElement).value;
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const telefono = (document.getElementById('telefono') as HTMLInputElement).value;
        const direccion = (document.getElementById('direccion') as HTMLInputElement).value;

        if (!marca || !email || !telefono || !direccion) {
          Swal.showValidationMessage('Todos los campos son requeridos');
          return false;
        }

        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          Swal.showValidationMessage('Email inválido');
          return false;
        }

        return { marca, email, telefono, direccion };
      }
    });

    if (formValues) {
      try {
        const response = await fetch('http://localhost:8080/api/proveedores', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formValues),
        });

        if (!response.ok) throw new Error('Error al crear el proveedor');

        const nuevoProveedor = await response.json();
        setProveedoresData([...proveedoresData, nuevoProveedor]);

        await Swal.fire({
          title: '¡Éxito!',
          text: 'Proveedor agregado correctamente',
          icon: 'success',
          confirmButtonColor: '#ff7300'
        });
      } catch (error) {
        console.error('Error:', error);
        await Swal.fire({
          title: 'Error',
          text: 'No se pudo agregar el proveedor',
          icon: 'error',
          confirmButtonColor: '#ff7300'
        });
      }
    }
  };

  // Función para editar un proveedor
  const handleEditar = async (proveedor: Proveedor) => {
    const { value: formValues } = await Swal.fire({
      title: 'Editar Proveedor',
      html: `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <input type="text" id="marca" class="swal2-input" placeholder="Marca" value="${proveedor.marca}">
          <input type="email" id="email" class="swal2-input" placeholder="Email" value="${proveedor.email}">
          <input type="tel" id="telefono" class="swal2-input" placeholder="Teléfono" value="${proveedor.telefono}">
          <input type="text" id="direccion" class="swal2-input" placeholder="Dirección" value="${proveedor.direccion}">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar Cambios',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ff7300',
      preConfirm: () => {
        const marca = (document.getElementById('marca') as HTMLInputElement).value;
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const telefono = (document.getElementById('telefono') as HTMLInputElement).value;
        const direccion = (document.getElementById('direccion') as HTMLInputElement).value;

        if (!marca || !email || !telefono || !direccion) {
          Swal.showValidationMessage('Todos los campos son requeridos');
          return false;
        }

        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          Swal.showValidationMessage('Email inválido');
          return false;
        }

        return { marca, email, telefono, direccion };
      }
    });

    if (formValues) {
      try {
        const response = await fetch(`http://localhost:8080/api/proveedores/${proveedor.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...formValues, id: proveedor.id }),
        });

        if (!response.ok) throw new Error('Error al actualizar el proveedor');

        const proveedorActualizado = await response.json();
        setProveedoresData(proveedoresData.map(p => 
          p.id === proveedor.id ? proveedorActualizado : p
        ));

        await Swal.fire({
          title: '¡Éxito!',
          text: 'Proveedor actualizado correctamente',
          icon: 'success',
          confirmButtonColor: '#ff7300'
        });
      } catch (error) {
        console.error('Error:', error);
        await Swal.fire({
          title: 'Error',
          text: 'No se pudo actualizar el proveedor',
          icon: 'error',
          confirmButtonColor: '#ff7300'
        });
      }
    }
  };

  // Función para eliminar un proveedor
  const handleEliminar = async (proveedor: Proveedor) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el proveedor ${proveedor.marca}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:8080/api/proveedores/${proveedor.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Error al eliminar el proveedor');

        setProveedoresData(proveedoresData.filter(p => p.id !== proveedor.id));

        await Swal.fire({
          title: '¡Eliminado!',
          text: 'El proveedor ha sido eliminado correctamente',
          icon: 'success',
          confirmButtonColor: '#ff7300'
        });
      } catch (error) {
        console.error('Error:', error);
        await Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar el proveedor',
          icon: 'error',
          confirmButtonColor: '#ff7300'
        });
      }
    }
  };

  // Filtrar datos según búsqueda
  const filteredData = useMemo(() => {
    return proveedoresData
      .sort((a, b) => (a?.id || 0) - (b?.id || 0)) // Ordenar por ID ascendente
      .filter(item => {
      const searchLower = searchTerm.toLowerCase();
      return (
          (item?.id?.toString() || '').includes(searchLower) ||
          (item?.marca?.toLowerCase() || '').includes(searchLower) ||
          (item?.email?.toLowerCase() || '').includes(searchLower) ||
          (item?.telefono?.toLowerCase() || '').includes(searchLower) ||
          (item?.direccion?.toLowerCase() || '').includes(searchLower)
      );
    });
  }, [proveedoresData, searchTerm]);

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
        }}>Gestión de Proveedores</h1>
        
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
                placeholder="Buscar por ID, Marca, Email..."
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
              onClick={handleFiltros}
              style={{
              ...filterButtonStyle,
              width: isMobile ? "100%" : "auto",
              fontSize: isMobile ? "0.875rem" : "1rem",
              padding: isMobile ? "0.75rem" : "0.5rem 1.2rem"
              }}
            >
              <Image
                src={filtrosImg.src}
                alt="Filtros"
                width={20}
                height={20}
                style={filterIconStyle}
              />
              Filtros
              {filtroFechas && <span style={{ marginLeft: '5px', fontSize: '0.8em' }}>•</span>}
            </button>
          </div>

          <div style={{
            ...rightControlsWrapperStyle,
            width: isMobile ? "100%" : "auto",
            marginTop: isMobile ? "1rem" : isSmall ? "1rem" : "0"
          }}>
            <button 
              onClick={handleAgregarProveedor}
              style={{
              ...editButtonStyle,
              width: isMobile ? "100%" : "auto",
              fontSize: isMobile ? "0.875rem" : "1rem",
              padding: isMobile ? "0.75rem" : "0.5rem 1.2rem"
              }}
            >
              <Image
                src={agregarImg.src}
                alt="Agregar proveedor"
                width={20}
                height={20}
                style={filterIconStyle}
              />
              AGREGAR PROVEEDOR
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
                <th style={thStyle}>ID Proveedor</th>
                <th style={thStyle}>Nombre</th>
                <th style={thStyle}>Correo electrónico</th>
                <th style={thStyle}>Teléfono</th>
                <th style={thStyle}>Dirección</th>
                <th style={thStyle}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ ...tdStyle, textAlign: "center", padding: "2rem" }}>
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
                      <div style={{ fontSize: '1.1rem', color: '#666' }}>Cargando proveedores...</div>
                      <div style={{ fontSize: '0.9rem', color: '#999', marginTop: '0.5rem' }}>
                        Conectando con http://localhost:8080
                      </div>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} style={{ ...tdStyle, textAlign: "center", padding: "2rem" }}>
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
                        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>❌ Error al cargar los proveedores</div>
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
                            console.log('• URL del backend:', 'http://localhost:8080/api/proveedores');
                            console.log('• User Agent:', navigator.userAgent);
                            console.log('• Conexión:', navigator.onLine ? 'En línea' : 'Sin conexión');
                            Swal.fire({
                              title: 'Diagnóstico',
                              text: 'Información de diagnóstico enviada a la consola del navegador (F12)',
                              icon: 'info',
                              confirmButtonColor: '#ff7300'
                            });
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
                          <li>Intentar acceder directamente a: <a href="http://localhost:8080/api/proveedores" target="_blank" style={{ color: '#3b82f6' }}>http://localhost:8080/api/proveedores</a></li>
                        </ul>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : currentTableData.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ ...tdStyle, textAlign: "center", padding: "2rem" }}>
                    No hay proveedores disponibles
                  </td>
                </tr>
              ) : (
                currentTableData.map((item, index) => (
                  <tr key={item?.id || `proveedor-${index}`}>
                    <td style={tdStyle}>{item?.id || '-'}</td>
                    <td style={tdStyle}>{item?.marca || '-'}</td>
                    <td style={tdStyle}>{item?.email || '-'}</td>
                    <td style={tdStyle}>{item?.telefono || '-'}</td>
                    <td style={tdStyle}>{item?.direccion || '-'}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", justifyContent: "center", gap: "5px" }}>
                        <button 
                          key={`edit-${item?.id || index}`}
                          onClick={() => handleEditar(item)}
                          style={{
                          ...modifyProductButtonStyle,
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          maxWidth: '60px'
                          }}
                        >
                          EDITAR
                        </button>
                        <button 
                          key={`delete-${item?.id || index}`}
                          onClick={() => handleEliminar(item)}
                          style={{
                          ...modifyProductButtonStyle,
                          backgroundColor: '#ef4444',
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          maxWidth: '60px'
                          }}
                        >
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