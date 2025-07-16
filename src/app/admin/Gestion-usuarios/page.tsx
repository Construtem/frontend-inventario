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
interface Rol {
  id: number;
  nombre: string;
}

interface Usuario {
  id?: number;
  nombre: string;
  email: string;
  telefono?: string;
  rol_id?: number;
  rol?: Rol;
  estado?: string;
  fechaRegistro?: string;
}

const ROLES = ['Administrador', 'Vendedor'];
const ESTADOS = ['Activo', 'Inactivo', 'Suspendido'];

// Mapeo de roles para el API
const ROLES_MAP = [
  { id: 1, nombre: 'Administrador' },
  { id: 2, nombre: 'Vendedor' }
];

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
const sortUsuarios = (data: Usuario[]) => {
  return [...data].sort((a, b) => (a.id || 0) - (b.id || 0));
};

export default function GestionUsuariosPage() {
  const { isExtraLarge, isLarge, isMedium, isSmall, isMobile } = useWindowSize();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usuariosData, setUsuariosData] = useState<Usuario[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedRol, setSelectedRol] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("");

  // Agregar estados temporales para los filtros
  const [tempRol, setTempRol] = useState("");
  const [tempEstado, setTempEstado] = useState("");

  const apiInventarioUrl = process.env.NEXT_PUBLIC_API_INVENTARIO || 'http://localhost:8080';
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

    const fetchUsuarios = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Usando API URL:', apiInventarioUrl);
        
        // Timeout manual con AbortController
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
        
        const response = await fetch(`${apiInventarioUrl}/api/usuarios`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        clearTimeout(timeoutId);
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        // Validar que los datos tengan la estructura esperada
        if (Array.isArray(data)) {
          console.log('Cantidad de usuarios:', data.length);
          setUsuariosData(sortUsuarios(data)); // Apply sorting here
        } else {
          console.log('Los datos no son un array:', typeof data);
          setUsuariosData([]);
        }
        
      } catch (err) {
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

    fetchUsuarios();
  }, []);

  // Función para reintentar la carga de datos
  const retryFetch = () => {
    setError(null);
    setLoading(true);
    
    const fetchUsuarios = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Reintentando con API URL:', apiInventarioUrl);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${apiInventarioUrl}/api/usuarios`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        clearTimeout(timeoutId);
        
        console.log('Retry response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Datos del retry:', data);
        
        if (Array.isArray(data)) {
          console.log('Cantidad de usuarios en retry:', data.length);
          setUsuariosData(sortUsuarios(data)); // Apply sorting here
        } else {
          console.log('Los datos del retry no son un array:', typeof data);
          setUsuariosData([]);
        }
        
      } catch (err) {
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
    
    fetchUsuarios();
  };

  // Función de filtrado para usuarios
  const filteredData = useMemo(() => {
    console.log('Calculando datos filtrados...');
    console.log('usuariosData.length:', usuariosData.length);
    console.log('searchTerm:', searchTerm);
    console.log('selectedRol:', selectedRol);
    console.log('selectedEstado:', selectedEstado);
    
    const result = sortUsuarios(usuariosData.filter(usuario => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = usuario.nombre.toLowerCase().includes(searchLower) ||
                           usuario.email.toLowerCase().includes(searchLower);

      const rolNombre = usuario.rol?.nombre || '';
      const matchesRol = selectedRol ? rolNombre === selectedRol : true;
      const matchesEstado = selectedEstado ? usuario.estado === selectedEstado : true;

      return matchesSearch && matchesRol && matchesEstado;
    }));
    
    console.log('Datos filtrados length:', result.length);
    return result;
  }, [usuariosData, searchTerm, selectedRol, selectedEstado]);

  // Calcular datos paginados
  const currentTableData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const result = filteredData.slice(startIndex, endIndex);
    
    console.log('Calculando datos de tabla...');
    console.log('currentPage:', currentPage);
    console.log('itemsPerPage:', itemsPerPage);
    console.log('startIndex:', startIndex);
    console.log('endIndex:', endIndex);
    console.log('filteredData.length:', filteredData.length);
    console.log('currentTableData.length:', result.length);
    
    return result;
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
    const filtersApplied = Boolean(tempRol || tempEstado);
    
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
    setSelectedRol(tempRol);
    setSelectedEstado(tempEstado);
    setShowFilterModal(false);
    
    // Mostrar mensaje de éxito con los filtros aplicados
    Swal.fire({
      title: 'Filtros aplicados',
      html: `
        ${tempRol ? `<p>Rol: ${tempRol}</p>` : ''}
        ${tempEstado ? `<p>Estado: ${tempEstado}</p>` : ''}
      `,
      icon: 'success',
      confirmButtonColor: '#ff7300'
    });
  };

  // Estados para el modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<Usuario | null>(null);

  // Estados para el modal de agregar
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    nombre: '',
    email: '',
    rol_id: 1
  });

  // Función para manejar la edición
  const handleEdit = (usuario: Usuario) => {
    // Asegurar que todos los campos tengan valores válidos para el formulario
    const usuarioParaEditar = {
      ...usuario,
      nombre: usuario.nombre || '',
      email: usuario.email || '',
      telefono: usuario.telefono || '',
      rol_id: usuario.rol_id || usuario.rol?.id || 1,
      estado: usuario.estado || 'Activo'
    };
    setEditFormData(usuarioParaEditar);
    setShowEditModal(true);
  };

  // Función para guardar cambios
  const handleSaveChanges = async () => {
    if (!editFormData) return;

    try {
      const dataToSend = {
        nombre: editFormData.nombre || '',
        email: editFormData.email || '',
        rol_id: editFormData.rol_id || editFormData.rol?.id || 1
      };

      const response = await fetch(`${apiInventarioUrl}/api/usuarios/${editFormData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al actualizar: ${response.status} - ${errorText}`);
      }

      const updatedUsuario = await response.json();

      // Asegurar que el usuario actualizado tenga el objeto rol completo
      const usuarioConRol = {
        ...updatedUsuario,
        rol: ROLES_MAP.find(rol => rol.id === updatedUsuario.rol_id) || { id: updatedUsuario.rol_id, nombre: 'N/A' }
      };

      // Update and sort the data
      setUsuariosData(prevData => 
        sortUsuarios(prevData.map(item => 
          item.id === editFormData.id ? usuarioConRol : item
        ))
      );

      setShowEditModal(false);
      Swal.fire({
        title: 'Éxito',
        text: 'Usuario actualizado correctamente',
        icon: 'success',
        confirmButtonColor: '#ff7300'
      });
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: `No se pudo actualizar el usuario: ${err instanceof Error ? err.message : 'Error desconocido'}`,
        icon: 'error',
        confirmButtonColor: '#ff7300'
      });
    }
  };

  // Función para guardar nuevo usuario
  const handleSaveNewUsuario = async () => {
    // Validaciones
    if (!addFormData.nombre.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'El nombre es requerido',
        icon: 'error',
        confirmButtonColor: '#ff7300'
      });
      return;
    }

    if (!addFormData.email.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'El email es requerido',
        icon: 'error',
        confirmButtonColor: '#ff7300'
      });
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(addFormData.email)) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor ingrese un email válido',
        icon: 'error',
        confirmButtonColor: '#ff7300'
      });
      return;
    }

    try {
      const dataToSend = {
        nombre: addFormData.nombre,
        email: addFormData.email,
        rol_id: addFormData.rol_id
      };

      const response = await fetch(`${apiInventarioUrl}/api/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al crear el usuario: ${response.status} - ${errorText}`);
      }

      const nuevoUsuario = await response.json();

      // Asegurar que el nuevo usuario tenga el objeto rol completo
      const usuarioConRol = {
        ...nuevoUsuario,
        rol: ROLES_MAP.find(rol => rol.id === nuevoUsuario.rol_id) || { id: nuevoUsuario.rol_id, nombre: 'N/A' }
      };

      // Actualizar el estado agregando el nuevo usuario y ordenando
      setUsuariosData(prevData => sortUsuarios([...prevData, usuarioConRol]));

      setShowAddModal(false);
      // Resetear formulario
      setAddFormData({
        nombre: '',
        email: '',
        rol_id: 1
      });
      
      Swal.fire({
        title: 'Éxito',
        text: 'Usuario creado correctamente',
        icon: 'success',
        confirmButtonColor: '#ff7300'
      });
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: `No se pudo crear el usuario: ${err instanceof Error ? err.message : 'Error desconocido'}`,
        icon: 'error',
        confirmButtonColor: '#ff7300'
      });
    }
  };

  // Función para manejar agregar usuario
  const handleAddUsuario = () => {
    // Resetear el formulario
    setAddFormData({
      nombre: '',
      email: '',
      rol_id: 1
    });
    setShowAddModal(true);
  };

  // Función para eliminar usuario
  const handleDelete = (usuario: Usuario) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar al usuario "${usuario.nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Segunda confirmación
        Swal.fire({
          title: 'ATENCIÓN: Eliminación Permanente',
          html: `
            <div style="text-align: left; margin: 1rem 0;">
              <p><strong>Al eliminar este usuario:</strong></p>
              <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
                <li>Todos los datos del usuario se eliminarán <strong>PERMANENTEMENTE</strong></li>
                <li>Esta acción <strong>NO SE PUEDE DESHACER</strong></li>
                <li>Se perderán todos los registros relacionados</li>
              </ul>
              <p style="color: #ef4444; font-weight: bold;">¿Estás completamente seguro de que deseas continuar?</p>
            </div>
          `,
          icon: 'error',
          showCancelButton: true,
          confirmButtonColor: '#ef4444',
          cancelButtonColor: '#6b7280',
          confirmButtonText: 'SÍ, ELIMINAR PERMANENTEMENTE',
          cancelButtonText: 'No, cancelar',
          reverseButtons: true,
          focusCancel: true
        }).then(async (finalResult) => {
          if (finalResult.isConfirmed) {
            try {
              const response = await fetch(`${apiInventarioUrl}/api/usuarios/${usuario.id}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                },
              });

              if (!response.ok) throw new Error('Error al eliminar');

              // Actualizar el estado eliminando solo el usuario específico
              setUsuariosData(prevData => {
                const newData = prevData.filter(item => item.id !== usuario.id);
                console.log('Datos antes de eliminar:', prevData.length);
                console.log('Datos después de eliminar:', newData.length);
                console.log('Usuario eliminado ID:', usuario.id);
                
                // Verificar si necesitamos ajustar la página actual
                const searchLower = searchTerm.toLowerCase();
                const newFilteredData = newData.filter(user => {
                  const matchesSearch = user.nombre.toLowerCase().includes(searchLower) ||
                                       user.email.toLowerCase().includes(searchLower);
                  const rolNombre = user.rol?.nombre || '';
                  const matchesRol = selectedRol ? rolNombre === selectedRol : true;
                  const matchesEstado = selectedEstado ? user.estado === selectedEstado : true;
                  return matchesSearch && matchesRol && matchesEstado;
                });
                
                const newTotalPages = Math.ceil(newFilteredData.length / itemsPerPage);
                if (currentPage > newTotalPages && newTotalPages > 0) {
                  setCurrentPage(newTotalPages);
                }
                
                return newData;
              });

              Swal.fire({
                title: 'Eliminado',
                text: `El usuario "${usuario.nombre}" ha sido eliminado permanentemente`,
                icon: 'success',
                confirmButtonColor: '#ff7300'
              });
            } catch (err) {
              console.error('Error al eliminar usuario:', err);
              Swal.fire({
                title: 'Error',
                text: `No se pudo eliminar el usuario: ${err instanceof Error ? err.message : 'Error desconocido'}`,
                icon: 'error',
                confirmButtonColor: '#ff7300'
              });
            }
          }
        });
      }
    });
  };

  // Agregar función para limpiar filtros desde la barra de herramientas
  const handleClearFiltersFromToolbar = () => {
    setSelectedRol('');
    setSelectedEstado('');
    setTempRol('');
    setTempEstado('');
    setCurrentPage(1);
    Swal.fire({
      title: 'Filtros reiniciados',
      text: 'Se han eliminado todos los filtros',
      icon: 'info',
      confirmButtonColor: '#ff7300'
    });
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = Boolean(selectedRol || selectedEstado);

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={{
          ...titleStyle,
          fontSize: isMobile ? "1.5rem" : isSmall ? "1.75rem" : "2rem",
          marginBottom: "1.5rem"
        }}>Gestión de Usuarios</h1>
        
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
                placeholder="Buscar por Nombre o Email..."
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
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                style={{
                  ...filterButtonStyle,
                  width: isMobile ? "100%" : "auto",
                  fontSize: isMobile ? "0.875rem" : "1rem",
                  padding: isMobile ? "0.75rem" : "0.5rem 1.2rem",
                  backgroundColor: hasActiveFilters ? '#ff7300' : '#5c5c5c',
                  position: 'relative'
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

          <div style={{
            ...rightControlsWrapperStyle,
            width: isMobile ? "100%" : "auto",
            marginTop: isMobile ? "1rem" : isSmall ? "1rem" : "0"
          }}>
            <button 
              onClick={handleAddUsuario}
              style={{
                ...editButtonStyle,
                width: isMobile ? "100%" : "auto",
                fontSize: isMobile ? "0.875rem" : "1rem",
                padding: isMobile ? "0.75rem" : "0.5rem 1.2rem",
              }}
            >
              <Image
                src={agregarImg.src}
                alt="Agregar usuario"
                width={20}
                height={20}
                style={filterIconStyle}
              />
              AGREGAR USUARIO
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
              <div style={{ fontSize: '1.1rem', color: '#666' }}>Cargando usuarios...</div>
              <div style={{ fontSize: '0.9rem', color: '#999', marginTop: '0.5rem' }}>
                Conectando con el servidor
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
              <div style={{ fontSize: '1.1rem', color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>
                Error al cargar usuarios
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '2rem', textAlign: 'center', whiteSpace: 'pre-line' }}>
                {error}
              </div>
              <button 
                onClick={retryFetch}
                style={{
                  ...editButtonStyle,
                  backgroundColor: '#ef4444'
                }}
              >
                Reintentar conexión
              </button>
            </div>
          ) : (
            <>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Nombre</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Rol</th>
                    <th style={thStyle}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTableData && currentTableData.length > 0 ? (
                    currentTableData.map((usuario, index) => (
                      <tr key={usuario.id || `user-${index}`}>
                        <td style={tdStyle}>{usuario.nombre}</td>
                        <td style={tdStyle}>{usuario.email}</td>
                        <td style={tdStyle}>{usuario.rol?.nombre || 'N/A'}</td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleEdit(usuario)}
                              style={{
                                backgroundColor: '#ff7300',
                                color: 'white',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(usuario)}
                              style={{
                                backgroundColor: '#ef4444',
                                color: 'white',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{...tdStyle, textAlign: 'center', padding: '2rem', color: '#666'}}>
                        {usuariosData.length === 0 ? 'No hay usuarios disponibles' : 'No hay usuarios en esta página'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {filteredData.length === 0 && !loading && (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: '#666',
                  fontSize: '1rem'
                }}>
                  No se encontraron usuarios que coincidan con los criterios de búsqueda.
                </div>
              )}

              {totalPages > 1 && (
                <div style={paginationContainerStyle}>
                  <div style={paginationControlsStyle}>
                    <button 
                      onClick={handlePrevPage} 
                      disabled={currentPage === 1}
                      style={{
                        ...paginationButtonBaseStyle,
                        opacity: currentPage === 1 ? 0.5 : 1,
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Anterior
                    </button>
                    
                    <div style={paginationButtonsWrapperStyle}>
                      {renderPaginationButtons()}
                    </div>
                    
                    <button 
                      onClick={handleNextPage} 
                      disabled={currentPage === totalPages}
                      style={{
                        ...paginationButtonBaseStyle,
                        opacity: currentPage === totalPages ? 0.5 : 1,
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Siguiente
                    </button>
                  </div>
                  
                  <div style={{ 
                    textAlign: 'center', 
                    marginTop: '1rem', 
                    color: '#666',
                    fontSize: '0.875rem'
                  }}>
                    Página {currentPage} de {totalPages} | Total: {filteredData.length} usuarios
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de filtros */}
      {showFilterModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={modalTitleStyle}>Filtrar Usuarios</h2>
              <button onClick={() => setShowFilterModal(false)} style={closeButtonStyle}>
                ×
              </button>
            </div>
            
            <div style={modalFormStyle}>
              <div style={selectGroupStyle}>
                <label style={labelStyle}>Rol</label>
                <select 
                  value={tempRol}
                  onChange={(e) => setTempRol(e.target.value)}
                  style={selectStyle}
                >
                  <option value="">Todos los roles</option>
                  {ROLES_MAP.map(rol => (
                    <option key={rol.id} value={rol.nombre}>{rol.nombre}</option>
                  ))}
                </select>
              </div>

              <div style={selectGroupStyle}>
                <label style={labelStyle}>Estado</label>
                <select 
                  value={tempEstado}
                  onChange={(e) => setTempEstado(e.target.value)}
                  style={selectStyle}
                >
                  <option value="">Todos los estados</option>
                  {ESTADOS.map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={modalButtonsStyle}>
              <button 
                onClick={() => {
                  setTempRol('');
                  setTempEstado('');
                }}
                style={{...modalButtonStyle, backgroundColor: '#6b7280'}}
              >
                Limpiar
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

      {/* Modal de edición */}
      {showEditModal && editFormData && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={modalTitleStyle}>Editar Usuario</h2>
              <button onClick={() => setShowEditModal(false)} style={closeButtonStyle}>
                ×
              </button>
            </div>
            
            <div style={modalFormStyle}>
              <div style={selectGroupStyle}>
                <label style={labelStyle}>Nombre</label>
                <input
                  type="text"
                  value={editFormData.nombre || ''}
                  onChange={(e) => setEditFormData({...editFormData, nombre: e.target.value})}
                  style={inputStyle}
                />
              </div>

              <div style={selectGroupStyle}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={editFormData.email || ''}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  style={inputStyle}
                />
              </div>

              <div style={selectGroupStyle}>
                <label style={labelStyle}>Rol</label>
                <select 
                  value={editFormData.rol_id || editFormData.rol?.id || 1}
                  onChange={(e) => setEditFormData({...editFormData, rol_id: parseInt(e.target.value)})}
                  style={selectStyle}
                >
                  {ROLES_MAP.map(rol => (
                    <option key={rol.id} value={rol.id}>{rol.nombre}</option>
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

      {/* Modal de agregar */}
      {showAddModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={modalTitleStyle}>Agregar Usuario</h2>
              <button onClick={() => setShowAddModal(false)} style={closeButtonStyle}>
                ×
              </button>
            </div>
            
            <div style={modalFormStyle}>
              <div style={selectGroupStyle}>
                <label style={labelStyle}>Nombre</label>
                <input
                  type="text"
                  value={addFormData.nombre}
                  onChange={(e) => setAddFormData({...addFormData, nombre: e.target.value})}
                  style={inputStyle}
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div style={selectGroupStyle}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={addFormData.email}
                  onChange={(e) => setAddFormData({...addFormData, email: e.target.value})}
                  style={inputStyle}
                  placeholder="Ej: juan@empresa.com"
                />
              </div>

              <div style={selectGroupStyle}>
                <label style={labelStyle}>Rol</label>
                <select 
                  value={addFormData.rol_id}
                  onChange={(e) => setAddFormData({...addFormData, rol_id: parseInt(e.target.value)})}
                  style={selectStyle}
                >
                  {ROLES_MAP.map(rol => (
                    <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={modalButtonsStyle}>
              <button 
                onClick={() => setShowAddModal(false)} 
                style={{...modalButtonStyle, backgroundColor: '#6b7280'}}
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveNewUsuario}
                style={modalButtonStyle}
              >
                Crear Usuario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Estilos (mismos que sucursales)
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
  minWidth: "800px",
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
  flexDirection: 'column',
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
  justifyContent: 'center',
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
  maxHeight: '90vh',
  overflowY: 'auto',
};

const modalTitleStyle: React.CSSProperties = {
  color: '#374151',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  marginBottom: '1.5rem',
  textAlign: 'center',
  fontFamily: 'Montserrat, sans-serif',
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

const closeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '1.5rem',
  cursor: 'pointer',
  padding: '0.5rem',
  color: '#6b7280',
  transition: 'color 0.2s ease',
  borderRadius: '4px',
  width: '2rem',
  height: '2rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
