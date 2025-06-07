"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import logo from '@/styles/images/logo_barra_superior.png'

import Link from "next/link";

const Register = () => {
  const [nombre, setNombre] = useState<string>("");
  const [correo, setCorreo] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert(`Nombre: ${nombre}\nCorreo: ${correo}\nUsuario: ${username}\nContraseña: ${password}`);
  };

  return (
    <div style={styles.pageBackground}>
      <div style={styles.loginWrapper}>
        <div style={styles.loginBox}>
          <h2 style={styles.title}>Crear nueva cuenta</h2>
          <p
            style={{
              fontSize: "16px",
              textAlign: "center",
              color: "#444",
              marginBottom: "20px",
            }}
          >
            Ingresa tus datos para registrarte en el sistema de la ferretería.
          </p>
            <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="text"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="text"
              placeholder="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
            <button type="submit" style={styles.button}>Crear cuenta</button>
            </form>
          <p style={styles.footerText}>
            ¿Ya tienes una cuenta?{" "}
            <Link href="/auth/login" style={styles.link}>
              Inicia sesión aquí
            </Link>
          </p>
        </div>

        <div style={styles.logoBox}>
          <Image src={logo} alt="Ferretería UTEM" style={styles.logo} />
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  pageBackground: {
    position: 'fixed',  // importante para evitar scroll
    top: 0,
    left: 0,
    height: '100vh',
    width: '100vw',
    background: '#F5F5F5',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',     // oculta scroll interno
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
  },
  loginWrapper: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
    borderRadius: '10px', // opcional: para mejor diseño
  },
  loginBox: {
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '390px',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '20px',
    textAlign: 'center',
    color: '#333',
    fontFamily: '"Montserrat", sans-serif',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '10px',
    marginBottom: '15px',
    fontSize: '16px',
    border: '1px solid #999',
    borderRadius: '5px',
  },
  button: {
    marginTop: '15px',
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: 'none',
    background: '#FF9933',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  logoBox: {
    backgroundColor: '#f1f1f1',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '390px',
  },
  logo: {
    maxWidth: '100%',
    maxHeight: '350px',
    objectFit: 'contain',
    height: 'auto',
    width: 'auto',
  },
};

export default Register;
