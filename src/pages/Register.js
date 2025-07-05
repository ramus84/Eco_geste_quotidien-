import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import axiosInstance from '../axiosConfig';

const Register = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
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
    if (!form.username || !form.email || !form.password) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post('/users/register', form);
      setSuccess('Inscription réussie ! Redirection...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription");
    }
    setLoading(false);
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">Créer un compte</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-label">
          <FaUser className="auth-icon" /> Nom d'utilisateur
          <input type="text" name="username" value={form.username} onChange={handleChange} className="auth-input" autoComplete="username" />
        </label>
        <label className="auth-label">
          <FaEnvelope className="auth-icon" /> Email
          <input type="email" name="email" value={form.email} onChange={handleChange} className="auth-input" autoComplete="email" />
        </label>
        <label className="auth-label">
          <FaLock className="auth-icon" /> Mot de passe
          <input type="password" name="password" value={form.password} onChange={handleChange} className="auth-input" autoComplete="new-password" />
        </label>
        <button type="submit" className="auth-btn" disabled={loading}>{loading ? 'Inscription...' : 'S\'inscrire'}</button>
      </form>
      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}
      <div className="auth-link">Déjà un compte ? <a href="/login">Se connecter</a></div>
    </div>
  );
};

export default Register;
