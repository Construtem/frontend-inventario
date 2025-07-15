"use client";

// =====================
// 1. IMPORTACIONES
// =====================
import React, { useRef, useState, useMemo, useEffect } from "react";
import Papa from 'papaparse';
import Swal from 'sweetalert2';
import Image from "next/image";
import { useSearchParams } from 'next/navigation';

import filtrosImg from "@/styles/images/filtros.png";
import agregarImg from "@/styles/images/agregar.png";
import logo1Img from "@/styles/images/logo1.png";
import buscarImg from "@/styles/images/buscar.png";

// =====================
// 1.1 CONFIGURACIÓN DEL BACKEND
// =====================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_INVENTARIO || 'https://api-inventario.tssw.cl';

// Headers comunes para las peticiones
const getHeaders = () => ({
  'Content-Type': 'application/json',
  // Agrega aquí tokens de autenticación si los usas
  // 'Authorization': `Bearer ${token}`,
});

// =====================
// 1.2 FUNCIONES DE API
// =====================

// Obtener todos los productos
const fetchProducts = async (): Promise<ProductData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/productos`, {
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
    console.error('Error al obtener productos:', error);
    throw error;
  }
};

// Obtener datos de una sucursal específica
const fetchSucursal = async (id: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/sucursales/${id}`, {
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
    console.error('Error al obtener sucursal:', error);
    throw error;
  }
};

// Obtener un producto por SKU
/*const fetchProductBySKU = async (sku: string): Promise<ProductData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/productos/${sku}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener producto por SKU:', error);
    throw error;
  }
};

// Crear un producto
const createProduct = async (product: Omit<ProductData, 'idProducto'>): Promise<ProductData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/productos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al crear producto:', error);
    throw error;
  }
};

// Actualizar un producto por SKU
const updateProduct = async (sku: string, product: Partial<ProductData>): Promise<ProductData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/productos/${sku}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    throw error;
  }
};*/

