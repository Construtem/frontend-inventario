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
  tipo?: string;
  tipo_id?: number; 
}



const validatePhoneInput = (value: string): { isValid: boolean; message: string } => {
  const validChars = /^[0-9\s\-+]*$/;

  if (!validChars.test(value)) {
    return {
      isValid: false,
      message: 'Solo se permiten números, espacios, guiones (-) y el símbolo +'
    };
  }

  return { isValid: true, message: '' };
};



const formatPhoneChileno = (numero: string): string => {
  if (!numero) return '';

  // Eliminar caracteres no numéricos
  let clean = numero.replace(/\D/g, '');

  // Limitar a 9 dígitos
  clean = clean.slice(0, 9);

  // Formatear como +56 9 XXXX XXXX
  let formateado = '+56 9 ';
  if (clean.length > 4) {
    formateado += clean.slice(0, 4) + ' ' + clean.slice(4);
  } else {
    formateado += clean;
  }

  return formateado;
};


const maxPorTipo = 3;
const totalBodegas = 3; // Cambia por el conteo real
const totalSucursales = 3; // Cambia por el conteo real

const CIUDADES = ['Santiago'];

const COMUNAS_POR_CIUDAD: { [key: string]: string[] } = {
  Santiago: [
    'Alhué',
    'Buin',
    'Calera de Tango',
    'Cerrillos',
    'Cerro Navia',
    'Colina',
    'Conchalí',
    'Curacaví',
    'El Bosque',
    'El Monte',
    'Estación Central',
    'Huechuraba',
    'Independencia',
    'Isla de Maipo',
    'La Cisterna',
    'La Florida',
    'La Granja',
    'La Pintana',
    'La Reina',
    'Lampa',
    'Las Condes',
    'Lo Barnechea',
    'Lo Espejo',
    'Lo Prado',
    'Macul',
    'Maipú',
    'María Pinto',
    'Melipilla',
    'Ñuñoa',
    'Padre Hurtado',
    'Paine',
    'Pedro Aguirre Cerda',
    'Peñaflor',
    'Peñalolén',
    'Pirque',
    'Providencia',
    'Pudahuel',
    'Puente Alto',
    'Quilicura',
    'Quinta Normal',
    'Recoleta',
    'Renca',
    'San Bernardo',
    'San Joaquín',
    'San José de Maipo',
    'San Miguel',
    'San Pedro',
    'San Ramón',
    'Santiago',
    'Talagante',
    'Tiltil',
    'Vitacura'
  ]
};

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
  return [...data].sort((a, b) => a.id - b.id);
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

  const apiInventarioUrl = process.env.NEXT_PUBLIC_API_INVENTARIO || 'https://api-inventario.tssw.cl';

  // =====================
// 2. FUNCIONES DE VALIDACIÓN
// =====================

