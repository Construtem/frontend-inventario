"use client";

// =====================
// 1. IMPORTACIONES
// =====================
import React, { useState, useMemo, useEffect } from "react";
import Swal from 'sweetalert2';
import Image from "next/image";
import { useSearchParams, useRouter } from 'next/navigation';
import { FaArrowLeft } from "react-icons/fa";


import filtrosImg from "@/styles/images/filtros.png";
import agregarImg from "@/styles/images/agregar.png";
import logo1Img from "@/styles/images/logo1.png";
import buscarImg from "@/styles/images/buscar.png";

// =====================
// 1.1 CONFIGURACIÓN DEL BACKEND
// =====================
const apiInventarioUrl = process.env.NEXT_PUBLIC_API_INVENTARIO || 'https://api-inventario.tssw.cl';

// Headers comunes para las peticiones
const getHeaders = () => ({
  'Content-Type': 'application/json',
});

// =====================
// 1.2 FUNCIONES DE API
// =====================

// Obtener todos los productos (adaptado para sucursales)
const fetchProducts = async (sucursalId?: string): Promise<ProductData[]> => {
  try {
    if (!sucursalId) {
      return [];
    }

    const response = await fetch(`${apiInventarioUrl}/api/stock-sucursal?sucursal_id=${sucursalId}`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
      mode: 'cors',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const stockData = await response.json();
    

    const transformedData: ProductData[] = stockData
      .filter((item: any) => item.sucursal_id.toString() === sucursalId)
      .map((item: any) => ({
        sku: item.producto.sku,
        nombre: item.producto.nombre,
        descripcion: item.producto.descripcion,
        marca: item.producto.proveedor?.marca || 'N/A',
        categoria: item.producto.categoria?.nombre || 'N/A',
        pesoKg: item.producto.peso,
        largoCm: item.producto.largo,
        anchoCm: item.producto.ancho,
        altoCm: item.producto.alto,
        precioVentaCu: item.producto.precio,
        stock: item.cantidad,
        estado: item.producto.estado,
      }));
    
    return transformedData;
  } catch (error) {

    throw error;
  }
};

// Eliminar un producto por SKU
const deleteProduct = async (sku: string): Promise<void> => {
  try {
    const response = await fetch(`${apiInventarioUrl}/api/productos/${sku}`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  } catch (error) {

    throw error;
  }
};

// Obtener datos de una sucursal específica (incluye bodegas)
const fetchSucursal = async (id: string): Promise<any> => {
  try {
    const response = await fetch(`${apiInventarioUrl}/api/sucursales/${id}`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {

    throw error;
  }
};

// Actualizar un producto por SKU
const updateProduct = async (sku: string, productData: Partial<ProductData>): Promise<void> => {
  try {
      const response = await fetch(`${apiInventarioUrl}/api/productos/${sku}`, {
      method: 'PUT',
      headers: getHeaders(),
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify({
        nombre: productData.nombre,
        descripcion: productData.descripcion,
        peso: productData.pesoKg,
        largo: productData.largoCm,
        ancho: productData.anchoCm,
        alto: productData.altoCm,
        precio: productData.precioVentaCu,
        estado: productData.estado,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  } catch (error) {

    throw error;
  }
};

// =====================
// 2. INTERFACES
// =====================
interface ProductData {
  sku: string;
  nombre: string;
  descripcion: string;
  marca: string;
  pesoKg: number;
  largoCm: number;
  anchoCm: number;
  altoCm: number;
  precioVentaCu: number;
  stock: number;
  categoria: string;
  estado: boolean;
}

//Interfaz de filtros del modal
interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: { categoria: string; estado: string }) => void;
  activeFilters: { categoria: string; estado: string };
}

// Interfaz para el modal de edición de productos
interface EditProductModalProps {
  isOpen: boolean;
  product: ProductData | null;
  onClose: () => void;
  onSave: (product: ProductData) => void;
}


// ===================== SWEET ALERT2 ESTILOS =====================

// Función auxiliar para convertir un objeto JS de estilos a una cadena CSS en línea
function objToInlineCss(styleObj: React.CSSProperties): string {
  return Object.entries(styleObj)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${value};`;
    })
    .join(' ');
}

// DEFINICIONES DE ESTILOS PARA SWEETALERT2

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
// 5. COMPONENTES REACT
// =====================


const FiltersModal: React.FC<FiltersModalProps> = ({ isOpen, onClose, onApplyFilters, activeFilters }) => {
  const [categoria, setCategoria] = useState("");
  const [estado, setEstado] = useState("");
  const [visible, setVisible] = useState(isOpen);

  // Sincronizar los filtros del modal con los filtros activos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setCategoria(activeFilters.categoria);
      setEstado(activeFilters.estado);
    }
  }, [isOpen, activeFilters]);

  // Nuevo efecto: Sincronizar cuando activeFilters cambia (incluso si el modal está cerrado)
  useEffect(() => {
    setCategoria(activeFilters.categoria);
    setEstado(activeFilters.estado);
  }, [activeFilters]);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    } else {
      const timeout = setTimeout(() => setVisible(false), 250);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  const handleApplyFilters = () => {
    onApplyFilters({ categoria, estado });
    onClose();

    // Mostrar mensaje de éxito con los filtros aplicados
    Swal.fire({
      html: `
        <div style="${swalTituloCssString}">
          ¡Filtros Aplicados!
        </div>
        <div style="${swalTextoConMargenCssString}">
          ${categoria ? `Categoría: <b>${categoria}</b><br/>` : ''}
          ${estado ? `Estado: <b>${estado}</b>` : ''}
          ${!categoria && !estado ? 'Se han eliminado todos los filtros' : ''}
        </div>
      `,
      icon: 'success',
      confirmButtonText: 'ACEPTAR',
      confirmButtonColor: '#ff7300',
      showCloseButton: true,
      timer: 3000,
      timerProgressBar: true,
    });
  };

  const handleClearFilters = () => {
    setCategoria("");
    setEstado("");
    onApplyFilters({ categoria: "", estado: "" });
    onClose();

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

  if (!visible) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <div style={modalHeaderStyle}>
          <h2 style={modalTitleStyle}>Filtrar Productos</h2>
          <button style={closeButtonStyle} onClick={onClose}>&times;</button>
        </div>

        <div style={modalBodyStyle}>
          <div style={selectGroupStyle}>
            <label style={labelStyle}>Categoría:</label>
            <select 
              value={categoria} 
              onChange={(e) => setCategoria(e.target.value)}
              style={selectStyle}
            >
              <option value="">Todas las categorías</option>
              <option value="Herramientas manuales">Herramientas manuales</option>
              <option value="Herramientas eléctricas">Herramientas eléctricas</option>
              <option value="Materiales de construcción">Materiales de construcción</option>
              <option value="Fijaciones">Fijaciones</option>
              <option value="Pinturas">Pinturas</option>
              <option value="Medición">Medición</option>
              <option value="Seguridad">Seguridad</option>
              <option value="Maquinaria liviana">Maquinaria liviana</option>
            </select>
          </div>

          <div style={selectGroupStyle}>
            <label style={labelStyle}>Estado:</label>
            <select 
              value={estado} 
              onChange={(e) => setEstado(e.target.value)}
              style={selectStyle}
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          <div style={{
            ...buttonContainerStyle,
            display: 'flex',
            gap: '1rem',
            justifyContent: 'space-between'
          }}>
            <button 
              onClick={handleClearFilters}
              style={{
                ...editButtonStyle,
                backgroundColor: '#5c5c5c',
                width: "48%",
                justifyContent: "center"
              }}
            >
              LIMPIAR FILTROS
            </button>
            <button 
              onClick={handleApplyFilters}
              style={{
                ...editButtonStyle,
                width: "48%",
                justifyContent: "center"
              }}
            >
              APLICAR FILTROS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal para editar productos
const EditProductModal: React.FC<EditProductModalProps> = ({ isOpen, product, onClose, onSave }) => {
  const [formData, setFormData] = useState<ProductData | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({ ...product });
    }
  }, [product]);

  if (!isOpen || !formData) return null;

  const handleSave = () => {
    // Validaciones
    if (!formData.nombre.trim()) {
      Swal.fire({
        html: `
          <div style="${swalTituloCssString}">
            Error
          </div>
          <div style="${swalTextoConMargenCssString}">
            El nombre es requerido
          </div>
        `,
        icon: 'error',
        confirmButtonColor: '#ff7300'
      });
      return;
    }

    if (!formData.descripcion.trim()) {
      Swal.fire({
        html: `
          <div style="${swalTituloCssString}">
            Error
          </div>
          <div style="${swalTextoConMargenCssString}">
            La descripción es requerida
          </div>
        `,
        icon: 'error',
        confirmButtonColor: '#ff7300'
      });
      return;
    }

    if (isNaN(formData.pesoKg) || formData.pesoKg < 0) {
      Swal.fire({
        html: `
          <div style="${swalTituloCssString}">
            Error
          </div>
          <div style="${swalTextoConMargenCssString}">
            El peso debe ser un número válido y positivo
          </div>
        `,
        icon: 'error',
        confirmButtonColor: '#ff7300'
      });
      return;
    }

    if (isNaN(formData.precioVentaCu) || formData.precioVentaCu < 0) {
      Swal.fire({
        html: `
          <div style="${swalTituloCssString}">
            Error
          </div>
          <div style="${swalTextoConMargenCssString}">
            El precio debe ser un número válido y positivo
          </div>
        `,
        icon: 'error',
        confirmButtonColor: '#ff7300'
      });
      return;
    }

    onSave(formData);
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={{...modalContentStyle, maxWidth: '650px', padding: '2rem'}}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <h2 style={{...modalTitleStyle, margin: 0}}>Editar Producto</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={skuContainerStyle}>
              SKU: <strong>{formData.sku}</strong>
            </div>
            <button onClick={onClose} style={closeButtonStyle}>
              ×
            </button>
          </div>
        </div>
        
        <div style={{...modalFormStyle, padding: '0 1rem'}}>
          <div style={selectGroupStyle}>
            <label style={labelStyle}>Nombre</label>
            <input
              type="text"
              value={formData.nombre}
              style={selectStyle}
              placeholder="Nombre del producto"
              maxLength={50}
              onChange={(e) => {
                const valor = e.target.value;
                // Solo permitir letras, espacios y caracteres acentuados
                if (valor === '' || /^[a-zA-ZÀ-ÿ0-9\u00f1\u00d1\s]*$/.test(valor)) {
                  setFormData({...formData, nombre: valor});
                }
              }}
            />
          </div>

          <div style={selectGroupStyle}>
            <label style={labelStyle}>Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              style={{...selectStyle, height: '80px', resize: 'vertical'}}
              placeholder="Descripción del producto"
              maxLength={50}
            />
            <p style={writtenCharactersStyle}>{formData.descripcion.length}/50 caracteres escritos</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={selectGroupStyle}>
              <label style={labelStyle}>Peso (KG)</label>
              <input
                type="number"
                step="0.1"
                value={formData.pesoKg}
                onChange={(e) => setFormData({...formData, pesoKg: parseFloat(e.target.value) || 0})}
                style={selectStyle}
              />
            </div>

            <div style={selectGroupStyle}>
              <label style={labelStyle}>Precio (CLP)</label>
              <input
                type="number"
                value={formData.precioVentaCu}
                onChange={(e) => setFormData({...formData, precioVentaCu: parseFloat(e.target.value) || 0})}
                style={selectStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div style={selectGroupStyle}>
              <label style={labelStyle}>Largo (CM)</label>
              <input
                type="number"
                value={formData.largoCm}
                onChange={(e) => setFormData({...formData, largoCm: parseFloat(e.target.value) || 0})}
                style={selectStyle}
              />
            </div>

            <div style={selectGroupStyle}>
              <label style={labelStyle}>Ancho (CM)</label>
              <input
                type="number"
                value={formData.anchoCm}
                onChange={(e) => setFormData({...formData, anchoCm: parseFloat(e.target.value) || 0})}
                style={selectStyle}
              />
            </div>

            <div style={selectGroupStyle}>
              <label style={labelStyle}>Alto (CM)</label>
              <input
                type="number"
                value={formData.altoCm}
                onChange={(e) => setFormData({...formData, altoCm: parseFloat(e.target.value) || 0})}
                style={selectStyle}
              />
            </div>
          </div>

          <div style={selectGroupStyle}>
            <label style={labelStyle}>Estado</label>
            <select 
              value={formData.estado ? 'true' : 'false'}
              onChange={(e) => setFormData({...formData, estado: e.target.value === 'true'})}
              style={selectStyle}
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
        </div>

        <div style={{...modalButtonsStyle, padding: '0 1rem'}}>
          <button 
            onClick={onClose} 
            style={{...modalButtonStyle, backgroundColor: '#6b7280'}}
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            style={modalButtonStyle}
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

// Esta función obtiene el tamaño de la ventana y proporciona información sobre los breakpoints
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

// ===================== FUNCIÓN PRINCIPAL DEL COMPONENTE =====================

export default function SucursalSlot1Page() {
  const { isExtraLarge, isLarge, isMedium, isSmall, isMobile } = useWindowSize();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sucursalId = searchParams.get('id');
  const [sucursalNombre, setSucursalNombre] = useState<string>('Sucursal Slot 1');

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

  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [loadedProducts, setLoadedProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<{ categoria: string; estado: string }>({
    categoria: "",
    estado: ""
  });

  // --- ESTADOS DE PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // <- Setear número de productos por página

  // Agregar CSS para la animación de carga
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Cargar productos desde el backend al inicializar
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const products = await fetchProducts(sucursalId || undefined);
        setLoadedProducts(products);
      } catch (err) {

        setError('Error al cargar productos desde el servidor');
        Swal.fire({
          icon: 'error',
          html: `
            <div style="${swalTituloCssString}">
              ¡Error al cargar productos!
            </div>
            <div style="${swalTextoConMargenCssString}">
              No se pudieron cargar los productos desde el servidor.
            </div>
          `,
          confirmButtonText: 'ACEPTAR',
          confirmButtonColor: '#ff7300',
          showCloseButton: true,
        });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [sucursalId]);

  // Cargar nombre de la sucursal
  useEffect(() => {
    const loadSucursalName = async () => {
      if (sucursalId) {
        try {
          const sucursalData = await fetchSucursal(sucursalId);
          setSucursalNombre(sucursalData.nombre || 'Sucursal Slot 1');
        } catch (err) {

          setSucursalNombre('Sucursal Slot 1');
        }
      }
    };

    loadSucursalName();
  }, [sucursalId]);

  // Función para el botón FILTROS
  const handleFiltersProduct = () => {
    setIsFiltersModalOpen(true);
  };

  // Función para aplicar filtros
  const handleApplyFilters = (filters: { categoria: string; estado: string }) => {
    setActiveFilters(filters);
    setCurrentPage(1);

    const newFilteredProducts = loadedProducts.filter(product => {
      const matchesCategoria = !filters.categoria || product.categoria === filters.categoria;
      const matchesEstado = !filters.estado || (filters.estado === "activo" ? product.estado : !product.estado);
      return matchesCategoria && matchesEstado;
    });

    // Mensajes con sweetalert2 según los resultados
    if (newFilteredProducts.length === 0 && (filters.categoria || filters.estado)) {
      Swal.fire({
        html: `
          <div style="${swalTituloCssString}">
            No se encontraron resultados
          </div>
          <div style="${swalTextoConMargenCssString}">
            No hay productos que coincidan con los filtros seleccionados:<br/><br/>
            ${filters.categoria ? `Categoría: <b>${filters.categoria}</b><br/>` : ''}
            ${filters.estado ? `Estado: <b>${filters.estado}</b>` : ''}
          </div>
        `,
        icon: 'warning',
        confirmButtonText: 'ACEPTAR',
        confirmButtonColor: '#ff7300',
        showCloseButton: true,
        timer: 5000,
        timerProgressBar: true,
      });
    } else if (filters.categoria || filters.estado) {
      Swal.fire({
        html: `
          <div style="${swalTituloCssString}">
            ¡Filtros Aplicados!
          </div>
          <div style="${swalTextoConMargenCssString}">
            Se encontraron <b>${newFilteredProducts.length}</b> productos con los siguientes filtros:<br/><br/>
            ${filters.categoria ? `Categoría: <b>${filters.categoria}</b><br/>` : ''}
            ${filters.estado ? `Estado: <b>${filters.estado}</b>` : ''}
          </div>
        `,
        icon: 'success',
        confirmButtonText: 'ACEPTAR',
        confirmButtonColor: '#ff7300',
        showCloseButton: true,
        timer: 5000,
      });
    }
  };

  // Filtrar productos según los filtros activos
  const filteredProducts = useMemo(() => {
    return loadedProducts.filter(product => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        product.nombre.toLowerCase().includes(searchLower);
      
      const matchesCategoria = !activeFilters.categoria || product.categoria === activeFilters.categoria;
      const matchesEstado = !activeFilters.estado || 
        (activeFilters.estado === "activo" ? product.estado : !product.estado);
      return matchesSearch && matchesCategoria && matchesEstado;
    });
  }, [loadedProducts, searchTerm, activeFilters]);

  // Calcular los datos a mostrar en la página actual usando los productos filtrados
  const currentTableData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  // Calcular el número total de páginas con los productos filtrados
  const totalPages = useMemo(() => {
    return Math.ceil(filteredProducts.length / itemsPerPage);
  }, [filteredProducts]);

  

  // Función para el botón MODIFICAR
  const handleModifyProduct = async (sku: string) => {
    if (sku === 'NUEVO') {
      // Mostrar modal para agregar productos
      Swal.fire({
        html: `
          <div style="${swalTituloCssString}">
            ¡<b>Funcionalidad en Mantenimiento</b>!
          </div>
          <div style="${swalTextoConMargenCssString}">
            Esta funcionalidad estará nuevamente disponible próximamente.
          </div>
        `,
        imageUrl: logo1Img.src,
        imageWidth: 400,
        imageHeight: 200,
        imageAlt: "Funcionalidad en Mantenimiento",
        confirmButtonText: 'ACEPTAR',
        confirmButtonColor: '#ff7300',
        showCloseButton: true,
        timer: 5000,
        timerProgressBar: true,
      });
      return;
    }

    // Buscar el producto a editar
    const product = loadedProducts.find(p => p.sku === sku);
    if (!product) {
      Swal.fire({
        icon: 'error',
        html: `
          <div style="${swalTituloCssString}">
            Error
          </div>
          <div style="${swalTextoConMargenCssString}">
            No se encontró el producto con SKU: <b>${sku}</b>
          </div>
        `,
        confirmButtonText: 'ACEPTAR',
        confirmButtonColor: '#ff7300',
      });
      return;
    }

    // Mostrar el modal de edición
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  // Función para manejar la actualización del producto
  const handleSaveProduct = async (updatedProduct: ProductData) => {
    try {
      // Actualizar en el backend
      await updateProduct(updatedProduct.sku, updatedProduct);
      
      setLoadedProducts(prev => 
        prev.map(p => 
          p.sku === updatedProduct.sku 
            ? updatedProduct
            : p
        )
      );

      setIsEditModalOpen(false);
      setEditingProduct(null);

      Swal.fire({
        icon: 'success',
        html: `
          <div style="${swalTituloCssString}">
            ¡Producto actualizado exitosamente!
          </div>
          <div style="${swalTextoConMargenCssString}">
            El producto con SKU: <b>${updatedProduct.sku}</b> ha sido actualizado correctamente.
        `,
        showConfirmButton: false,
        confirmButtonColor: '#ff7300',
        timer: 5000,
        timerProgressBar: true,
        showCloseButton: true,

      });
    } catch (error) {

      Swal.fire({
        icon: 'error',
        html: `
          <div style="${swalTituloCssString}">
            Error al actualizar
          </div>
          <div style="${swalTextoConMargenCssString}">
            No se pudo actualizar el producto en el servidor.
          </div>
        `,
        confirmButtonText: 'ACEPTAR',
        confirmButtonColor: '#ff7300',
      });
    }
  };

  // Función para el botón ELIMINAR
  const handleDeleteProduct = async (sku: string) => {
    const result = await Swal.fire({
      html: `
        <div style="${swalTituloCssString}">
          ¿Eliminar producto?
        </div>
        <div style="${swalTextoConMargenCssString}">
          ¿Estás seguro de que deseas eliminar el producto con SKU: <b>${sku}</b>?<br>
          Esta acción no se puede deshacer.
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ELIMINAR',
      confirmButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#5c5c5c',
    });

    if (result.isConfirmed) {
      try {
        await deleteProduct(sku);

        setLoadedProducts(prev => prev.filter(p => p.sku !== sku));
        
        Swal.fire({
          icon: 'success',
          html: `
            <div style="${swalTextoCssString}">
              Producto eliminado exitosamente
            </div>
          `,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          html: `
            <div style="${swalTituloCssString}">
              Error al eliminar
            </div>
            <div style="${swalTextoConMargenCssString}">
              No se pudo eliminar el producto del servidor.
            </div>
          `,
          confirmButtonText: 'ACEPTAR',
          confirmButtonColor: '#ff7300',
        });
      }
    }
  };

  // Funciones para manejar el cambio de página
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };


  // Guardar los productos cargados en window para que el modal los pueda leer
  useEffect(() => {
    // @ts-expect-error: window.__LOADED_PRODUCTS__ es una variable global para comunicación con el modal
    window.__LOADED_PRODUCTS__ = loadedProducts;
  }, [loadedProducts]);


  // Función para verificar si hay filtros activos
  const hasActiveFilters = useMemo(() => {
    return activeFilters.categoria !== "" || activeFilters.estado !== "";
  }, [activeFilters]);

  // Función para limpiar filtros desde la barra de herramientas
  const handleClearFiltersFromToolbar = () => {

    setActiveFilters({ categoria: "", estado: "" });
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
      timer: 5000,
      timerProgressBar: true,
      showCloseButton: true
    });
  };

  // Función para formatear precio con separadores de miles
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
                    <button
                      onClick={() => router.push('/admin/inventario')}
                      style={backButtonStyle}
                      title="Volver a Despachos"
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e65a00')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ff7300')}
                    >
                      <FaArrowLeft />
                      Volver
                    </button>
        <h1 style={{...titleStyle,
          fontSize: isMobile ? "1.5rem" : isSmall ? "1.75rem" : "2rem",
          marginBottom: "1.5rem"}}>
            Inventario de Productos ({sucursalNombre})
        </h1>
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
              placeholder="Buscar por nombre del producto..."
              value={searchTerm}
              onChange={(e) => {
                const valor = e.target.value;
                // Solo permitir letras, espacios y caracteres acentuados
                if (valor === '' || /^[a-zA-ZÀ-ÿ0-9\u00f1\u00d1\s]*$/.test(valor)) {
                  setSearchTerm(valor);
                }
              }}
                            maxLength={70}
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
          {!hasActiveFilters ? (
          // Botón de una pieza cuando no hay filtros
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
            
          // División de botones cuando hay filtros aplicados
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
            }} onClick={() => handleModifyProduct('NUEVO')}>
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
            <colgroup>
              <col style={{ width: isMobile ? "8%" : "6%" }} />
              <col style={{ width: isMobile ? "12%" : "10%" }} />
              <col style={{ width: isMobile ? "15%" : "12%" }} />
              <col style={{ width: isMobile ? "10%" : "8%" }} />
              <col style={{ width: isMobile ? "10%" : "8%" }} />
              <col style={{ width: isMobile ? "7%" : "6%" }} />
              <col style={{ width: isMobile ? "7%" : "6%" }} />
              <col style={{ width: isMobile ? "7%" : "6%" }} />
              <col style={{ width: isMobile ? "7%" : "6%" }} />
              <col style={{ width: isMobile ? "10%" : "8%" }} />
              <col style={{ width: isMobile ? "8%" : "7%" }} />
              <col style={{ width: isMobile ? "7%" : "6%" }} />
              <col style={{ width: isMobile ? "18%" : "16%" }} />
            </colgroup>
            <thead style={{ 
              ...theadStyle,
              fontSize: isMobile ? "0.75rem" : "0.875rem"
            }}>
              <tr>
                {[
                  "SKU",
                  "Nombre",
                  "Descripción",
                  "Marca",
                  "Categoría",
                  "Peso (KG)",
                  "Largo (CM)",
                  "Ancho (CM)",
                  "Alto (CM)",
                  "Precio venta (C/U)",
                  "Estado",
                  "Stock",
                  "Acción",
                ].map((col) => (
                  <th key={col} style={thStyle}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={14} style={{ ...tdStyle, ...colSpanStyle}}>
                    <div style={loadingStyle}>
                      <div style={loadingSpinnerStyle}></div>
                      Cargando productos...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={14} style={{ ...tdStyle, ...colSpanStyle, color: "#d33" }}>
                    {error}
                  </td>
                </tr>
              ) : currentTableData.length > 0 ? (
                currentTableData.map((product) => (
                  <tr key={product.sku}>
                    <td style={tdStyle}>{product.sku}</td>
                    <td style={tdStyle}>{product.nombre}</td>
                    <td style={tdStyle}>{product.descripcion}</td>
                    <td style={tdStyle}>{product.marca}</td>
                    <td style={tdStyle}>{product.categoria}</td>
                    <td style={tdStyle}>{product.pesoKg}</td>
                    <td style={tdStyle}>{product.largoCm}</td>
                    <td style={tdStyle}>{product.anchoCm}</td>
                    <td style={tdStyle}>{product.altoCm}</td>
                    <td style={tdStyle}>${formatPrice(product.precioVentaCu)}</td>
                    <td style={tdStyle}>
                      <span style={{...productStatusStyle, backgroundColor: product.estado ? '#4ade80' : '#f87171', color: product.estado ? '#f7f7f7' : '#f7f7f7'}}>{product.estado ? 'Activo' : 'Inactivo'}</span>
                    </td>
                    <td style={tdStyle}>{product.stock}</td>
                    <td style={tdStyle}>
                      <div style={containerEditDeletebuttonsStyle}>
                        <button style={handleModifyProductButtonStyle} onClick={() => handleModifyProduct(product.sku)}>EDITAR</button>
                        <button style={handleDeleteProductButtonStyle} onClick={() => handleDeleteProduct(product.sku)}>ELIMINAR</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={14} style={unavailableProductsStyle}>
                    No hay productos disponibles. Usa &quot;AGREGAR PRODUCTOS&quot; para cargar productos desde CSV o contacta al administrador.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {loadedProducts.length > 0 && (
          <div style={paginationContainerStyle}>
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
                  {!isMobile && <span style={{ marginLeft: '0.5rem' }}>páginas</span>}
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
          </div>
        )}
      </div>

      <FiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        activeFilters={activeFilters}
      />

      <EditProductModal
        isOpen={isEditModalOpen}
        product={editingProduct}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
      />
    </div>
  );
}

// =====================
// 6. ESTILOS DE COMPONENTES
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
  backgroundColor: 'white',
  borderRadius: '12px',
  width: '90%',
  maxWidth: '500px',
  maxHeight: '90vh',
  overflow: 'auto',
  position: 'relative',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

const modalHeaderStyle: React.CSSProperties = {
  padding: '1rem 1.5rem',
  borderBottom: '1px solid #e5e7eb',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const modalTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '1.25rem',
  fontWeight: 'bold',
  color: '#111827',
  fontFamily: 'Montserrat, sans-serif',
};

const closeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '1.5rem',
  cursor: 'pointer',
  padding: '0.5rem',
  color: '#6b7280',
  transition: 'color 0.2s ease',
};

// Estilos para Sucursal1Page (y compartidos)
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
  padding: '0.5rem',
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
  fontSize:"1rem",
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

const modalBodyStyle: React.CSSProperties = {
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

const selectGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.9rem",
  fontWeight: "500",
  color: "#333",
  fontFamily: "Montserrat, sans-serif",
};

const selectStyle: React.CSSProperties = {
  padding: "0.5rem",
  borderRadius: "4px",
  border: "1px solid #ddd",
  fontSize: "0.9rem",
  color: "#333",
  backgroundColor: "#fff",
  cursor: "pointer",
  outline: "none",
  fontFamily: "Roboto, sans-serif",
  transition: "border-color 0.2s ease",
};

const buttonContainerStyle: React.CSSProperties = {
  marginTop: "1rem",
  display: "flex",
  justifyContent: "flex-end",
};

const modalFormStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
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

const writtenCharactersStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  textAlign: 'right',
  color: '#000',
  fontFamily: 'Montserrat, sans-serif',
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

const loadingSpinnerStyle: React.CSSProperties = { 
  width: "20px", 
  height: "20px", 
  border: "2px solid #f3f3f3", 
  borderTop: "2px solid #ff7300", 
  borderRadius: "50%", 
  animation: "spin 1s linear infinite" 
};

// Estilos para los botones de modificar y eliminar productos
const handleModifyProductButtonStyle: React.CSSProperties = {
  ...modifyProductButtonStyle,
  fontSize: '0.75rem',
  padding: '0.25rem 0.5rem',
  maxWidth: '60px'
};

const handleDeleteProductButtonStyle: React.CSSProperties = {
  ...modifyProductButtonStyle,
  backgroundColor: '#ef4444',
  fontSize: '0.75rem',
  padding: '0.25rem 0.5rem',
  maxWidth: '60px'
};

const productStatusStyle: React.CSSProperties = {
  color: 'white',
  padding: '0.25rem 0.5rem',
  borderRadius: '12px',
  fontSize: '0.75rem',
  fontWeight: '500'
};

const containerEditDeletebuttonsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: "5px"
};

const unavailableProductsStyle: React.CSSProperties = {
    ...tdStyle, 
    textAlign: 'center', 
    color: '#888', 
    padding: "2rem" 
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

const theadStyle: React.CSSProperties = {
  position: "sticky", 
  top: 0, 
  zIndex: 2, 
  background: "#5C5C5C",
};

const colSpanStyle: React.CSSProperties = {
  textAlign: "center",
  padding: "2rem"
};

const loadingStyle: React.CSSProperties = {
  display: "flex", 
  justifyContent: "center", 
  alignItems: "center", 
  gap: "10px" 
};

const skuContainerStyle: React.CSSProperties = {
  fontSize: '0.9rem', 
  color: '#666', 
  backgroundColor: '#f3f4f6', 
  padding: '0.5rem 0.75rem', 
  borderRadius: '6px', 
  border: '1px solid #d1d5db' 
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
const backButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  backgroundColor: "#ff7300",
  color: "white",
  border: "none",
  padding: "0.75rem 1.5rem",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "0.875rem",
  fontWeight: "600",
  fontFamily: "Montserrat, sans-serif",
  transition: "all 0.2s ease",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  alignSelf: "flex-start",
};
