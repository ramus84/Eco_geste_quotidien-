import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { FaLock } from 'react-icons/fa';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const query = useQuery();
  const token = query.get('token');

  // Gère la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      await axiosInstance.post('/users/reset-password', { token, password });
      setMessage('Mot de passe réinitialisé avec succès. Redirection...');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la réinitialisation");
    }
    setLoading(false);
  };

  if (!token) {
    return <div className="auth-card"><div className="auth-error">Lien de réinitialisation invalide ou expiré.</div></div>;
  }

  return (
    <div className="auth-card">
      <h2 className="auth-title">Réinitialiser le mot de passe</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-label">
          <FaLock className="auth-icon" /> Nouveau mot de passe
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="auth-input" autoComplete="new-password" required />
        </label>
        <button type="submit" className="auth-btn" disabled={loading}>{loading ? 'Réinitialisation...' : 'Réinitialiser'}</button>
      </form>
      {error && <div className="auth-error">{error}</div>}
      {message && <div className="auth-success">{message}</div>}
      <div className="auth-link"><a href="/login">Retour à la connexion</a></div>
    </div>
  );
};

export default ResetPassword; 