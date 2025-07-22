"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";

// Importaciones de imágenes
import filtrosImg from "@/styles/images/filtros.png";
import agregarImg from "@/styles/images/agregar.png";
import buscarImg from "@/styles/images/buscar.png";
import Swal from "sweetalert2";
import { clearLine } from "readline";



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

type EditFormData = {
  id: number;
  sku: string;
  nombreProducto: string;
  proveedor: string;
  proveedor_id: number;
  pesoKg: string | number;
  largoCm: string | number;
  anchoCm: string | number;
  altoCm: string | number;
  precioCU: number | "";
  stock: number | "";
  fechaIngreso: string;
};

// Add sorting function outside the component
// Define the type for inventory data
type InventarioData = {
  id: number;
  sku: string;
  nombreProducto: string;
  proveedor: string;
  proveedor_id: number;
  pesoKg: string | number;
  largoCm: string | number;
  anchoCm: string | number;
  altoCm: string | number;
  precioCU: number;
  stock: number;
  fechaIngreso: string;
};

const sortInventario = (data: InventarioData[]) => {
  return [...data].sort((a, b) => {
    const skuA = (a.sku || '').toString().toLowerCase();
    const skuB = (b.sku || '').toString().toLowerCase();
    return skuA.localeCompare(skuB);
  });
};

export default function InventarioProveedoresPage() {
  const { isExtraLarge, isLarge, isMedium, isSmall, isMobile } = useWindowSize();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const apiInventarioUrl = process.env.NEXT_PUBLIC_API_INVENTARIO || 'https://api-inventario.tssw.cl';
  const itemsPerPage = 10;
  
  // Estados para el modal de filtros
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempFechaDesde, setTempFechaDesde] = useState("");
  const [tempFechaHasta, setTempFechaHasta] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // Estados para el modal de editar 
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventarioData | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData | null>(null);

  // Estados para el modal de agregar
  const [showAddModal, setShowAddModal] = useState(false);

  // Interfaz de datos para add
  type NewProductData = {
  nombre: string;
  proveedor: string;
  pesoKg: number | "";
  largoCm: number | "";
  anchoCm: number | "";
  altoCm: number | "";
  precioCU: number | "";
  stock: number | "";
};
  const [newProductData, setNewProductData] = useState<NewProductData>({
    nombre: "",
    proveedor: "",
    pesoKg: "",
    largoCm: "",
    anchoCm: "",
    altoCm: "",
    precioCU: "",
    stock: ""
  });

// FUNCION PARA AGREGAR PRODUCTOS

const handleAddProduct = async (e: React.FormEvent) => {
  e.preventDefault();

  // Convierte los valores a número para validar
  const precio = Number(newProductData.precioCU);
  const stock = Number(newProductData.stock);
  const peso = Number(newProductData.pesoKg);
  const largo = Number(newProductData.largoCm);
  const ancho = Number(newProductData.anchoCm);
  const alto = Number(newProductData.altoCm);

  // Validación básica
  if (
    !newProductData.nombre ||
    !newProductData.proveedor ||
    isNaN(precio) || precio <= 0 ||
    isNaN(stock) || stock <= 0 ||
    isNaN(peso) || peso <= 0 ||
    isNaN(largo) || largo <= 0 ||
    isNaN(ancho) || ancho <= 0 ||
    isNaN(alto) || alto <= 0
  ) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Completa todos los campos correctamente',
      confirmButtonColor: '#ff7300',
    });
    return;
  }

  // Construye el body para el backend
