"use client";

import React, { useEffect, useState, useMemo } from "react";
import filtrosImg from "@/styles/images/filtros.png";
import buscarImg from "@/styles/images/buscar.png";
import Image from "next/image";
import Swal from "sweetalert2";

// =====================
// 1. INTERFACES DE DATOS
// =====================
interface Producto {
  id: number;
  sku: string;
  nombre: string;
  descripcion: string;
  peso: number;
  alto: number;
  ancho: number;
  precio: number;
  cantidad?: number;
}

interface ProductoDespachoDetallado {
  despacho_id: number;
  sku: string;
  cantidad: number;
  id?: number;
  nombre?: string;
  descripcion?: string;
  peso?: number;
  alto?: number;
  ancho?: number;
  precio?: number;
  productos?: {
    id: number;
    sku: string;
    nombre: string;
    descripcion: string;
    peso: number;
    largo?: number;
    ancho: number;
    alto: number;
    precio: number;
  };
}

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
  estado: string;
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
// 2. SWEET ALERT2 ESTILOS
// =====================
function objToInlineCss(styleObj: React.CSSProperties): string {
  return Object.entries(styleObj)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${value};`;
    })
    .join(' ');
}

const estiloSwalTituloObj: React.CSSProperties = {
  fontFamily: "'Montserrat', sans-serif",
  fontSize: '1.5rem',
  fontWeight: '600',
  color: '#222'
};

const estiloSwalTextoObj: React.CSSProperties = {
  fontFamily: "'Roboto', sans-serif",
  fontSize: '1rem',
  fontWeight: '400',
  color: '#333'
};

const estiloSwalTextoConMargenObj: React.CSSProperties = {
  ...estiloSwalTextoObj,
  marginTop: '10px'
};

const swalTituloCssString = objToInlineCss(estiloSwalTituloObj);
const swalTextoCssString = objToInlineCss(estiloSwalTextoObj);
const swalTextoConMargenCssString = objToInlineCss(estiloSwalTextoConMargenObj);

// =====================
// 3. HOOK PARA RESPONSIVE
// =====================
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
// 4. COMPONENTE PRINCIPAL
// =====================
export default function DespachoPage() {
  // Estados principales
  const [despachos, setDespachos] = useState<Despacho[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOffline, setIsOffline] = useState(false);
  
  // Estados de filtros y búsqueda
  const [sucursal, setSucursal] = useState("");
  const [estado, setEstado] = useState("");
  const [search, setSearch] = useState("");
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  // Estados del modal de productos
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedDespachoId, setSelectedDespachoId] = useState<number | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  
  // Estados del modal de filtros
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempSucursal, setTempSucursal] = useState("");
  const [tempEstado, setTempEstado] = useState("");
  
  // Hooks y configuración
  const { isExtraLarge, isLarge, isMedium, isSmall, isMobile } = useWindowSize();
  const apiInventarioUrl = process.env.NEXT_PUBLIC_API_INVENTARIO || "https://api-inventario.tssw.cl";

  // =====================
  // 5. FUNCIONES AUXILIARES
  // =====================
  const getSearchWidth = (): string => {
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
  // 6. EFECTOS
  // =====================
  useEffect(() => {
    const fetchDespachos = async () => {
      try {
        setLoading(true);
        setError("");
        setIsOffline(false);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const res = await fetch(`${apiInventarioUrl}/api/despachos`, {
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
          estado: d.estado || "pendiente",
          camion: d.camion?.patente || "Camión no asignado",
          cantidadItems: d.cantidad_items || 0,
          totalKg: d.total_kg || 0,
        }));

        setDespachos(clean);
        
      } catch (error: unknown) {
        console.warn("Backend no disponible:", error);
        
        let errorMessage = "Error desconocido al cargar datos";
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            errorMessage = "Tiempo de espera agotado al conectar con el servidor";
          } else if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
            errorMessage = '•No se pudo conectar al servidor.\n• Verifique su conexión a internet o contacte al administrador del sistema.';
          } else {
            errorMessage = error.message;
          }
        }
        setError(errorMessage);
        setIsOffline(true);
        
      } finally {
        setLoading(false);
      }
    };

    fetchDespachos();
  }, [apiInventarioUrl]);

  // =====================
  // 7. HANDLERS
  // =====================
  const handleRetry = () => {
    setError("");
    setIsOffline(false);
    window.location.reload();
  };

  const handleDelete = async (id: number) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: `¿Deseas eliminar el despacho #${id}?`,
    icon: 'warning',
    showCancelButton: true,
    showCloseButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  });

  if (!result.isConfirmed) return;

  if (isOffline) {
    Swal.fire({
      icon: 'error',
      title: 'Sin conexión',
      text: 'No se puede eliminar en modo offline. Reconecta al servidor.',
      confirmButtonColor: '#ff7300',
    });
    return;
  }

  try {
    const res = await fetch(`${apiInventarioUrl}/api/despachos/${id}`, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Error al eliminar despacho: ${res.status} ${res.statusText}`);
    }

    setDespachos((prev) => prev.filter((d) => d.id !== id));

    // Mensaje personalizado
    Swal.fire({
      html: `
        <div style="text-align: left;">
          <p><strong>El despacho #${id} ha sido eliminado permanentemente.</strong></p>
        </div>
      `,
      icon: 'success',
      confirmButtonColor: '#ff7300',
      showCloseButton: true,
      timer: 5000,
      timerProgressBar: true
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido al eliminar";
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonColor: '#ff7300',
    });
  }
};

  const handleViewProducts = async (despachoId: number) => {
    setSelectedDespachoId(despachoId);
    setShowProductModal(true);
    setLoadingProductos(true);
    
    try {
      console.log(`Consultando productos detallados para despacho ID: ${despachoId}`);
      
      const res = await fetch(`${apiInventarioUrl}/api/productos_despacho/despacho/${despachoId}/detallado`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`Respuesta del servidor: ${res.status} ${res.statusText}`);
      
      if (!res.ok) {
        throw new Error(`Error del servidor: ${res.status} ${res.statusText}`);
      }

      const productosData = await res.json();
      console.log("Datos de productos detallados recibidos:", productosData);
      
      const productosFormateados = productosData.map((item: ProductoDespachoDetallado) => ({
        id: item.productos?.id || item.id || item.sku || Math.random(),
        sku: item.sku || item.productos?.sku || 'N/A',
        nombre: item.productos?.nombre || item.nombre || 'N/A',
        descripcion: item.productos?.descripcion || item.descripcion || 'N/A',
        peso: Number(item.productos?.peso || item.peso || 0),
        alto: Number(item.productos?.alto || item.alto || 0),
        ancho: Number(item.productos?.ancho || item.ancho || 0),
        precio: Number(item.productos?.precio || item.precio || 0),
        cantidad: Number(item.cantidad || 1)
      }));
      
      setProductos(productosFormateados);
      
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setProductos([
        {
          id: 1,
          sku: "SKU001",
          nombre: "Producto Ejemplo 1",
          descripcion: "Descripción del producto ejemplo",
          peso: 25.5,
          alto: 30,
          ancho: 20,
          precio: 15000
        },
        {
          id: 2,
          sku: "SKU002", 
          nombre: "Producto Ejemplo 2",
          descripcion: "Otra descripción de producto",
          peso: 18.3,
          alto: 25,
          ancho: 15,
          precio: 12000
        }
      ]);
    } finally {
      setLoadingProductos(false);
    }
  };

  const handleCloseModal = () => {
    setShowProductModal(false);
    setSelectedDespachoId(null);
    setProductos([]);
  };

  const handleFiltersProduct = () => {
    setTempSucursal(sucursal);
    setTempEstado(estado);
    setShowFilterModal(true);
  };

  const handleApplyFilters = () => {
    setSucursal(tempSucursal);
    setEstado(tempEstado);
    setCurrentPage(1);
    setShowFilterModal(false);
    
    if (tempSucursal || tempEstado) {
      const filtrosAplicados = [];
      if (tempSucursal) filtrosAplicados.push(`Sucursal: ${tempSucursal}`);
      if (tempEstado) filtrosAplicados.push(`Estado: ${tempEstado}`);
      
      Swal.fire({
        html: `
          <div style="${swalTituloCssString}">
            Filtros Aplicados
          </div>
          <div style="${swalTextoConMargenCssString}">
            ${filtrosAplicados.join('<br>')}
          </div>
        `,
        icon: 'success',
        confirmButtonText: 'ACEPTAR',
        confirmButtonColor: '#ff7300',
        timer: 3000,
        timerProgressBar: true,
        showCloseButton: true
      });
    }
  };

  const handleClearFilters = () => {
    setTempSucursal("");
    setTempEstado("");
    setSucursal("");
    setEstado("");
    setCurrentPage(1);
    setShowFilterModal(false);

    Swal.fire({
      html: `
        <div style="${swalTituloCssString}">
          Filtros Eliminados
        </div>
        <div style="${swalTextoConMargenCssString}">
          Se han eliminado todos los filtros aplicados.
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'ACEPTAR',
      confirmButtonColor: '#ff7300',
      timer: 3000,
      timerProgressBar: true,
      showCloseButton: true
    });
  };

  const handleClearFiltersFromToolbar = () => {
    setSucursal("");
    setEstado("");
    setTempSucursal("");
    setTempEstado("");
    setCurrentPage(1);

    Swal.fire({
      html: `
        <div style="${swalTituloCssString}">
          Filtros Eliminados
        </div>
        <div style="${swalTextoConMargenCssString}">
          Se han eliminado todos los filtros aplicados.
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'ACEPTAR',
      confirmButtonColor: '#ff7300',
      timer: 3000,
      timerProgressBar: true,
      showCloseButton: true
    });
  };

  // Handlers de paginación
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handlePageClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // =====================
  // 8. DATOS COMPUTADOS
  // =====================
  const hasActiveFilters = Boolean(sucursal || estado);

  const filteredDespachos = useMemo(() => {
    return despachos.filter((d) => {
      const matchesSearch = search === "" || 
        `${d.cliente} ${d.origen} ${d.destino} ${d.camion} ${d.estado}`
          .toLowerCase()
          .includes(search.toLowerCase());
      
      const matchesSucursal = sucursal === "" || d.origen === sucursal;
      const matchesEstado = estado === "" || d.estado === estado;
      
      return matchesSearch && matchesSucursal && matchesEstado;
    });
  }, [despachos, search, sucursal, estado]);

  const currentTableData = useMemo(() => {
    return filteredDespachos.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredDespachos, currentPage, itemsPerPage]);
  
  const totalPages = Math.ceil(filteredDespachos.length / itemsPerPage);

  // =====================
  // 9. RENDER
  // =====================
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Gestión de Despachos</h1>

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
                placeholder="Buscar por cliente, origen o destino..."
                value={search}
                maxLength={70}
                onChange={(e) => {
                  const valor = e.target.value;
                  if (valor === '' || /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s@]*$/.test(valor)) {
                    setSearch(valor);
                  }
                }}
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
              {!hasActiveFilters ? (
                <button style={{
                  ...filterButtonStyle, 
                  ...entirePieceFilterButtonStyle,
                  width: isMobile ? "100%" : "auto",
                  fontSize: isMobile ? "0.875rem" : "1rem",
                  padding: isMobile ? "0.75rem" : "0.5rem 1.2rem",
                  }}
                  onClick={handleFiltersProduct}>
                    <Image
                      src={filtrosImg.src}
                      alt="Filtros"
                      width={20}
                      height={20}
                      style={filterIconStyle}
                    />
                    Filtros
                  </button>
                ) : (
                <div style={{ display: 'flex' }}>
                  <button style={{
                    ...filterButtonStyle,
                    ...firstPieceFilterButtonStyle,
                    width: isMobile ? "calc(100% - 80px)" : "auto",
                    fontSize: isMobile ? "0.875rem" : "1rem",
                    padding: isMobile ? "0.75rem" : "0.5rem 1.2rem",
                  }} onClick={handleFiltersProduct}>
                    <Image
                      src={filtrosImg.src}
                      alt="Filtros"
                      width={20}
                      height={20}
                      style={filterIconStyle}
                    />
                    Filtros
                  </button>
                  <button
                    onClick={handleClearFiltersFromToolbar}
                    style={{
                      ...filterButtonStyle,
                      ...secondPieceFilterButtonStyle,
                      width: isMobile ? "80px" : "auto",
                      fontSize: isMobile ? "0.75rem" : "0.875rem",
                      padding: isMobile ? "0.75rem 0.5rem" : "0.5rem 1rem",
                    }}
                    title="Limpiar Filtros"
                  >
                    <span style={xClosebuttonStyle}>×</span>
                    {!isMobile && 'Limpiar'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mostrar errores y estado offline SOLO dentro del card */}
        {(loading || error) ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '3rem',
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            minHeight: '300px',
            margin: '2rem 0'
          }}>
            {loading ? (
              <>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #f3f4f6',
                  borderTop: '4px solid #ff7300',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginBottom: '1rem'
                }} />
                <div style={loadingDespachosStyle}>Cargando despachos. Espere un momento...</div>
                <style>
                  {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
                </style>
              </>
            ) : (
              <>
                <div style={{ 
                  fontSize: '1.1rem', 
                  color: '#ef4444',
                  textAlign: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '1rem', fontFamily: 'Montserrat, sans-serif', fontSize: '1.5rem' }}>
                    Error al cargar los despachos
                  </div>
                  <div style={{ 
                    fontSize: '1rem', 
                    marginTop: '0.5rem',
                    whiteSpace: 'normal',
                    lineHeight: '1.5',
                    color: '#666'
                  }}>
                    {error || "No se pudo conectar con el servidor. \nVerifique su conexión a internet o contacte al administrador del sistema."}
                  </div>
                </div>
                <button
                  onClick={handleRetry}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                    minWidth: '120px'
                  }}
                >
                  Reintentar
                </button>
              </>
            )}
          </div>
        ) : (
          <>
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
                      "Productos",
                      "Ruta",
                      "PDF",
                      "Acción",
                    ].map((col) => (
                      <th key={col} style={thStyle}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredDespachos.length === 0 ? (
                    <tr>
                      <td colSpan={13} style={tdStyle}>
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
                          color: d.estado === "aprobado" || d.estado === "aprobada" ? "#16a34a" : 
                                 d.estado === "rechazado" || d.estado === "rechazada" ? "#ef4444" :
                                 d.estado === "cancelado" || d.estado === "cancelada" ? "#ef4444" :
                                 d.estado === "enviado" || d.estado === "enviada" ? "#2563eb" :
                                 d.estado === "pendiente" ? "#f59e0b" : "#6b7280"
                        }}>
                          {d.estado.charAt(0).toUpperCase() + d.estado.slice(1)}
                        </td>
                        <td style={tdStyle}>{d.camion}</td>
                        <td style={tdStyle}>{d.cantidadItems}</td>
                        <td style={tdStyle}>
                          <span
                            onClick={() => handleViewProducts(d.id)}
                            style={{
                              color: "#ff7300",
                              fontWeight: "bold",
                              textDecoration: "none",
                              cursor: "pointer",
                            }}
                          >
                            Ver Productos
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <a
                            href={`/admin/despacho/ruta?despachoId=${d.id}`}
                            style={{
                              color: "#2563eb",
                              fontWeight: "bold",
                              textDecoration: "underline",
                              cursor: "pointer",
                            }}
                          >
                            Ver ruta
                          </a>
                        </td>
                        <td style={tdStyle}>
                          <a
                            href={`${apiInventarioUrl}/api/despachos/${d.id}/pdf`}
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
                          <button
                            onClick={() => handleDelete(d.id)}
                            style={deleteButtonStyle}
                            title="Eliminar despacho"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
        
      {filteredDespachos.length > 0 && (
        <div style={{
          ...paginationControlsStyle,
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? "1rem" : "1rem",
          padding: isMobile ? "1rem" : "0.5rem 1rem"
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: isMobile ? "100%" : "auto",
            gap: "1rem"
          }}>
            <button 
              onClick={handlePrevPage} 
              disabled={currentPage === 1} 
              style={{
                ...paginationButtonBaseStyle,
                ...(currentPage === 1 ? paginationButtonDisabledStyle : {}),
                flex: isMobile ? "1" : "none",
                minWidth: isMobile ? "auto" : "80px"
              }}
            >
              Anterior
            </button>
            
            <div style={{
              ...pageIndicatorStyle,
              margin: isMobile ? "0" : "0",
              flex: isMobile ? "0 0 auto" : "none"
            }}>
              {currentPage} de {totalPages}
              {!isMobile && <span style={{ marginLeft: '0.5rem' }}>página(s)</span>}
            </div>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              style={{
                ...paginationButtonBaseStyle,
                ...(currentPage === totalPages ? paginationButtonDisabledStyle : {}),
                flex: isMobile ? "1" : "none",
                minWidth: isMobile ? "auto" : "80px"
              }}
            >
              Siguiente
            </button>
          </div>
          
          {totalPages > 1 && (
            <div style={{
              ...paginationButtonsWrapperStyle,
              justifyContent: isMobile ? "center" : "flex-start",
              flexWrap: isMobile ? "wrap" : "nowrap",
              width: isMobile ? "100%" : "auto"
            }}>
            </div>
          )}
        </div>
      )}

      {/* Modal de Productos */}
      {showProductModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>
                Productos del Despacho #{selectedDespachoId}
              </h2>
              <span 
                onClick={handleCloseModal}
                style={closeButtonStyle}
              >
                ✕
              </span>
            </div>
            
            <div style={modalBodyStyle}>
              {loadingProductos ? (
                <div style={loadingStyle}>Cargando productos...</div>
              ) : (
                <>
                  <div style={summaryStyle}>
                    <div style={summaryItemStyle}>
                      <strong>Total Kgs: </strong>
                      {productos.reduce((total, p) => {
                        const peso = Number(p.peso) || 0;
                        const cantidad = Number(p.cantidad) || 1;
                        return total + (peso * cantidad);
                      }, 0).toFixed(2)} kg
                    </div>
                    <div style={summaryItemStyle}>
                      <strong>Total Precio: </strong>
                      ${productos.reduce((total, p) => {
                        const precio = Number(p.precio) || 0;
                        const cantidad = Number(p.cantidad) || 1;
                        return total + (precio * cantidad);
                      }, 0).toLocaleString()}
                    </div>
                  </div>
                  
                  <div style={tableWrapperStyle}>
                    <table style={tableStyle}>
                      <thead>
                        <tr>
                          <th style={thStyle}>SKU</th>
                          <th style={thStyle}>Nombre</th>
                          <th style={thStyle}>Descripción</th>
                          <th style={thStyle}>Cantidad</th>
                          <th style={thStyle}>Peso (kg)</th>
                          <th style={thStyle}>Alto (cm)</th>
                          <th style={thStyle}>Ancho (cm)</th>
                          <th style={thStyle}>Precio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productos.length === 0 ? (
                          <tr>
                            <td colSpan={8} style={tdStyle}>
                              No hay productos para este despacho
                            </td>
                          </tr>
                        ) : (productos.map((producto) => (
                            <tr key={producto.id}>
                              <td style={tdStyle}>{producto.sku || 'N/A'}</td>
                              <td style={tdStyle}>{producto.nombre || 'N/A'}</td>
                              <td style={tdStyle}>{producto.descripcion || 'N/A'}</td>
                              <td style={tdStyle}>{producto.cantidad || 1}</td>
                              <td style={tdStyle}>{producto.peso || 0} kg</td>
                              <td style={tdStyle}>{producto.alto || 0} cm</td>
                              <td style={tdStyle}>{producto.ancho || 0} cm</td>
                              <td style={tdStyle}>${(producto.precio || 0).toLocaleString()}</td>
                            </tr>
                          ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

      {/* Modal de Filtros */}
      {showFilterModal && (
        <div style={filterModalOverlayStyle}>
          <div style={filterModalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <h2 style={filterModalTitleStyle}>Filtros</h2>
              <button 
                onClick={() => setShowFilterModal(false)}
                style={filterCloseButtonStyle}
              >
                &times;
              </button>
            </div>
            
            <div style={filterModalFormStyle}>
              <div style={filterSelectGroupStyle}>
                <label style={filterLabelStyle}>Sucursal</label>
                <select 
                  value={tempSucursal}
                  onChange={(e) => setTempSucursal(e.target.value)}
                  style={filterSelectStyle}
                >
                  <option value="">Todas las Sucursales</option>
                  <option value="Bodega Central">Bodega Central</option>
                  <option value="Bodega Norte">Bodega Norte</option>
                  <option value="Bodega Sur">Bodega Sur</option>
                  <option value="Sucursal Centro">Sucursal Centro</option>
                  <option value="Sucursal La Florida">Sucursal La Florida</option>
                  <option value="Sucursal Maipú">Sucursal Maipú</option>
                </select>
              </div>

              <div style={filterSelectGroupStyle}>
                <label style={filterLabelStyle}>Estado</label>
                <select 
                  value={tempEstado}
                  onChange={(e) => setTempEstado(e.target.value)}
                  style={filterSelectStyle}
                >
                  <option value="">Todos los Estados</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Enviada">Enviada</option>
                  <option value="Aprobada">Aprobada</option>
                  <option value="Cancelada">Cancelada</option>
                  <option value="Rechazada">Rechazada</option>
                </select>
              </div>
            </div>

            <div style={filterModalButtonsStyle}>
              <button 
                onClick={handleClearFilters} 
                style={{...filterModalButtonStyle, backgroundColor: '#6b7280'}}
              >
                Limpiar filtros
              </button>
              <button 
                onClick={handleApplyFilters}
                style={filterModalButtonStyle}
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}        
    </div>
  );
}

// =====================
// 10. ESTILOS
// =====================

const toolbarStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "1rem",
  gap: "1rem",
  transition: "all 0.3s ease"
};

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
  textAlign: "center",
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
  textAlign: "center",
};

const deleteButtonStyle: React.CSSProperties = {
  backgroundColor: "#ef4444",
  color: "#ffffff",
  border: "none",
  padding: "0.5rem 1rem",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "0.875rem",
  fontWeight: "600",
  fontFamily: "Roboto, sans-serif",
  transition: "background-color 0.3s ease",
};

const paginationControlsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  marginTop: '1rem',
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
  minWidth: '3.125rem',
  justifyContent: 'center',
  display: 'flex',
  alignItems: 'center',
};

// =====================
// 7. ESTILOS DEL MODAL
// =====================

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
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  maxWidth: '90vw',
  maxHeight: '90vh',
  overflow: 'hidden',
  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
};

const modalHeaderStyle: React.CSSProperties = {
  backgroundColor: '#ff7300',
  color: '#ffffff',
  padding: '1.5rem 2rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const modalTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '1.5rem',
  fontWeight: 'bold',
  fontFamily: 'Montserrat, sans-serif',
};

const closeButtonStyle: React.CSSProperties = {
  cursor: 'pointer',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: '#ffffff',
  background: 'none',
  border: 'none',
  padding: '0.5rem',
};

const modalBodyStyle: React.CSSProperties = {
  padding: '2rem',
  maxHeight: '70vh',
  overflowY: 'auto',
};

const summaryStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-around',
  backgroundColor: '#f3f4f6',
  padding: '1rem',
  borderRadius: '8px',
  marginBottom: '2rem',
  border: '1px solid #e5e7eb',
};

const summaryItemStyle: React.CSSProperties = {
  fontSize: '1.1rem',
  fontFamily: 'Montserrat, sans-serif',
  color: '#333333',
};

const loadingStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '2rem',
  fontSize: '1.2rem',
  color: '#666666',
  fontFamily: 'Roboto, sans-serif',
};

// =====================
// 8. ESTILOS DEL MODAL DE FILTROS
// =====================

const filterModalOverlayStyle: React.CSSProperties = {
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

const filterModalContentStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '2rem',
  borderRadius: '12px',
  width: '90%',
  maxWidth: '500px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  maxHeight: '90vh',
  overflow: 'hidden',
};

const filterModalTitleStyle: React.CSSProperties = {
  color: '#374151',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  marginTop: '0',
  marginBottom: '1.5rem',
  textAlign: 'center',
  fontFamily: 'Montserrat, sans-serif',
};

const filterModalFormStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const filterSelectGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const filterLabelStyle: React.CSSProperties = {
  color: '#374151',
  fontSize: '0.875rem',
  fontWeight: '500',
  fontFamily: 'Roboto, sans-serif',
};

const filterSelectStyle: React.CSSProperties = {
  padding: '0.5rem',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  fontSize: '0.875rem',
  width: '100%',
  fontFamily: 'Roboto, sans-serif',
  outline: 'none',
  transition: 'border-color 0.2s ease',
};

const filterModalButtonsStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '1rem',
  marginTop: '2rem',
};

const filterModalButtonStyle: React.CSSProperties = {
  backgroundColor: '#ff7300',
  color: 'white',
  padding: '0.5rem 1rem',
  borderRadius: '6px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: '500',
  fontFamily: 'Montserrat, sans-serif',
  transition: 'background-color 0.2s ease',
};

const filterCloseButtonStyle: React.CSSProperties = {
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

// =====================
// 9. ESTILOS DEL BOTÓN DE FILTROS
// =====================

const filterButtonStyle: React.CSSProperties = {
  backgroundColor: '#5c5c5c',
  color: 'white',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'Montserrat, sans-serif',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  transition: 'background-color 0.2s ease',
  whiteSpace: 'nowrap'
};

const paginationButtonDisabledStyle: React.CSSProperties = {
  backgroundColor: '#d1d5db',
  color: '#9ca3af',
  cursor: 'not-allowed',
  opacity: 0.6
};

const pageIndicatorStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: '500',
  color: '#f7f7f7',
  fontFamily: 'Montserrat, sans-serif',
  display: 'flex',
  alignItems: 'center',
  padding: '0 1rem',
  backgroundColor: '#5c5c5c',
  borderRadius: '6px',
  border: '1px solid #e5e7eb',
  minWidth: 'fit-content',
  whiteSpace: 'nowrap',
  paddingTop: '0.5rem',
  paddingBottom: '0.5rem',
};

const entirePieceFilterButtonStyle: React.CSSProperties = {
  backgroundColor: '#5c5c5c',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem'
};

const firstPieceFilterButtonStyle: React.CSSProperties = {
  backgroundColor: '#ff7300',
  borderTopRightRadius: '0',
  borderBottomRightRadius: '0',
  borderRight: '1px solid rgba(255, 255, 255, 0.3)',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem'
};

const secondPieceFilterButtonStyle: React.CSSProperties = {
  backgroundColor: '#ef4444',
  borderTopLeftRadius: '0',
  borderBottomLeftRadius: '0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.25rem'
};

const xClosebuttonStyle: React.CSSProperties = {
  fontSize: '1rem',
  lineHeight: '1' 
};

const filterIconStyle: React.CSSProperties = {
  width: '1.2rem',
  height: '1.2rem',
  color: 'white',
};

const searchContainerStyle: React.CSSProperties = {
  position: 'relative',
  height: '40px',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
  transition: "all 0.3s ease"
};

const leftControlsGroupStyle: React.CSSProperties = {
  display: "flex",
  gap: "1rem",
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

const loadingDespachosStyle: React.CSSProperties = {
  fontSize: '1.1rem',
  color: '#666',
  textAlign: 'center',
  padding: '2rem',
  fontFamily: 'Roboto, sans-serif',
  fontWeight: '500',
};