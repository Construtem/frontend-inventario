"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Sucursal {
  id: number;
  nombre: string;
  tipo: string;
  telefono: string;
  direccion: string;
  comuna: string;
  tipo_id?: number; // Agregar tipo_id que viene del backend
}

interface CardProps {
  id: number;
  mainText: string;
  subText: string;
  imagePath: string;
  extraInfo?: string;
  route?: string;
  onClick?: () => void;
}

interface UserData {
  name: string;
  email: string;
  photoURL: string;
  rol: string;
}

export default function InventarioPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [openCard, setOpenCard] = useState<number | null>(null);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiInventarioUrl = process.env.NEXT_PUBLIC_API_INVENTARIO || 'https://api-inventario.tssw.cl';

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as UserData;
        setUser(parsedUser);
      } catch (err) {
      }
    }
  }, []);

  // Efecto para cargar las sucursales
  useEffect(() => {
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
          setSucursales(data);
        } else {

          setSucursales([]);
        }
        
      } catch (err) {
        let errorMessage = "Error de conexión. Por favor, intente nuevamente.";
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            errorMessage = 'Tiempo de espera agotado. Verifique su conexión a internet y vuelva a intentar.';
          } else if (err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
            errorMessage = '•No se pudo conectar al servidor.\n• Verifique su conexión a internet o contacte al administrador del sistema.';
          } else if (err.message.includes('500')) {
            errorMessage = 'Error interno del servidor (Error 500). Por favor, contacte al administrador del sistema.';
          } else if (err.message.includes('404')) {
            errorMessage = 'Servicio no encontrado (Error 404). Por favor, contacte al administrador del sistema.';
          } else if (err.message.includes('403') || err.message.includes('401')) {
            errorMessage = 'No tiene permisos para acceder a este recurso. Por favor, contacte al administrador del sistema.';
          } else {
            errorMessage = 'Error inesperado. Por favor, intente nuevamente o contacte al administrador del sistema.';
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
            const response = await fetch(`${apiInventarioUrl}/api/sucursales`, {
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
          setSucursales(data);
          setError(null);
        } else {
          throw new Error('Los datos recibidos no tienen el formato esperado');
        }
      } catch (err) {
        let errorMessage = "Error de conexión. Por favor, intente nuevamente.";
        if (err instanceof Error) {
          if (err.message.includes('500')) {
            errorMessage = 'Error interno del servidor (Error 500). Por favor, contacte al administrador del sistema.';
          } else if (err.message.includes('404')) {
            errorMessage = 'Servicio no encontrado (Error 404). Por favor, contacte al administrador del sistema.';
          } else if (err.message.includes('403') || err.message.includes('401')) {
            errorMessage = 'No tiene permisos para acceder a este recurso. Por favor, contacte al administrador del sistema.';
          } else if (err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
            errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
          } else {
            errorMessage = 'Error inesperado. Por favor, intente nuevamente o contacte al administrador del sistema.';
          }
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSucursales();
  };

  const cardData: CardProps[] = useMemo(() => {
    if (sucursales.length === 0) return [];



    const sucursalesOnly = sucursales
      .filter(item => {
        const tipoValue = item.tipo_id || item.tipo;
        const esSucursal = tipoValue === 2 || tipoValue === '2' || 
                          (!item.nombre?.toLowerCase()?.includes('bodega') && !tipoValue);
        return esSucursal;
      })
      .sort((a, b) => (a?.id || 0) - (b?.id || 0));
    
    const bodegasOnly = sucursales
      .filter(item => {
        const tipoValue = item.tipo_id || item.tipo;
        const esBodega = tipoValue === 1 || tipoValue === '1' || 
                        (item.nombre?.toLowerCase()?.includes('bodega') && !tipoValue);
        return esBodega;
      })
      .sort((a, b) => (a?.id || 0) - (b?.id || 0));

    const cards: CardProps[] = [];


    sucursalesOnly.slice(0, 3).forEach((sucursal, index) => {
      const slot = index + 1;
      const card = {
        id: Number(sucursal.id) || 0,
        mainText: String(sucursal.nombre || `Sucursal ${sucursal.id}`),
        subText: `Slot ${slot}`,
        imagePath: "/images/inicio/sucursales.png",
        extraInfo: `${String(sucursal.direccion || 'Dirección no especificada')}, ${String(sucursal.comuna || 'Comuna no especificada')} | Tel: ${String(sucursal.telefono || 'No especificado')}`,
        route: `/admin/inventario/sucursal-slot-${slot}?id=${sucursal.id}`
      };
      cards.push(card);
    });

    // Asignar slots a bodegas (máximo 3)
    bodegasOnly.slice(0, 3).forEach((bodega, index) => {
      const slot = index + 1;
      const card = {
        id: Number(bodega.id) || 0,
        mainText: String(bodega.nombre || `Bodega ${bodega.id}`),
        subText: `Slot ${slot}`,
        imagePath: "/images/inicio/bodegas.png",
        extraInfo: `${String(bodega.direccion || 'Dirección no especificada')}, ${String(bodega.comuna || 'Comuna no especificada')} | Tel: ${String(bodega.telefono || 'No especificado')}`,
        route: `/admin/inventario/bodega-slot-${slot}?id=${bodega.id}`
      };

      cards.push(card);
    });


    return cards;
  }, [sucursales]);


  

  const handleCardClick = (cardId: number) => {
    const card = cardData.find(c => c.id === cardId);
    if (card?.route) {
      router.push(card.route);
    }
  };

  const handleCloseModal = () => {
    setOpenCard(null);
  };

  // Renderizar contenido principal
  const renderContent = () => {
    if (loading) {
      return (
        <div style={loadingContainerStyle}>
          <div style={loadingSpinnerStyle} />
          <div style={loadingTextStyle}>Cargando sucursales. Espere un momento...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div style={errorContainerStyle}>
          <div style={errorTitleStyle}>Error al cargar Inventario</div>
          <div style={errorMessageStyle}>{error}</div>
          
          <div style={errorButtonsStyle}>
            <button onClick={retryFetch} style={retryButtonStyle}>
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    if (sucursales.length === 0) {
      return (
        <div style={emptyStateStyle}>
          <div style={emptyIconStyle}>🏢</div>
          <div style={emptyTitleStyle}>No hay sucursales disponibles</div>
          <div style={emptySubtitleStyle}>
            Agregue sucursales desde la sección de gestión para verlas aquí
          </div>
        </div>
      );
    }

    return (
      <>
        <div style={cardGridStyle}>
          {cardData.map((card) => (
            <Card key={card.id} {...card} onClick={() => handleCardClick(card.id)} />
          ))}
        </div>
        {openCard && (
          <CardModal
            card={cardData.find(c => c.id === openCard)!}
            onClose={handleCloseModal}
          />
        )}
      </>
    );
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Inventario de Sucursales y Bodegas</h1>
        <h3 style={textStyle}>
          Seleccione la sucursal o bodega para ver el inventario{" "}
          <span style={{ fontWeight: "bold" }}>
            {user ? user.name : "Invitado"}
          </span>
        </h3>
        <div style={subtleLineStyle}></div>
        {renderContent()}
      </div>
    </div>
  );
}

const Card: React.FC<CardProps> = ({ mainText, subText, imagePath, extraInfo, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardContainerStyle: React.CSSProperties = {
    backgroundColor: '#FF7300',
    borderRadius: '20px',
    padding: '15px',
    width: '350px',
    height: '140px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    fontFamily: 'Montserrat, sans-serif',
    boxSizing: 'border-box',
    maxWidth: '100%',
    position: 'relative',
    ...(isHovered ? {
      transform: 'scale(1.05)',
      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)',
      opacity: 1.2,
    } : {})
  };

  const textContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flexGrow: 1,
    minWidth: 0,
    marginRight: '10px',
  };

  const mainTextStyle: React.CSSProperties = {
    fontSize: '1.2rem',
    marginBottom: '4px',
    fontWeight: 'bold',
    color: '#fff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const subTextStyle: React.CSSProperties = {
    fontSize: '1rem',
    color: '#222',
    opacity: 0.9,
    marginBottom: '2px',
    fontWeight: 500,
  };

  const extraInfoStyle: React.CSSProperties = {
    fontSize: '0.8rem',
    color: '#f5f5f5',
    opacity: 0.8,
    marginTop: '2px',
    fontWeight: 400,
    lineHeight: '1.2',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  };

  const imageStyle: React.CSSProperties = {
    opacity: isHovered ? 1 : 0.7,
    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
    transition: 'transform 0.3s, opacity 0.3s',
    marginLeft: '15px',
    flexShrink: 0,
  };

  return (
    <div
      style={cardContainerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div style={textContainerStyle}>
        <div style={mainTextStyle}>{mainText}</div>
        <div style={subTextStyle}>{subText}</div>
        {extraInfo && <div style={extraInfoStyle}>{extraInfo}</div>}
      </div>
      <Image
        src={imagePath}
        alt={mainText}
        width={65}
        height={65}
        style={imageStyle}
      />
    </div>
  );
};

// Modal adaptado para mostrar detalles de la sucursal seleccionada
interface CardModalProps {
  card: CardProps;
  onClose: () => void;
}

const CardModal: React.FC<CardModalProps> = ({ card, onClose }) => {
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
    padding: '2rem',
    minWidth: '350px',
    maxWidth: '95vw',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
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

  const modalTitleStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#222222',
    fontFamily: 'Montserrat, sans-serif',
    margin: '1rem 0 0.5rem 0',
    textAlign: 'center',
  };

  const infoStyle: React.CSSProperties = {
    fontSize: '1.1rem',
    color: '#444',
    margin: '0.5rem 0',
    textAlign: 'center',
    lineHeight: '1.4',
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
        <button style={closeButtonStyle} onClick={onClose}>×</button>
        <Image
          src={card.imagePath}
          alt={card.mainText}
          width={80}
          height={80}
        />
        <div style={modalTitleStyle}>{card.mainText}</div>
        <div style={infoStyle}>{card.subText}</div>
        {card.extraInfo && <div style={infoStyle}>{card.extraInfo}</div>}
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

// Estilos para estados de carga
const loadingContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '4rem 2rem',
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  textAlign: 'center',
};

const loadingSpinnerStyle: React.CSSProperties = {
  width: '50px',
  height: '50px',
  border: '4px solid #f3f4f6',
  borderTop: '4px solid #ff7300',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  marginBottom: '1.5rem',
};

const loadingTextStyle: React.CSSProperties = {
  fontSize: '1.2rem',
  color: '#666',
  fontFamily: 'Montserrat, sans-serif',
  fontWeight: 'semibold',
  marginBottom: '0.5rem',
};

const loadingSubTextStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  color: '#999',
  fontFamily: 'Roboto, sans-serif',
};

// Estilos para estado de error
const errorContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '3rem 2rem',
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  maxWidth: '600px',
  margin: '0 auto',
  textAlign: 'center',
};

const errorTitleStyle: React.CSSProperties = {
  fontSize: '1.2rem',
  color: '#ef4444',
  fontFamily: 'Montserrat, sans-serif',
  fontWeight: 'bold',
  marginBottom: '1rem',
};

const errorMessageStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  color: '#666',
  fontFamily: 'Roboto, sans-serif',
  lineHeight: '1.5',
  whiteSpace: 'pre-line',
  marginBottom: '2rem',
};

const errorButtonsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  marginBottom: '2rem',
  flexWrap: 'wrap',
  justifyContent: 'center',
};

const retryButtonStyle: React.CSSProperties = {
  backgroundColor: '#ef4444',
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
  minWidth: '120px',
};

const diagnosticButtonStyle: React.CSSProperties = {
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
  minWidth: '120px',
};

// Estilos para estado vacío
const emptyStateStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '4rem 2rem',
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  textAlign: 'center',
};

const emptyIconStyle: React.CSSProperties = {
  fontSize: '4rem',
  marginBottom: '1rem',
  opacity: 0.6,
};

const emptyTitleStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  color: '#374151',
  fontFamily: 'Montserrat, sans-serif',
  fontWeight: 'bold',
  marginBottom: '0.5rem',
};

const emptySubtitleStyle: React.CSSProperties = {
  fontSize: '1rem',
  color: '#6b7280',
  fontFamily: 'Roboto, sans-serif',
  lineHeight: '1.5',
};