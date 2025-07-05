import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { jwtDecode } from 'jwt-decode';

function CarbonCalculator() {
  // États pour stocker la valeur du calcul, le message, et l'email utilisateur
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');

  // useEffect pour récupérer le userId et l'email dès que le composant est monté
  useEffect(() => {
    // On récupère le token JWT du localStorage
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // On décode le token pour extraire l'id et l'email
        const decoded = jwtDecode(token);
        setUserId(decoded.userId || decoded.id || decoded._id || '');
        setUserEmail(decoded.email || '');
      } catch (e) {
        setMessage("Impossible de décoder le token utilisateur.");
      }
    } else {
      setMessage("Aucun utilisateur connecté.");
    }
  }, []);

  // Fonction pour envoyer le calcul au backend
  const envoyerCalcul = async () => {
    if (!userId) {
      setMessage("Impossible d'envoyer le calcul : utilisateur non identifié.");
      return;
    }
    try {
      const data = {
        userId: userId,
        value: parseFloat(value)
      };
      await axios.post('/api/stats/carboncalculations', data);
      setMessage('Calcul de carbone enregistré avec succès !');
    } catch (error) {
      setMessage("Erreur lors de l'enregistrement : " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: 20, borderRadius: 8, maxWidth: 400, margin: 'auto' }}>
      <h2>Enregistrer un calcul de carbone</h2>
      {/* Message d'accueil */}
      {userEmail && <div style={{ marginBottom: 10 }}>Bienvenue, <b>{userEmail}</b> !</div>}
      {/* Champ pour la valeur du calcul */}
      <input
        type="number"
        placeholder="Valeur du calcul (ex: 123.45)"
        value={value}
        onChange={e => setValue(e.target.value)}
        style={{ width: '100%', marginBottom: 10 }}
      />
      {/* Bouton pour envoyer */}
      <button onClick={envoyerCalcul} style={{ width: '100%', padding: 10, background: '#4caf50', color: 'white', border: 'none', borderRadius: 4 }}>
        Enregistrer le calcul
      </button>
      {/* Message de retour */}
      {message && <div style={{ marginTop: 15, color: message.includes('succès') ? 'green' : 'red' }}>{message}</div>}
    </div>
  );
}

export default CarbonCalculator;
