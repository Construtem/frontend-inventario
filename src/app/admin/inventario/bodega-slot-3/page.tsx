"use client";

// =====================
// 1. IMPORTACIONES
// =====================
import React, { useState, useMemo, useEffect, useCallback } from "react";
import Swal from 'sweetalert2';
import Image from "next/image";
import Papa from "papaparse";
import { useSearchParams, useRouter } from 'next/navigation';
import filtrosImg from "@/styles/images/filtros.png";
import agregarImg from "@/styles/images/agregar.png";
import buscarImg from "@/styles/images/buscar.png";
import volverImg from "@/styles/images/volver.png";
import actualizarStockImg from "@/styles/images/actualizar-stock.png";

// =====================
// 1.1 CONFIGURACIÓN DEL BACKEND
// =====================
const apiInventarioUrl = process.env.NEXT_PUBLIC_API_INVENTARIO || 'https://api-inventario.tssw.cl';

const getHeaders = () => ({
  'Content-Type': 'application/json',
});

// =====================
// 1.2 FUNCIONES DE API
// =====================

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

const addProduct = async (productData: crearProducto, sucursalId: string, cantidad: number = 1, descuento: number = 0): Promise<void> => {
  try {

    const requiredHeadersTabla = ['sku', 'nombre', 'descripcion', 'peso', 'largo', 'ancho', 'alto', 'precio', 'categoria_id', 'proveedor_id', 'estado'];
    const missingFields = requiredHeadersTabla.filter(field => productData[field as keyof crearProducto] === undefined || productData[field as keyof crearProducto] === null);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    if (!sucursalId || sucursalId.trim() === '') {
      throw new Error('ID de sucursal es requerido para registrar el stock');
    }
    if (typeof cantidad !== 'number' || isNaN(cantidad) || cantidad < 0) {
      throw new Error(`Cantidad debe ser un número positivo válido. Recibido: ${cantidad}`);
    }

    if (typeof descuento !== 'number' || isNaN(descuento) || descuento < 0) {
      throw new Error(`Descuento debe ser un número válido mayor o igual a 0. Recibido: ${descuento}`);
    }

    // Verificar si el producto ya existe en el sistema global
    const allProductsSKUs = await fetchAllProductsSKUs();
    const productExistsInSystem = allProductsSKUs.has(productData.sku);

    // Si el producto no existe en el sistema, crearlo
    if (!productExistsInSystem) {
      const response = await fetch(`${apiInventarioUrl}/api/productos`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
      }
    }

    // Siempre intentar agregar el stock a la sucursal (ya sea producto nuevo o existente)
    const stockResponse = await fetch(`${apiInventarioUrl}/api/stock-sucursal`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify({
        sku: productData.sku,
        sucursal_id: parseInt(sucursalId),
        cantidad: cantidad,
        descuento: descuento
      })
    });

    if (!stockResponse.ok) {
      const stockErrorText = await stockResponse.text();
      throw new Error(`Error ${stockResponse.status} al registrar producto en sucursal: ${stockErrorText}`);
    } 
    
  } catch (error) {

    throw error;
  }
};

const updateStock = async (sku: string, sucursalId: string, cantidadCambio: number): Promise<void> => {
  try {

    if (!sku || !sucursalId || cantidadCambio === undefined || cantidadCambio === null) {
      throw new Error('SKU, sucursalId y cantidad son requeridos');
    }

    const currentStockResponse = await fetch(`${apiInventarioUrl}/api/stock-sucursal?sucursal_id=${sucursalId}`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
      mode: 'cors',
    });

    if (!currentStockResponse.ok) {
      throw new Error(`Error al obtener stock actual: ${currentStockResponse.status}`);
    }

    const stockData = await currentStockResponse.json();
    const productStock = stockData.find((item: any) => 
      item.producto.sku === sku && item.sucursal_id.toString() === sucursalId
    );

    if (!productStock) {
      throw new Error(`Producto con SKU ${sku} no encontrado en la sucursal ${sucursalId}`);
    }

    const currentQuantity = productStock.cantidad;
    const newQuantity = currentQuantity + cantidadCambio;

    if (newQuantity < 0) {
      throw new Error(`No se puede reducir el stock. Stock actual: ${currentQuantity}, cambio solicitado: ${cantidadCambio}. El resultado sería negativo.}`);
    }

    const response = await fetch(`${apiInventarioUrl}/api/stock-sucursal/${sucursalId}/${sku}`, {
      method: 'PUT',
      headers: getHeaders(),
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify({
        sku: sku,
        sucursal_id: parseInt(sucursalId),
        cantidad: newQuantity,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
    }

  } catch (error) {
    Swal.fire({
      icon: 'error',
      html: `
        <div style="${swalTituloCssString}">
          Error al actualizar stock
        </div>
        <div style="${swalTextoConMargenCssString}">
          No se pudo actualizar el stock para el producto con SKU ${sku}.
        </div>
      `,
      confirmButtonText: 'ACEPTAR',
      confirmButtonColor: '#ff7300',
      showCloseButton: true,
      timer: 5000,
      timerProgressBar: true
    });
    throw error;
  }
}

const fetchCategorias = async (): Promise<categorias[]> => {
  try {
    const url = `${apiInventarioUrl}/api/productos`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
      mode: 'cors',
    });
    const productos = await response.json();

    const categoriasUnicas = new Map<string, categorias>();

    productos.forEach((producto: any) => {
      if (producto.categoria && producto.categoria.id && producto.categoria.nombre) {
        const categoriaId = producto.categoria.id.toString();
        if (!categoriasUnicas.has(categoriaId)) {
          categoriasUnicas.set(categoriaId, {
            categoria_id: categoriaId,
            nombre: producto.categoria.nombre,
          });
        }
      }
    });
    
    const result = Array.from(categoriasUnicas.values());
    return result;
  } catch (error) {
    
    throw error;
  }
};

