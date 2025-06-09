"use client";

import React from "react";
import Image from "next/image";
import logo from "@/styles/images/logo_barra_superior.png";
import exit from "@/styles/images/logout2.png";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const router = useRouter();

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        {/* Botón hamburguesa */}
        <button onClick={onToggleSidebar} style={styles.hamburgerButton}>
          <svg viewBox="0 0 100 80" width="24" height="24" fill="white">
            <rect width="100" height="10" />
            <rect y="30" width="100" height="10" />
            <rect y="60" width="100" height="10" />
          </svg>
        </button>

        <Image src={logo} alt="ConstrUTEM Logo" style={styles.logoImg as React.CSSProperties} />
      </div>

      <div style={styles.right}>
        <span style={styles.userInfo}>
          <span style={styles.userRole}>Vendedor</span>
          <span style={styles.userIcon}>👤</span>
          <span style={styles.userText}>
            <span style={styles.userName}>Usuario</span>
            <span style={styles.userEmail}>vendedor@vendedor.com</span>
          </span>
        </span>
        <Image
          src={exit}
          alt="Cerrar sesión"
          style={styles.logout as React.CSSProperties}
          width={32}
          height={32}
          onClick={() => {
            router.push("/auth/login");
          }}
        />
      </div>
    </header>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    width: '100%',
    height: '58px',
    background: '#373330',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    boxSizing: 'border-box',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
  },
  hamburgerButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    marginRight: '1rem',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userRole: {
    backgroundColor: '#ff8000',
    borderRadius: '20px',
    padding: '8px 15px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
    color: '#222222',
    fontWeight: 'medium',
    fontFamily: 'Roboto, sans-serif',
    fontSize: '0.9375rem',
    whiteSpace: 'nowrap',
  },
  logoImg: {
    height: 'auto',
    maxHeight: '58px',
    objectFit: 'contain',
    width: 'auto',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.25rem 1rem',
  },
  userIcon: {
    background: 'white',
    color: '#1f2937',
    borderRadius: '50%',
    padding: '0.25rem',
    fontSize: '1.1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userText: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: '1.2',
  },
  userName: {
    fontSize: '1rem',
    color: 'white',
  },
  userEmail: {
    fontSize: '0.85rem',
    color: '#a5b4fc',
  },
  logout: {
    fontSize: '1.5rem',
    cursor: 'pointer',
    userSelect: 'none',
  },
};

export default Header;
