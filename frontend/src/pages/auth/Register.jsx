import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerApi } from '../../api';
import './styles/auth.css';

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
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">Kayıt Ol</h2>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">Kayıt başarılı! Yönlendiriliyor...</div>}

        <form onSubmit={handleRegister}>
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
            Kayıt Ol
          </button>
        </form>

        <p className="auth-footer">
          Zaten hesabın var mı?{" "}
          <Link to="/login" className="auth-link">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;