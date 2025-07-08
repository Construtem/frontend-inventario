//parche para accionar workflow ci
// export default function InventarioPage() {
//   return <div>Inventario</div>;
// }

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
  extraInfo?: string;
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
  const [, setUser] = useState<UserData | null>(null);
  const { isSmall, isMobile } = useWindowSize();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as UserData;
        setUser(parsedUser);
      } catch (err) {
        console.error("Error al parsear user en InicioPage:", err);
      }
    }
  }, []);

  // Datos de ejemplo para 3 tiendas y 3 bodegas
  const tiendas: CardProps[] = [
    {
      id: 1,
      mainText: "Tienda Centro",
      subText: "Av. Principal 123",
      imagePath: "/images/inicio/sucursales.png",
      extraInfo: "Gerente: Ana López | Tel: 123-456-7890",
      onClick: () => {
        router.push("/admin/inventario/sucursal-1");
      },
    },
    {
      id: 2,
      mainText: "Tienda Norte",
      subText: "Calle Norte 456",
      imagePath: "/images/inicio/sucursales.png",
      extraInfo: "Gerente: Carlos Méndez | Tel: 098-765-4321",
      onClick: () => {
        router.push("/admin/inventario/sucursal-2");
      },
    },
    {
      id: 3,
      mainText: "Tienda Sur",
      subText: "Av. Sur 789",
      imagePath: "/images/inicio/sucursales.png",
      extraInfo: "Gerente: Laura Jiménez | Tel: 555-123-4567",
      onClick: () => {
        router.push("/admin/inventario/sucursal-3");
      },
    },
  ];

  const bodegas: CardProps[] = [
    {
      id: 4,
      mainText: "Bodega Central",
      subText: "Zona Norte",
      imagePath: "/images/inicio/bodegas.png",
      extraInfo: "Capacidad: 1000 m² | Responsable: Pedro Ramírez",
      onClick: () => {
        window.location.href = "/admin/inventario/bodega-1";
      },
    },

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
        }}>Inventario</h1>
        <h3 style={{
          ...textStyle,
          fontSize: isMobile ? "0.9rem" : "1rem",
        }}>
          Seleccione una tienda o bodega para ver su inventario.
        </h3>
        <div style={subtleLineStyle}></div>
        <h2 style={{
          ...titleStyle,
          fontSize: isMobile ? "1.1rem" : "1.3rem",
          marginBottom: isMobile ? "0.75rem" : "1rem"
        }}>Tiendas</h2>
        <div style={{
          ...cardGridStyle,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '1rem' : '2rem',
          padding: isMobile ? '0.25rem' : '0.5rem',
          flexWrap: 'wrap',
          justifyContent: 'flex-start'
        }}>
          {tiendas.map((card) => (
            <Card 
              key={card.id} 
              {...card} 
              isMobile={isMobile}
            />
          ))}
        </div>
        <h2 style={{
          ...titleStyle,
          fontSize: isMobile ? "1.1rem" : "1.3rem",
          marginTop: isMobile ? "1.5rem" : "2.5rem",
          marginBottom: isMobile ? "0.75rem" : "1rem"
        }}>Bodegas</h2>
        <div style={{
          ...cardGridStyle,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '1rem' : '2rem',
          padding: isMobile ? '0.25rem' : '0.5rem',
          flexWrap: 'wrap',
          justifyContent: 'flex-start'
        }}>
          {bodegas.map((card) => (
            <Card 
              key={card.id} 
              {...card}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ResponsiveCardProps extends CardProps {
  isMobile?: boolean;
}

const Card: React.FC<ResponsiveCardProps> = ({ mainText, subText, imagePath, extraInfo, onClick, isMobile }) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardContainerStyle: React.CSSProperties = {
    backgroundColor: '#FF7300',
    borderRadius: '20px',
    padding: isMobile ? '12px' : '15px',
    width: isMobile ? '100%' : '350px',
    height: isMobile ? '120px' : '140px',
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
      transform: isMobile ? 'scale(1.02)' : 'scale(1.05)',
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
    marginRight: isMobile ? '8px' : '10px',
  };

  const mainTextStyle: React.CSSProperties = {
    fontSize: isMobile ? '1.1rem' : '1.2rem',
    marginBottom: '4px',
    fontWeight: 'bold',
    color: '#fff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const subTextStyle: React.CSSProperties = {
    fontSize: isMobile ? '0.9rem' : '1rem',
    color: '#222',
    opacity: 0.9,
    marginBottom: '2px',
    fontWeight: 500,
  };

  const extraInfoStyle: React.CSSProperties = {
    fontSize: isMobile ? '0.8rem' : '0.9rem',
    color: '#f5f5f5',
    opacity: 0.8,
    marginTop: '2px',
    fontWeight: 400,
  };

  const imageStyle: React.CSSProperties = {
    opacity: isHovered ? 1 : 0.7,
    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
    transition: 'transform 0.3s, opacity 0.3s',
    marginLeft: isMobile ? '10px' : '15px',
    flexShrink: 0,
    width: isMobile ? '55px' : '65px',
    height: isMobile ? '55px' : '65px',
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
        width={isMobile ? 55 : 65}
        height={isMobile ? 55 : 65}
        style={imageStyle}
      />
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
  display: 'flex',
  gap: '2rem',
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