const body = {
  stock: stock,
  proveedor: {
    marca: newProductData.proveedor,
    email: "",
    telefono: "",
    direccion: ""
  },
  producto: {
    nombre: newProductData.nombre,
    descripcion: "",
    proveedor_id: 0, // Si tienes el id, ponlo aquí
    peso: peso,
    largo: largo,
    ancho: ancho,
    alto: alto,
    precio: precio,
    categoria_id: 1, // O el id que corresponda
    estado: true,
    proveedor: {
      id: 0,
      marca: newProductData.proveedor,
      email: "",
      telefono: "",
      direccion: ""
    },
    categoria: {
      id: 0,
      nombre: ""
    }
  }
  // El SKU y la fecha de ingreso los genera el backend
};

  try {
    const response = await fetch(`${apiInventarioUrl}/api/stock-proveedor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error('Error al agregar producto');

    Swal.fire({
      icon: 'success',
      title: '¡Producto agregado!',
      confirmButtonColor: '#ff7300',
      timer: 2500,
      showCloseButton: true,
    });

    setNewProductData({
      nombre: "",
      proveedor: "",
      pesoKg: "",
      largoCm: "",
      anchoCm: "",
      altoCm: "",
      precioCU: "",
      stock: "",
    });

    // Opcional: recargar inventario
    // fetchInventario();

  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo agregar el producto',
      confirmButtonColor: '#ff7300',
    });
  }
};

  // Funcion para editar
  const handleEditar = (item: InventarioData) => {
    setEditingItem(item);
    setEditFormData({ ...item });
    setShowEditModal(true);
  };

// Funcion para guardar cambios
const handleSaveEditChanges = async () => {
  if (
    !editFormData ||
    !editingItem ||
    typeof editFormData.precioCU !== "number" ||
    typeof editFormData.stock !== "number" ||
    editFormData.precioCU <= 0 ||
    editFormData.stock <= 0
  ) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Precio y stock deben ser mayores a 0',
      confirmButtonColor: '#ff7300',
    });
    return;
  }

  const body = {
    proveedor_id: editingItem.proveedor_id,
    sku: editingItem.sku,
    stock: editFormData.stock,
    fecha_ingreso: editingItem.fechaIngreso,
    proveedor: {
      id: editingItem.proveedor_id,
      marca: editFormData.proveedor,
      email: "",
      telefono: "",
      direccion: ""
    },
    producto: {
      sku: editingItem.sku,
      nombre: editFormData.nombreProducto,
      descripcion: "",
      proveedor_id: editingItem.proveedor_id,
      peso: editFormData.pesoKg,
      largo: editFormData.largoCm,
      ancho: editFormData.anchoCm,
      alto: editFormData.altoCm,
      precio: editFormData.precioCU,
      categoria_id: 1,
      estado: true,
      proveedor: {
        id: editingItem.proveedor_id,
        marca: editFormData.proveedor,
        email: "",
        telefono: "",
        direccion: ""
      },
      categoria: {
        id: 0,
        nombre: ""
      }
    }
  };

  try {
    const url = `${apiInventarioUrl}/api/stock-proveedor/${editingItem.proveedor_id}/${editingItem.sku}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error('Error al actualizar el producto');

    // Mapea la respuesta al formato de InventarioData
    const updatedRaw = await response.json();
    const updatedItem: InventarioData = {
      id: editingItem.id,
      sku: updatedRaw.sku,
      nombreProducto: updatedRaw.producto?.nombre || "",
      proveedor: updatedRaw.proveedor?.marca || "",
      proveedor_id: updatedRaw.proveedor_id,
      pesoKg: updatedRaw.producto?.peso || "",
      largoCm: updatedRaw.producto?.largo || "",
      anchoCm: updatedRaw.producto?.ancho || "",
      altoCm: updatedRaw.producto?.alto || "",
      precioCU: updatedRaw.producto?.precio || 0,
      stock: updatedRaw.stock,
      fechaIngreso: updatedRaw.fecha_ingreso
    };

    setInventarioData(prev =>
      prev.map(p => (String(p.sku) === String(updatedItem.sku) ? updatedItem : p))
    );

    setShowEditModal(false);
    setEditingItem(null);
    setEditFormData(null);

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: '¡Producto actualizado!',
      showConfirmButton: false,
      timer: 3000,
    });
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo actualizar el producto',
      confirmButtonColor: '#ff7300',
    });
  }
};
  
// Funcion para borrar

