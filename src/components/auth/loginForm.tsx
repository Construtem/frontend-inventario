"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/styles/images/contrutem.png"; // Ajusta la ruta si cambia

const Login = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert(`Username: ${username}\nPassword: ${password}`);
  };

  return (
    <div style={styles.pageBackground}>
      <div style={styles.loginWrapper}>
        <div style={styles.loginBox}>
          <h2 style={styles.title}>Ferretería ConstrUTEM</h2>
          <p
            style={{
              fontSize: "16px",
              textAlign: "center",
              color: "#444",
              marginBottom: "20px",
            }}
          >
            Bienvenido administrador. Inicia sesión para gestionar el inventario,
            pedidos y configuraciones del sistema.
          </p>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="text"
              placeholder="Usuario"
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
            <Link
              href="/auth/recover-password"
              style={{
                color: "#007bff",
                textDecoration: "none",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
            <p style={{ textAlign: "center", marginTop: "10px", fontSize: "14px" }}>
              ¿No tienes una cuenta?{" "}
              <Link href="/auth/register" style={{ color: "#007bff", textDecoration: "none" }}>
                Regístrate aquí
              </Link>
            </p>
            <button type="submit" style={styles.button}>Iniciar sesión</button>
          </form>
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
    background: 'linear-gradient(90deg, #003366 0%, #00A859 60%, #FFFFFF 100%)',
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
    background: '#00A859',
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

export default Login;