const fetchProveedores = async (): Promise<proveedores[]> => {
  try {
    const url = `${apiInventarioUrl}/api/productos`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const productos = await response.json();
    const proveedoresUnicos = new Map<string, proveedores>();
    
    productos.forEach((producto: any) => {
      if (producto.proveedor && producto.proveedor.id && producto.proveedor.marca) {
        const proveedorId = producto.proveedor.id.toString();
        if (!proveedoresUnicos.has(proveedorId)) {
          proveedoresUnicos.set(proveedorId, {
            proveedor_id: proveedorId,
            marca: producto.proveedor.marca,
          });

        }
      }
    });
    
    const result = Array.from(proveedoresUnicos.values());
    return result;
  } catch (error) {
    throw error;
  }
};

const fetchAllProductsSKUs = async (): Promise<Set<string>> => {
  try {
    const url = `${apiInventarioUrl}/api/productos`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const productos = await response.json();
    const skusSet = new Set<string>();
    
    productos.forEach((producto: any) => {
      if (producto.sku) {
        skusSet.add(producto.sku);
      }
    });
    
    return skusSet;
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

type crearProducto = {
  sku: string;
  nombre: string;
  descripcion: string;
  peso: number;
  largo: number;
  ancho: number;
  alto: number;
  precio: number;
  categoria_id: number;
  proveedor_id: number; 
  estado: boolean;
};

type categorias = {
  categoria_id: string;
  nombre: string;
};

type proveedores = {
  proveedor_id: string;
  marca: string;
};

type stockUpdate = {
  sku: string;
  cantidad: number;
  cantidadExistente?: number; 
};

interface AddProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  skusExistentes: () => Promise<Set<string>>;
  categorias: categorias[];
  proveedores: proveedores[];
  addProduct: (product: crearProducto, sucursalId: string, cantidad: number, descuento: number) => Promise<any>;
  sucursalId: string;
  onProductsAdded?: () => void;
  modalType?: 'add' | 'updateStock';
  updateStock?: (sku: string, sucursalId: string, cantidadCambio: number) => Promise<any>;
}

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: { categoria: string; estado: string }) => void;
  activeFilters: { categoria: string; estado: string };
}

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

// estilos para los textos de los modals de sweetalert2
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

