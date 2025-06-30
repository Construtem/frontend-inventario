"use client";

// =====================
// 1. IMPORTACIONES
// =====================
import React, { useRef, useState, useMemo, useEffect } from "react";
import Papa from 'papaparse';
// import Head from "next/head"; // <-- Eliminar Head, no se usa
import Swal from 'sweetalert2';
import Image from "next/image"; // Para reemplazar <img> por <Image />

// Importaciones de imágenes (considerando que están en @/styles/images)
import filtrosImg from "@/styles/images/filtros.png";
import agregarImg from "@/styles/images/agregar.png";
import logo1Img from "@/styles/images/logo1.png";
import buscarImg from "@/styles/images/buscar.png";

// =====================
// 2. INTERFACES
// =====================
interface ProductData {
  idProducto: number;
  sku: string;
  nombre: string;
  descripcion: string;
  pesoKg: number;
  largoCm: number;
  anchoCm: number;
  altoCm: number;
  costoBaseCu: number;
  precioVentaCu: number;
  activo: boolean;
  stock: number;
}

interface UploadCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadConfirm: (data: ProductData[]) => void;
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

// Función para parsear el campo "Activo"
function parseActivo(value: string): boolean | null {
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
            "ID Producto",
            "SKU",
            "Nombre",
            "Descripción",
            "Peso (KG)",
            "Largo (CM)",
            "Ancho (CM)",
            "Alto (CM)",
            "Costo base (C/U)",
            "Precio venta (C/U)",
            "Activo",
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

            const idProductoParsed = parseInt(row["ID Producto"], 10);
            const idProducto = isNaN(idProductoParsed) || idProductoParsed < 0 ? NaN : idProductoParsed;

            const sku = row["SKU"]?.toString().trim() || '';
            const nombre = row["Nombre"]?.toString().trim() || '';
            const descripcion = row["Descripción"]?.toString().trim() || '';
            const pesoKg = parseFloat(row["Peso (KG)"]);
            const largoCm = parseFloat(row["Largo (CM)"]);
            const anchoCm = parseFloat(row["Ancho (CM)"]);
            const altoCm = parseFloat(row["Alto (CM)"]);
            const costoBaseCu = parseFloat(row["Costo base (C/U)"]);
            const precioVentaCu = parseFloat(row["Precio venta (C/U)"]);

            const activoParsed = parseActivo(row["Activo"]);
            const activo = activoParsed === null ? null : activoParsed;

            const stock = parseInt(row["Stock"], 10);

            if (isNaN(idProducto)) rowErrors.push('ID Producto debe ser un número positivo');
            if (!sku) rowErrors.push('SKU no puede estar vacío');
            if (!nombre) rowErrors.push('Nombre no puede estar vacío');

            if (isNaN(pesoKg) || pesoKg < 0) rowErrors.push('Peso (KG) debe ser un número positivo');
            if (isNaN(largoCm) || largoCm < 0) rowErrors.push('Largo (CM) debe ser un número positivo');
            if (isNaN(anchoCm) || anchoCm < 0) rowErrors.push('Ancho (CM) debe ser un número positivo');
            if (isNaN(altoCm) || altoCm < 0) rowErrors.push('Alto (CM) debe ser un número positivo');

            if (isNaN(costoBaseCu) || costoBaseCu < 0) rowErrors.push('Costo base (C/U) debe ser un número positivo');
            if (isNaN(precioVentaCu) || precioVentaCu < 0) rowErrors.push('Precio venta (C/U) debe ser un número positivo');

            if (activo === null) rowErrors.push('Activo debe ser "Activo" o "Inactivo"');

            if (isNaN(stock) || stock < 0) rowErrors.push('Stock debe ser un número entero positivo');

            if (rowErrors.length > 0) {
              allRowErrors.push(`Fila ${index + 2}: ${rowErrors.join(', ')}`);
              hasRowErrors = true;
            } else {
              validatedData.push({
                idProducto: idProducto as number,
                sku,
                nombre,
                descripcion,
                pesoKg,
                largoCm,
                anchoCm,
                altoCm,
                costoBaseCu,
                precioVentaCu,
                activo: activo as boolean,
                stock
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
      const existingIds = new Set<number>(loadedProducts.map(p => p.idProducto));

      const skuCount: Record<string, number> = {};
      const idCount: Record<number, number> = {};
      parsedData.forEach(prod => {
        skuCount[prod.sku] = (skuCount[prod.sku] || 0) + 1;
        idCount[prod.idProducto] = (idCount[prod.idProducto] || 0) + 1;
      });
      const duplicatedSkus = Object.keys(skuCount).filter(sku => skuCount[sku] > 1);
      const duplicatedIds = Object.keys(idCount).filter(id => idCount[Number(id)] > 1);

      // Duplicados respecto a los productos ya cargados
      const duplicatedSkusGlobal = parsedData
        .map(p => p.sku)
        .filter((sku, idx, arr) => existingSkus.has(sku) && arr.indexOf(sku) === idx);
      const duplicatedIdsGlobal = parsedData
        .map(p => p.idProducto)
        .filter((id, idx, arr) => existingIds.has(id) && arr.indexOf(id) === idx);

      
      if (
        duplicatedIds.length > 0 || duplicatedIdsGlobal.length > 0 ||
        duplicatedSkus.length > 0 || duplicatedSkusGlobal.length > 0
      ) {
        let idMsg: string | null = null;
        let skuMsg: string | null = null;
        if (duplicatedIds.length > 0 || duplicatedIdsGlobal.length > 0) {
          let msg = "No se puede cargar el archivo porque existen productos con ";
          const parts: string[] = [];
          if (duplicatedIds.length > 0) parts.push(`<b>ID Producto</b> repetido en el archivo: ${duplicatedIds.join(", ")}`);
          if (duplicatedIdsGlobal.length > 0) parts.push(`<b>ID Producto</b> ya existente: ${duplicatedIdsGlobal.join(", ")}`);
          msg += parts.join(" | ");
          idMsg = msg;
        }
        if (duplicatedSkus.length > 0 || duplicatedSkusGlobal.length > 0) {
          let msg = "No se puede cargar el archivo porque existen productos con ";
          const parts: string[] = [];
          if (duplicatedSkus.length > 0) parts.push(`<b>SKU</b> repetido en el archivo: ${duplicatedSkus.join(", ")}`);
          if (duplicatedSkusGlobal.length > 0) parts.push(`<b>SKU</b> ya existente: ${duplicatedSkusGlobal.join(", ")}`);
          msg += parts.join(" | ");
          skuMsg = msg;
        }

        if (idMsg && skuMsg) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            html: `
              <div style="${swalTextoCssString}">
                ${idMsg}
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
        } else if (idMsg) {
          setPendingDuplicateError(idMsg);
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
                      <td style={tdModalStyle}>{product.idProducto}</td>
                      <td style={tdModalStyle}>{product.sku}</td>
                      <td style={tdModalStyle}>{product.nombre}</td>
                      <td style={tdModalStyle}>{product.descripcion}</td>
                      <td style={tdModalStyle}>{product.pesoKg}</td>
                      <td style={tdModalStyle}>{product.largoCm}</td>
                      <td style={tdModalStyle}>{product.anchoCm}</td>
                      <td style={tdModalStyle}>{product.altoCm}</td>
                      <td style={tdModalStyle}>{product.costoBaseCu}</td>
                      <td style={tdModalStyle}>{product.precioVentaCu}</td>
                      <td style={tdModalStyle}>{product.activo ? 'Activo' : 'Inactivo'}</td>
                      <td style={tdModalStyle}>{product.stock}</td>
                      <td style={tdModalStyle}>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                          <button
                            style={modifyProductButtonStyle}
                            onClick={() => {
                              Swal.fire({
                                html: `
                                  <div style="${swalTituloCssString}">
                                    ¡<b>Funcionalidad en Desarrollo</b>!
                                  </div>
                                  <div style="${swalTextoConMargenCssString}">
                                    La opción de modificar productos estará disponible próximamente.
                                  </div>
                                `,
                                imageUrl: logo1Img.src,
                                imageWidth: 400,
                                imageHeight: 200,
                                imageAlt: "Funcionalidad en Desarrollo",
                                confirmButtonText: 'ACEPTAR',
                                confirmButtonColor: '#ff7300',
                              });
                            }}
                          >
                            MODIFICAR
                          </button>
                        </div>
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

export default function Sucursal1Page() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [loadedProducts, setLoadedProducts] = useState<ProductData[]>([]);

  // --- ESTADOS DE PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // 10 resultados por página

  // Calcular los datos a mostrar en la página current
  const currentTableData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return loadedProducts.slice(startIndex, endIndex);
  }, [loadedProducts, currentPage, itemsPerPage]);

  // Calcular el número total de páginas
  const totalPages = useMemo(() => {
    return Math.ceil(loadedProducts.length / itemsPerPage);
  }, [loadedProducts, itemsPerPage]);

  const handleConfirmBulkUpload = (data: ProductData[]) => {
    console.log("Datos para cargar masivamente (simulado):", data);
    setLoadedProducts(data);
    setCurrentPage(1); // Reset a la primera página cuando se cargan nuevos datos
    // La alerta de éxito ahora se maneja dentro de handleUploadConfirm en el modal
  };

  // Función para el botón MODIFICAR
  const handleModifyProduct = () => {
    Swal.fire({
      html: `
        <div style="${swalTituloCssString}">
          ¡<b>Funcionalidad en Desarrollo</b>!
        </div>
        <div style="${swalTextoConMargenCssString}">
          La opción de modificar productos estará disponible próximamente.
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

    // Función para el botón FILTROS
  const handleFiltersProduct = () => {
    Swal.fire({
      html: `
        <div style="${swalTituloCssString}">
          ¡<b>Funcionalidad en Desarrollo</b>!
        </div>
        <div style="${swalTextoConMargenCssString}">
          La opción de filtrado de productos estará disponible próximamente.
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
  const [showFloatingPagination, setShowFloatingPagination] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
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

  return (
    <>
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>Inventario de Productos (Sucursal 2)</h1>
          <div style={toolbarStyle}>
            <div style={leftControlsGroupStyle}>
              <div style={searchContainerStyle}>
                <input
                  type="text"
                  placeholder="Buscar por ID Producto, SKU, Nombre..."
                  style={inputStyle}
                />
                <button style={lupaButtonStyle}>
                <Image
                  src={buscarImg.src}
                  alt="Buscar"
                  width={40}
                  height={40}
                  style={searchIconStyle}
                />
                </button>
              </div>
              <button
                style={filterButtonStyle}
                onClick={handleFiltersProduct}
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
            <div style={rightControlsWrapperStyle}>
              <div style={columnButtonsStyle}>
                <button
                  style={editButtonStyle}
                  onClick={() => setIsUploadModalOpen(true)}
                >
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
          </div>
          <div style={{ overflowX: "auto", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ width: "100%", maxHeight: "none", overflowY: "visible" }}>
              <table
                style={{
                  ...tableStyle,
                  tableLayout: "fixed",
                  width: "100%",
                  minWidth: "0",
                  maxWidth: "100%",
                }}
              >
                <colgroup>
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "14%" }} />
                </colgroup>
                <thead style={{ position: "sticky", top: 0, zIndex: 2, background: "#5C5C5C" }}>
                  <tr>
                    {[
                      "ID Producto",
                      "SKU",
                      "Nombre",
                      "Descripción",
                      "Peso (KG)",
                      "Largo (CM)",
                      "Ancho (CM)",
                      "Alto (CM)",
                      "Costo base (C/U)",
                      "Precio venta (C/U)",
                      "Activo",
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
                  {currentTableData.length > 0 ? (
                    currentTableData.map((product) => (
                      <tr key={product.idProducto}>
                        <td style={tdStyle}>{product.idProducto}</td>
                        <td style={tdStyle}>{product.sku}</td>
                        <td style={tdStyle}>{product.nombre}</td>
                        <td style={tdStyle}>{product.descripcion}</td>
                        <td style={tdStyle}>{product.pesoKg}</td>
                        <td style={tdStyle}>{product.largoCm}</td>
                        <td style={tdStyle}>{product.anchoCm}</td>
                        <td style={tdStyle}>{product.altoCm}</td>
                        <td style={tdStyle}>{product.costoBaseCu}</td>
                        <td style={tdStyle}>{product.precioVentaCu}</td>
                        <td style={tdStyle}>{product.activo ? 'Activo' : 'Inactivo'}</td>
                        <td style={tdStyle}>{product.stock}</td>
                        <td style={tdStyle}>
                          <div style={{ display: "flex", justifyContent: "center" }}>
                            <button
                              style={modifyProductButtonStyle}
                              onClick={handleModifyProduct} 
                            >
                              MODIFICAR
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={13} style={{ ...tdStyle, textAlign: 'center', color: '#888' }}>
                        No hay productos cargados. Por favor, carga un CSV.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- CONTROLES DE PAGINACIÓN --- */}
        </div>
        {/* Floating pagination: aparece al hacer scroll arriba, desaparece al bajar */}
        {loadedProducts.length > 0 && (
          <div
            style={{
              ...paginationContainerStyle,
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 100,
              margin: "0 auto",
              maxWidth: '1000px',
              opacity: showFloatingPagination && !isAtBottom ? 1 : 0,
              pointerEvents: showFloatingPagination && !isAtBottom ? "auto" : "none",
              transform: showFloatingPagination && !isAtBottom ? "translateY(0)" : "translateY(60px)",
              filter: showFloatingPagination && !isAtBottom ? "blur(0)" : "blur(8px)",
              transition:
                "opacity 0.45s cubic-bezier(.4,0,.2,1), " +
                "transform 0.55s cubic-bezier(.4,0,.2,1), " +
                "filter 0.45s cubic-bezier(.4,0,.2,1)",
              willChange: "opacity, transform, filter",
            }}
          >
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
        )}

        {loadedProducts.length > 0 && (
          <div
            style={{
              ...paginationContainerStyle,
              margin: "40px auto 0 auto",
              maxWidth: '1000px',
              position: isAtBottom ? "relative" : "absolute",
              left: "unset",
              right: "unset",
              bottom: "unset",
              zIndex: 10,
              opacity: isAtBottom ? 1 : 0,
              pointerEvents: isAtBottom ? "auto" : "none",
              transform: isAtBottom ? "translateY(0)" : "translateY(60px)",
              filter: isAtBottom ? "blur(0)" : "blur(8px)",
              transition:
                "opacity 0.45s cubic-bezier(.4,0,.2,1), " +
                "transform 0.55s cubic-bezier(.4,0,.2,1), " +
                "filter 0.45s cubic-bezier(.4,0,.2,1)",
              willChange: "opacity, transform, filter",
            }}
          >
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
        )}
        <UploadCsvModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUploadConfirm={handleConfirmBulkUpload}
        />
      </div>
    </>
  );
}

// =====================
// 6. ESTILOS DE COMPONENTES
// =====================

// Estilos para UploadCsvModal
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '30px',
  borderRadius: '10px',
  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
  width: '90%',
  maxWidth: '800px',
  maxHeight: '90%',
  overflowY: 'auto' as const,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '20px',
};

const modalHeaderStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px',
};

const modalTitleStyle: React.CSSProperties = {
  fontSize: '2rem',
  fontFamily: 'Montserrat, sans-serif',
  fontWeight: 'bold',
  color: '#333',
  margin: 0
};

const arrastraStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: '#555',
  textAlign: 'center' as const,
  marginBottom: '10px',
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
};

const closeButtonStyle: React.CSSProperties = {
  backgroundColor: 'transparent', border: 'none', fontSize: '1.8em',
  cursor: 'pointer', color: '#aaa',
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
const leftControlsGroupStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  gap: "1rem",
  flexWrap: "wrap",
};

const containerStyle: React.CSSProperties = {
  marginTop: "70px",
  padding: "2rem",
  boxSizing: "border-box",
  minHeight: "calc(100vh - 70px)",
  backgroundColor: "#f3f4f6",
  borderRadius: "20px",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "white", borderRadius: "12px", padding: "2rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const titleStyle: React.CSSProperties = {
  color: "rgb(34, 34, 34)", fontSize: "2rem", fontWeight: "bold",
  marginBottom: "2rem", fontFamily: "Montserrat, sans-serif",
};

const toolbarStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "1rem",
  flexWrap: "wrap",
  gap: "1rem",
  alignItems: "flex-end",
};

const searchContainerStyle: React.CSSProperties = {
  position: 'relative',
  width: '700px',
  maxWidth: '100%',
  minWidth: '350px',
  flex: '0 1 auto',
  height: '40px',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
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
  fontWeight:400,
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

const rightControlsWrapperStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  gap: "1rem",
};

const columnButtonsStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
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

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "900px",
  border: "none",
  backgroundColor: "#fff",
  boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
  borderRadius: "12px",
  overflow: "hidden",
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
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '10px',
  flexWrap: 'wrap',
  borderRadius: '12px',
  paddingTop: '16px',
  paddingBottom: '16px',
  paddingLeft: '0',
  paddingRight: '0',
  backgroundColor: "#f7f7f7",
  position: "relative",
  boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
  width: "100%",
};

const paginationButtonBaseStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderTop: '1px solid #ddd',
  borderRight: '1px solid #ddd',
  borderBottom: '1px solid #ddd',
  borderLeft: '1px solid #ddd',
  borderRadius: '5px',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease, border-color 0.2s ease',
  minWidth: '35px',
  textAlign: 'center',
  color: '#333',
};

const paginationDotsStyle: React.CSSProperties = {
  padding: '8px 0',
  color: '#555',
  justifyContent: 'center',
};

const paginationButtonActiveStyle: React.CSSProperties = {
  backgroundColor: '#ff7300',
  color: 'white',
  borderTop: '1px solid #ff7300',
  borderRight: '1px solid #ff7300',
  borderBottom: '1px solid #ff7300',
  borderLeft: '1px solid #ff7300',
};

const paginationNextButtonStyle: React.CSSProperties = {
  marginRight: '16px',
  justifyContent:'center',
};

const paginationButtonsWrapperStyle: React.CSSProperties = {
  display: 'flex',
  gap: '5px',
  flexWrap: 'wrap',
  justifyContent: 'center',
};