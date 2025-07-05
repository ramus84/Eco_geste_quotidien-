import axios from 'axios';

// Création d'une instance axios avec une baseURL configurable
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

// Ajouter un intercepteur pour insérer le token dans les en-têtes de chaque requête
instance.interceptors.request.use(
  (config) => {
    // Récupérer le token JWT depuis localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // Ajouter le token aux en-têtes
    }
    
    // Log pour debug
    console.log(`🌐 Requête vers: ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('❌ Erreur lors de la préparation de la requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et les erreurs
instance.interceptors.response.use(
  (response) => {
    // Log pour debug
    console.log(`✅ Réponse reçue: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Erreur réseau:', error);
    
    // Gestion spécifique des erreurs
    if (error.code === 'ECONNABORTED') {
      console.error('⏰ Timeout de la requête');
      return Promise.reject(new Error('La requête a pris trop de temps. Veuillez réessayer.'));
    }
    
    if (!error.response) {
      // Erreur réseau (pas de réponse du serveur)
      console.error('🌐 Erreur de connexion au serveur');
      return Promise.reject(new Error('Impossible de se connecter au serveur. Vérifiez votre connexion internet.'));
    }
    
    // Erreur avec réponse du serveur
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        console.error('🔐 Non autorisé - Token invalide ou expiré');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(new Error('Session expirée. Veuillez vous reconnecter.'));
        
      case 403:
        console.error('🚫 Accès interdit');
        return Promise.reject(new Error('Vous n\'avez pas les permissions nécessaires.'));
        
      case 404:
        console.error('🔍 Ressource non trouvée');
        return Promise.reject(new Error('La ressource demandée n\'existe pas.'));
        
      case 500:
        console.error('💥 Erreur serveur');
        return Promise.reject(new Error('Erreur interne du serveur. Veuillez réessayer plus tard.'));
        
      default:
        console.error(`❌ Erreur ${status}:`, data);
        return Promise.reject(new Error(data?.message || 'Une erreur inattendue s\'est produite.'));
    }
  }
);

// Fonction utilitaire pour tester la connexion
export const testConnection = async () => {
  try {
    const response = await instance.get('/health');
    console.log('✅ Connexion au serveur réussie');
    return true;
  } catch (error) {
    console.error('❌ Échec de la connexion au serveur:', error.message);
    return false;
  }
};

// Fonction pour changer l'URL de base (utile pour différents environnements)
export const setBaseURL = (newBaseURL) => {
  instance.defaults.baseURL = newBaseURL;
  console.log(`🌐 URL de base changée vers: ${newBaseURL}`);
};

const nameRegex = /^[a-zA-ZÀ-ÿ' -]{2,30}$/;
const messageRegex = /^.{10,}$/;
const categoryRegex = /^[a-zA-ZÀ-ÿ ]+$/;
const urlRegex = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-./?%&=]*)?$/;

export default instance;