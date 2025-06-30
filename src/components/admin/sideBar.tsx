'use client';

import React, { FC, useState, CSSProperties } from 'react';
import Link from 'next/link';
import {
  FaHome,
  FaBoxes,
  FaStore,
  FaCog,
  FaChevronDown,
  FaChevronUp,
  FaTruck,
} from 'react-icons/fa';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: FC<SidebarProps> = ({ isOpen }) => {
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>('Sucursal 1');
  const [inventarioAbierto, setInventarioAbierto] = useState<boolean>(false);
  const [bodegaAbierta, setBodegaAbierta] = useState<boolean>(false);
  const [proveedoresAbierto, setProveedorAbierto] = useState<boolean>(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const toggleInventario = () => setInventarioAbierto(!inventarioAbierto);
  const toggleBodegas = () => setBodegaAbierta(!bodegaAbierta);
  const toggleProveedores = () => setProveedorAbierto(!proveedoresAbierto);

  const handleMouseEnter = (id: string) => setHoveredItem(id);
  const handleMouseLeave = () => setHoveredItem(null);

  const getMenuItemStyle = (id: string): CSSProperties => ({
    ...styles.menuItem,
    backgroundColor: hoveredItem === id ? '#FF7A00' : 'transparent',
    color: hoveredItem === id ? '#000000' : 'inherit',
  });

  const getSubMenuItemStyle = (id: string, isActive: boolean): CSSProperties => ({
    ...styles.subMenuItem,
    ...(isActive ? styles.subMenuItemActive : {}),
    backgroundColor: hoveredItem === id ? '#FF7A00' : 'transparent',
    color: hoveredItem === id
      ? '#000000'
      : isActive
      ? '#000000'
      : '#bdbdbd',
  });

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

      <div
        style={getMenuItemStyle('bodega')}
        onClick={toggleBodegas}
        onMouseEnter={() => handleMouseEnter('bodega')}
        onMouseLeave={handleMouseLeave}
      >
        <FaBoxes />
        <span style={{ flex: 1 }}>Bodega</span>
        {bodegaAbierta ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
      </div>

      {bodegaAbierta && (
        <div style={styles.subMenu}>
          {[
            { name: 'Bodega general', path: '/admin/bodega/bodega-general' },
            { name: 'Lista de bodegas', path: '/admin/bodega/lista-de-bodegas' },
          ].map((item) => {
            const isActive =
              typeof window !== 'undefined' && window.location.pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                style={getSubMenuItemStyle(item.path, isActive)}
                onMouseEnter={() => handleMouseEnter(item.path)}
                onMouseLeave={handleMouseLeave}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      )}

      <div
        style={getMenuItemStyle('proveedores')}
        onClick={toggleProveedores}
        onMouseEnter={() => handleMouseEnter('proveedores')}
        onMouseLeave={handleMouseLeave}
      >
        <FaBoxes />
        <span style={{ flex: 1 }}>Proveedores</span>
        {proveedoresAbierto ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
      </div>

      {proveedoresAbierto && (
        <div style={styles.subMenu}>
          {[
            {
              name: 'Inventario de proveedores',
              path: '/admin/proveedores/inventario-de-proveedores',
            },
            {
              name: 'Gestión de proveedores',
              path: '/admin/proveedores/gestion-de-proveedores',
            },
          ].map((item) => {
            const isActive =
              typeof window !== 'undefined' && window.location.pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                style={getSubMenuItemStyle(item.path, isActive)}
                onMouseEnter={() => handleMouseEnter(item.path)}
                onMouseLeave={handleMouseLeave}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      )}

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
        href="/admin/despacho"
        style={getMenuItemStyle('despacho')}
        onMouseEnter={() => handleMouseEnter('despacho')}
        onMouseLeave={handleMouseLeave}
      >
        <FaTruck />
        <span>Despacho</span>
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
    color: '#rgb(189, 189, 189)',
    textDecoration: 'none',
    transition: 'background-color 0.2s, color 0.2s',
    borderRadius: '4px',
  },
  subMenuItemActive: {
    fontWeight: 'bold',
    color: '#rgb(189, 189, 189)',
  },
};

export default Sidebar;
