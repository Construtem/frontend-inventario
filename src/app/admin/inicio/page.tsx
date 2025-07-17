"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

// Configuración del API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Interfaz para los datos de usuario del API
interface UsuarioAPI {
  email: string;
  nombre: string;
  rol: {
    id: number;
    nombre: string;
  };
}

// Función para obtener usuarios del endpoint
const fetchUsuarios = async (): Promise<UsuarioAPI[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Timeout de 10 segundos
    
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('⏱️ Timeout al cargar usuarios - operación cancelada');
    } else {
      console.warn('⚠️ Error al cargar usuarios - usando datos por defecto');
    }
    return [];
  }
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

interface CardProps {
  id: number;
  mainText: string;
  subText: string;
  imagePath: string;
  onClick?: () => void;
  isMobile?: boolean;
}

interface UserData {
  name: string;
  email: string;
  photoURL: string;
  rol: string;
}

export default function InicioPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [openCard, setOpenCard] = useState<number | null>(null);
  const [usuariosCount, setUsuariosCount] = useState<number>(0);
  const { isSmall, isMobile } = useWindowSize();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as UserData;
        setUser(parsedUser);
        console.log("✅ Usuario cargado en InicioPage:", parsedUser);
      } catch (err) {
        console.error("Error al parsear user en InicioPage:", err);
      }
    }

    // Cargar conteo de usuarios
    const loadUsuariosCount = async () => {
      try {
        const usuarios = await fetchUsuarios();
        setUsuariosCount(usuarios.length);
        console.log("📊 Conteo de usuarios cargado:", usuarios.length);
      } catch (error) {
        console.error("Error loading usuarios count:", error);
        setUsuariosCount(0);
      }
    };

    loadUsuariosCount();
  }, []);


  const handleCardClick = (cardId: number) => {
    setOpenCard(cardId);
  };

  const handleCloseModal = () => {
    setOpenCard(null);
  };

  const cardData: CardProps[] = [
    { id: 1, mainText: '12', subText: 'Clientes', imagePath: '/images/inicio/clientes.png' },
    { id: 2, mainText: '20', subText: 'Proveedores', imagePath: '/images/inicio/proveedores.png' },
    { id: 3, mainText: '4', subText: 'Bodegas', imagePath: '/images/inicio/bodegas.png' },
    { id: 4, mainText: '100', subText: 'Productos registrados', imagePath: '/images/inicio/productos.png' },
    { id: 5, mainText: '25', subText: 'Productos disponibles', imagePath: '/images/inicio/productos.png' },
    { id: 6, mainText: '25', subText: 'Productos no disponibles', imagePath: '/images/inicio/productos.png' },
    { id: 7, mainText: '50', subText: 'Pedidos', imagePath: '/images/inicio/pedidos.png' },
    { id: 8, mainText: '50', subText: 'Facturas emitidas', imagePath: '/images/inicio/facturas.png' },
    { id: 9, mainText: '150', subText: 'Existencia total', imagePath: '/images/inicio/existencias.png' },
    { id: 10, mainText: '100', subText: 'Existencia vendida', imagePath: '/images/inicio/existencias.png' },
    { id: 11, mainText: '5', subText: 'Sucursales', imagePath: '/images/inicio/sucursales.png' },
    { id: 12, mainText: '50', subText: 'Ventas', imagePath: '/images/inicio/ventas.png' },
    { id: 13, mainText: usuariosCount.toString(), subText: 'Usuarios registrados', imagePath: '/images/inicio/usuarios_registrados.png' },
  ];

  return (
    <div style={containerStyle}>
      <div style={{
        ...cardStyle,
        padding: isMobile ? "1rem" : "2rem",
        marginLeft: isMobile ? '0.5rem' : '1.5rem',
        marginRight: isMobile ? '0.5rem' : '1.5rem',
      }}>
        <h1 style={{
          ...titleStyle,
          fontSize: isMobile ? "1.5rem" : isSmall ? "1.75rem" : "2rem",
          marginBottom: isMobile ? "1rem" : "2rem",
        }}>Inicio</h1>
        <h3 style={{
          ...textStyle,
          fontSize: isMobile ? "0.9rem" : "1rem",
        }}>
          Bienvenido a su panel de gestión,{" "}
          <span style={{ fontWeight: "bold" }}>
            {user ? user.name : "Invitado"}
          </span>
          !
        </h3>
        <div style={subtleLineStyle}></div>
        <h1 style={{
          ...titleStyle,
          fontSize: isMobile ? "1.5rem" : isSmall ? "1.75rem" : "2rem",
          marginBottom: isMobile ? "1rem" : "2rem",
        }}>Resumen general</h1>
        <div style={{
          ...cardGridStyle,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          flexWrap: 'wrap',
          gap: isMobile ? '1rem' : '2rem',
          padding: isMobile ? '0.25rem' : '0.5rem',
          justifyContent: 'flex-start'
        }}>
          {cardData.map((card) => (
            <Card 
              key={card.id} 
              {...card} 
              onClick={() => handleCardClick(card.id)}
              isMobile={isMobile}
            />
          ))}
        </div>

        {openCard && (
          <CardModal
            card={cardData.find(c => c.id === openCard)!}
            onClose={handleCloseModal}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  );
}

const Card: React.FC<CardProps> = ({ mainText, subText, imagePath, onClick, isMobile }) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardContainerStyle: React.CSSProperties = {
    backgroundColor: '#FF7300',
    borderRadius: '20px',
    padding: isMobile ? '12px' : '15px',
    width: isMobile ? '100%' : 'calc(25% - 1.5rem)',
    height: isMobile ? '100px' : '120px',
    display: 'grid',
    gridTemplateColumns: '1fr 80px', // 2 columnas: texto e ícono
    gap: '10px',
    alignItems: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    fontFamily: 'Montserrat, sans-serif',
    boxSizing: 'border-box',
    maxWidth: '100%',
    position: 'relative',
    minWidth: isMobile ? '100%' : '280px',
    ...(isHovered ? {
      transform: isMobile ? 'scale(1.02)' : 'scale(1.05)',
      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)',
      opacity: 1.2,
    } : {})
  };

  const textContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minWidth: 0,
  };

  const mainTextStyle: React.CSSProperties = {
    fontSize: isMobile ? '1.1rem' : '1.125rem',
    marginBottom: '5px',
    fontWeight: 'medium',
    color: '#222222',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const subTextStyle: React.CSSProperties = {
    ...mainTextStyle,
    fontSize: isMobile ? '0.9rem' : '1rem',
    opacity: 0.8,
    marginBottom: 0,
  };

  const imageStyle: React.CSSProperties = {
    opacity: isHovered ? 1 : 0.5,
    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
    transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
    flexShrink: 0,
    width: isMobile ? '65px' : '75px',
    height: isMobile ? '65px' : '75px',
    justifySelf: 'center',
  };

  return (
    <div
      style={cardContainerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div style={textContainerStyle}>
        <p style={mainTextStyle}>{mainText}</p>
        <p style={subTextStyle}>{subText}</p>
      </div>

      <Image
        src={imagePath}
        alt={subText}
        width={isMobile ? 65 : 75}
        height={isMobile ? 65 : 75}
        style={imageStyle}
      />
    </div>
  );
};

// Actualizar la interfaz del CardModal para incluir isMobile
interface CardModalProps {
  card: CardProps;
  onClose: () => void;
  isMobile?: boolean;
}

const CardModal: React.FC<CardModalProps> = ({ card, onClose, isMobile }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [realUsuarios, setRealUsuarios] = useState<UsuarioAPI[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar datos reales de usuarios cuando el modal se abre y es la card de usuarios
  useEffect(() => {
    const loadRealData = async () => {
      if (card.subText !== 'Usuarios registrados') {
        setRealUsuarios([]);
        return;
      }

      setLoading(true);
      try {
        const usuarios = await fetchUsuarios();
        setRealUsuarios(usuarios);
        console.log("📊 Usuarios cargados en modal:", usuarios);
      } catch (error) {
        console.error("Error loading usuarios in modal:", error);
        setRealUsuarios([]);
      } finally {
        setLoading(false);
      }
    };

    loadRealData();
  }, [card.subText]);
  
  // Función para generar datos según el tipo de card
  const getDataToShow = (): Record<string, string | number>[] => {
    // Si es la card de usuarios registrados y tenemos datos reales del servidor
    if (card.subText === 'Usuarios registrados') {
      if (loading) {
        return [{
          id: 1,
          mensaje: 'Cargando información...',
          estado: 'Conectando al servidor',
          descripcion: 'Por favor espere mientras se cargan los usuarios'
        }];
      }

      if (realUsuarios.length > 0) {
        // Convertir los datos del API al formato de la tabla (sin rol_id ni estado)
        return realUsuarios.map((usuario, index) => ({
          id: index + 1,
          email: usuario.email,
          nombre: usuario.nombre,
          rol: usuario.rol.nombre
        }));
      }

      return [{
        id: 1,
        mensaje: 'No hay usuarios registrados',
        descripcion: 'No se encontraron usuarios en el sistema'
      }];
    }

    // Para otras cards, usar datos estáticos o mostrar mensaje de no implementado
    return generateSampleData(card.subText);
  };
  // Función para generar datos estáticos para cards no implementadas
  const generateSampleData = (cardSubText: string): Record<string, string | number>[] => {
    const dataMap: { [key: string]: Record<string, string | number>[] } = {
      'Clientes': [
        { id: 1, nombre: 'Juan Pérez', email: 'juan@email.com', telefono: '123-456-7890', empresa: 'Tech Corp' },
        { id: 2, nombre: 'María García', email: 'maria@email.com', telefono: '098-765-4321', empresa: 'Design LLC' },
        { id: 3, nombre: 'Carlos López', email: 'carlos@email.com', telefono: '555-123-4567', empresa: 'Solutions Inc' },
        { id: 4, nombre: 'Juan Pérez', email: 'juan@email.com', telefono: '123-456-7890', empresa: 'Tech Corp' },
        { id: 5, nombre: 'María García', email: 'maria@email.com', telefono: '098-765-4321', empresa: 'Design LLC' },
        { id: 6, nombre: 'Carlos López', email: 'carlos@email.com', telefono: '555-123-4567', empresa: 'Solutions Inc' },
        { id: 7, nombre: 'Juan Pérez', email: 'juan@email.com', telefono: '123-456-7890', empresa: 'Tech Corp' },
        { id: 8, nombre: 'María García', email: 'maria@email.com', telefono: '098-765-4321', empresa: 'Design LLC' },
        { id: 9, nombre: 'Carlos López', email: 'carlos@email.com', telefono: '555-123-4567', empresa: 'Solutions Inc' },
        { id: 10, nombre: 'Juan Pérez', email: 'juan@email.com', telefono: '123-456-7890', empresa: 'Tech Corp' },
        { id: 20, nombre: 'María García', email: 'maria@email.com', telefono: '098-765-4321', empresa: 'Design LLC' },
        { id: 30, nombre: 'Carlos López', email: 'carlos@email.com', telefono: '555-123-4567', empresa: 'Solutions Inc' },
        { id: 100, nombre: 'Juan Pérez', email: 'juan@email.com', telefono: '123-456-7890', empresa: 'Tech Corp' },
        { id: 200, nombre: 'María García', email: 'maria@email.com', telefono: '098-765-4321', empresa: 'Design LLC' },
        { id: 300, nombre: 'Carlos López', email: 'carlos@email.com', telefono: '555-123-4567', empresa: 'Solutions Inc' },
      ],
      'Proveedores': [
        { id: 1, nombre: 'Suministros ABC', contacto: 'Ana Torres', telefono: '111-222-3333', categoria: 'Materiales' },
        { id: 2, nombre: 'Distribuidora XYZ', contacto: 'Luis Méndez', telefono: '444-555-6666', categoria: 'Equipos' },
        { id: 3, nombre: 'Importadora DEF', contacto: 'Sofia Ruiz', telefono: '777-888-9999', categoria: 'Herramientas' },
      ],
      'Bodegas': [
        { id: 1, nombre: 'Bodega Central', ubicacion: 'Zona Norte', capacidad: '1000 m²', responsable: 'Pedro Ramírez' },
        { id: 2, nombre: 'Bodega Sur', ubicacion: 'Zona Sur', capacidad: '750 m²', responsable: 'Laura Jiménez' },
        { id: 3, nombre: 'Bodega Este', ubicacion: 'Zona Este', capacidad: '500 m²', responsable: 'Miguel Santos' },
      ],
      'Productos registrados': [
        { id: 1, codigo: 'P001', nombre: 'Laptop HP', categoria: 'Tecnología', precio: '$800', stock: 15 },
        { id: 2, codigo: 'P002', nombre: 'Mouse Logitech', categoria: 'Accesorios', precio: '$25', stock: 50 },
        { id: 3, codigo: 'P003', nombre: 'Monitor Samsung', categoria: 'Tecnología', precio: '$300', stock: 8 },
      ],
      'Productos disponibles': [
        { id: 1, codigo: 'P001', nombre: 'Laptop HP', stock: 15, estado: 'Disponible', ubicacion: 'Bodega A' },
        { id: 2, codigo: 'P002', nombre: 'Mouse Logitech', stock: 50, estado: 'Disponible', ubicacion: 'Bodega B' },
      ],
      'Productos no disponibles': [
        { id: 1, codigo: 'P010', nombre: 'Teclado mecánico', stock: 0, estado: 'Agotado', fecha_restock: '2025-07-15' },
        { id: 2, codigo: 'P011', nombre: 'Webcam 4K', stock: 0, estado: 'Descontinuado', fecha_restock: 'N/A' },
      ],
      'Pedidos': [
        { id: 1, numero: 'PED-001', cliente: 'Juan Pérez', fecha: '2025-07-01', estado: 'Pendiente', total: '$1,200' },
        { id: 2, numero: 'PED-002', cliente: 'María García', fecha: '2025-07-02', estado: 'Procesando', total: '$850' },
      ],
      'Facturas emitidas': [
        { id: 1, numero: 'FAC-001', cliente: 'Tech Corp', fecha: '2025-07-01', monto: '$1,200', estado: 'Pagada' },
        { id: 2, numero: 'FAC-002', cliente: 'Design LLC', fecha: '2025-07-02', monto: '$850', estado: 'Pendiente' },
      ],
      'Existencia total': [
        { id: 1, producto: 'Laptop HP', categoria: 'Tecnología', cantidad: 15, valor_unitario: '$800', valor_total: '$12,000' },
        { id: 2, producto: 'Mouse Logitech', categoria: 'Accesorios', cantidad: 50, valor_unitario: '$25', valor_total: '$1,250' },
      ],
      'Existencia vendida': [
        { id: 1, producto: 'Laptop HP', cantidad_vendida: 5, fecha_venta: '2025-07-01', valor_total: '$4,000', cliente: 'Tech Corp' },
        { id: 2, producto: 'Mouse Logitech', cantidad_vendida: 10, fecha_venta: '2025-07-02', valor_total: '$250', cliente: 'Design LLC' },
      ],
      'Sucursales': [
        { id: 1, nombre: 'Sucursal Centro', direccion: 'Av. Principal 123', telefono: '123-456-7890', gerente: 'Ana López' },
        { id: 2, nombre: 'Sucursal Norte', direccion: 'Calle Norte 456', telefono: '098-765-4321', gerente: 'Carlos Méndez' },
      ],
      'Ventas': [
        { id: 1, numero: 'V-001', fecha: '2025-07-01', cliente: 'Juan Pérez', producto: 'Laptop HP', cantidad: 1, total: '$800' },
        { id: 2, numero: 'V-002', fecha: '2025-07-02', cliente: 'María García', producto: 'Mouse Logitech', cantidad: 2, total: '$50' },
      ],
    };
    
    return dataMap[cardSubText] || [
      { id: 1, campo1: 'Valor 1', campo2: 'Valor 2', campo3: 'Valor 3' },
      { id: 2, campo1: 'Valor 4', campo2: 'Valor 5', campo3: 'Valor 6' },
    ];
  };

  const dataToShow = getDataToShow();
  const columns = dataToShow.length > 0 ? Object.keys(dataToShow[0]).filter(key => key !== 'id') : [];

  // Filtrar datos basado en el término de búsqueda
  const filteredData = dataToShow.filter((row: any) => 
    Object.values(row).some((value: any) => 
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  
  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(128, 128, 128, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  };

  const modalContentStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: isMobile ? '1rem' : '2rem',
    width: isMobile ? '95vw' : '80vw',
    maxWidth: '900px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    position: 'relative',
  };

  const closeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '15px',
    right: '20px',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666',
    fontWeight: 'bold',
  };

  const modalHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: isMobile ? '1rem' : '2rem',
    borderBottom: '1px solid #e0e0e0',
    paddingBottom: isMobile ? '0.5rem' : '1rem',
    flexDirection: 'row',
    gap: '1rem',
  };

  const modalTitleStyle: React.CSSProperties = {
    fontSize: isMobile ? '1.2rem' : '1.5rem',
    fontWeight: 'bold',
    color: '#222222',
    fontFamily: 'Montserrat, sans-serif',
    margin: 0,
  };

  const tableContainerStyle: React.CSSProperties = {
    height: '400px',
    overflowY: 'auto',
    overflowX: 'auto',
    border: '1px solid #e0e0e0',
    borderRadius: '20px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    flex: 1,
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
    minWidth: '600px', // Asegurar un ancho mínimo para scroll horizontal
  };

  const headerRowStyle: React.CSSProperties = {
    backgroundColor: '#5c5c5c',
    position: 'sticky',
    top: 0,
    zIndex: 1,
  };

  const headerCellStyle: React.CSSProperties = {
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: 'bold',
    borderBottom: '2px solid #dee2e6',
    color: '#fff',
    fontFamily: 'Montserrat, sans-serif',
    whiteSpace: 'nowrap', // Evitar que el texto se rompa
    minWidth: '120px', // Ancho mínimo para las columnas
  };

  const dataRowStyle: React.CSSProperties = {
    borderBottom: '1px solid #e9ecef',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  };

  const dataCellStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderBottom: '1px solid #e9ecef',
    whiteSpace: 'nowrap', // Evitar que el texto se rompa
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '200px', // Ancho máximo para las celdas
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <button style={closeButtonStyle} onClick={onClose}>
          ×
        </button>
        
        <div style={modalHeaderStyle}>
          <Image
            src={card.imagePath}
            alt={card.subText}
            width={60}
            height={60}
          />
          <h2 style={modalTitleStyle}>{card.subText}</h2>
        </div>

        {/* Buscador */}
        <div style={{ 
          marginBottom: '1.5rem', 
          display: 'flex', 
          gap: '10px', 
          alignItems: 'center',
          flexWrap: 'wrap',
          flexShrink: 0
        }}>
          <input
            type="text"
            placeholder={`Buscar en ${card.subText}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '10px 12px',
              borderRadius: '20px',
              border: '2px solid #e0e0e0',
              fontSize: '0.9rem',
              fontFamily: 'Roboto, sans-serif',
              outline: 'none',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              backgroundColor: '#fff',
            }}
            onFocus={(e) => e.target.style.borderColor = '#FF7300'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>

        {/* Tabla de datos */}
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr style={headerRowStyle}>
                {columns.map((column) => (
                  <th key={column} style={headerCellStyle}>
                    {column.charAt(0).toUpperCase() + column.slice(1).replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row: any) => (
                <tr 
                  key={row.id} 
                  style={{
                    ...dataRowStyle,
                    backgroundColor: 'white'
                  }}
                >
                  {columns.map((column) => (
                    <td key={column} style={dataCellStyle}>
                      {row[column]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Información adicional */}
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          flexShrink: 0
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
            Total de registros: {dataToShow.length} | Mostrando: {filteredData.length}
          </p>
        </div>
      </div>
    </div>
  );
};

// === Estilos Globales ===

const containerStyle: React.CSSProperties = {
  marginTop: "70px",
  padding: "1.5rem",
  boxSizing: "border-box",
  minHeight: "calc(100vh - 70px)",
  backgroundColor: "#f5f5f5",
  borderRadius: '20px',
  width: "100%",
  overflowX: "hidden",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "white",
  borderRadius: "12px",
  padding: "2rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  maxWidth: "100%",
  overflowX: "hidden",
  marginTop: "1.5rem",
  marginLeft: '1.5rem',
  marginRight: '1.5rem',
};

const cardGridStyle: React.CSSProperties = {
  display: 'grid',
  gap: '2rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  width: '100%',
  padding: '0.5rem',
  boxSizing: 'border-box',
};

const titleStyle: React.CSSProperties = {
  color: '#222222',
  fontSize: "2rem",
  fontWeight: "bold",
  marginBottom: "2rem",
  fontFamily: 'Montserrat, sans-serif',
  borderRadius: '20px',
};

const textStyle: React.CSSProperties = {
  color: "#222222",
  fontSize: "1rem",
  fontWeight: "normal",
  lineHeight: "1.6",
  fontFamily: 'Roboto, sans-serif',
  borderRadius: '20px',
};

const subtleLineStyle: React.CSSProperties = {
  backgroundColor: '#e0e0e0',
  height: '1px',
  opacity: 0.7,
  margin: '20px 0',
  borderRadius: '20px',
};