// Función para validar nombre y dirección (sin caracteres especiales)
const validateTextInput = (value: string): { isValid: boolean; message: string } => {
  // Caracteres prohibidos: ; % $ @ # & * ( ) [ ] { } | \ / ? < > " ' ` ~ ! ^ = 
  const forbiddenChars = /[;%$@#&*()[\]{}|\\/?<>"'`~!^=]/;
  
  if (forbiddenChars.test(value)) {
    const foundChars = value.match(forbiddenChars);
    return {
      isValid: false,
      message: `Caracteres no permitidos encontrados: ${foundChars?.join(', ')}`
    };
  }
  
  return { isValid: true, message: '' };
};

// Función para validar teléfono (solo números, espacios, guiones y +)
const validatePhoneInput = (value: string): { isValid: boolean; message: string } => {
  // Solo permitir números, espacios, guiones y el símbolo +
  const validChars = /^[0-9\s\-+]*$/;
  
  if (!validChars.test(value)) {
    return {
      isValid: false,
      message: 'Solo se permiten números, espacios, guiones (-) y el símbolo +'
    };
  }
  
  return { isValid: true, message: '' };
};

// Función para filtrar caracteres en tiempo real
const filterTextInput = (value: string): string => {
  // Remover caracteres prohibidos automáticamente
  return value.replace(/[;%$@#&*()[\]{}|\\/?<>"'`~!^=]/g, '');
};

// Función para filtrar teléfono en tiempo real
const filterPhoneInput = (value: string): string => {
  // Solo mantener números, espacios, guiones y +
  return value.replace(/[^0-9\s\-+]/g, '');
};

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
        

        
        // Timeout manual con AbortController
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
        
        const response = await fetch(`${apiInventarioUrl}/api/sucursales`, {
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

        
        // Validar que los datos tengan la estructura esperada
        if (Array.isArray(data)) {
          setSucursalesData(sortSucursales(data)); // Apply sorting here
        } else {

          setSucursalesData([]);
        }
        
      } catch (err) {

        
        let errorMessage = "Error desconocido al cargar datos";
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            errorMessage = 'Tiempo de espera agotado al conectar con el servidor';
          } else if (err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
            errorMessage = '•No se pudo conectar al servidor.\n• Verifique su conexión a internet o contacte al administrador del sistema.';
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
  }, [apiInventarioUrl]);


  // Función para reintentar la carga de datos
  const retryFetch = () => {
    setError(null);
    setLoading(true);
    
    const fetchSucursales = async () => {
      try {
        setLoading(true);
        setError(null);
        

        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${apiInventarioUrl}/api/sucursales`, {
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

        
        if (Array.isArray(data)) {
          setSucursalesData(sortSucursales(data)); // Apply sorting here
        } else {
          setSucursalesData([]);
        }
        
      } catch (err) {
        
        let errorMessage = "Error desconocido al cargar datos";
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            errorMessage = 'Tiempo de espera agotado al conectar con el servidor';
          } else if (err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
            errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión a internet o contacte al administrador del sistema.';
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

  // Modificar la función de filtrado para usar el campo tipo en lugar del nombre
  const filteredData = useMemo(() => {
    return sortSucursales(sucursalesData.filter(sucursal => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = sucursal.nombre.toLowerCase().includes(searchLower);

      const matchesCiudad = selectedCiudad ? sucursal.ciudad === selectedCiudad : true;
      const matchesComuna = selectedComuna ? sucursal.comuna === selectedComuna : true;
      
      let matchesTipo = true;
      if (selectedTipo) {
        const tipoValue = sucursal.tipo_id || sucursal.tipo;
        if (selectedTipo === 'bodega') {
          matchesTipo = tipoValue === 1 || tipoValue === '1' || 
                       sucursal.nombre?.toLowerCase()?.includes('bodega');
        } else if (selectedTipo === 'sucursal') {
          matchesTipo = tipoValue === 2 || tipoValue === '2' || 
                       !sucursal.nombre?.toLowerCase()?.includes('bodega');
        }
      }

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
        html: `
          <div style="${swalTituloCssString}">
            ¡<b>Sin filtros</b>!
          </div>
          <div style="${swalTextoConMargenCssString}">
            No has seleccionado ningún filtro
          </div>
        `,
        icon: 'info',
        confirmButtonColor: '#ff7300',
        timer: 5000,
        timerProgressBar: true,
        showCloseButton: true
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
      html: `
        <div style="${swalTituloCssString}">
          ¡<b>Filtros aplicados</b>!
        </div>
        <div style="${swalTextoConMargenCssString}">
          ${tempCiudad ? `<p>Ciudad: ${tempCiudad}</p>` : ''}
          ${tempComuna ? `<p>Comuna: ${tempComuna}</p>` : ''}
          ${tempTipo ? `<p>Tipo: ${tempTipo}</p>` : ''}
        </div>
      `,
      icon: 'success',
      confirmButtonColor: '#ff7300',
      timer: 5000,
      timerProgressBar: true,
      showCloseButton: true
    });
  };

  // Estados para el modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<Sucursal | null>(null);

  // Estados para el modal de agregar
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    ciudad: '',
    comuna: '',
    tipo: '2' // valor por defecto (2 = Sucursal)
  });

  // Agregar función para manejar la edición - eliminar lógica de determinación de tipo
  const handleEdit = (sucursal: Sucursal) => {
    setEditFormData(sucursal);
    setShowEditModal(true);
  };

  // Modificar handleSaveChanges para incluir tipo_id
  const handleSaveChanges = async () => {
    if (!editFormData) return;

    try {
      const dataToSend = {
        nombre: editFormData.nombre,
        direccion: editFormData.direccion,
        telefono: editFormData.telefono,
        ciudad: editFormData.ciudad,
        comuna: editFormData.comuna,
        tipo_id: parseInt(editFormData.tipo || '2') // Asegurar que se envíe tipo_id
      };



      const response = await fetch(`${apiInventarioUrl}/api/sucursales/${editFormData.id}`, {
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

      const updatedSucursal = await response.json();

      // Update and sort the data
      setSucursalesData(prevData => 
        sortSucursales(prevData.map(item => 
          item.id === editFormData.id ? updatedSucursal : item
        ))
      );

      setShowEditModal(false);
      Swal.fire({
        html: `
          <div style="${swalTituloCssString}">
            ¡<b>Éxito</b>!
          </div>
          <div style="${swalTextoConMargenCssString}">
            Sucursal actualizada correctamente
          </div>
        `,
        icon: 'success',
        confirmButtonColor: '#ff7300',
        timer: 5000,
        timerProgressBar: true,
        showCloseButton: true
      });
    } catch (err) {

      Swal.fire({
        html: `
          <div style="${swalTituloCssString}">
            ¡<b>Error</b>!
          </div>
          <div style="${swalTextoConMargenCssString}">
            No se pudo actualizar la sucursal: ${err instanceof Error ? err.message : 'Error desconocido'}
          </div>
        `,
        icon: 'error',
        confirmButtonColor: '#ff7300',
        timer: 5000,
        timerProgressBar: true,
        showCloseButton: true
      });
    }
  };

  // También modificar handleSaveNewSucursal para usar el mismo formato
  const handleSaveNewSucursal = async () => {
    const { sucursales, bodegas } = countByType;
    
    // Validar límites antes de crear
    if (addFormData.tipo === '2' && sucursales >= 3) {
      Swal.fire({
        html: `
          <div style="${swalTituloCssString}">
            ¡<b>Límite alcanzado</b>!
          </div>
          <div style="${swalTextoConMargenCssString}">
            Ya tienes el máximo de 3 sucursales permitidas.
          </div>
        `,
        icon: 'warning',
        confirmButtonColor: '#ff7300',
        timer: 5000,
        timerProgressBar: true,
        showCloseButton: true
      });
      return;
    }
    
    if (addFormData.tipo === '1' && bodegas >= 3) {
      Swal.fire({
        html: `
          <div style="${swalTituloCssString}">
            ¡<b>Límite alcanzado</b>!
          </div>
          <div style="${swalTextoConMargenCssString}">
            Ya tienes el máximo de 3 bodegas permitidas.
          </div>
        `,
        icon: 'warning',
        confirmButtonColor: '#ff7300',
        timer: 5000,
        timerProgressBar: true,
        showCloseButton: true
      });
      return;
    }

    // Validaciones
    if (!addFormData.nombre.trim()) {
      Swal.fire({
        html: `
          <div style="${swalTituloCssString}">
            ¡<b>Error</b>!
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

    if (!addFormData.direccion.trim()) {
      Swal.fire({
        html: `
          <div style="${swalTituloCssString}">
            ¡<b>Error</b>!
          </div>
          <div style="${swalTextoConMargenCssString}">
            La dirección es requerida
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

    if (!addFormData.telefono.trim()) {
      Swal.fire({
        html: `
          <div style="${swalTituloCssString}">
            ¡<b>Error</b>!
          </div>
          <div style="${swalTextoConMargenCssString}">
            El teléfono es requerido
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

    if (!addFormData.ciudad) {
      Swal.fire({
        html: `
          <div style="${swalTituloCssString}">
            ¡<b>Error</b>!
          </div>
          <div style="${swalTextoConMargenCssString}">
            La ciudad es requerida
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

    if (!addFormData.comuna) {
      Swal.fire({
        html: `
          <div style="${swalTituloCssString}">
            ¡<b>Error</b>!
          </div>
          <div style="${swalTextoConMargenCssString}">
            La comuna es requerida
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

    try {
      // Preparar los datos para enviar con tipo_id
      const dataToSend = {
        nombre: addFormData.tipo === '1' 
          ? `Bodega ${addFormData.nombre}` 
          : addFormData.nombre,
        direccion: addFormData.direccion,
        telefono: addFormData.telefono,
        ciudad: addFormData.ciudad,
        comuna: addFormData.comuna,
        tipo_id: parseInt(addFormData.tipo) // Incluir tipo_id
      };



      const response = await fetch(`${apiInventarioUrl}/api/sucursales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(`Error al crear la sucursal: ${response.status} - ${errorText}`);
      }

      const nuevaSucursal = await response.json();

      // Actualizar el estado agregando la nueva sucursal y ordenando
      setSucursalesData(prevData => sortSucursales([...prevData, nuevaSucursal]));

      setShowAddModal(false);
      Swal.fire({
        html: `
          <div style="${swalTituloCssString}">
            ¡<b>Éxito</b>!
          </div>
          <div style="${swalTextoConMargenCssString}">
            Sucursal creada correctamente
          </div>
        `,
        icon: 'success',
        confirmButtonColor: '#ff7300',
        timer: 5000,
        timerProgressBar: true,
        showCloseButton: true
      });
    } catch (err) {

      Swal.fire({
        html: `
          <div style="${swalTituloCssString}">
            ¡<b>Error</b>!
          </div>
          <div style="${swalTextoConMargenCssString}">
            No se pudo crear la sucursal: ${err instanceof Error ? err.message : 'Error desconocido'}
          </div>
        `,
        icon: 'error',
        confirmButtonColor: '#ff7300',
        timer: 5000,
        timerProgressBar: true,
        showCloseButton: true
      });
    }
  };

  // Función para contar sucursales y bodegas - corregir lógica
  const countByType = useMemo(() => {
    const sucursales = sucursalesData.filter(item => {
      // Verificar tanto tipo como tipo_id y también el nombre como fallback
      const tipoValue = item.tipo_id || item.tipo;
      return tipoValue === 2 || tipoValue === '2' || 
             (!item.nombre?.toLowerCase()?.includes('bodega') && !tipoValue);
    }).length;
    
    const bodegas = sucursalesData.filter(item => {
      // Verificar tanto tipo como tipo_id y también el nombre como fallback
      const tipoValue = item.tipo_id || item.tipo;
      return tipoValue === 1 || tipoValue === '1' || 
             (item.nombre?.toLowerCase()?.includes('bodega') && !tipoValue);
    }).length;
    

    
    return { sucursales, bodegas };
  }, [sucursalesData]);

  const handleDelete = (sucursal: Sucursal) => {
  const tipoValue = sucursal.tipo_id || sucursal.tipo;
  const tipo = (tipoValue === 1 || tipoValue === '1' ||
    sucursal.nombre?.toLowerCase()?.includes('bodega')) ? 'bodega' : 'sucursal';

  Swal.fire({

    html: `
      <div style="${swalTituloCssString}">
        ¡<b>ATENCIÓN: Eliminación Permanente</b>!
      </div>
      <div style="${swalTextoConMargenCssString}">
        ¿Estás seguro de eliminar la ${tipo} <b>${sucursal.nombre}</b>?
      </div>
      <div style="${swalTextoConMargenCssString}">
        Esta acción eliminará permanentemente la ${tipo} y todos sus productos asociados.
      </div>
    `,
    icon: 'error',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'SÍ, ELIMINAR PERMANENTEMENTE',
    cancelButtonText: 'No, cancelar',
    reverseButtons: true,
    focusCancel: true,
    showCloseButton: true
  }).then(async (finalResult) => {
    if (finalResult.isConfirmed) {
      try {
        const response = await fetch(`${apiInventarioUrl}/api/sucursales/${sucursal.id}`, {
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
          icon: 'success',
          confirmButtonColor: '#ff7300',
          timer: 5000,
          timerProgressBar: true,
          showCloseButton: true
        });
      } catch (err) {
        Swal.fire({
          title: 'Error',
          html: `
            <div style="${swalTituloCssString}">
              ¡<b>Error</b>!
            </div>
            <div style="${swalTextoConMargenCssString}">
              No se pudo eliminar la ${tipo}
            </div>
          `,
          icon: 'error',
          confirmButtonColor: '#ff7300',
          timer: 5000,
          timerProgressBar: true,
          showCloseButton: true
        });
      }
    }
  });
};

  // Función para manejar agregar sucursal
  const handleAddSucursal = () => {
    const { sucursales, bodegas } = countByType;
    
    // Verificar si se puede agregar algo
    if (sucursales >= 3 && bodegas >= 3) {
      Swal.fire({
        html: `
          <div style="${swalTituloCssString}">
            ¡<b>Límite alcanzado</b>!
          </div>
          <div style="${swalTextoConMargenCssString}">
            Ya tienes el máximo permitido de 3 sucursales y 3 bodegas.
          </div>
        `,
        icon: 'warning',
        confirmButtonColor: '#ff7300',
        timer: 5000,
        timerProgressBar: true,
        showCloseButton: true
      });
      return;
    }

    // Determinar qué tipos están disponibles
    const tiposDisponibles = [];
    if (sucursales < 3) tiposDisponibles.push('2');
    if (bodegas < 3) tiposDisponibles.push('1');

    // Si solo hay un tipo disponible, preseleccionarlo
    const tipoInicial = tiposDisponibles.length === 1 ? tiposDisponibles[0] : '2';

    // Resetear el formulario
    setAddFormData({
      nombre: '',
      direccion: '',
      telefono: '',
      ciudad: '',
      comuna: '',
      tipo: tipoInicial
    });
    setShowAddModal(true);
  };

  // Agregar función para limpiar filtros desde la barra de herramientas
  const handleClearFiltersFromToolbar = () => {
    setSelectedCiudad('');
    setSelectedComuna('');
    setSelectedTipo('');
    setTempCiudad('');
    setTempComuna('');
    setTempTipo('');
    setCurrentPage(1);
    Swal.fire({
      html: `
        <div style="${swalTituloCssString}">
          ¡<b>Filtros reiniciados</b>!
        </div>
        <div style="${swalTextoConMargenCssString}">
          Se han eliminado todos los filtros
        </div>
      `,
      icon: 'info',
      confirmButtonColor: '#ff7300',
      timer: 5000,
      timerProgressBar: true,
      showCloseButton: true
    });
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = Boolean(selectedCiudad || selectedComuna || selectedTipo);

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
                maxLength={70}
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
              onClick={handleAddSucursal}
              disabled={countByType.sucursales >= 3 && countByType.bodegas >= 3}
              style={{
                ...editButtonStyle,
                width: isMobile ? "100%" : "auto",
                fontSize: isMobile ? "0.875rem" : "1rem",
                padding: isMobile ? "0.75rem" : "0.5rem 1.2rem",
                opacity: (countByType.sucursales >= 3 && countByType.bodegas >= 3) ? 0.5 : 1,
                cursor: (countByType.sucursales >= 3 && countByType.bodegas >= 3) ? 'not-allowed' : 'pointer'
              }}
              title={
                countByType.sucursales >= 3 && countByType.bodegas >= 3 
                  ? 'Límite máximo alcanzado (3 sucursales y 3 bodegas)'
                  : countByType.sucursales >= 3 
                    ? `Solo puedes agregar ${3 - countByType.bodegas} bodega(s) más`
                    : countByType.bodegas >= 3
                      ? `Solo puedes agregar ${3 - countByType.sucursales} sucursal(es) más`
                      : `Puedes agregar ${3 - countByType.sucursales} sucursal(es) y ${3 - countByType.bodegas} bodega(s) más`
              }
            >
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
                Conectando con el servidor...
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
                <div style={{ fontWeight: 'bold', marginBottom: '1rem', fontFamily: 'Montserrat, sans-serif', fontSize: '1.5rem' }}>Error al cargar las sucursales</div>
                <div style={{ 
                  fontSize: '1rem', 
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
                      <td style={tdStyle}>{sucursal.id}</td>
                      <td style={tdStyle}>{sucursal.nombre}</td>
                      <td style={tdStyle}>{sucursal.direccion}</td>
                      <td style={tdStyle}>{sucursal.telefono}</td>
                      <td style={tdStyle}>{sucursal.comuna || 'N/A'}</td>
                      <td style={tdStyle}>{sucursal.ciudad || 'N/A'}</td>
                      <td style={tdStyle}>
                        <span style={{
                          backgroundColor: (() => {
                            const tipoValue = sucursal.tipo_id || sucursal.tipo;
                            return (tipoValue === 1 || tipoValue === '1' || 
                                   sucursal.nombre?.toLowerCase()?.includes('bodega')) ? '#10b981' : '#3b82f6';
                          })(),
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 'semibold'
                        }}>
                          {(() => {
                            const tipoValue = sucursal.tipo_id || sucursal.tipo;
                            return (tipoValue === 1 || tipoValue === '1' || 
                                   sucursal.nombre?.toLowerCase()?.includes('bodega')) ? 'Bodega' : 'Sucursal';
                          })()}
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

      </div>



      {filteredData.length > 0 && (
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

      {/* Modal de Filtros */}
      {showFilterModal && (
        <div style={modalOverlayStyle}>
          <div style={{...modalContentStyle, padding: '2rem'}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <h2 style={{...modalTitleStyle, margin: 0}}>Filtros</h2>
              <button 
                onClick={() => setShowFilterModal(false)}
                style={closeButtonStyle}
              >
                &times;
              </button>
            </div>
            
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
                    html: `
                      <div style="${swalTituloCssString}">
                        ¡<b>Filtros reiniciados</b>!
                      </div>
                      <div style="${swalTextoConMargenCssString}">
                        Se han eliminado todos los filtros
                      </div>
                    `,
                    icon: 'info',
                    confirmButtonColor: '#ff7300',
                    timer: 5000,
                    timerProgressBar: true,
                    showCloseButton: true
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
    <div style={{ ...modalContentStyle, padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <h2 style={{ ...modalTitleStyle, margin: 0 }}>Editar Sucursal</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '0.9rem', color: '#666', backgroundColor: '#f3f4f6', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }}>
            ID: <strong>{editFormData.id}</strong>
          </div>
          <button
            onClick={() => setShowEditModal(false)}
            style={closeButtonStyle}
          >
            &times;
          </button>
        </div>
      </div>

      <div style={modalFormStyle}>
        <div style={selectGroupStyle}>
          <label style={labelStyle}>Nombre</label>
          <input
            type="text"
            value={editFormData.nombre || ''}
            onChange={(e) => {
              const filteredValue = filterTextInput(e.target.value);
              const validation = validateTextInput(filteredValue);

              if (!validation.isValid) {
                Swal.fire({
                  title: 'Caracteres no permitidos',
                  html: `
                    <div style="${swalTituloCssString}">
                      ¡<b>Error</b>!
                    </div>
                    <div style="${swalTextoConMargenCssString}">
                      ${validation.message}
                    </div>
                  `,

                  icon: 'warning',
                  confirmButtonColor: '#ff7300',
                  timer: 5000,
                  timerProgressBar: true,
                  showCloseButton: true
                });
              }

              setEditFormData({ ...editFormData, nombre: filteredValue });
            }}
            style={inputStyle}
            placeholder="Ej: Sucursal Central"
          />
        </div>

        <div style={selectGroupStyle}>
          <label style={labelStyle}>Dirección</label>
          <input
            type="text"
            value={editFormData.direccion || ''}
            onChange={(e) => {
              const filteredValue = filterTextInput(e.target.value);
              const validation = validateTextInput(filteredValue);

              if (!validation.isValid) {
                Swal.fire({
                  title: 'Caracteres no permitidos',
                  html: `
                    <div style="${swalTituloCssString}">
                      ¡<b>Error</b>!
                    </div>
                    <div style="${swalTextoConMargenCssString}">
                      ${validation.message}
                    </div>
                  `,
                  icon: 'warning',
                  confirmButtonColor: '#ff7300',
                  timer: 5000,
                  timerProgressBar: true,
                  showCloseButton: true
                });
              }

              setEditFormData({ ...editFormData, direccion: filteredValue });
            }}
            style={inputStyle}
            placeholder="Ej: Av. Siempre Viva 123"
          />
        </div>

{/* Teléfono de la Sucursal */}
<div style={selectGroupStyle}>
  <label style={labelStyle}>Celular</label>
  <input
    type="tel"
    value={editFormData.telefono || '+56 9 '}
    maxLength={15}
    onChange={(e) => {
      let valor = e.target.value;

      // Mantener prefijo +56 9 y solo números después
      if (!valor.startsWith('+56 9 ')) {
        // Si borra el prefijo, resetearlo
        valor = '+56 9 ';
      }

      // Extraer solo números después del prefijo
      let numeros = valor.replace('+56 9 ', '').replace(/\D/g, '');

      // Limitar a máximo 8 dígitos (4 + 4)
      if (numeros.length > 8) {
        numeros = numeros.slice(0, 8);
      }

      // Formatear como +56 9 XXXX XXXX
      let formateado = '+56 9 ';
      if (numeros.length > 4) {
        formateado += numeros.slice(0, 4) + ' ' + numeros.slice(4);
      } else {
        formateado += numeros;
      }

      setEditFormData({ ...editFormData, telefono: formateado });
    }}
    style={selectStyle}
    placeholder="+56 9 1234 5678"
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
                comuna: ''
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
            onChange={(e) => setEditFormData({ ...editFormData, comuna: e.target.value })}
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
          style={{ ...modalButtonStyle, backgroundColor: '#6b7280' }}
        >
          Cancelar
        </button>
        <button
          onClick={() => {
            if (!editFormData.tipo) {
              Swal.fire({
                html: `
                  <div style="${swalTituloCssString}">
                    ¡<b>Tipo de sucursal obligatorio</b>!
                  </div>
                  <div style="${swalTextoConMargenCssString}">
                    Debes seleccionar Bodega o Sucursal
                  </div>
                `,
                icon: 'warning',
                confirmButtonColor: '#ff7300',
                timer: 5000,
                timerProgressBar: true,
                showCloseButton: true
              });
              return;
            }
            handleSaveChanges();
          }}
          style={modalButtonStyle}
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  </div>
)}

      {/* Modal de Agregar Sucursal */}
      {showAddModal && (
        <div style={modalOverlayStyle}>
          <div style={{...modalContentStyle, padding: '2rem'}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <h2 style={{...modalTitleStyle, margin: 0}}>Agregar Nueva Sucursal</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                style={closeButtonStyle}
              >
                &times;
              </button>
            </div>
            
            {/* Mostrar información de límites */}
            <div style={{
              backgroundColor: '#f3f4f6',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              color: '#374151'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Estado actual:</div>
              <div>• Sucursales: {countByType.sucursales}/3</div>
              <div>• Bodegas: {countByType.bodegas}/3</div>
              {countByType.sucursales >= 3 && (
                <div style={{ color: '#ef4444', marginTop: '0.5rem' }}>
                  Límite de sucursales alcanzado
                </div>
              )}
              {countByType.bodegas >= 3 && (
                <div style={{ color: '#ef4444', marginTop: '0.5rem' }}>
                  Límite de bodegas alcanzado
                </div>
              )}
            </div>
            
            <div style={modalFormStyle}>
              <div style={selectGroupStyle}>
                <label style={labelStyle}>Tipo</label>
                <select 
                  value={addFormData.tipo}
                  onChange={(e) => {
                    setAddFormData({...addFormData, tipo: e.target.value});
                  }}
                  style={selectStyle}
                >
                  <option 
                    value="2" 
                    disabled={countByType.sucursales >= 3}
                  >
                    Sucursal {countByType.sucursales >= 3 ? '(Límite alcanzado)' : `(${countByType.sucursales}/3)`}
                  </option>
                  <option 
                    value="1" 
                    disabled={countByType.bodegas >= 3}
                  >
                    Bodega {countByType.bodegas >= 3 ? '(Límite alcanzado)' : `(${countByType.bodegas}/3)`}
                  </option>
                </select>
              </div>

              <div style={selectGroupStyle}>
                <label style={labelStyle}>
                  Nombre {addFormData.tipo === '1' && <span style={{fontSize: '0.8rem', color: '#666'}}>(se agregará &quot;Bodega&quot; al inicio automáticamente)</span>}
                </label>
                <input
                  type="text"
                  value={addFormData.nombre}
                  onChange={(e) => setAddFormData({...addFormData, nombre: e.target.value})}
                  style={inputStyle}
                  placeholder={addFormData.tipo === '1' ? 'Ej: Central' : 'Ej: Sucursal Centro'}
                />
              </div>

              <div style={selectGroupStyle}>
                <label style={labelStyle}>Dirección</label>
                <input
                  type="text"
                  value={addFormData.direccion}
                  onChange={(e) => setAddFormData({...addFormData, direccion: e.target.value})}
                  style={inputStyle}
                  placeholder="Ej: Av. Principal 123"
                />
              </div>

              {/* Teléfono de la Sucursal - Agregar */}
              <div style={selectGroupStyle}>
                <label style={labelStyle}>Celular</label>
                <input
                  type="tel"
                  value={addFormData.telefono || '+56 9 '}
                  maxLength={15}
                  onChange={(e) => {
                    let valor = e.target.value;

                    // Mantener prefijo +56 9 y solo números después
                    if (!valor.startsWith('+56 9 ')) {
                      valor = '+56 9 ';
                    }

                    // Extraer solo números después del prefijo
                    let numeros = valor.replace('+56 9 ', '').replace(/\D/g, '');

                    // Limitar a máximo 8 dígitos (4 + 4)
                    if (numeros.length > 8) {
                      numeros = numeros.slice(0, 8);
                    }

                    // Formatear como +56 9 XXXX XXXX
                    let formateado = '+56 9 ';
                    if (numeros.length > 4) {
                      formateado += numeros.slice(0, 4) + ' ' + numeros.slice(4);
                    } else {
                      formateado += numeros;
                    }

                    setAddFormData({ ...addFormData, telefono: formateado });
                  }}
                  style={inputStyle}
                  placeholder="+56 9 1234 5678"
                />
              </div>

              <div style={selectGroupStyle}>
                <label style={labelStyle}>Ciudad</label>
                <select 
                  value={addFormData.ciudad}
                  onChange={(e) => {
                    setAddFormData({
                      ...addFormData,
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
                  value={addFormData.comuna}
                  onChange={(e) => setAddFormData({...addFormData, comuna: e.target.value})}
                  style={selectStyle}
                  disabled={!addFormData.ciudad}
                >
                  <option value="">Seleccionar comuna</option>
                  {addFormData.ciudad && COMUNAS_POR_CIUDAD[addFormData.ciudad]?.map(comuna => (
                    <option key={comuna} value={comuna}>{comuna}</option>
                  ))}
                </select>
                {!addFormData.ciudad && (
                  <span style={{fontSize: '0.8rem', color: '#666', marginTop: '0.25rem'}}>
                    Primero selecciona una ciudad
                  </span>
                )}
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
                onClick={handleSaveNewSucursal}
                style={modalButtonStyle}
              >
                Crear Sucursal
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