// Componente para el modal de agregar productos masivamente con papaparse
const AddProductsModal: React.FC<AddProductsModalProps> = ({
  isOpen,
  onClose,
  skusExistentes,
  categorias,
  proveedores,
  addProduct,
  sucursalId,
  onProductsAdded,
  modalType = 'add',
  updateStock
}) => {

  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [datosParseadosTabla, setdatosParseadosTabla] = useState<ProductData[]>([]);
  const [datosParseados, setdatosParseados] = useState<crearProducto[]>([]);
  const [datosStockUpdate, setdatosStockUpdate] = useState<stockUpdate[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isUpdateStockMode = modalType === 'updateStock';
  const requiredColumns = isUpdateStockMode ? ['sku', 'cantidad'] : ['sku', 'nombre', 'categoria', 'marca', 'peso', 'precio'];

  const validateProduct = (row: any, rowNumber: number) => {
    const errors: string[] = [];

    if (!row.sku?.trim()) {
       errors.push(`Fila ${rowNumber}: SKU vacío`);
    }

    if (isUpdateStockMode) {
      const cantidad = parseFloat(row.cantidad);
      if (isNaN(cantidad)) {
        errors.push(`Fila ${rowNumber}: Cantidad inválida`);
      }
      return { errors, categoria: null, proveedor: null, cantidad };
    } else {
      if (!row.nombre?.trim()) {
         errors.push(`Fila ${rowNumber}: Nombre vacío`);
      }
      if (!row.categoria?.trim()) {
        errors.push(`Fila ${rowNumber}: Categoría vacía`);
      }
      if (!row.marca?.trim()) {
        errors.push(`Fila ${rowNumber}: Marca vacía`);
      }

      const peso = parseFloat(row.peso);
      const precio = parseFloat(row.precio);
      if (isNaN(peso) || peso <= 0) {
        errors.push(`Fila ${rowNumber}: Peso inválido`);
      }
      if (isNaN(precio) || precio <= 0) {
        errors.push(`Fila ${rowNumber}: Precio inválido`);
      }

      const categoria = categorias.find(cat => 
        cat.nombre.toLowerCase() === row.categoria?.toLowerCase()
      );
      if (!categoria) {
        errors.push(`Fila ${rowNumber}: Categoría "${row.categoria}" no existe`);
      }

      const proveedor = proveedores.find(sup => 
        sup.marca.toLowerCase() === row.marca?.toLowerCase()
      );
      if (!proveedor) {
        errors.push(`Fila ${rowNumber}: Marca "${row.marca}" no existe`);
      }

      return { errors, categoria, proveedor };
    }
  };

  // Lógica para manejar el cambio de archivo
  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setArchivoSeleccionado(file);
    setdatosParseadosTabla([]);
    setdatosParseados([]);
    setdatosStockUpdate([]);
    setErrorMessage(null);

    // Validar que sea CSV
    if (!file.name.endsWith('.csv')) {
      Swal.fire({
        html: `
          <div style="${swalTituloCssString}">
            Error
          </div>
          <div style="${swalTextoConMargenCssString}">
            Por favor selecciona un archivo CSV.
          </div>
        `,
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#ff7300',
        showCloseButton: true,
        timer: 5000,
        timerProgressBar: true
      });
      return;
    }

    // Si es modo de actualización de stock, obtener datos actuales antes de procesar el CSV
    let currentStockData: any[] = [];
    if (isUpdateStockMode) {
      try {
        const stockResponse = await fetch(`${apiInventarioUrl}/api/stock-sucursal?sucursal_id=${sucursalId}`, {
          method: 'GET',
          headers: getHeaders(),
          credentials: 'include',
          mode: 'cors',
        });
        
        if (stockResponse.ok) {
          currentStockData = await stockResponse.json();
        }
      } catch (error) {
      }
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {

        if (results.errors.length > 0) {
          Swal.fire({
            html: `
              <div style="${swalTituloCssString}">
                Error en el archivo CSV
              </div>
              <div style="${swalTextoConMargenCssString}">
                Error al leer el archivo: ${results.errors[0].message}
              </div>
            `,
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#ff7300',
            showCloseButton: true,
            timer: 5000,  
            timerProgressBar: true
          });
          return;
        }

        if (!results.data || results.data.length === 0) {
          Swal.fire({
            html: `
              <div style="${swalTituloCssString}">
                Archivo vacío
              </div>
              <div style="${swalTextoConMargenCssString}">
                El archivo CSV no contiene datos.
              </div>
            `,
            icon: 'warning',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#ff7300',
            showCloseButton: true,
            timer: 5000,
            timerProgressBar: true
          });
          return;
        }

        const headers = Object.keys(results.data[0] as any);
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        
        if (missingColumns.length > 0) {
          Swal.fire({
            html: `
              <div style="${swalTituloCssString}">
                Columnas faltantes
              </div>
              <div style="${swalTextoConMargenCssString}">
                El archivo CSV debe contener las siguientes columnas: ${missingColumns.join(', ')}.
              </div>
            `,
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#ff7300',
            timer: 5000,
            timerProgressBar: true,
            showCloseButton: true
          });
          return;
        }

        if (isUpdateStockMode) {
          // Procesar para actualización de stock
          const validStockUpdates: stockUpdate[] = [];
          const allErrors: string[] = [];

          results.data.forEach((row: any, index: number) => {
            const rowNumber = index + 2;
            const { errors, cantidad } = validateProduct(row, rowNumber);

            if (errors.length > 0) {
              allErrors.push(...errors);
            } else {
              // Buscar la cantidad existente para este SKU
              const stockItem = currentStockData.find((item: any) => 
                item.producto.sku === row.sku.trim() && item.sucursal_id.toString() === sucursalId
              );
              const cantidadExistente = stockItem ? stockItem.cantidad : 0;

              validStockUpdates.push({
                sku: row.sku.trim(),
                cantidad: cantidad!,
                cantidadExistente: cantidadExistente
              });
            }
          });

          if (allErrors.length > 0) {
            Swal.fire({
              html: `
                <div style="${swalTituloCssString}">
                  Errores en el archivo CSV
                </div>
                <div style="${swalTextoConMargenCssString}">
                  Se encontraron errores:${allErrors.slice(0, 5).join('')}${allErrors.length > 5 ? `...y ${allErrors.length - 5} errores más` : ''}
                </div>
              `,
              icon: 'error',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#ff7300',
              timer: 5000,
              timerProgressBar: true,
              showCloseButton: true
            });
            return;
          }

          setdatosStockUpdate(validStockUpdates);
        } else {
          const validProductsForAPI: crearProducto[] = [];
          const validProductsForTable: ProductData[] = [];
          const allErrors: string[] = [];

          results.data.forEach((row: any, index: number) => {
            const rowNumber = index + 2;
            const { errors, categoria, proveedor } = validateProduct(row, rowNumber);

            if (errors.length > 0) {
              allErrors.push(...errors);
            } else if (categoria && proveedor) {
              const productForAPI: crearProducto = {
                sku: row.sku.trim(),
                nombre: row.nombre.trim(),
                descripcion: row.descripcion?.trim() || '',
                peso: parseFloat(row.peso),
                largo: parseFloat(row.largo) || 0,
                ancho: parseFloat(row.ancho) || 0,
                alto: parseFloat(row.alto) || 0,
                precio: parseFloat(row.precio),
                categoria_id: parseInt(categoria.categoria_id),
                proveedor_id: parseInt(proveedor.proveedor_id),
                estado: row.estado?.toLowerCase() !== 'false'
              };

              const productForTable: ProductData = {
                sku: row.sku.trim(),
                nombre: row.nombre.trim(),
                descripcion: row.descripcion?.trim() || '',
                marca: row.marca.trim(),
                categoria: row.categoria.trim(),
                pesoKg: parseFloat(row.peso),
                largoCm: parseFloat(row.largo) || 0,
                anchoCm: parseFloat(row.ancho) || 0,
                altoCm: parseFloat(row.alto) || 0,
                precioVentaCu: parseFloat(row.precio),
                stock: 0,
                estado: row.estado?.toLowerCase() !== 'false'
              };

              validProductsForAPI.push(productForAPI);
              validProductsForTable.push(productForTable);
            }
          });

          if (allErrors.length > 0) {
            Swal.fire({
              html: `
                <div style="${swalTituloCssString}">
                  Errores en el archivo CSV
                </div>
                <div style="${swalTextoConMargenCssString}">
                  Se encontraron errores:${allErrors.slice(0, 5).join('')}${allErrors.length > 5 ? `...y ${allErrors.length - 5} errores más` : ''}
                </div>
              `,
              icon: 'error',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#ff7300',
              timer: 5000,
              timerProgressBar: true,
              showCloseButton: true
            });
            return;
          }

          if (validProductsForAPI.length === 0) {
            Swal.fire({
              html: `
                <div style="${swalTituloCssString}">
                  Sin productos válidos
                </div>
                <div style="${swalTextoConMargenCssString}">
                  No se encontraron productos válidos en el archivo.
                </div>
              `,
              icon: 'warning',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#ff7300',
              timer: 5000,
              timerProgressBar: true,
              showCloseButton: true
            });
            return;
          }

          setdatosParseados(validProductsForAPI);
          setdatosParseadosTabla(validProductsForTable);
        }
        
        setErrorMessage(null);
      },
      error: (error) => {
        Swal.fire({
          html: `
            <div style="${swalTituloCssString}">
              Error al leer el archivo
            </div>
            <div style="${swalTextoConMargenCssString}">
              Error al leer el archivo: ${error.message}
            </div>
          `,
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#ff7300',
          timer: 5000,
          timerProgressBar: true,
          showCloseButton: true
        });
        setErrorMessage(`Error al leer el archivo: ${error.message}`);
      }
    });
  }, [categorias, proveedores, isUpdateStockMode, requiredColumns]);


  const handleUploadConfirm = useCallback(async () => {
    if (isUpdateStockMode) {

      if (datosStockUpdate.length === 0 || errorMessage) {
        return;
      }

      let existingSkus: Set<string> = new Set();
      if (skusExistentes) {
        try {
          existingSkus = await skusExistentes();
        } catch (error) {
          Swal.fire({
            html: `
              <div style="${swalTituloCssString}">
                Error al cargar SKUs existentes
              </div>
              <div style="${swalTextoConMargenCssString}">
                No se pudieron cargar los SKUs existentes.
              </div>
            `,
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#ff7300',
            timer: 5000,
            timerProgressBar: true,
            showCloseButton: true
          });
          onClose();
          return;
        }
      }

      const skusNoExistentes = datosStockUpdate
        .filter(update => !existingSkus.has(update.sku))
        .map(update => update.sku);

      if (skusNoExistentes.length > 0) {
        await Swal.fire({
          html: `
            <div style="${swalTituloCssString}">
              SKUs no encontrados
            </div>
            <div style="${swalTextoConMargenCssString}">
              Los siguientes SKUs no existen en esta sucursal:
              ${skusNoExistentes.join(", ")}
            </div>
          `,
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#ff7300',
          timer: 5000,
          timerProgressBar: true,
          showCloseButton: true
        });
        return;
      }

      const stockUpdatesToApply = datosStockUpdate.filter(update => existingSkus.has(update.sku));
      const positiveUpdates = stockUpdatesToApply.filter(update => update.cantidad > 0);
      const negativeUpdates = stockUpdatesToApply.filter(update => update.cantidad < 0);

      const result = await Swal.fire({
        html: `
          <div style="${swalTituloCssString}">
            Confirmar actualización de stock
          </div>
          <div style="${swalTextoConMargenCssString}">
            Actualizaciones a realizar: ${stockUpdatesToApply.length}
            ${positiveUpdates.length > 0 ? `<br/>Incrementos de stock: ${positiveUpdates.length}` : ''}
            ${negativeUpdates.length > 0 ? `<br/>Decrementos de stock: ${negativeUpdates.length}` : ''}
            ¿Aplicar cambios?
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#ff7300',
        cancelButtonColor: '#5c5c5c',
        showCloseButton: true 
      });

      if (result.isConfirmed && updateStock) {
        try {
          for (const stockUpdate of stockUpdatesToApply) {
            await updateStock(stockUpdate.sku, sucursalId, stockUpdate.cantidad);
          }
          
          setArchivoSeleccionado(null);
          setdatosStockUpdate([]);
          onClose();
          
          if (onProductsAdded) {
            onProductsAdded();
          }
          
          await Swal.fire({
            html: `<div style="${swalTituloCssString}">
              Éxito
            </div>
            <div style="${swalTextoConMargenCssString}">
              Stock actualizado correctamente
            </div>`,
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#ff7300',
            timer: 5000,
            timerProgressBar: true,
            showCloseButton: true
          });
        } catch (error: any) {

          await Swal.fire({
            html: `
              <div style="${swalTituloCssString}">
                Error al actualizar stock
              </div>
              <div style="${swalTextoConMargenCssString}">
                Error al actualizar stock: ${error.message || 'Error desconocido'}
              </div>
            `,
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#ff7300',
            timer: 5000,
            timerProgressBar: true,
            showCloseButton: true
          });
        }
      }
    } else {
      if (datosParseados.length === 0 || errorMessage) {
        return;
      }
      
      // Obtener SKUs existentes en la sucursal específica (para evitar duplicados en la sucursal)
      let existingSkusInSucursal: Set<string> = new Set();
      if (skusExistentes) {
        try {
          existingSkusInSucursal = await skusExistentes();
        } catch (error) {

          Swal.fire({
            html: `
              <div style="${swalTituloCssString}">
                Error
              </div>
              <div style="${swalTextoConMargenCssString}">
                No se pudieron cargar los SKUs existentes en la sucursal.
              </div>
            `,
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#ff7300',
            timer: 5000,
            timerProgressBar: true,
            showCloseButton: true
          });
          onClose();
          return;
        }
      }

      const skusInFile = new Set<string>();
      const duplicadosEnCSV: string[] = [];     
      const existentesEnSucursal: string[] = [];     
      const productosParaProcesar: crearProducto[] = []; 

      datosParseados.forEach(product => {
        const sku = product.sku;
        
        if (skusInFile.has(sku)) {
          duplicadosEnCSV.push(sku);
        } else {
          skusInFile.add(sku);
          if (existingSkusInSucursal.has(sku)) {
            existentesEnSucursal.push(sku);
          } else {
            productosParaProcesar.push(product);
          }
        }
      });

      const uniqueDuplicadosEnCSV = [...new Set(duplicadosEnCSV)];
      const uniqueExistentesEnSucursal = [...new Set(existentesEnSucursal)];

      if (uniqueDuplicadosEnCSV.length > 0) {
        await Swal.fire({
          html: `
            <div style="${swalTituloCssString}">
              SKUs duplicados en el archivo
            </div>
            <div style="${swalTextoConMargenCssString}">
              SKUs repetidos en el archivo: ${uniqueDuplicadosEnCSV.join(", ")}
              Corrige el archivo para incluir solo SKUs únicos.
            </div>
          `,
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#ff7300',
          timer: 5000,
          timerProgressBar: true,
          showCloseButton: true
        });
        return;
      }

      if (uniqueExistentesEnSucursal.length > 0) {
        await Swal.fire({
          html: `
            <div style="${swalTituloCssString}">
              Productos ya existentes en sucursal
            </div>
            <div style="${swalTextoConMargenCssString}">
              Los siguientes productos ya existen en esta sucursal y serán omitidos:
              ${uniqueExistentesEnSucursal.join(", ")}
              Para actualizar su stock, utiliza la opción "Actualizar Stock".
            </div>
          `,
          icon: 'warning',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#ff7300',
          timer: 5000,
          timerProgressBar: true,
          showCloseButton: true
        });
      }
      
      if (productosParaProcesar.length === 0) {
        await Swal.fire({
          html: `
            <div style="${swalTituloCssString}">
              No hay productos para procesar
            </div>
            <div style="${swalTextoConMargenCssString}">
              Todos los productos del archivo ya existen en esta sucursal.
              Para actualizar el stock, usa la opción "Actualizar Stock".
            </div>
          `,
          icon: 'info',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#ff7300',
          timer: 5000,
          timerProgressBar: true,
          showCloseButton: true
        });
        onClose();
        return;
      }

      const result = await Swal.fire({
        title: 'Confirmar carga',
        html: `
          <div style="${swalTituloCssString}">
            Confirmar carga de productos
          </div>
          <div style="${swalTextoConMargenCssString}">
            Productos a procesar: ${productosParaProcesar.length}
            ${uniqueExistentesEnSucursal.length > 0 ? `<br/>Omitidos (ya existen en sucursal): ${uniqueExistentesEnSucursal.length}` : ''}
            Stock inicial: 1 (cantidad mínima requerida)
            <br/><br/>
            Nota: Si un producto existe en el sistema pero no en esta sucursal, se agregará automáticamente a la sucursal.
            ¿Procesar productos?
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#ff7300',
        showCloseButton: true
      });

      if (result.isConfirmed) {
        try {
          for (const product of productosParaProcesar) {
            await addProduct(product, sucursalId, 1, 0);
          }
          
          setArchivoSeleccionado(null);
          setdatosParseadosTabla([]);
          setdatosParseados([]);
          onClose();
          
          if (onProductsAdded) {
            onProductsAdded();
          }
          
          await Swal.fire({
            title: 'Éxito',
            html: `<div style="${swalTituloCssString}">
              Productos procesados correctamente
            </div>
            <div style="${swalTextoConMargenCssString}">
              Se han agregado ${productosParaProcesar.length} productos a la sucursal.
            </div>`,
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#ff7300',
            showCloseButton: true,
            timer: 5000,
            timerProgressBar: true
          });
        } catch (error: any) {
          await Swal.fire({
            html: `
            <div style="${swalTituloCssString}">
              Error al procesar productos
            </div>
              <div style="${swalTextoConMargenCssString}">
                Error al procesar productos: ${error.message || 'Error desconocido'}
              </div>
            `,
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#ff7300',
            showCloseButton: true,
            timer: 5000,
            timerProgressBar: true
          });
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        await Swal.fire({
          html: `
            <div style="${swalTituloCssString}">
              Carga cancelada
            </div>
            <div style="${swalTextoConMargenCssString}">
              La carga de productos fue cancelada.
            </div>
          `,
          icon: 'info',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#ff7300',
          showCloseButton: true,
          timer: 5000,
          timerProgressBar: true
        });
      }
    }
  }, [datosParseados, datosStockUpdate, errorMessage, onClose, skusExistentes, addProduct, updateStock, sucursalId, isUpdateStockMode, onProductsAdded]);

  useEffect(() => {
    if (!isOpen) {
      setArchivoSeleccionado(null);
      setdatosParseadosTabla([]);
      setdatosParseados([]);
      setdatosStockUpdate([]);
      setErrorMessage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <div style={modalHeaderStyle}>
          <h2 style={modalTitleStyle}>
            {modalType === 'add' ? 'Agregar nuevos productos mediante CSV' : 'Actualizar stock mediante CSV'}
          </h2>
          <button style={closeButtonStyle} onClick={onClose}>&times;</button>
        </div>

        <div style={informationTextStyle}>
          <p style={destacaStyle}>
            Nota importante:
          </p>
          {modalType === 'add' ? (
            <>
              <p style={normalTextStyle}>Se requiere que en la primera fila del archivo CSV esté escrita exactamente como se indica, separado por comas:</p>
              <p style={{...destacaStyle, textAlign: 'center', fontSize: '0.7rem', justifyContent: 'center'}}>sku,nombre,descripcion,peso,largo,ancho,alto,precio,categoria,marca,estado</p>
            </>
          ) : (
            <>
              <p style={normalTextStyle}>Para actualizar stock, se requiere que en la primera fila esté colocado este encabezado, separado por comas:</p>
              <p style={{...destacaStyle, textAlign: 'center', fontSize: '1rem', justifyContent: 'center'}}>sku,cantidad</p>
              <p style={normalTextStyle}>Luego coloca en las filas siguientes los datos correspondientes separados por comas. Usa números positivos para sumar stock y números negativos para restar stock.</p>
            </>
          )}
        </div>

        <div
          style={fileInputContainerStyle}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={fileInputStyle}
          />
          <p style={arrastraStyle}>Arrastra tu archivo .csv aquí o haz clic para seleccionarlo</p>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              style={uploadButtonStyle}
              type="button"
              onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
            >
              SELECCIONAR ARCHIVO
            </button>
            {archivoSeleccionado && (
              <button
                type="button"
                style={{ ...removeButtonStyle, backgroundColor: '#5c5c5c', color: 'white' }}
                onClick={e => {
                  e.stopPropagation();
                  setArchivoSeleccionado(null);
                  setdatosParseadosTabla([]);
                  setdatosParseados([]);
                  setErrorMessage(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                Quitar Archivo
              </button>
            )}
          </div>
          {archivoSeleccionado && (
            <p style={fileNameDisplayStyle}>Archivo seleccionado: <strong>{archivoSeleccionado.name}</strong></p>
          )}
        </div>

        {errorMessage && <p style={errorTextStyle}>{errorMessage}</p>}

        {(datosParseadosTabla.length > 0 || datosStockUpdate.length > 0) && (
          <div>
            <h3 style={{...preVisualTextStyle, fontSize: '1.5rem'}}>
              {modalType === 'add' 
                ? `Previsualización de productos (${datosParseadosTabla.length} encontrados):` 
                : `Previsualización de actualizaciones (${datosStockUpdate.length} encontradas):`
              }
            </h3>
            <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '5px' }}>
              <table style={previewTableStyle}>
                <tbody>
                  {modalType === 'add' ? (
                    <>
                      <tr>
                        <th style={thStyle}>SKU</th>
                        <th style={thStyle}>Nombre</th>
                        <th style={thStyle}>Descripción</th>
                        <th style={thStyle}>Marca</th>
                        <th style={thStyle}>Peso (kg)</th>
                        <th style={thStyle}>Largo (cm)</th>
                        <th style={thStyle}>Ancho (cm)</th>
                        <th style={thStyle}>Alto (cm)</th>
                        <th style={thStyle}>Precio Venta (C/U)</th>
                        <th style={thStyle}>Stock</th>
                        <th style={thStyle}>Categoría</th>
                        <th style={thStyle}>Estado</th>
                      </tr>
                      {datosParseadosTabla.map((item, index) => (
                        <tr key={index}>
                          <td style={tdStyle}>{item.sku}</td>
                          <td style={tdStyle}>{item.nombre}</td>
                          <td style={tdStyle}>{item.descripcion}</td>
                          <td style={tdStyle}>{item.marca}</td>
                          <td style={tdStyle}>{item.pesoKg}</td>
                          <td style={tdStyle}>{item.largoCm}</td>
                          <td style={tdStyle}>{item.anchoCm}</td>
                          <td style={tdStyle}>{item.altoCm}</td>
                          <td style={tdStyle}>{item.precioVentaCu}</td>
                          <td style={tdStyle}>{item.stock}</td>
                          <td style={tdStyle}>{item.categoria}</td>
                          <td style={tdStyle}>{item.estado ? 'true' : 'false'}</td>
                        </tr>
                      ))}
                    </>
                  ) : (
                    <>
                      <tr>
                        <th style={thStyle}>SKU</th>
                        <th style={thStyle}>Cantidad Existente</th>
                        <th style={thStyle}>Cantidad a modificar</th>
                        <th style={thStyle}>Resultado Final</th>
                        <th style={thStyle}>Operación</th>
                      </tr>
                      {datosStockUpdate.map((item, index) => {
                        const cantidadExistente = item.cantidadExistente ?? 0;
                        const cantidadFinal = cantidadExistente + item.cantidad;
                        return (
                          <tr key={index}>
                            <td style={tdStyle}>{item.sku}</td>
                            <td style={tdStyle}>{cantidadExistente}</td>
                            <td style={tdStyle}>{item.cantidad}</td>
                            <td style={tdStyle}>
                              <span style={{
                                color: cantidadFinal < 0 ? 'red' : cantidadFinal > cantidadExistente ? 'green' : 'black',
                                fontWeight: 'bold'
                              }}>
                                {cantidadFinal}
                              </span>
                            </td>
                            <td style={tdStyle}>
                              {item.cantidad > 0 ? 
                                <span style={{color: 'green', fontWeight: 'bold'}}>+ Sumar {item.cantidad}</span> : 
                                <span style={{color: 'red', fontWeight: 'bold'}}>- Restar {Math.abs(item.cantidad)}</span>
                              }
                            </td>
                          </tr>
                        );
                      })}
                    </>
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
              <button
                style={{
                  ...confirmButtonStyle,
                  ...((modalType === 'add' ? (datosParseados.length === 0 || errorMessage) : (datosStockUpdate.length === 0 || errorMessage)) ? confirmButtonDisabledStyle : {}),
                }}
                onClick={handleUploadConfirm}
                disabled={modalType === 'add' ? (datosParseados.length === 0 || !!errorMessage) : (datosStockUpdate.length === 0 || !!errorMessage)}
              >
                {modalType === 'add' ? 'Confirmar carga masiva' : 'Confirmar actualización de stock'}
              </button>
              <button
                style={{
                  ...confirmButtonStyle,
                  backgroundColor: '#5c5c5c',
                  opacity: ((modalType === 'add' ? (datosParseados.length === 0 || errorMessage) : (datosStockUpdate.length === 0 || errorMessage))) ? 0.6 : 1,
                  cursor: ((modalType === 'add' ? (datosParseados.length === 0 || errorMessage) : (datosStockUpdate.length === 0 || errorMessage))) ? 'not-allowed' : 'pointer',
                }}
                onClick={() => {
                  Swal.fire({
                    html: `
                      <div style="${swalTituloCssString}">
                        Confirmar cancelación
                      </div>
                      <div style="${swalTextoConMargenCssString}">
                        ¿Estás seguro de que deseas cancelar ${modalType === 'add' ? 'la carga masiva de productos' : 'la actualización de stock'}? 
                        ${modalType === 'add' ? 'No se guardarán los productos previsualizados.' : 'No se aplicarán los cambios de stock.'}
                      </div>
                    `,
                    icon: 'warning',
                    showCancelButton: true,
                    showCloseButton: true,
                    confirmButtonText: 'Sí, cancelar',
                    confirmButtonColor: '#ff7300',
                    cancelButtonText: 'No, continuar',
                    cancelButtonColor: '#5c5c5c',
                    
                  }).then((result) => {
                    if (result.isConfirmed) {
                      onClose();
                      Swal.fire({
                        html: `
                          <div style="${swalTextoConMargenCssString}">
                            ${modalType === 'add' ? 'La carga masiva de productos ha sido cancelada.' : 'La actualización de stock ha sido cancelada.'}
                          </div>
                        `,
                        icon: 'info',
                        confirmButtonText: 'Aceptar',
                        confirmButtonColor: '#ff7300',
                        showCloseButton: true,
                        timer: 5000,
                        timerProgressBar: true
                      });
                    }
                  });
                }}
                disabled={modalType === 'add' ? (datosParseados.length === 0 || !!errorMessage) : (datosStockUpdate.length === 0 || !!errorMessage)}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FiltersModal: React.FC<FiltersModalProps> = ({ isOpen, onClose, onApplyFilters, activeFilters }) => {
  const [categoria, setCategoria] = useState("");
  const [estado, setEstado] = useState("");
  const [visible, setVisible] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setCategoria(activeFilters.categoria);
      setEstado(activeFilters.estado);
    }
  }, [isOpen, activeFilters]);

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

    Swal.fire({
      html: `
        <div style="${swalTituloCssString}">
          ¡Filtros Aplicados!
        </div>
        <div style="${swalTextoConMargenCssString}">
          ${categoria ? `Categoría: ${categoria}` : ''}
          ${estado ? `Estado: ${estado}` : ''}
          ${!categoria && !estado ? 'Se han eliminado todos los filtros' : ''}
        </div>
      `,
      icon: 'success',
      confirmButtonText: 'ACEPTAR',
      confirmButtonColor: '#ff7300',
      showCloseButton: true,
      timer: 5000,
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
        confirmButtonColor: '#ff7300',
        timer: 5000,
        timerProgressBar: true,
        showCloseButton: true
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
        confirmButtonColor: '#ff7300',
        timer: 5000,
        timerProgressBar: true,
        showCloseButton: true
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
        confirmButtonColor: '#ff7300',
        timer: 5000,
        timerProgressBar: true,
        showCloseButton: true
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
        confirmButtonColor: '#ff7300',
        timer: 5000,
        timerProgressBar: true,
        showCloseButton: true
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
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isUpdateStockModalOpen, setIsUpdateStockModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [loadedProducts, setLoadedProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<{ categoria: string; estado: string }>({
    categoria: "",
    estado: ""
  });

  const [categorias, setCategorias] = useState<categorias[]>([]);
  const [proveedores, setproveedores] = useState<proveedores[]>([]);

  //importante: para la paginación
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
          timer: 5000,
          timerProgressBar: true,
          showCloseButton: true,
        });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [sucursalId]);

  // Función para recargar productos después de crear nuevos
  const reloadProducts = async () => {
    try {
      setLoading(true);
      const products = await fetchProducts(sucursalId || undefined);
      setLoadedProducts(products);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        html: `
          <div style="${swalTituloCssString}">
            Error al recargar productos
          </div>
          <div style="${swalTextoConMargenCssString}">
            No se pudieron recargar los productos desde el servidor.
          </div>
        `,
        confirmButtonText: 'ACEPTAR',
        confirmButtonColor: '#ff7300',
        showCloseButton: true,
        timer: 5000,
        timerProgressBar: true

      });
    } finally {
      setLoading(false);
    }
  };

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

  // Cargar categorías desde el backend
  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const categoriasData = await fetchCategorias();
        setCategorias(categoriasData);
      } catch (err) {
        Swal.fire({
          icon: 'warning',
          html: `
            <div style="${swalTituloCssString}">
              Advertencia
            </div>
            <div style="${swalTextoConMargenCssString}">
              No se pudieron cargar las categorías desde el servidor.
              Error: ${err instanceof Error ? err.message : 'Error desconocido'}
            </div>
          `,
          showCloseButton: true,
          confirmButtonText: 'ACEPTAR',
          confirmButtonColor: '#ff7300',
          timer: 5000,
          timerProgressBar: true,
        });
      } finally {
      }
    };

    loadCategorias();
  }, []);


  useEffect(() => {
    const loadproveedores = async () => {
      try {

        const proveedoresData = await fetchProveedores();
        setproveedores(proveedoresData);
      } catch (err) {
        Swal.fire({
          icon: 'warning',
          html: `
            <div style="${swalTituloCssString}">
              Advertencia
            </div>
            <div style="${swalTextoConMargenCssString}">
              No se pudieron cargar los proveedores desde el servidor.<br>
              Error: ${err instanceof Error ? err.message : 'Error desconocido'}
            </div>
          `,
          confirmButtonText: 'ACEPTAR',
          confirmButtonColor: '#ff7300',
          timer: 5000,
          timerProgressBar: true,
          showCloseButton: true
        });
      } finally {

      }
    };

    loadproveedores();
  }, []);

  // Función para el botón FILTROS
  const handleFiltersProduct = () => {
    setIsFiltersModalOpen(true);
  };

  // Función para abrir el modal de agregar productos
  const handleOpenAddProductModal = () => {

    if (categorias.length === 0 || proveedores.length === 0) {
      Swal.fire({
        icon: 'warning',
        html: `
          <div style="${swalTituloCssString}">
            Datos no disponibles
          </div>
          <div style="${swalTextoConMargenCssString}">
            No se pueden cargar productos sin categorías y proveedores disponibles.
            Categorías: ${categorias.length}
            Proveedores: ${proveedores.length}
          </div>
        `,
        confirmButtonText: 'ACEPTAR',
        confirmButtonColor: '#ff7300',
        showCloseButton: true,
        timer: 5000,
        timerProgressBar: true
      });
      return;
    }

    setIsAddProductModalOpen(true);
  };

  // Función para abrir el modal de actualizar stock
  const handleOpenUpdateStockModal = () => {
    setIsUpdateStockModalOpen(true);
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

    if (newFilteredProducts.length === 0 && (filters.categoria || filters.estado)) {
      Swal.fire({
        html: `
          <div style="${swalTituloCssString}">
            No se encontraron resultados
          </div>
          <div style="${swalTextoConMargenCssString}">
            No hay productos que coincidan con los filtros seleccionados:
            ${filters.categoria ? `Categoría: ${filters.categoria}` : ''}
            ${filters.estado ? `Estado: ${filters.estado}` : ''}
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
            Se encontraron ${newFilteredProducts.length} productos con los siguientes filtros:
            ${filters.categoria ? `Categoría: ${filters.categoria}` : ''}
            ${filters.estado ? `Estado: ${filters.estado}` : ''}
          </div>
        `,
        icon: 'success',
        confirmButtonText: 'ACEPTAR',
        confirmButtonColor: '#ff7300',
        showCloseButton: true,
        timer: 5000,
        timerProgressBar: true,
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


  // calculo de el número total de páginas con los productos filtrados
  const totalPages = useMemo(() => {
    return Math.ceil(filteredProducts.length / itemsPerPage);
  }, [filteredProducts]);

  
  // Función para el botón MODIFICAR
  const handleModifyProduct = async (sku: string) => {
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
        timer: 5000,
        timerProgressBar: true,
        showCloseButton: true
      });
      return;
    }

    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleSaveProduct = async (updatedProduct: ProductData) => {
    try {

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
        timer: 5000,
        timerProgressBar: true,
        showCloseButton: true
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
      showCloseButton: true,
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
            <div style="${swalTituloCssString}">
              ¡Producto eliminado!
            </div>
            <div style="${swalTextoCssString}">
              Producto eliminado exitosamente
            </div>
          `,
          confirmButtonText: 'ACEPTAR',
          confirmButtonColor: '#ff7300',
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true,
          showCloseButton: true
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
          timer: 5000,
          timerProgressBar: true,
          showCloseButton: true
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


  useEffect(() => {
    // @ts-expect-error: window.__LOADED_PRODUCTS__ es una variable global para comunicación con el modal
    window.__LOADED_PRODUCTS__ = loadedProducts;
  }, [loadedProducts]);

  const hasActiveFilters = useMemo(() => {
    return activeFilters.categoria !== "" || activeFilters.estado !== "";
  }, [activeFilters]);


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

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <button style={{
              ...buttonStyle,
              width: isMobile ? "25%" : isSmall ? "15%" : isMedium ? "12%" : isLarge ? "10%" : "7.5%",
              fontSize: isMobile ? "0.875rem" : "1rem",
              padding: isMobile ? "0.5rem 0.75rem" : "0.5rem 1.2rem"
            }} onClick={() => router.push('/admin/inventario')}>
              <Image
                src={volverImg.src}
                width={20}
                height={20}
                alt="Volver"
                style={filterIconStyle}
              />
              {!isMobile && "Volver"}
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
                if (valor === '' || /^[a-zA-ZÀ-ÿ0-9\u00f1\u00d1\s]*$/.test(valor)) {
                  setSearchTerm(valor);
                }
              }}
              maxLength={100}
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
          <div style={{
            ...rightControlsWrapperStyle,
            width: isMobile ? "100%" : "auto", 
            marginTop: isMobile ? "1rem" : isSmall ? "1rem" : "0"
            }}>
            <button style={{
              ...editButtonStyle,
              width: isMobile ? "100%" : "auto",
              fontSize: isMobile ? "0.875rem" : "1rem",
            }} onClick={handleOpenAddProductModal}>
              <Image
                src={agregarImg.src}
                alt="Agregar productos"
                width={20}
                height={20}
                style={filterIconStyle}
              />
              AGREGAR PRODUCTOS
            </button>
            <button style={{
              ...editButtonStyle,
              width: isMobile ? "100%" : "auto",
              fontSize: isMobile ? "0.875rem" : "1rem",
            }} onClick={handleOpenUpdateStockModal}>
              <Image
                src={actualizarStockImg.src}
                alt="Actualizar stock"
                width={20}
                height={20}
                style={filterIconStyle}
              />
              ACTUALIZAR STOCK
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
      </div>

      {loadedProducts.length > 0 && (
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
      
      <>
        <AddProductsModal
          isOpen={isAddProductModalOpen}
          onClose={() => setIsAddProductModalOpen(false)}
          skusExistentes={async () => {
            return new Set(loadedProducts.map(p => p.sku));
          }}
          categorias={categorias} 
          proveedores={proveedores} 
          addProduct={addProduct} 
          updateStock={updateStock}
          modalType="add"
          sucursalId={sucursalId || '1'}
          onProductsAdded={reloadProducts}
        />
        
        <AddProductsModal
          isOpen={isUpdateStockModalOpen}
          onClose={() => setIsUpdateStockModalOpen(false)}
          skusExistentes={async () => {
            return new Set(loadedProducts.map(p => p.sku));
          }}
          categorias={categorias} 
          proveedores={proveedores} 
          addProduct={addProduct} 
          updateStock={updateStock}
          modalType="updateStock"
          sucursalId={sucursalId || '1'}
          onProductsAdded={reloadProducts}
        />
      </>
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
  padding: '1.5rem',
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
  color:"#000",
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
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
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
  border: '1px solid #d1d5db', 
  fontFamily: 'Montserrat, sans-serif',

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

const buttonStyle: React.CSSProperties = {
  backgroundColor: "#ff7300",
  color: "white",
  padding: "0.5rem 1.2rem",
  borderRadius: "8px",
  height: "40px",
  border: "none",
  cursor: "pointer",
  fontFamily: "Montserrat, sans-serif",
  fontSize: "1rem",
  fontWeight: 600,
  marginBottom: "1rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
  transition: "background-color 0.2s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  minWidth: "fit-content"
};


const arrastraStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: '#555',
  textAlign: 'center' as const,
  marginBottom: '10px',
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
};

const preVisualTextStyle: React.CSSProperties = {
  fontSize: '1rem', 
  fontFamily: 'Montserrat, sans-serif', 
  fontWeight: 'semibold',
  color: '#333', 
  marginBottom: '10px',
};

const previewTableStyle: React.CSSProperties = {
  width: '100%', 
  borderCollapse: 'collapse' as const, 
  marginTop: '20px',
};

const fileInputContainerStyle: React.CSSProperties = {
  display: 'flex', 
  flexDirection: 'column' as const, 
  alignItems: 'center',
  gap: '10px', 
  padding: '20px', 
  border: '2px dashed #ccc',
  borderRadius: '8px',
  cursor: 'pointer', 
  backgroundColor: '#f9f9f9',
};

const fileInputStyle: React.CSSProperties = { 
  display: 'none' 
};

const uploadButtonStyle: React.CSSProperties = {
  backgroundColor: '#ff7300',
  color: 'white',
  padding: '10px 20px',
  borderRadius: '5px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1rem',
  fontFamily: 'Montserrat, sans-serif',
  fontWeight: 'semibold',
  transition: 'background-color 0.2s ease',
  marginTop: '10px',
};

const removeButtonStyle: React.CSSProperties = {
  backgroundColor: '#5c5c5c',
  color: 'white',
  padding: '10px 20px',
  borderRadius: '5px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.9375rem',
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 'medium',
  transition: 'background-color 0.2s ease',
  marginTop: '10px',
};

const confirmButtonStyle: React.CSSProperties = {
  backgroundColor: '#ff7300', 
  color: 'white', 
  padding: '12px 25px',
  borderRadius: '5px', 
  border: 'none', 
  cursor: 'pointer', 
  fontSize: '1.1em',
  marginTop: '20px', 
  transition: 'background-color 0.2s ease',
};

const confirmButtonDisabledStyle: React.CSSProperties = {
  backgroundColor: '#cccccc', 
  cursor: 'not-allowed',
};

const fileNameDisplayStyle: React.CSSProperties = {
  marginTop: '10px',
  fontSize: '1rem',
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
  color: '#555',
};

const errorTextStyle: React.CSSProperties = {
  color: 'red', 
  marginTop: '10px', 
  fontSize: '0.9em',
};

const informationTextStyle: React.CSSProperties = {
  backgroundColor: '#f8f9fa', 
  margin: '1.5rem',
  fontSize: '0.875rem',
  gap: '10px',
  padding: '20px',
  border: '2px solid #ccc',
  borderRadius: '8px',
};

const destacaStyle: React.CSSProperties = {
  fontWeight: 'bold',
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '1.1em'
};

const normalTextStyle: React.CSSProperties = {
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
  fontSize: '1rem',
  color: '#333',
};

