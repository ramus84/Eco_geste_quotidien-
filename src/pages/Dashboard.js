import React, { useEffect, useState } from 'react';
import axios from 'axios';
import axiosInstance from '../axiosConfig';
import StatAccordion from '../components/StatAccordion';
import Carousel from '../components/Carousel';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axiosInstance.get('/users/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUserData(response.data);
        } catch (error) {
          if (error?.response?.status === 401) {
            setError("Session expirée. Veuillez vous reconnecter.");
          } else if (error?.response?.status === 404) {
            setError("Profil utilisateur non trouvé.");
          } else {
            setError("Impossible de charger les données utilisateur. Veuillez vous reconnecter.");
          }
        }
      } else {
        setError("Vous devez être connecté pour accéder au tableau de bord.");
      }
    };

    fetchUserData();
  }, []);

  if (error) {
    return <div style={{color: 'red'}}>{error}</div>;
  }

  if (!userData) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <Carousel />
      <StatAccordion title="10K utilisateurs">
        <p>
          Plus de 10 000 utilisateurs engagés dans la communauté ÉcoGestes !<br />
          Rejoignez-nous pour partager vos gestes et conseils.
        </p>
      </StatAccordion>
      <StatAccordion title="50K gestes à réaliser">
        <ul>
          <li>Éteindre les lumières inutiles</li>
          <li>Réduire la consommation d'eau</li>
          <li>Recycler les déchets</li>
          <li>Utiliser les transports en commun</li>
          <li>Et bien plus encore…</li>
        </ul>
      </StatAccordion>
      <h1>Bienvenue, {userData.username}</h1>
      {/* Afficher d'autres informations utilisateur ici */}
    </div>
  );
};

export default Dashboard;
