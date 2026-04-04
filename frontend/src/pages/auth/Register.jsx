import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerApi } from '../../api';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    try {
      await registerApi({ username, password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Kayıt Ol</h2>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>Kayıt başarılı! Yönlendiriliyor...</div>}

        <form onSubmit={handleRegister}>
          <input 
            type="text"
            placeholder="Kullanıcı Adı"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required 
            style={styles.input}
          />
          <input 
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Kayıt Ol
          </button>
        </form>

        <p style={styles.footer}>
          Zaten hesabın var mı?{" "}
          <Link to="/login" style={styles.link}>
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#f3f4f6',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    background: '#fff',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  title: {
    marginBottom: '24px',
  },
  input: {
    width: '90%',
    padding: '14px',
    marginBottom: '16px',
    borderRadius: '10px',
    border: '1px solid #ddd',
    background: '#f9fafb',
    fontSize: '14px',
  },
  button: {
    width: '100%',
    padding: '14px',
    borderRadius: '999px',
    border: 'none',
    background: '#111',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
  },
  footer: {
    marginTop: '20px',
    fontSize: '14px',
    color: '#666',
  },
  link: {
    color: '#111',
    fontWeight: '600',
    textDecoration: 'none',
  },
  error: {
    background: '#fee2e2',
    color: '#b91c1c',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
  },
};

export default Register;