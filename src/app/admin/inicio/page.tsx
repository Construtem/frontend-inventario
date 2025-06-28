"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface CardProps {
  id: number;
  mainText: string;
  subText: string;
  imagePath: string;
}

interface UserData {
  name: string;
  email: string;
  photoURL: string;
  rol: string;
}

export default function InicioPage() {
  const [user, setUser] = useState<UserData | null>(null);

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
  }, []);

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
    { id: 13, mainText: '10', subText: 'Usuarios registrados', imagePath: '/images/inicio/usuarios_registrados.png' },
  ];

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Inicio</h1>
        <h3 style={textStyle}>
          Bienvenido a su panel de gestión,{" "}
          <span style={{ fontWeight: "bold" }}>
            {user ? user.name : "Invitado"}
          </span>
          !
        </h3>
        <div style={subtleLineStyle}></div>
        <h1 style={titleStyle}>Resumen general</h1>
        <div style={cardGridStyle}>
          {cardData.map((card) => (
            <Card key={card.id} {...card} />
          ))}
        </div>
      </div>
    </div>
  );
}

const Card: React.FC<CardProps> = ({ mainText, subText, imagePath }) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardContainerStyle: React.CSSProperties = {
    backgroundColor: '#FF7300',
    borderRadius: '20px',
    padding: '20px',
    width: '250px',
    height: '120px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    fontFamily: 'Montserrat, sans-serif',
    ...(isHovered ? {
      transform: 'scale(1.1)',
      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)',
      opacity: 1.2,
    } : {})
  };

  const imageStyle = {
    opacity: isHovered ? 1 : 0.5,
    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
    transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
    marginLeft: '15px',
  };

  return (
    <div
      style={cardContainerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        flexGrow: 1,
      }}>
        <p style={{
          fontSize: '1.125rem',
          marginBottom: '5px',
          fontWeight: 'medium',
          color: '#222222',
        }}>{mainText}</p>
        <p style={{
          fontSize: '1.125rem',
          fontWeight: 'medium',
          opacity: 0.8,
          color: '#222222',
        }}>{subText}</p>
      </div>

      <Image
        src={imagePath}
        alt={subText}
        width={75}
        height={75}
        style={imageStyle}
      />
    </div>
  );
};

// === Estilos Globales ===

const containerStyle: React.CSSProperties = {
  padding: "2rem",
  boxSizing: "border-box",
  minHeight: "calc(100vh - 70px)",
  backgroundColor: "#f5f5f5",
  borderRadius: '20px',
  marginTop: "40px",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "white",
  borderRadius: "12px",
  padding: "2rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const cardGridStyle: React.CSSProperties = {
  display: 'grid',
  gap: '29.8px',
  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
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
