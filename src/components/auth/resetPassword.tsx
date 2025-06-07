"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from '@/styles/images/logo_barra_superior.png'

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden. Intenta nuevamente.");
      return;
    }

    alert("Contraseña restablecida exitosamente.");
    // Aquí iría la lógica para enviar al backend
  };

  return (
    <div style={styles.pageBackground}>
      <div style={styles.wrapper}>
        <div style={styles.box}>
          <h2 style={styles.title}>Nueva contraseña</h2>
          <p style={styles.description}>
            Escribe y confirma tu nueva contraseña para actualizar el acceso a tu cuenta.
          </p>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
              required
            />
            <button type="submit" style={styles.button}>Restablecer</button>
          </form>
          <p style={styles.footerText}>
            ¿Ya tienes una cuenta?{" "}
            <Link href="/auth/login" style={styles.link}>
              Inicia sesión aquí
            </Link>
          </p>
        </div>

        <div style={styles.logoBox}>
          <Image src={logo} alt="Ferretería UTEM" style={styles.logo as React.CSSProperties} />
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  pageBackground: {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    width: "100vw",
    background: '#F5F5F5',
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    margin: 0,
    padding: 0,
    boxSizing: "border-box",
  },
  wrapper: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
    borderRadius: "10px",
    overflow: "hidden",
  },
  box: {
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    width: "390px",
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "20px",
    textAlign: "center",
    color: "#333",
    fontFamily: '"Montserrat", sans-serif',
  },
  description: {
    fontSize: "16px",
    textAlign: "center",
    color: "#444",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "10px",
    marginBottom: "15px",
    fontSize: "16px",
    border: "1px solid #999",
    borderRadius: "5px",
  },
  button: {
    marginTop: "15px",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "none",
    background: '#FF9933',
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  footerText: {
    textAlign: "center",
    marginTop: "10px",
    fontSize: "14px",
    color: "#333",
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
  },
  logoBox: {
    backgroundColor: "#f1f1f1",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "390px",
  },
  logo: {
    maxWidth: "100%",
    maxHeight: "350px",
    objectFit: "contain",
    height: "auto",
    width: "auto",
  },
};

export default ResetPassword;