const handleEliminar = async (item: InventarioData) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: `¿Deseas eliminar el producto SKU ${item.sku}?`,
    icon: 'warning',
    showCancelButton: true,
    showCloseButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  });

  if (result.isConfirmed) {
    try {
      const url = `${apiInventarioUrl}/api/stock-proveedor/${item.proveedor_id}/${item.sku}`;
      const response = await fetch(url, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error al eliminar');
      setInventarioData(prev => prev.filter(p => p.sku !== item.sku));
      Swal.fire({
        title: 'Eliminado',
        text: 'Producto eliminado correctamente',
        icon: 'success',
        confirmButtonColor: '#ff7300',
        showCloseButton: true,
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar el producto',
        icon: 'error',
        confirmButtonColor: '#ff7300',
      });
    }
  }
};

const [inventarioData, setInventarioData] = useState<Array<{
  id: number;
  sku: string;
  nombreProducto: string;
  proveedor: string;
  proveedor_id: number; // ✅ este es el que falta
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
          sku: item.sku || "",
          nombreProducto: item.producto?.nombre || "",
          proveedor: item.proveedor?.marca || "",
          proveedor_id: item.proveedor_id,
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
  }, [apiInventarioUrl]);

  // Filtrar datos según búsqueda y fechas
  const filteredData = useMemo(() => {
    const filtered = inventarioData.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (
        (item.sku || '-').toLowerCase().includes(searchLower) ||
        (item.nombreProducto || '-').toLowerCase().includes(searchLower) ||
        (item.proveedor || '-').toLowerCase().includes(searchLower)
      );

      // Filtro por fecha
      let matchesDate = true;
      if (fechaDesde || fechaHasta) {
        const itemDate = new Date(item.fechaIngreso);
        const desde = fechaDesde ? new Date(fechaDesde) : null;
        const hasta = fechaHasta ? new Date(fechaHasta) : null;

        if (desde && hasta) {
          matchesDate = itemDate >= desde && itemDate <= hasta;
        } else if (desde) {
          matchesDate = itemDate >= desde;
        } else if (hasta) {
          matchesDate = itemDate <= hasta;
        }
      }

      return matchesSearch && matchesDate;
    });
    return sortInventario(filtered);
  }, [inventarioData, searchTerm, fechaDesde, fechaHasta]);

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

  const handleApplyFilters = () => {
    setFechaDesde(tempFechaDesde);
    setFechaHasta(tempFechaHasta);
    setCurrentPage(1);
    setShowFilterModal(false);

    const filtrosAplicados: string[] = [];
    if (tempFechaDesde) {
      filtrosAplicados.push(`Fecha Desde: ${tempFechaDesde}`);
    }
    if (tempFechaHasta) {
      filtrosAplicados.push(`Fecha Hasta: ${tempFechaHasta}`);
    }
    if (filtrosAplicados.length === 0) {
      filtrosAplicados.push('Sin filtros activos');
    }

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
  };


  const handleFiltersProduct = () => {
    setTempFechaDesde(fechaDesde);
    setTempFechaHasta(fechaHasta);
    setShowFilterModal(true);
  };

  const handleClearFilters = () => {
    setTempFechaDesde("");
    setTempFechaHasta("");
    setFechaDesde("");
    setFechaHasta("");
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
      timer: 5000,
      timerProgressBar: true,
      showCloseButton: true
    });
  };

    const handleClearFiltersFromToolbar = () => {
    setTempFechaDesde("");
    setTempFechaHasta("");
    setFechaDesde("");
    setFechaHasta("");
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
      timer: 5000,
      timerProgressBar: true,
      showCloseButton: true
    });
  };

  const hasActiveFilters = Boolean(fechaDesde || fechaHasta);

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
                onChange={(e) => {
                const valor = e.target.value;
                if (valor === '' || /^[a-zA-ZÀ-ÿ0-9\u00f1\u00d1\s]*$/.test(valor)) {
                  setSearchTerm(valor);
                }
              }}

              maxLength={70}
                value={searchTerm}
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
                    onClick={handleClearFilters}
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
            }}
            onClick={() => setShowAddModal(true)}>
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
                    <td style={tdStyle}>${typeof item.precioCU === 'number' ? item.precioCU.toFixed(0) : '0'}</td>
                    <td style={tdStyle}>{item.stock}</td>
                    <td style={tdStyle}>{new Date(item.fechaIngreso).toISOString().split('T')[0]}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", justifyContent: "center", gap: "5px" }}>
                        <button
                          onClick={() => handleEditar(item)}
                          style={{
                            ...modifyProductButtonStyle,
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            maxWidth: '60px',
                          }}
                        >
                          EDITAR
                        </button>
                        <button
                          onClick={() => handleEliminar(item)}
                          style={{
                            ...modifyProductButtonStyle,
                            backgroundColor: '#ef4444',
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            maxWidth: '60px',
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
      </div>

      {/* Modal de Filtros */}
      {showFilterModal && (
        <div style={filterModalOverlayStyle}>
          <div style={{
            ...filterModalContentStyle,
            width: isMobile ? "95%" : "90%",
            maxWidth: isMobile ? "350px" : "500px",
            padding: isMobile ? "1.5rem" : "2rem",
            margin: isMobile ? "1rem" : "0"
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <h2 style={{
                ...filterModalTitleStyle,
                fontSize: isMobile ? "1.25rem" : "1.5rem"
              }}>Filtrar por Fecha de Ingreso</h2>
              <button 
                onClick={() => setShowFilterModal(false)}
                style={filterCloseButtonStyle}
              >
                &times;
              </button>
            </div>
            
            {(() => {
              const today = new Date();
              const tenYearsAgo = new Date();
              tenYearsAgo.setFullYear(today.getFullYear() - 10); //10 años atrás
              const minDate = tenYearsAgo.toISOString().split('T')[0];
              const maxDate = today.toISOString().split('T')[0];
              
              //Si la fecha seleccionada es anterior a 10 años, limpiar el campo
              if (tempFechaDesde && new Date(tempFechaDesde) < tenYearsAgo) {
                Swal.fire({
                  icon: 'error',
                  html: 
                    `<div style="${swalTituloCssString}">Error</div>
                    <div style="${swalTextoCssString}">La fecha "Desde" no puede ser anterior a 10 años desde el día de hoy.</div>`,
                  confirmButtonText: 'ACEPTAR',
                  confirmButtonColor: '#ff7300',
                  timer: 5000,
                  timerProgressBar: true,
                  showCloseButton: true
                });
                setTempFechaDesde("");
              }
              if (tempFechaHasta && new Date(tempFechaHasta) > today) {
                setTempFechaHasta("");
                Swal.fire({
                  icon: 'error',
                  html:
                   `<div style="${swalTituloCssString}">Error</div>
                    <div style="${swalTextoCssString}">La fecha "Hasta" no puede ser futura.</div>`,
                  confirmButtonText: 'ACEPTAR',
                  confirmButtonColor: '#ff7300',
                  timer:5000,
                  timerProgressBar: true,
                  showCloseButton: true
                });
              }
               // La fecha de inicio no puede ser posterior a la fecha de fin
              if (tempFechaDesde && tempFechaHasta && new Date(tempFechaDesde) > new Date(tempFechaHasta)) {
                Swal.fire({
                  icon : 'error',
                  html:
                  `<div style="${swalTituloCssString}">Error</div>
                  <div style="${swalTextoCssString}">La fecha "Desde" no puede ser posterior a la fecha "Hasta".</div>`,
                  confirmButtonText: 'ACEPTAR',
                  confirmButtonColor: '#ff7300',
                  timer: 5000,
                  timerProgressBar: true,
                  showCloseButton: true
                });
                setTempFechaDesde("");
                setTempFechaHasta("");
              }
              
              return (
                <div style={filterModalFormStyle}>
                  <div style={filterSelectGroupStyle}>
                    <label style={{
                      ...filterLabelStyle,
                      fontSize: isMobile ? "0.8rem" : "0.875rem"
                    }}>Fecha Desde</label>
                    <input 
                      type="date"
                      id="fechaDesde"
                      value={tempFechaDesde}
                      max={maxDate} // No permitir fecha futura
                      min={minDate} // No permitir fecha anterior a 10 años
                      onChange={(e) => setTempFechaDesde(e.target.value)}
                      style={{
                        ...filterInputStyle,
                        fontSize: isMobile ? "0.8rem" : "0.875rem",
                        padding: isMobile ? "0.6rem" : "0.5rem"
                      }}
                    />
                  </div>

                  <div style={filterSelectGroupStyle}>
                    <label style={{
                      ...filterLabelStyle,
                      fontSize: isMobile ? "0.8rem" : "0.875rem"
                    }}>Fecha Hasta</label>
                    <input 
                      type="date"
                      id="fechaHasta"

                      value={tempFechaHasta}
                      min={minDate} // No permitir fecha anterior a 10 años
                      max={maxDate} // No permitir fecha futura
                      onChange={(e) => setTempFechaHasta(e.target.value)}
                      style={{
                        ...filterInputStyle,
                        fontSize: isMobile ? "0.8rem" : "0.875rem",
                        padding: isMobile ? "0.6rem" : "0.5rem"
                      }}
                    />
                  </div>
                </div>
              );
            })()}

            <div style={{
              ...filterModalButtonsStyle,
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? "0.5rem" : "1rem"
            }}>
              <button 
                onClick={handleClearFilters} 
                style={{
                  ...filterModalButtonStyle, 
                  backgroundColor: '#6b7280',
                  width: isMobile ? "100%" : "auto",
                  order: isMobile ? 2 : 1
                }}
              >
                Limpiar filtros
              </button>
              <button 
                onClick={handleApplyFilters}
                style={{
                  ...filterModalButtonStyle,
                  width: isMobile ? "100%" : "auto",
                  order: isMobile ? 1 : 2
                }}
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}
      {showEditModal && editFormData && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, maxWidth: '500px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <h2 style={{ ...modalTitleStyle, margin: 0 }}>Editar Producto</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                  setEditFormData(null);
                }}
                style={closeButtonStyle}
              >
                &times;
              </button>
            </div>

            <div style={{ ...modalFormStyle, padding: '0 1rem' }}>
                <div style={selectGroupStyle}>
                  <label style={labelStyle}>Nombre Producto</label>
                  <input
                    type="text"
                    value={editFormData.nombreProducto}
                    maxLength={50}
                    pattern="^[a-zA-ZÀ-ÿ0-9\u00f1\u00d1\s]*$"
                    onChange={(e) => {
                      const valor = e.target.value;
                      if (/^[a-zA-ZÀ-ÿ0-9\u00f1\u00d1\s]*$/.test(valor)) {
                        setEditFormData({ ...editFormData, nombreProducto: valor });
                      }
                    }}
                    style={selectStyle}
                    placeholder="Edita el nombre del Producto"
                  />
                </div>

                <div style={selectGroupStyle}>
                  <label style={labelStyle}>Proveedor</label>
                  <input
                    type="text"
                    value={editFormData.proveedor}
                    maxLength={40}
                    pattern="^[a-zA-ZÀ-ÿ0-9\u00f1\u00d1\s]*$"
                    onChange={(e) => {
                      const valor = e.target.value;
                      if (/^[a-zA-ZÀ-ÿ0-9\u00f1\u00d1\s]*$/.test(valor)) {
                        setEditFormData({ ...editFormData, proveedor: valor });
                      }
                    }}
                    style={selectStyle}
                    placeholder="Edita el nombre del Proveedor"
                  />
                </div>

                <div style={selectGroupStyle}>
                  <label style={labelStyle}>Precio (C/U)</label>
                  <input
                    type="number"
                    min={1}
                    max={1000000}
                    value={editFormData.precioCU === 0 ? "" : editFormData.precioCU}
                    onChange={(e) => {
                      const valor = e.target.value === "" ? "" : Math.max(1, Math.min(1000000, parseInt(e.target.value)));
                      setEditFormData({ ...editFormData, precioCU: valor });
                    }}
                    style={selectStyle}
                    placeholder="Edita el Precio unitario"
                  />
                </div>

                <div style={selectGroupStyle}>
                  <label style={labelStyle}>Stock</label>
                  <input
                    type="number"
                    min={1}
                    max={100000}
                    value={editFormData.stock === 0 ? "" : editFormData.stock}
                    onChange={(e) => {
                      const valor = e.target.value === "" ? "" : Math.max(1, Math.min(100000, parseInt(e.target.value)));
                      setEditFormData({ ...editFormData, stock: valor });
                    }}
                    style={selectStyle}
                    placeholder="Edita el Stock disponible"
                  />
                </div>
            </div>

            <div style={{ ...modalButtonsStyle, padding: '0 1rem' }}>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                  setEditFormData(null);
                }}
                style={{ ...modalButtonStyle, backgroundColor: '#6b7280' }}
              >
                Cancelar
              </button>
              <button onClick={handleSaveEditChanges} style={modalButtonStyle}>
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/*Modal para agregar productos*/}
        {showAddModal && (
  <div style={modalOverlayStyle}>
    <div style={{ ...modalContentStyle, maxWidth: '500px', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <h2 style={{ ...modalTitleStyle, margin: 0 }}>Agregar Producto</h2>
        <button
          onClick={() => setShowAddModal(false)}
          style={closeButtonStyle}
        >
          &times;
        </button>
      </div>
      <form onSubmit={handleAddProduct}>
        <div style={modalFormStyle}>
          <div style={selectGroupStyle}>
            <label style={labelStyle}>Nombre del Producto</label>
            <input
              type="text"
              value={newProductData.nombre}
              maxLength={50}
              pattern="^[a-zA-ZÀ-ÿ0-9\u00f1\u00d1\s]*$"
              onChange={(e) => {
                const valor = e.target.value;
                if (/^[a-zA-ZÀ-ÿ0-9\u00f1\u00d1\s]*$/.test(valor)) {
                  setNewProductData({ ...newProductData, nombre: valor });
                }
              }}
              style={selectStyle}
              required
            />
          </div>
          <div style={selectGroupStyle}>
            <label style={labelStyle}>Proveedor</label>
            <input
              type="text"
              value={newProductData.proveedor}
              maxLength={40}
              pattern="^[a-zA-ZÀ-ÿ0-9\u00f1\u00d1\s]*$"
              onChange={(e) => {
                const valor = e.target.value;
                if (/^[a-zA-ZÀ-ÿ0-9\u00f1\u00d1\s]*$/.test(valor)) {
                  setNewProductData({ ...newProductData, proveedor: valor });
                }
              }}
              style={selectStyle}
              required
            />
          </div>
          <div style={selectGroupStyle}>
            <label style={labelStyle}>Peso (KG)</label>
            <input
              type="number"
              min={0.01}
              max={1000}
              step={0.01}
              value={newProductData.pesoKg === "" ? "" : newProductData.pesoKg}
              onChange={(e) => {
                const valor = e.target.value === "" ? "" : Math.max(0.01, Math.min(1000, parseFloat(e.target.value)));
                setNewProductData({ ...newProductData, pesoKg: valor });
              }}
              style={selectStyle}
              required
            />
          </div>
          <div style={selectGroupStyle}>
            <label style={labelStyle}>Largo (CM)</label>
            <input
              type="number"
              min={1}
              max={1000}
              value={newProductData.largoCm === "" ? "" : newProductData.largoCm}
              onChange={(e) => {
                const valor = e.target.value === "" ? "" : Math.max(1, Math.min(1000, parseInt(e.target.value)));
                setNewProductData({ ...newProductData, largoCm: valor });
              }}
              style={selectStyle}
              required
            />
          </div>
          <div style={selectGroupStyle}>
            <label style={labelStyle}>Ancho (CM)</label>
            <input
              type="number"
              min={1}
              max={1000}
              value={newProductData.anchoCm === "" ? "" : newProductData.anchoCm}
              onChange={(e) => {
                const valor = e.target.value === "" ? "" : Math.max(1, Math.min(1000, parseInt(e.target.value)));
                setNewProductData({ ...newProductData, anchoCm: valor });
              }}
              style={selectStyle}
              required
            />
          </div>
          <div style={selectGroupStyle}>
            <label style={labelStyle}>Alto (CM)</label>
            <input
              type="number"
              min={1}
              max={1000}
              value={newProductData.altoCm === "" ? "" : newProductData.altoCm}
              onChange={(e) => {
                const valor = e.target.value === "" ? "" : Math.max(1, Math.min(1000, parseInt(e.target.value)));
                setNewProductData({ ...newProductData, altoCm: valor });
              }}
              style={selectStyle}
              required
            />
          </div>
          <div style={selectGroupStyle}>
            <label style={labelStyle}>Precio (C/U)</label>
            <input
              type="number"
              min={1}
              max={1000000}
              value={newProductData.precioCU === "" ? "" : newProductData.precioCU}
              onChange={(e) => {
                const valor = e.target.value === "" ? "" : Math.max(1, Math.min(1000000, parseInt(e.target.value)));
                setNewProductData({ ...newProductData, precioCU: valor });
              }}
              style={selectStyle}
              required
            />
          </div>
          <div style={selectGroupStyle}>
            <label style={labelStyle}>Stock</label>
            <input
              type="number"
              min={1}
              max={100000}
              value={newProductData.stock === "" ? "" : newProductData.stock}
              onChange={(e) => {
                const valor = e.target.value === "" ? "" : Math.max(1, Math.min(100000, parseInt(e.target.value)));
                setNewProductData({ ...newProductData, stock: valor });
              }}
              style={selectStyle}
              required
            />
          </div>
        </div>
        <div style={modalButtonsStyle}>
          <button
            type="button"
            onClick={() => setShowAddModal(false)}
            style={{ ...modalButtonStyle, backgroundColor: '#6b7280' }}
          >
            Cancelar
          </button>
          <button type="submit" style={modalButtonStyle}>
            Agregar Producto
          </button>
        </div>
      </form>
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

const paginationControlsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  backgroundColor: '#fff',
  marginTop: '1rem',
  borderRadius: '8px',
  padding: '0.5rem 1rem',
  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
  justifyContent: 'center',
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

// Estilos adicionales para el modal
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

const filterInputStyle: React.CSSProperties = {
  padding: '0.5rem',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  fontSize: '0.875rem',
  width: '100%',
  fontFamily: 'Roboto, sans-serif',
  outline: 'none',
  transition: 'border-color 0.2s ease',
  boxSizing: 'border-box',
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

// =====================
// ESTILOS MODAL DE EDICIÓN
// =====================

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
  padding: '1rem',
  overflowY: 'auto'
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '10px',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
  padding: '2rem',
  width: '100%',
  maxWidth: '500px',
  zIndex: 1001,
  position: 'relative',
};

const modalTitleStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: '600',
  fontFamily: 'Montserrat, sans-serif',
  color: '#222',
  marginBottom: '1rem'
};

const modalFormStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  marginTop: '1rem'
};

const selectGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem'
};

const labelStyle: React.CSSProperties = {
  fontWeight: 500,
  fontSize: '0.875rem',
  color: '#374151'
};

const selectStyle: React.CSSProperties = {
  borderRadius: '6px',
  padding: '0.5rem 0.75rem',
  border: '1px solid #d1d5db',
  fontSize: '0.875rem',
  fontFamily: 'Roboto, sans-serif',
  outline: 'none',
  transition: 'border-color 0.2s ease-in-out'
};

const modalButtonsStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '1rem',
  marginTop: '1.5rem'
};

const modalButtonStyle: React.CSSProperties = {
  backgroundColor: '#ff7300',
  color: 'white',
  padding: '0.6rem 1.2rem',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontFamily: 'Montserrat, sans-serif',
  fontWeight: 600,
  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
  transition: 'all 0.3s ease'
};

const closeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '1.5rem',
  color: '#666',
  cursor: 'pointer',
  lineHeight: 1
};
