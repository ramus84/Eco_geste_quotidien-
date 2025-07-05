import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import axiosInstance from '../axiosConfig';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Gère la saisie des champs
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Gère la soumission du formulaire
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.email || !form.password) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post('/users/login', form);
      // Stocke le token JWT dans le localStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('userId', res.data.userId);
      setSuccess('Connexion réussie ! Redirection...');
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      if (err.message.includes('404') || err.message.includes('Ressource non trouvée')) {
        setError("La route de connexion n'existe pas côté serveur. Vérifiez que le backend est bien démarré et que la route /api/users/login est accessible.");
      } else {
        setError(err.response?.data?.error || "Erreur lors de la connexion");
      }
    }
    setLoading(false);
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">Connexion</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-label">
          <FaEnvelope className="auth-icon" /> Email
          <input type="email" name="email" value={form.email} onChange={handleChange} className="auth-input" autoComplete="email" />
        </label>
        <label className="auth-label">
          <FaLock className="auth-icon" /> Mot de passe
          <input type="password" name="password" value={form.password} onChange={handleChange} className="auth-input" autoComplete="current-password" />
        </label>
        <button type="submit" className="auth-btn" disabled={loading}>{loading ? 'Connexion...' : 'Se connecter'}</button>
      </form>
      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}
      <div className="auth-link">Pas encore de compte ? <a href="/register">Créer un compte</a></div>
      <div className="auth-link"><a href="/forgot-password">Mot de passe oublié ?</a></div>
    </div>
  );
};

export default Login;
