'use client';

import React, { FC, useState } from 'react';
import Link from 'next/link';
import {
  FaHome,
  FaBoxes,
  FaWarehouse,
  FaTruck,
  FaStore,
  FaCog,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa';

const Sidebar: FC = () => {
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>('Sucursal 1');
  const [inventarioAbierto, setInventarioAbierto] = useState<boolean>(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const toggleInventario = () => {
    setInventarioAbierto(!inventarioAbierto);
  };

  const handleMouseEnter = (id: string) => setHoveredItem(id);
  const handleMouseLeave = () => setHoveredItem(null);

  const getMenuItemStyle = (id: string) => ({
    ...styles.menuItem,
    backgroundColor: hoveredItem === id ? '#444' : 'transparent',
    color: hoveredItem === id ? '#00ff99' : 'inherit',
  });

  const getSubMenuItemStyle = (id: string, isActive: boolean) => ({
    ...styles.subMenuItem,
    ...(isActive ? styles.subMenuItemActive : {}),
    backgroundColor: hoveredItem === id ? '#444' : 'transparent',
    color: hoveredItem === id
      ? '#00ff99'
      : isActive
      ? '#00a859'
      : '#bdbdbd',
  });

  return (
    <aside style={styles.sidebar}>
      <Link
        href="/admin/inicio"
        style={getMenuItemStyle('inicio')}
        onMouseEnter={() => handleMouseEnter('inicio')}
        onMouseLeave={handleMouseLeave}
      >
        <FaHome />
        <span>Inicio</span>
      </Link>

      <div
        style={getMenuItemStyle('inventario')}
        onClick={toggleInventario}
        onMouseEnter={() => handleMouseEnter('inventario')}
        onMouseLeave={handleMouseLeave}
      >
        <FaBoxes />
        <span style={{ flex: 1 }}>Inventario</span>
        {inventarioAbierto ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
      </div>

      {inventarioAbierto && (
        <div style={styles.subMenu}>
          {['Sucursal 1', 'Sucursal 2', 'Sucursal 3'].map((sucursal, i) => {
            const slug = `sucursal-${i + 1}`;
            const isActive = sucursal === sucursalSeleccionada;
            return (
              <Link
                key={sucursal}
                href={`/admin/inventario/${slug}`}
                style={getSubMenuItemStyle(slug, isActive)}
                onClick={() => setSucursalSeleccionada(sucursal)}
                onMouseEnter={() => handleMouseEnter(slug)}
                onMouseLeave={handleMouseLeave}
              >
                {sucursal}
              </Link>
            );
          })}
        </div>
      )}

      <Link
        href="/admin/bodega"
        style={getMenuItemStyle('bodega')}
        onMouseEnter={() => handleMouseEnter('bodega')}
        onMouseLeave={handleMouseLeave}
      >
        <FaWarehouse />
        <span>Bodega</span>
      </Link>
      <Link
        href="/admin/proveedores"
        style={getMenuItemStyle('proveedores')}
        onMouseEnter={() => handleMouseEnter('proveedores')}
        onMouseLeave={handleMouseLeave}
      >
        <FaTruck />
        <span>Proveedores</span>
      </Link>
      <Link
        href="/admin/sucursales"
        style={getMenuItemStyle('sucursales')}
        onMouseEnter={() => handleMouseEnter('sucursales')}
        onMouseLeave={handleMouseLeave}
      >
        <FaStore />
        <span>Sucursales</span>
      </Link>
      <Link
        href="/admin/configuracion"
        style={getMenuItemStyle('config')}
        onMouseEnter={() => handleMouseEnter('config')}
        onMouseLeave={handleMouseLeave}
      >
        <FaCog />
        <span>Configuración</span>
      </Link>
    </aside>
  );
};

const styles: {
  sidebar: React.CSSProperties;
  menuItem: React.CSSProperties;
  subMenu: React.CSSProperties;
  subMenuItem: React.CSSProperties;
  subMenuItemActive: React.CSSProperties;
} = {
  sidebar: {
    width: '180px',
    height: '100vh',
    backgroundColor: '#2f2f2f',
    color: 'white',
    paddingTop: '90px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
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
    color: 'inherit',
    transition: 'background-color 0.2s, color 0.2s',
  },
  subMenu: {
    paddingLeft: '30px',
    display: 'flex',
    flexDirection: 'column',
  },
  subMenuItem: {
    padding: '8px 12px',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#bdbdbd',
    textDecoration: 'none',
    transition: 'background-color 0.2s, color 0.2s',
    borderRadius: '4px',
  },
  subMenuItemActive: {
    fontWeight: 'bold',
    color: '#00a859',
  },
};

export default Sidebar;