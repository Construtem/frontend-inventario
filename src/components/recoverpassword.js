import React, { useState } from 'react';
import logo from '../styles/images/contrutem.png';
import { Link } from 'react-router-dom';

const RecoverPassword = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Se ha enviado un enlace de recuperación a: ${email}`);
  };

  return (
    <div style={styles.pageBackground}>
      <div style={styles.recoverWrapper}>
        <div style={styles.recoverBox}>
          <h2 style={styles.title}>Recuperar Contraseña</h2>
          <p style={{
            fontSize: '16px',
            textAlign: 'center',
            color: '#444',
            marginBottom: '20px'
          }}>
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </p>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
            <button type="submit" style={styles.button}>Enviar enlace</button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '10px' }}>
            ¿Recordaste tu contraseña? <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>Inicia sesión aquí</Link>
          </p>
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
    background: 'linear-gradient(90deg, #003366 0%, #00A859 60%, #FFFFFF 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recoverWrapper: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
  },
  recoverBox: {
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '390px',
    height: '300px',
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
  },
};

export default RecoverPassword;
