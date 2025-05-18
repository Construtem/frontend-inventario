import React, { useState } from 'react';
import logo from '../styles/images/contrutem.png'; // Logo
import { Link } from 'react-router-dom'; // Asegúrate de importar esto arriba

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Username: ${username}\nPassword: ${password}`);
  };

  return (
    <div style={styles.pageBackground}>
      <div style={styles.loginWrapper}>
        <div style={styles.loginBox}>
          <h2 style={styles.title}>Ferreteria ConstrUTEM</h2>
          <p style={{
            fontSize: '16px',
            textAlign: 'center',
            color: '#444',
            marginBottom: '20px'
          }}>
            Bienvenido administrador. Inicia sesión para gestionar el inventario, pedidos y configuraciones del sistema.
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
            <Link to="/recover" style={{ color: '#007bff', textDecoration: 'none', cursor: 'pointer' }}>
                ¿Olvidaste tu contraseña?
            </Link>
            <p style={{ textAlign: 'center', marginTop: '10px' }}>
              ¿No tienes una cuenta? <Link to="/register" style={{ color: '#007bff', textDecoration: 'none' }}>Regístrate aquí</Link>
          </p>
          </form>
            <button type="submit" style={styles.button}>Iniciar sesión</button>
        </div>

        <div style={styles.logoBox}>
          <img src={logo} alt="Ferretería UTEM" style={styles.logo} />
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageBackground: {
    height: '100vh',
    width: '100vw',
    // Mezcla de verde lima, azul marino, azul oscuro y verde oscuro en un gradiente
    background: 'linear-gradient(90deg, #003366 0%, #00A859 60%, #FFFFFF 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginWrapper: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
  },
  loginBox: {
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '390px',
    height: '350px',
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
  forgotLink: {
    textAlign: 'right',
    fontSize: '12px',
    marginBottom: '15px',
    color: '#007bff',
    textDecoration: 'none',
  },
  button: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: 'none',
    // Mezcla de verde lima, azul marino, azul oscuro y verde oscuro en un gradiente
    background: ' #00A859',
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
  },
};

export default Login;
