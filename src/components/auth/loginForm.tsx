"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../../firebase";
import logo from '@/styles/images/logo_barra_superior.png'
import google_sign_in from "@/styles/images/logo_google.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [googleError, setGoogleError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fadeOut, setFadeOut] = useState(false); // para animar el mensaje
  const router = useRouter();

  const allowedEmail = "jriquelme@utem.cl"; //CAMBIAR GMAIL PARA LA DEMOSTRACION ESTE ES PARA EL ADMINISTRADOR

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert(`Username: ${username}\nPassword: ${password}`);
  };

  const handleGoogleLogin = async () => {
    setGoogleError("");
    setFadeOut(false);
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.email) {
        setGoogleError("No se pudo obtener el correo del usuario.");
        return;
      }

      if (user.email !== allowedEmail) {
        setGoogleError("Este correo no está registrado como usuario autorizado en el sistema.");
        return;
      }

      localStorage.setItem("user", JSON.stringify({
        name: user.displayName,
        email: user.email,
        uid: user.uid,
        photoURL: user.photoURL,
      }));

      router.push("/admin/inicio");
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        setGoogleError("El inicio de sesión fue cancelado.");
      } else {
        setGoogleError("Error al iniciar sesión con Google.");
      }
      console.error("Error en Google Login:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (googleError) {
      setFadeOut(false);
      const fadeTimer = setTimeout(() => setFadeOut(true), 3000); 
      const clearTimer = setTimeout(() => setGoogleError(""), 5000); 
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [googleError]);

  return (
    <div style={styles.pageBackground}>
      <div style={styles.loginWrapper}>
        <div style={styles.loginBox}>
          <h2 style={styles.title}>Accede al sistema de gestión</h2>
          <p style={{
            fontSize: "16px",
            textAlign: "center",
            color: "#444",
            marginBottom: "20px",
          }}>
            Por favor ingresa con tus credenciales de administrador o vendedor para acceder al sistema de gestión.
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

            <Link href="/auth/recover-password" style={styles.link}>
              ¿Olvidaste tu contraseña?
            </Link>

            <p style={{ textAlign: "center", marginTop: "10px", fontSize: "14px" }}>
              ¿No tienes una cuenta?{" "}
              <Link href="/auth/register" style={{ color: "#007bff", textDecoration: "none" }}>
                Regístrate aquí
              </Link>
            </p>

            <button type="submit" style={styles.button}>
              Iniciar sesión
            </button>

            <button
              type="button"
              style={styles.googleButton}
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <Image
                src={google_sign_in}
                alt="Continuar con Google"
                style={styles.googleIcon}
                width={24}
                height={24}
              />
              <span style={{ marginLeft: "10px" }}>
                {loading ? "Autenticando..." : "Continuar con Google"}
              </span>
            </button>

            {googleError && (
              <p
                style={{
                  ...styles.fadeOutMessage,
                  ...(fadeOut ? styles.hiddenMessage : {}),
                  color: "red",
                  marginTop: "10px",
                  textAlign: "center",
                }}
              >
                {googleError}
              </p>
            )}
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
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: '100vw',
    background: '#F5F5F5',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
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
    borderRadius: '10px',
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
  googleButton: {
    marginTop: '10px',
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    background: '#fff',
    color: '#444',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  googleIcon: {
    display: 'inline-block',
    verticalAlign: 'middle',
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
    cursor: "pointer",
    fontSize: "14px",
    marginBottom: "10px",
  },
  fadeOutMessage: {
    opacity: 1,
    transition: "opacity 0.8s ease-in-out",
  },
  hiddenMessage: {
    opacity: 0,
  }
};

export default Login;