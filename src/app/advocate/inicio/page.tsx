"use client";

import React from "react";
import clientesIcon from '@/styles/images/inicio/clientes.png';
import bodegasIcon from '@/styles/images/inicio/bodegas.png';
import existenciasIcon from '@/styles/images/inicio/existencias.png';
import facturasIcon from '@/styles/images/inicio/facturas.png';
import pedidosIcon from '@/styles/images/inicio/pedidos.png';
import productosIcon from '@/styles/images/inicio/productos.png';
import proveedoresIcon from '@/styles/images/inicio/proveedores.png';
import sucursalesIcon from '@/styles/images/inicio/sucursales.png';
import usuariosIcon from '@/styles/images/inicio/usuarios_registrados.png';
import ventasIcon from '@/styles/images/inicio/ventas.png';

interface CardProps {
  id: number;
  mainText: string;
  subText: string;
  imageUrl?: string;
}

export default function InicioPage() {

  const cardData = [
    
    { id: 1, mainText: '12', subText: 'Clientes', imageUrl: clientesIcon.src},
    { id: 2, mainText: '20', subText: 'Proveedores', imageUrl: proveedoresIcon.src},
    { id: 3, mainText: '4', subText: 'Bodegas', imageUrl: bodegasIcon.src },    
    { id: 4, mainText: '100', subText: 'Productos registrados', imageUrl: productosIcon.src }, 
    { id: 5, mainText: '25', subText: 'Productos disponibles', imageUrl: productosIcon.src},
    { id: 6, mainText: '25', subText: 'Productos no disponibles', imageUrl: productosIcon.src}, 
    { id: 7, mainText: '50', subText: 'Pedidos', imageUrl: pedidosIcon.src },   
    { id: 8, mainText: '50', subText: 'Facturas emitidas', imageUrl: facturasIcon.src }, 
    { id: 9, mainText: '150', subText: 'Existencia total', imageUrl: existenciasIcon.src },  
    { id: 10, mainText: '100', subText: 'Existencia vendida', imageUrl: existenciasIcon.src },  
    { id: 11, mainText: '5', subText: 'Sucursales', imageUrl: sucursalesIcon.src},  
    { id: 12, mainText: '50', subText: 'Ventas', imageUrl: ventasIcon.src }, 
    { id: 13, mainText: '10', subText: 'Usuarios registrados', imageUrl: usuariosIcon.src }, 
  ];

  return (
  <div style={containerStyle}>
    <div style={cardStyle}>
        <h1 style={titleStyle}>Inicio</h1>
        <h3 style={textStyle}>Bienvenido a su panel de gestión, (nombre de usuario)!</h3>
        <div style={subtleLineStyle}></div>
        <h1 style={titleStyle}>Resumen general</h1>

        <div style={cardGridStyle}>
        {cardData.map(card => (
                <Card
                  key={card.id}
                  id={card.id}
                  mainText={card.mainText}
                  subText={card.subText}
                  imageUrl={card.imageUrl}/>
              ))}
        </div> 
    </div>
  </div>
  );
}

// --- CSS en JS ---
const containerStyle: React.CSSProperties = {
  marginLeft: "180px", // ancho del sidebar
  marginTop: "70px",   // alto del header
  borderRadius:"20px",
  padding: "2rem",
  boxSizing: "border-box",
  minHeight: "calc(100vh - 70px)",
  backgroundColor: "#f5f5f5",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "white",
  borderRadius: "12px",
  padding: "2rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

//Formato de la card
const Card: React.FC<CardProps> = ({ id, mainText, subText, imageUrl }) => {

  const [isHovered, setIsHovered] = React.useState(false);  

  const cardContainerStyle: React.CSSProperties = {
    backgroundColor: '#FF7300',
    //backgroundImage: 'linear-gradient(90deg, #007070 0%, #008C8C 100%)', //degradado verde utem hacia un tono más claro
    //backgroundImage: 'linear-gradient(90deg, #007070 10%, #004D4D 50%, #003333 200%)', //degradado verde utem hacia un tono más azul oscuro
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
    fontFamily: 'Montserrat, sans-serif'
    };

  //Estilo para imágenes dentro de la card
  const cardImageStyle: React.CSSProperties = {
    width: '75px', // Ancho de la imagen
    height: '75px', // Alto de la imagen
    objectFit: 'contain', 
    marginLeft: '15px',
    opacity: 0.5,
    transition: 'transform 0.3s ease-out, opacity 0.3s ease-out', 
  };

  //Animación para la imagen de la card cuando está en hover
  const cardImageHoverStyle: React.CSSProperties = {
    transform: 'scale(1.1)',
    opacity: 1.2, 
  };

  const cardImageCombinedStyle: React.CSSProperties = {
    ...cardImageStyle,
    ...(isHovered ? cardImageHoverStyle : {}), // Aplica cardImageHoverStyle si isHovered es true
  };

  //Animación hover para la card
  const cardHoverStyle: React.CSSProperties = {
    transform: 'scale(1.1)', // Agranda la card un 10%
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)',
    opacity: 1.2, 
  };

  const cardContainerCombinedStyle: React.CSSProperties = {
    ...cardContainerStyle,
    ...(isHovered ? cardHoverStyle : {}),
  };

  const cardMainTextStyle: React.CSSProperties = {
    fontSize: '1.125rem',
    marginBottom: '5px',
    fontWeight:'medium',
    color: '#222222',
  };

  const cardSubTextStyle: React.CSSProperties = {
    fontSize: '1.125rem',
    fontWeight: 'medium',
    opacity: 0.8,
    color: '#222222',
  };

  const textContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column', 
    justifyContent: 'center',
    flexGrow: 1, 

  };

  return (
    <div
      key={id}
      style={cardContainerCombinedStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={textContainerStyle}>
        <p style={cardMainTextStyle}>{mainText}</p>
        <p style={cardSubTextStyle}>{subText}</p>
      </div>

      {imageUrl && (
        <img
          src={imageUrl}
          alt={mainText}
          style={cardImageCombinedStyle}
        />
      )}
    </div>
  );
};

const cardGridStyle: React.CSSProperties = {
  display: 'grid',
  gap: '20px',
  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
};

const titleStyle: React.CSSProperties = {
  color:'#222222',
  fontSize: "2rem",
  fontWeight: "bold",
  marginBottom: "2rem",
  fontFamily: 'Montserrat, sans-serif',
};

const textStyle: React.CSSProperties = {
  color: "#222222",
  fontSize: "1rem",
  fontWeight:"regular",
  lineHeight: "1.6",
  fontFamily: 'Roboto, sans-serif',
};

//Línea divisoria de Inicio y Resumen general
const subtleLineStyle: React.CSSProperties = {
  backgroundColor: '#e0e0e0', // Color gris muy claro
  height: '1px', // Altura de la línea
  opacity: 0.7,
  margin: '20px 0', // Espacio arriba y abajo
};