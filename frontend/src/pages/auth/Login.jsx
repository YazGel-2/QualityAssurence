import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginApi } from '../../api';
import './styles/auth.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await loginApi({ username, password });

      // Tainted data storage güvenliği için veri kontrolü
      if (
        response &&
        typeof response.token === 'string' &&
        response.token.trim().length > 0
      ) {
        localStorage.setItem('token', response.token);
        navigate('/dashboard');
      } else {
        setError('Sunucudan geçersiz yanıt alındı.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">Giriş Yap</h2>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          <input  
            type="text"
            placeholder="Kullanıcı Adı"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required 
            className="auth-input"
          />
          <input 
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            className="auth-input"
          />

          <button type="submit" className="auth-button">
            Giriş Yap
          </button>
        </form>

        <p className="auth-footer">
          Hesabın yok mu?{" "}
          <Link to="/register" className="auth-link">
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;