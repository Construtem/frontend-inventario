//parche para accionar workflow ci
// export default function InventarioPage() {
//   return <div>Inventario</div>;
// }

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

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

  // Datos de ejemplo para 3 sucursales y 3 bodegas
  const cardData: CardProps[] = [
    {
      id: 1,
      mainText: "Sucursal Centro",
      subText: "Av. Principal 123",
      imagePath: "/images/inicio/sucursales.png",
      extraInfo: "Gerente: Ana López | Tel: 123-456-7890",
      route: "/admin/inventario/sucursal-1"
    },
    {
      id: 2,
      mainText: "Sucursal Norte",
      subText: "Calle Norte 456",
      imagePath: "/images/inicio/sucursales.png",
      extraInfo: "Gerente: Carlos Méndez | Tel: 098-765-4321",
      route: "/admin/inventario/sucursal-2"
    },
    {
      id: 3,
      mainText: "Sucursal Sur",
      subText: "Av. Sur 789",
      imagePath: "/images/inicio/sucursales.png",
      extraInfo: "Gerente: Laura Jiménez | Tel: 555-123-4567",
      route: "/admin/inventario/sucursal-3"
    },
    {
      id: 4,
      mainText: "Bodega Central",
      subText: "Zona Norte",
      imagePath: "/images/inicio/bodegas.png",
      extraInfo: "Capacidad: 1000 m² | Responsable: Pedro Ramírez",
      route: "/admin/inventario/bodega-1"
    },
    {
      id: 5,
      mainText: "Bodega Este",
      subText: "Zona Este",
      imagePath: "/images/inicio/bodegas.png",
      extraInfo: "Capacidad: 500 m² | Responsable: Miguel Santos",
      route: "/admin/inventario/bodega-2"
    },
    {
      id: 6,
      mainText: "Bodega Sur",
      subText: "Zona Sur",
      imagePath: "/images/inicio/bodegas.png",
      extraInfo: "Capacidad: 750 m² | Responsable: Laura Jiménez",
      route: "/admin/inventario/bodega-3"
    },
  ];

  const handleCardClick = (cardId: number) => {
    const card = cardData.find(c => c.id === cardId);
    if (card?.route) {
      router.push(card.route);
    }
  };

  const handleCloseModal = () => {
    setOpenCard(null);
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Sucursales y Bodegas</h1>
        <h3 style={textStyle}>
          Bienvenido,{" "}
          <span style={{ fontWeight: "bold" }}>
            {user ? user.name : "Invitado"}
          </span>
          .
        </h3>
        <div style={subtleLineStyle}></div>
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
    fontSize: '0.9rem',
    color: '#f5f5f5',
    opacity: 0.8,
    marginTop: '2px',
    fontWeight: 400,
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

// Modal adaptado para mostrar detalles de la sucursal o bodega seleccionada
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
