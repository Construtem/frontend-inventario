import React, { useState } from 'react';
import logo from '../styles/images/contrutem.png'; // Logo

const Register = () => {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Nombre: ${nombre}\nCorreo: ${correo}\nUsuario: ${username}\nContraseña: ${password}`);
  };

  return (
    <div style={styles.pageBackground}>
      <div style={styles.loginWrapper}>
        <div style={styles.loginBox}>
          <h2 style={styles.title}>Registro de Administrador</h2>
          <p style={{
            fontSize: '16px',
            textAlign: 'center',
            color: '#444',
            marginBottom: '20px',
            fontFamily: '"Montserrat", sans-serif'
          }}>
            Completa el formulario para crear una nueva cuenta de administrador en el sistema de la ferretería.
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
            <button type="submit" style={styles.button}>Registrar</button>
          </form>
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

export default Register;
