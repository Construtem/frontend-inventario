'use client';

import React, { FC, useState, CSSProperties, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaHome,
  FaBoxes,
  FaStore,
  FaChevronDown,
  FaChevronUp,
  FaTruck,
  FaUsers,
} from 'react-icons/fa';

interface SidebarProps {
  isOpen: boolean;
}

const keyframes = `
  @keyframes slideDown {
    from {
      opacity: 0;
      max-height: 0;
    }
    to {
      opacity: 1;
      max-height: 500px;
    }
  }
`;

const Sidebar: FC<SidebarProps> = ({ isOpen }) => {
  const pathname = usePathname();
  const [bodegaAbierta, setBodegaAbierta] = useState<boolean>(false);
  const [proveedoresAbierto, setProveedorAbierto] = useState<boolean>(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Función para cerrar todos los menús
  const closeAllMenus = () => {
    setBodegaAbierta(false);
    setProveedorAbierto(false);
  };

  const toggleBodegas = () => {
    closeAllMenus();
    setBodegaAbierta(!bodegaAbierta);
  };

  const toggleProveedores = () => {
    closeAllMenus();
    setProveedorAbierto(!proveedoresAbierto);
  };

  const handleMouseEnter = (id: string) => setHoveredItem(id);
  const handleMouseLeave = () => setHoveredItem(null);

  const isRouteActive = (path: string): boolean => {
    return pathname === path;
  };

  const isMenuActive = (basePath: string): boolean => {
    return pathname.startsWith(basePath);
  };

  useEffect(() => {
    // Primero cerramos todos los menús
    closeAllMenus();
    
    // Luego abrimos solo el menú correspondiente a la ruta actual
    const path = pathname.toLowerCase();

    if (path.includes('/bodega/')) {
      setBodegaAbierta(true);
    } else if (path.includes('/proveedores/')) {
      setProveedorAbierto(true);
    }
  }, [pathname]);

  const getMenuItemStyle = (id: string, basePath?: string, hasSubmenu: boolean = false): CSSProperties => ({
    ...styles.menuItem,
    backgroundColor: hoveredItem === id 
      ? '#FF7A00' 
      : (!hasSubmenu && basePath && isMenuActive(basePath))
        ? '#FF7A00'
        : 'transparent',
    color: (hoveredItem === id || (!hasSubmenu && basePath && isMenuActive(basePath))) 
      ? '#000000' 
      : 'inherit',
  });

  const getSubMenuItemStyle = (path: string): CSSProperties => ({
    ...styles.subMenuItem,
    backgroundColor: hoveredItem === path 
      ? '#FF7A00' 
      : isRouteActive(path)
        ? '#FF7A00' 
        : 'transparent',
    color: (hoveredItem === path || isRouteActive(path))
      ? '#000000'
      : '#bdbdbd',
    
  });

  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = keyframes;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <aside
      style={{
        ...styles.sidebar,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease-in-out',
      }}
    >
      <Link
        href="/admin/inicio"
        style={getMenuItemStyle('inicio', '/admin/inicio')}
        onMouseEnter={() => handleMouseEnter('inicio')}
        onMouseLeave={handleMouseLeave}
      >
        <FaHome />
        <span>Inicio</span>
      </Link>
      
      <Link
        href="/admin/Gestion-usuarios"
        style={getMenuItemStyle('gestion-usuarios', '/admin/Gestion-usuarios')}
        onMouseEnter={() => handleMouseEnter('gestion-usuarios')}
        onMouseLeave={handleMouseLeave}
      >
        <FaUsers />
        <span>Usuarios</span>
      </Link>

      <Link
        href="/admin/inventario"
        style={getMenuItemStyle('inventario', '/admin/inventario')}
        onMouseEnter={() => handleMouseEnter('inventario')}
        onMouseLeave={handleMouseLeave}
      >
        <FaBoxes />
        <span>Inventario</span>
      </Link>

      <div
        style={getMenuItemStyle('proveedores', '/admin/proveedores', true)}
        onClick={toggleProveedores}
        onMouseEnter={() => handleMouseEnter('proveedores')}
        onMouseLeave={handleMouseLeave}
      >
        <FaBoxes />
        <span style={{ flex: 1 }}>Proveedores</span>
        {proveedoresAbierto ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
      </div>

      <div style={{
        ...styles.subMenu,
        ...(proveedoresAbierto ? styles.subMenuOpen : {}),
      }}>
        {[
          {
            name: 'Inventario de proveedores',
            path: '/admin/proveedores/inventario-de-proveedores',
          },
          {
            name: 'Gestión de proveedores',
            path: '/admin/proveedores/gestion-de-proveedores',
          },
        ].map((item) => (
          <Link
            key={item.name}
            href={item.path}
            style={{
              ...getSubMenuItemStyle(item.path),
              backgroundColor: hoveredItem === item.path 
                ? '#FF7A00' 
                : isRouteActive(item.path)
                  ? '#FF7A00' 
                  : 'transparent',
              color: (hoveredItem === item.path || isRouteActive(item.path))
                ? '#000000'
                : '#bdbdbd',
            }}
            onMouseEnter={() => handleMouseEnter(item.path)}
            onMouseLeave={handleMouseLeave}
          >
            {item.name}
          </Link>
        ))}
      </div>

      <Link
        href="/admin/sucursales"
        style={getMenuItemStyle('sucursales', '/admin/sucursales')}
        onMouseEnter={() => handleMouseEnter('sucursales')}
        onMouseLeave={handleMouseLeave}
      >
        <FaStore />
        <span>Sucursales</span>
      </Link>

      <Link
        href="/admin/despacho"
        style={getMenuItemStyle('despacho', '/admin/despacho')}
        onMouseEnter={() => handleMouseEnter('despacho')}
        onMouseLeave={handleMouseLeave}
      >
        <FaTruck />
        <span>Despacho</span>
      </Link>
    </aside>
  );
};

const styles: Record<string, CSSProperties> = {
  sidebar: {
    width: '180px',
    height: '100vh',
    backgroundColor: '#2d2d2d',
    color: 'white',
    paddingTop: '90px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 40,
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '15px 20px',
    cursor: 'pointer',
    fontSize: '15px',
    userSelect: 'none',
    textDecoration: 'none',
    transition: 'all 0.2s ease-in-out',
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 'bold',
    width: '100%',
    boxSizing: 'border-box',
    margin: 0,
  },
  subMenu: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    maxHeight: '0',
    opacity: '0',
    transition: 'all 0.3s ease-in-out',
    width: '100%',
    padding: 0,
    margin: 0,
  },
  subMenuOpen: {
    maxHeight: '500px',
    opacity: '1',
  },
  subMenuItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '15px 20px 15px 40px',
    fontSize: '13px',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.2s ease-in-out',
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 'bold',
    width: '100%',
    boxSizing: 'border-box',
    margin: 0,
  },
};

export default Sidebar;