// Eliminar un producto por SKU
const deleteProduct = async (sku: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/productos/${sku}`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error al eliminar producto:', error);
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

interface UploadCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadConfirm: (data: ProductData[]) => void;
}

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: { categoria: string; estado: string }) => void;
}

// =====================
// 3. DEFINICIONES DE ESTILOS PARA SWEETALERT2
// (Fuera de los componentes para reutilización y generación de CSS en línea)
// =====================

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

// Combinación para el texto que necesita un margen superior
const estiloSwalTextoConMargenObj: React.CSSProperties = {
  ...estiloSwalTextoObj,
  marginTop: '10px'
};

// Función auxiliar para convertir un objeto JS de estilos a una cadena CSS en línea
function objToInlineCss(styleObj: React.CSSProperties): string {
  return Object.entries(styleObj)
    .map(([key, value]) => {
      // Convierte camelCase a kebab-case (ej. 'fontSize' a 'font-size')
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      // Retorna la propiedad CSS en formato "clave: valor;"
      return `${cssKey}: ${value};`;
    })
    .join(' '); // Une todas las propiedades con un espacio
}

// Genera las cadenas CSS que se usarán directamente en el HTML de SweetAlert2
const swalTituloCssString = objToInlineCss(estiloSwalTituloObj);
const swalTextoCssString = objToInlineCss(estiloSwalTextoObj);
const swalTextoConMargenCssString = objToInlineCss(estiloSwalTextoConMargenObj);

// =====================
// 4. FUNCIONES AUXILIARES
// =====================

// Función para parsear el campo "estado"
function parseestado(value: string): boolean | null {
  const lowerCaseValue = value?.toLowerCase().trim();
  if (lowerCaseValue === 'activo') return true;
  if (lowerCaseValue === 'inactivo') return false;
  return null;
}

// =====================
// 5. COMPONENTES REACT
// =====================

const UploadCsvModal: React.FC<UploadCsvModalProps> = ({ isOpen, onClose, onUploadConfirm }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ProductData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingDuplicateError, setPendingDuplicateError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Animación para aparecer/desaparecer el modal
  const [visible, setVisible] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    } else {
      const timeout = setTimeout(() => setVisible(false), 250);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setSelectedFile(file);
    setParsedData([]);
    setErrorMessage(null);

    if (file) {
      if (file.type !== 'text/csv') {
        setErrorMessage('Formato de archivo no válido. Por favor, sube un archivo .csv');
        setSelectedFile(null);
        // SweetAlert2 para error de formato
        Swal.fire({
          icon: 'error',
          html: `
            <div style="${swalTituloCssString}">
              ¡Ups! Parece que hay un <b>Error de Archivo</b>.
            </div>
            <div style="${swalTextoConMargenCssString}">
              Por favor, sube un archivo .csv.
            </div>
          `,
          confirmButtonText: 'ACEPTAR',
          confirmButtonColor: '#ff7300',
          cancelButtonText: 'Cancelar',
          cancelButtonColor: '#5c5c5c',
        });
        return;
      }

      Papa.parse<ProductData>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results: Papa.ParseResult<ProductData>) => {
          if (results.errors.length) {
            const errorMsg = `Error al parsear el CSV: ${results.errors[0].message}`;
            setErrorMessage(errorMsg);
            setParsedData([]);
            // SweetAlert2 para errores de parseo
            Swal.fire({
              icon: 'error',
              html: `
                <div style="${swalTituloCssString}">
                  ¡Atención! Se produjo un <b>Error de Parseo CSV</b>.
                </div>
                <div style="${swalTextoConMargenCssString}">
                  ${errorMsg}
                </div>
              `,
              confirmButtonText: 'ACEPTAR',
              confirmButtonColor: '#ff7300',
              cancelButtonText: 'Cancelar',
              cancelButtonColor: '#5c5c5c',
            });
            return;
          }

          if (!results.data.length) {
            setErrorMessage('El archivo CSV está vacío o no contiene datos válidos.');
            setParsedData([]);
            // SweetAlert2 para CSV vacío
            Swal.fire({
              icon: 'warning',
              html: `
                <div style="${swalTituloCssString}">
                  El <b>Archivo CSV</b> está vacío o no contiene datos válidos.
                </div>
                <div style="${swalTextoConMargenCssString}">
                  Por favor, revisa el contenido.
                </div>
              `,
              confirmButtonText: 'ACEPTAR',
              confirmButtonColor: '#ff7300',
              cancelButtonText: 'Cancelar',
              cancelButtonColor: '#5c5c5c',
            });
            return;
          }

          const requiredHeaders = [
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
            "Stock"
          ];

          const headers = results.meta.fields || [];
          const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));

          if (missingHeaders.length > 0) {
            const errorMsg = `Faltan los siguientes encabezados requeridos: ${missingHeaders.join(', ')}. Por favor, verifica el formato del CSV.`;
            setErrorMessage(errorMsg);
            setParsedData([]);
            // SweetAlert2 para encabezados faltantes
            Swal.fire({
              icon: 'error',
              html: `
                <div style="${swalTituloCssString}">
                  ¡Error! Faltan <b>Encabezados</b> importantes en tu CSV.
                </div>
                <div style="${swalTextoConMargenCssString}">
                  ${errorMsg}
                </div>
              `,
              confirmButtonText: 'ACEPTAR',
              confirmButtonColor: '#ff7300',
              cancelButtonText: 'Cancelar',
              cancelButtonColor: '#5c5c5c',
            });
            return;
          }

          const validatedData: ProductData[] = [];
          let hasRowErrors = false;
          const allRowErrors: string[] = []; // Para acumular todos los errores de fila

          // (results.data as any[]).forEach((row: any, index: number) => {
          // Corrige los tipos de PapaParse: usa Record<string, string> para filas CSV genéricas
          ((results.data as unknown) as Record<string, string>[]).forEach((row, index: number) => {
            const rowErrors: string[] = [];

            const sku = row["SKU"]?.toString().trim() || '';
            const nombre = row["Nombre"]?.toString().trim() || '';
            const descripcion = row["Descripción"]?.toString().trim() || '';
            const marca = row["Marca"]?.toString().trim() || '';
            const categoria = row["Categoría"]?.toString().trim() || '';
            const pesoKg = parseFloat(row["Peso (KG)"]);
            const largoCm = parseFloat(row["Largo (CM)"]);
            const anchoCm = parseFloat(row["Ancho (CM)"]);
            const altoCm = parseFloat(row["Alto (CM)"]);
            const precioVentaCu = parseFloat(row["Precio venta (C/U)"]);

            const estadoParsed = parseestado(row["Estado"]);
            const estado = estadoParsed === null ? null : estadoParsed;

            const stock = parseInt(row["Stock"], 10);

            if (!sku) rowErrors.push('SKU no puede estar vacío');
            if (!nombre) rowErrors.push('Nombre no puede estar vacío');
            if (!marca) rowErrors.push('Marca no puede estar vacía');
            if (!categoria) rowErrors.push('Categoría no puede estar vacía');

            if (isNaN(pesoKg) || pesoKg < 0) rowErrors.push('Peso (KG) debe ser un número positivo');
            if (isNaN(largoCm) || largoCm < 0) rowErrors.push('Largo (CM) debe ser un número positivo');
            if (isNaN(anchoCm) || anchoCm < 0) rowErrors.push('Ancho (CM) debe ser un número positivo');
            if (isNaN(altoCm) || altoCm < 0) rowErrors.push('Alto (CM) debe ser un número positivo');

            if (isNaN(precioVentaCu) || precioVentaCu < 0) rowErrors.push('Precio venta (C/U) debe ser un número positivo');

            if (estado === null) rowErrors.push('Estado debe ser "Activo" o "Inactivo"');

            if (isNaN(stock) || stock < 0) rowErrors.push('Stock debe ser un número entero positivo');

            if (rowErrors.length > 0) {
              allRowErrors.push(`Fila ${index + 2}: ${rowErrors.join(', ')}`);
              hasRowErrors = true;
            } else {
              validatedData.push({
                sku,
                nombre,
                descripcion,
                marca,
                categoria,
                pesoKg,
                largoCm,
                anchoCm,
                altoCm,
                precioVentaCu,
                stock,
                estado: estado as boolean,
              });
            }
          });

          if (hasRowErrors) {
            setParsedData([]);
            const errorSummary = `Se encontraron errores en el CSV. Detalles:<br>${allRowErrors.join('<br>')}`; // Usar <br> para saltos de línea en HTML
            setErrorMessage(errorSummary);
            
            Swal.fire({
              icon: 'error',
              html: `
                <div style="${swalTituloCssString}">
                  ¡Se detectaron <b>Errores en Filas del CSV</b>!
                </div>
                <div style="${swalTextoConMargenCssString}">
                  ${errorSummary}
                </div>
              `,
              buttonsStyling: false,
              width: 'auto'
            });
            return;
          }

          if (validatedData.length === 0 && results.data.length > 0) {
            setErrorMessage('Ninguna fila del CSV contiene datos válidos después de la validación.');
            setParsedData([]);
           
            Swal.fire({
              icon: 'warning',
              html: `
                <div style="${swalTituloCssString}">
                  ¡Advertencia! Sin <b>Datos Válidos</b>.
                </div>
                <div style="${swalTextoConMargenCssString}">
                  Ninguna fila del CSV contiene datos válidos después de la validación.
                </div>
              `,
              confirmButtonText: 'ACEPTAR',
              confirmButtonColor: '#ff7300',
              cancelButtonText: 'Cancelar',
              cancelButtonColor: '#5c5c5c',
            });
            return;
          }

          setParsedData(validatedData);
          setErrorMessage(null);
          

        },
        error: (error: Error /*, file: File*/) => { // <-- Elimina 'file' no usado
          const errorMsg = `Error al leer el archivo: ${error.message}`;
          setErrorMessage(errorMsg);

          Swal.fire({
            icon: 'error',
            html: `
              <div style="${swalTituloCssString}">
                Se produjo un <b>Error de Lectura de Archivo</b>.
              </div>
              <div style="${swalTextoConMargenCssString}">
                ${errorMsg}
              </div>
            `,
            confirmButtonText: 'ACEPTAR',
            confirmButtonColor: '#ff7300',
            cancelButtonText: 'Cancelar',
            cancelButtonColor: '#5c5c5c',
          });
        },
      });
    }
  };

  const handleUploadConfirm = async () => {
    if (parsedData.length > 0 && !errorMessage) {

      // @ts-expect-error: window.__LOADED_PRODUCTS__ es una variable global para comunicación con el modal
      const loadedProducts: ProductData[] = (window.__LOADED_PRODUCTS__ || []);

      const existingSkus = new Set<string>(loadedProducts.map(p => p.sku));

      const skuCount: Record<string, number> = {};
      parsedData.forEach(prod => {
        skuCount[prod.sku] = (skuCount[prod.sku] || 0) + 1;
      });
      const duplicatedSkus = Object.keys(skuCount).filter(sku => skuCount[sku] > 1);

      // Duplicados respecto a los productos ya cargados
      const duplicatedSkusGlobal = parsedData
        .map(p => p.sku)
        .filter((sku, idx, arr) => existingSkus.has(sku) && arr.indexOf(sku) === idx);

      
      if (duplicatedSkus.length > 0 || duplicatedSkusGlobal.length > 0) {
        let skuMsg: string | null = null;
        if (duplicatedSkus.length > 0 || duplicatedSkusGlobal.length > 0) {
          let msg = "No se puede cargar el archivo porque existen productos con ";
          const parts: string[] = [];
          if (duplicatedSkus.length > 0) parts.push(`<b>SKU</b> repetido en el archivo: ${duplicatedSkus.join(", ")}`);
          if (duplicatedSkusGlobal.length > 0) parts.push(`<b>SKU</b> ya existente: ${duplicatedSkusGlobal.join(", ")}`);
          msg += parts.join(" | ");
          skuMsg = msg;
        }
        if (skuMsg) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            html: `
              <div style="${swalTextoCssString}">
                ${skuMsg}
              </div>
            `, 
            showConfirmButton: false,
            timer: 3500,
            timerProgressBar: true,
            customClass: {
              popup: 'swal2-toast-success-custom', 
            },
            didClose: () => {
              setTimeout(() => {
                Swal.fire({
                  toast: true,
                  position: 'top-end',
                  icon: 'error',
                  html: `
                    <div style="${swalTextoCssString}">
                      ${skuMsg!}
                    </div>
                  `, 
                  showConfirmButton: false,
                  timer: 3500,
                  timerProgressBar: true,
                  customClass: {
                    popup: 'swal2-toast-success-custom', 
                  }
                });
              }, 100);
            }
          });
        } else if (skuMsg) {
          setTimeout(() => {
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'error',
              html: `
                <div style="${swalTextoCssString}">
                  ${skuMsg!}
                </div>
              `, 
              showConfirmButton: false,
              timer: 3500,
              timerProgressBar: true,
              customClass: {
                popup: 'swal2-toast-success-custom', 
              }
            });
          }, 100);
        }
        onClose(); 
        return;
      }

      const result = await Swal.fire({
        html: `
          <div style="${swalTituloCssString}">
            <b>¿Estás seguro?</b>
          </div>
          <div style="${swalTextoConMargenCssString}">
            Se cargarán <b>${parsedData.length} productos</b>.<br>¿Deseas continuar con la carga masiva?
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ACEPTAR',
        confirmButtonColor: '#ff7300',
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#5c5c5c',
        // customClass.popup se mantiene por si tiene estilos no relacionados con fuente
        customClass: {
          confirmButton: 'my-swal-confirm-button',
          cancelButton: 'my-swal-cancel-button',
          popup: 'my-swal-popup', // Puedes mantener esta clase para estilos no tipográficos
        }
      });

      if (result.isConfirmed) {
        onUploadConfirm(parsedData);
        setSelectedFile(null);
        setParsedData([]);
        onClose();
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          html: `
            <div style="${swalTextoCssString}">
              ¡<b>Carga exitosa</b>! Los productos han sido añadidos.
            </div>
          `, 
          showConfirmButton: false,
          timer: 3500,
          timerProgressBar: true,
          customClass: {
            popup: 'swal2-toast-success-custom', 
          }
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          html: `
            <div style="${swalTituloCssString}">
              <b>Carga Cancelada</b>
            </div>
            <div style="${swalTextoConMargenCssString}">
              La carga masiva de productos ha sido cancelada.
            </div>
          `,
          icon: 'info',
          confirmButtonText: 'ACEPTAR',
          confirmButtonColor: '#ff7300',
          customClass: {
            confirmButton: 'my-swal-confirm-button',
            cancelButton: 'my-swal-cancel-button',
            popup: 'my-swal-popup',
          }
        });
      }
    }
  };

  
  useEffect(() => {
    if (!isOpen && pendingDuplicateError) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        html: `
          <div style="${swalTextoCssString}">
            ${pendingDuplicateError}
          </div>
        `, 
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true,
        customClass: {
          popup: 'swal2-toast-success-custom', 
        }
      });
      setPendingDuplicateError(null);
    }
  }, [isOpen, pendingDuplicateError]);

  if (!visible) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <div style={modalHeaderStyle}>
          <h2 style={modalTitleStyle}>Agregar productos mediante CSV</h2>
          <button style={closeButtonStyle} onClick={onClose}>&times;</button>
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
              onClick={e => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              SELECCIONAR ARCHIVO
            </button>
            {selectedFile && (
              <button
                type="button"
                style={{
                  ...removeButtonStyle,
                  backgroundColor: '#5c5c5c',
                  color: 'white',
                }}
                onClick={e => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  setParsedData([]);
                  setErrorMessage(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                Quitar Archivo
              </button>
            )}
          </div>
          {selectedFile && (
            <p style={fileNameDisplayStyle}>Archivo seleccionado: <strong>{selectedFile.name}</strong></p>
          )}
        </div>

        {errorMessage && <p style={errorTextStyle}>{errorMessage}</p>}

        {parsedData.length > 0 && (
          <div>
            <h3 style={preVisualTextStyle}>Previsualización de productos ({parsedData.length} encontrados):</h3>
            <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '5px' }}>
              <table style={previewTableStyle}>
                <thead>
                  <tr>
                    {Object.keys(parsedData[0] || {}).map((key) => (
                      <th style={tableHeaderStyle} key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((product, index) => (
                    <tr key={index}>
                      <td style={tdModalStyle}>{product.sku}</td>
                      <td style={tdModalStyle}>{product.nombre}</td>
                      <td style={tdModalStyle}>{product.descripcion}</td>
                      <td style={tdModalStyle}>{product.marca}</td>
                      <td style={tdModalStyle}>{product.categoria}</td>
                      <td style={tdModalStyle}>{product.pesoKg}</td>
                      <td style={tdModalStyle}>{product.largoCm}</td>
                      <td style={tdModalStyle}>{product.anchoCm}</td>
                      <td style={tdModalStyle}>{product.altoCm}</td>
                      <td style={tdModalStyle}>${product.precioVentaCu}</td>
                      <td style={tdModalStyle}>{product.stock}</td>
                      <td style={tdModalStyle}>
                        <span style={{
                          backgroundColor: product.estado ? '#10b981' : '#ef4444',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          {product.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
              <button
                style={{
                  ...confirmButtonStyle,
                  ...(parsedData.length === 0 || errorMessage ? confirmButtonDisabledStyle : {}),
                }}
                onClick={handleUploadConfirm}
                disabled={parsedData.length === 0 || !!errorMessage}
              >
                Confirmar carga masiva
              </button>
              <button
                style={{
                  ...confirmButtonStyle,
                  backgroundColor: '#5c5c5c',
                  // Aplica el estilo de deshabilitado si no hay datos o hay error, pero usa el color de fondo para "Cancelar"
                  opacity: (parsedData.length === 0 || errorMessage) ? 0.6 : 1, // Opacidad para deshabilitado
                  cursor: (parsedData.length === 0 || errorMessage) ? 'not-allowed' : 'pointer', // Cursor para deshabilitado
                }}
                onClick={() => {
                  Swal.fire({
                    html: `
                      <div style="${swalTituloCssString}">
                        ¿<b>Deseas cancelar la carga</b>?
                      </div>
                      <div style="${swalTextoConMargenCssString}">
                        No se guardarán los productos previsualizados.
                      </div>
                    `,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'ACEPTAR',
                    confirmButtonColor: '#ff7300',
                    cancelButtonText: 'Cancelar',
                    cancelButtonColor: '#5c5c5c',
                  }).then((result) => {
                    if (result.isConfirmed) {
                      setParsedData([]);
                      setSelectedFile(null);
                      setErrorMessage(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                      onClose(); // Cierra el modal
                      Swal.fire({
                        html: `
                          <div style="${swalTituloCssString}">
                            ¡<b>Cancelado</b>!
                          </div>
                          <div style="${swalTextoConMargenCssString}">
                            Carga masiva de productos cancelada.
                          </div>
                        `,
                        icon: 'info',
                        confirmButtonText: 'ACEPTAR',
                        confirmButtonColor: '#ff7300',
                      });
                    }
                  });
                }}
                // Solo deshabilitar si la lógica interna del botón de confirmar lo requeriría
                disabled={parsedData.length === 0 || !!errorMessage}
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

const FiltersModal: React.FC<FiltersModalProps> = ({ isOpen, onClose, onApplyFilters }) => {
  const [categoria, setCategoria] = useState("");
  const [estado, setEstado] = useState("");
  const [visible, setVisible] = useState(isOpen);

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
    });
  };

  const handleClearFilters = () => {
    setCategoria("");
    setEstado("");
    onApplyFilters({ categoria: "", estado: "" });
    onClose();

    // Mostrar mensaje de éxito al limpiar filtros
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
              <option value="electronica">Electrónica</option>
              <option value="ropa">Ropa</option>
              <option value="hogar">Hogar</option>
              <option value="alimentos">Alimentos</option>
              <option value="otros">Otros</option>
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

// Modificar el hook useWindowSize para incluir más breakpoints
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

export default function Sucursal1Page() {
  const { isExtraLarge, isLarge, isMedium, isSmall, isMobile } = useWindowSize();
  const searchParams = useSearchParams();
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

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [loadedProducts, setLoadedProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<{ categoria: string; estado: string }>({
    categoria: "",
    estado: ""
  });

  // --- ESTADOS DE PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // 15 resultados por página

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

  // Cargar nombre de la sucursal
  useEffect(() => {
    const loadSucursalName = async () => {
      if (sucursalId) {
        try {
          const sucursalData = await fetchSucursal(sucursalId);
          setSucursalNombre(sucursalData.nombre || 'Sucursal Slot 1');
        } catch (err) {
          console.error('Error al cargar nombre de sucursal:', err);
          setSucursalNombre('Sucursal Slot 1');
        }
      }
    };

    loadSucursalName();
  }, [sucursalId]);

  // Cargar productos desde el backend al inicializar
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const products = await fetchProducts();
        setLoadedProducts(products);
      } catch (err) {
        console.error('Error al cargar productos:', err);
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
        });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Función para el botón FILTROS
  const handleFiltersProduct = () => {
    setIsFiltersModalOpen(true);
  };

  // Función para aplicar filtros
  const handleApplyFilters = (filters: { categoria: string; estado: string }) => {
    setActiveFilters(filters);
    setCurrentPage(1); // Reset a la primera página cuando se aplican filtros

    // Calcular resultados con los nuevos filtros
    const newFilteredProducts = loadedProducts.filter(product => {
      const matchesCategoria = !filters.categoria || product.categoria === filters.categoria;
      const matchesEstado = !filters.estado || 
        (filters.estado === "activo" ? product.estado : !product.estado);
      return matchesCategoria && matchesEstado;
    });

    // Mostrar mensaje según los resultados
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
      });
    }
  };

  // Filtrar productos según los filtros activos
  const filteredProducts = useMemo(() => {
    return loadedProducts.filter(product => {
      const matchesCategoria = !activeFilters.categoria || product.categoria === activeFilters.categoria;
      const matchesEstado = !activeFilters.estado || 
        (activeFilters.estado === "activo" ? product.estado : !product.estado);
      return matchesCategoria && matchesEstado;
    });
  }, [loadedProducts, activeFilters]);

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

  const handleConfirmBulkUpload = async (data: ProductData[]) => {
    try {
      console.log("Datos para cargar masivamente:", data);
      // Aquí podrías implementar la carga masiva real al backend
      // const newProducts = await bulkCreateProducts(data);
      
      // Por ahora, agregamos los productos localmente
      setLoadedProducts(prev => [...prev, ...data]);
      setCurrentPage(1); // Reset a la primera página cuando se cargan nuevos datos
    } catch (error) {
      console.error('Error en carga masiva:', error);
      Swal.fire({
        icon: 'error',
        html: `
          <div style="${swalTituloCssString}">
            Error en carga masiva
          </div>
          <div style="${swalTextoConMargenCssString}">
            No se pudieron cargar los productos al servidor.
          </div>
        `,
        confirmButtonText: 'ACEPTAR',
        confirmButtonColor: '#ff7300',
      });
    }
  };

  // Función para el botón MODIFICAR
  const handleModifyProduct = (sku: string) => {
    Swal.fire({
      html: `
        <div style="${swalTituloCssString}">
          ¡<b>Funcionalidad en Desarrollo</b>!
        </div>
        <div style="${swalTextoConMargenCssString}">
          Modificar producto con SKU: <b>${sku}</b><br>
          Esta funcionalidad estará disponible próximamente.
        </div>
      `,
      imageUrl: logo1Img.src,
      imageWidth: 400,
      imageHeight: 200,
      imageAlt: "Funcionalidad en Desarrollo",
      confirmButtonText: 'ACEPTAR',
      confirmButtonColor: '#ff7300',
    });
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
        // Actualizar la lista local removiendo el producto eliminado
        setLoadedProducts(prev => prev.filter(p => p.sku !== sku));
        
        Swal.fire({
          toast: true,
          position: 'top-end',
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
        console.error('Error al eliminar producto:', error);
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

  // Generar los botones de paginación
  const renderPaginationButtons = () => {
    const buttons = [];
    // Lógica para mostrar un rango limitado de botones de página si hay muchas páginas
    const maxButtonsToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtonsToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxButtonsToShow - 1); // Usa const

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

  // --- ANIMACIÓN PARA PAGINACIÓN FLOTANTE ---
  const [, setShowFloatingPagination] = useState(false);
  const [, setIsAtBottom] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // Detecta si el usuario está cerca del final de la página (por ejemplo, a 40px del fondo)
      if (windowHeight + scrollY >= docHeight - 40) {
        setIsAtBottom(true);
        setShowFloatingPagination(false);
      } else {
        setIsAtBottom(false);
        // Detecta dirección de scroll: si sube, muestra la paginación flotante; si baja, oculta
        if (scrollY < lastScrollY.current) {
          setShowFloatingPagination(true);
        } else if (scrollY > lastScrollY.current) {
          setShowFloatingPagination(false);
        }
      }
      lastScrollY.current = scrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Guardar los productos cargados en window para que el modal los pueda leer
  useEffect(() => {
    // @ts-expect-error: window.__LOADED_PRODUCTS__ es una variable global para comunicación con el modal
    window.__LOADED_PRODUCTS__ = loadedProducts;
  }, [loadedProducts]);

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

  // Función para verificar si hay filtros activos
  const hasActiveFilters = useMemo(() => {
    return activeFilters.categoria !== "" || activeFilters.estado !== "";
  }, [activeFilters]);

  // Función para limpiar filtros desde la barra de herramientas
  const handleClearFiltersFromToolbar = () => {
    setActiveFilters({ categoria: "", estado: "" });
    setCurrentPage(1);

    // Mostrar mensaje de éxito al limpiar filtros
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
    });
  };

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
        }}>Inventario de Productos ({sucursalNombre})</h1>
        
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
                placeholder="Buscar por SKU, Nombre..."
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
            }} onClick={() => setIsUploadModalOpen(true)}>
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
              <col style={{ width: isMobile ? "10%" : "8%" }} />
              <col style={{ width: isMobile ? "12%" : "10%" }} />
              <col style={{ width: isMobile ? "10%" : "8%" }} />
              <col style={{ width: isMobile ? "10%" : "8%" }} />
              <col style={{ width: isMobile ? "8%" : "7%" }} />
              <col style={{ width: isMobile ? "8%" : "7%" }} />
              <col style={{ width: isMobile ? "8%" : "7%" }} />
              <col style={{ width: isMobile ? "8%" : "7%" }} />
              <col style={{ width: isMobile ? "11%" : "9%" }} />
              <col style={{ width: isMobile ? "12%" : "10%" }} />
              <col style={{ width: isMobile ? "8%" : "6%" }} />
              <col style={{ width: isMobile ? "8%" : "6%" }} />
              <col style={{ width: isMobile ? "16%" : "14%" }} />
            </colgroup>
            <thead style={{ 
              position: "sticky", 
              top: 0, 
              zIndex: 2, 
              background: "#5C5C5C",
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
                  <td colSpan={13} style={{ ...tdStyle, textAlign: "center", padding: "2rem" }}>
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
              ) : error ? (
                <tr>
                  <td colSpan={13} style={{ ...tdStyle, textAlign: "center", padding: "2rem", color: "#d33" }}>
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
                    <td style={tdStyle}>${product.precioVentaCu}</td>
                    <td style={tdStyle}>
                      <span style={{
                        backgroundColor: product.estado ? '#10b981' : '#ef4444',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {product.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={tdStyle}>{product.stock}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", justifyContent: "center", gap: "5px" }}>
                        <button
                          style={{
                            ...modifyProductButtonStyle,
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            maxWidth: '60px'
                          }}
                          onClick={() => handleModifyProduct(product.sku)}
                        >
                          EDITAR
                        </button>
                        <button
                          style={{
                            ...modifyProductButtonStyle,
                            backgroundColor: '#ef4444',
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            maxWidth: '60px'
                          }}
                          onClick={() => handleDeleteProduct(product.sku)}
                        >
                          ELIMINAR
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={13} style={{ ...tdStyle, textAlign: 'center', color: '#888', padding: "2rem" }}>
                    No hay productos disponibles. Usa &quot;AGREGAR PRODUCTOS&quot; para cargar productos desde CSV o contacta al administrador.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {loadedProducts.length > 0 && (
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
                style={{ ...paginationButtonBaseStyle, ...paginationNextButtonStyle }}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      <UploadCsvModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadConfirm={handleConfirmBulkUpload}
      />

      <FiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
}

// =====================
// 6. ESTILOS DE COMPONENTES
// =====================

// Estilos para UploadCsvModal
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

const arrastraStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: '#555',
  textAlign: 'center' as const,
  marginBottom: '10px',
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
};

const fileInputContainerStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
  gap: '10px', padding: '20px', border: '2px dashed #ccc', borderRadius: '8px',
  cursor: 'pointer', backgroundColor: '#f9f9f9',
};

const fileInputStyle: React.CSSProperties = { display: 'none' };

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

const preVisualTextStyle: React.CSSProperties = {
  fontSize: '1.5rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 'semibold',
  color: '#333', marginBottom: '10px',
};

const previewTableStyle: React.CSSProperties = {
  width: '100%', borderCollapse: 'collapse' as const, marginTop: '20px',
};

const tableHeaderStyle: React.CSSProperties = {
  backgroundColor: '#f2f2f2', padding: '10px', borderBottom: '1px solid #ddd',
  textAlign: 'left' as const,
};

const tdModalStyle: React.CSSProperties = {
  padding: '10px', borderBottom: '1px solid #eee', textAlign: 'left' as const,
};

const confirmButtonStyle: React.CSSProperties = {
  backgroundColor: '#ff7300', color: 'white', padding: '12px 25px',
  borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '1.1em',
  marginTop: '20px', transition: 'background-color 0.2s ease',
};

const confirmButtonDisabledStyle: React.CSSProperties = {
  backgroundColor: '#cccccc', cursor: 'not-allowed',
};

const errorTextStyle: React.CSSProperties = {
  color: 'red', marginTop: '10px', fontSize: '0.9em',
};

const fileNameDisplayStyle: React.CSSProperties = {
  marginTop: '10px',
  fontSize: '1rem',
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
  color: '#555',
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