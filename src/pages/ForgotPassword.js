import React, { useState } from 'react';
import axiosInstance from '../axiosConfig';
import { FaEnvelope } from 'react-icons/fa';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Gère la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const res = await axiosInstance.post('/users/forgot-password', { email });
      setMessage(res.data.message + (res.data.resetLink ? ` (Lien de test : ${res.data.resetLink})` : ''));
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la demande de réinitialisation");
    }
    setLoading(false);
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">Mot de passe oublié</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-label">
          <FaEnvelope className="auth-icon" /> Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="auth-input" autoComplete="email" required />
        </label>
        <button type="submit" className="auth-btn" disabled={loading}>{loading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}</button>
      </form>
      {error && <div className="auth-error">{error}</div>}
      {message && <div className="auth-success">{message}</div>}
      <div className="auth-link"><a href="/login">Retour à la connexion</a></div>
    </div>
  );
};

export default ForgotPassword; 