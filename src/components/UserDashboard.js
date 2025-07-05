import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { NotificationContext, LoaderContext } from '../App';
import ChartComponent from './Chart';
import PushNotifications from './PushNotifications';
import ExportTools from './ExportTools';
import axiosInstance from '../axiosConfig';
import Messaging from './Messaging';
import AddGestureForm from './AddGestureForm';
import { FaTrashAlt, FaKey } from 'react-icons/fa';
import { CSSTransition } from 'react-transition-group';
import { useRef } from 'react';

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [password, setPassword] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const { showNotification } = useContext(NotificationContext);
  const { setShowLoader } = useContext(LoaderContext);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [communityStats, setCommunityStats] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showCustomize, setShowCustomize] = useState(false);
  const [customBio, setCustomBio] = useState(localStorage.getItem('customBio') || '');
  const [customColor, setCustomColor] = useState(localStorage.getItem('customColor') || '#1976d2');
  const [editCity, setEditCity] = useState(userData?.city || '');
  const [sortGestures, setSortGestures] = useState('date');
  const [likedSuggestions, setLikedSuggestions] = useState([]);
  const [ignoredSuggestions, setIgnoredSuggestions] = useState([]);
  const [showGestureModal, setShowGestureModal] = useState(false);
  const [challengeToValidate, setChallengeToValidate] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confetti, setConfetti] = useState(false);
  const [gestureToDelete, setGestureToDelete] = useState(null);
  const [selectedGesture, setSelectedGesture] = useState(null);
  const [carbonHistory, setCarbonHistory] = useState([]); // Historique CO2
  const handleLikeSuggestion = (id) => setLikedSuggestions(prev => [...prev, id]);
  const handleIgnoreSuggestion = (id) => setIgnoredSuggestions(prev => [...prev, id]);

  // Liste de défis (gamification)
  const challenges = [
    {
      id: 1,
      title: 'Éco-Départ',
      description: 'Ajoute ton premier geste éco-responsable.',
      check: (user) => user.gestures && user.gestures.length >= 1,
      progress: (user) => Math.min(1, (user.gestures?.length || 0) / 1),
      reward: 'Badge "Nouveau Héros"'
    },
    {
      id: 2,
      title: 'Multi-catégories',
      description: 'Réalise au moins un geste dans 3 catégories différentes.',
      check: (user) => user.gestures && new Set(user.gestures.map(g=>g.category)).size >= 3,
      progress: (user) => Math.min(1, (new Set(user.gestures?.map(g=>g.category)).size || 0) / 3),
      reward: 'Badge "Curieux"'
    },
    {
      id: 3,
      title: 'Éco-Expert',
      description: 'Atteins 100 kg de CO₂ économisé.',
      check: (user) => user.gestures && user.gestures.reduce((sum,g)=>sum+(g.co2Saved||0),0) >= 100,
      progress: (user) => Math.min(1, (user.gestures?.reduce((sum,g)=>sum+(g.co2Saved||0),0) || 0) / 100),
      reward: 'Badge "Expert"'
    },
    {
      id: 4,
      title: 'Assidu',
      description: 'Ajoute un geste chaque semaine pendant 4 semaines (simulation).',
      check: (user) => user.gestures && user.gestures.length >= 4, // Pour la démo
      progress: (user) => Math.min(1, (user.gestures?.length || 0) / 4),
      reward: 'Badge "Assidu"'
    }
  ];

  // Génération dynamique d'objectifs personnalisés
  const personalizedGoals = (() => {
    if (!userData) return [];
    const totalCO2 = userData.gestures?.reduce((sum, g) => sum + (g.co2Saved || 0), 0) || 0;
    const nbGestes = userData.gestures?.length || 0;
    const cats = userData.gestures ? Array.from(new Set(userData.gestures.map(g => g.category))) : [];
    // Objectif CO2 : +50% par rapport à l'actuel (arrondi à la dizaine supérieure)
    const nextCO2 = Math.ceil((totalCO2 * 1.5) / 10) * 10 || 50;
    // Objectif nombre de gestes : +3 par rapport à l'actuel
    const nextGestes = nbGestes + 3;
    // Objectif catégorie la moins remplie
    const allCats = ['Transport', 'Énergie', 'Déchets', 'Alimentation', 'Eau', 'Autre'];
    const catCounts = allCats.map(cat => ({
      cat,
      count: userData.gestures?.filter(g => g.category === cat).length || 0
    }));
    const minCat = catCounts.reduce((min, c) => c.count < min.count ? c : min, catCounts[0]);
    return [
      {
        id: 'goal-co2',
        title: `Atteindre ${nextCO2} kg de CO₂ économisé` ,
        description: `Continue à agir pour atteindre ${nextCO2} kg de CO₂ économisé !`,
        progress: Math.min(1, totalCO2 / nextCO2),
        done: totalCO2 >= nextCO2,
        badge: '🌍'
      },
      {
        id: 'goal-gestes',
        title: `Réaliser ${nextGestes} gestes éco-responsables` ,
        description: `Ajoute encore ${nextGestes - nbGestes} geste(s) pour atteindre cet objectif.`,
        progress: Math.min(1, nbGestes / nextGestes),
        done: nbGestes >= nextGestes,
        badge: '💪'
      },
      {
        id: 'goal-cat',
        title: `Faire 2 gestes dans la catégorie « ${minCat.cat} »` ,
        description: `Essaie d'agir dans la catégorie « ${minCat.cat} » pour diversifier ton impact.`,
        progress: Math.min(1, (minCat.count || 0) / 2),
        done: (minCat.count || 0) >= 2,
        badge: '🔄'
      }
    ];
  })();

  // Badges communautaires (calcul local pour la démo)
  const communityBadges = [
    {
      id: 'ambassador',
      name: 'Ambassadeur',
      description: 'A partagé ses résultats ou gestes au moins 1 fois.',
      icon: '🌟',
      achieved: !!localStorage.getItem('sharedOnce')
    },
    {
      id: 'commentator',
      name: 'Top Commentateur',
      description: 'A posté au moins 5 commentaires sur les gestes.',
      icon: '💬',
      achieved: (userData?.commentsCount || 0) >= 5
    },
    {
      id: 'supporter',
      name: 'Soutien',
      description: 'A laissé au moins 2 conseils sur des gestes.',
      icon: '🤝',
      achieved: (userData?.commentsCount || 0) >= 2 // Pour la démo, même base
    },
    {
      id: 'regular',
      name: 'Engagement continu',
      description: 'A été actif chaque semaine pendant 4 semaines (simulation).',
      icon: '📅',
      achieved: (userData?.gestures?.length || 0) >= 4 // Pour la démo
    }
  ];

  // --- LOGIQUE POUR DÉFI DU JOUR DYNAMIQUE ---
  const dailyChallengesList = [
    { id: "d1", name: "Douche express", description: "Prends une douche de moins de 5 minutes.", category: "Eau", gestureName: "Douche rapide" },
    { id: "d2", name: "Vélo au boulot", description: "Va au travail ou à l'école à vélo ou à pied.", category: "Transport", gestureName: "Aller à vélo" },
    { id: "d3", name: "Repas végétarien", description: "Prépare un repas 100% végétarien.", category: "Alimentation", gestureName: "Repas végétarien" },
    { id: "d4", name: "Zéro déchet", description: "N'utilise aucun emballage jetable aujourd'hui.", category: "Déchets", gestureName: "Zéro emballage" },
    { id: "d5", name: "Baisser le chauffage", description: "Baisse le chauffage de 1°C.", category: "Énergie", gestureName: "Baisser le chauffage" },
    { id: "d6", name: "Éteindre les lumières", description: "Éteins toutes les lumières inutiles.", category: "Énergie", gestureName: "Éteindre les lumières" },
    { id: "d7", name: "Boire l'eau du robinet", description: "Bois uniquement de l'eau du robinet aujourd'hui.", category: "Eau", gestureName: "Eau du robinet" }
  ];
  const today = new Date();
  const daySeed = today.getFullYear() * 1000 + today.getMonth() * 100 + today.getDate();
  const dailyChallenge = dailyChallengesList[daySeed % dailyChallengesList.length];
  const hasDoneDaily = userData && userData.gestures && userData.gestures.some(g =>
    g.name === dailyChallenge.gestureName &&
    new Date(g.date).toDateString() === today.toDateString()
  );

  // --- Définition de la saison actuelle et des gestes par saison ---
  // Fonction pour obtenir la saison à partir de la date
  function getSeason(date) {
    const m = date.getMonth() + 1;
    if (m >= 3 && m <= 5) return 'printemps';
    if (m >= 6 && m <= 8) return 'ete';
    if (m >= 9 && m <= 11) return 'automne';
    return 'hiver';
  }
  const currentSeason = getSeason(today);
  // Objet qui associe chaque saison à une liste de gestes
  const seasonGesturesMap = {
    hiver: ['Baisser le chauffage', 'Éteindre les lumières', 'Douche rapide'],
    ete: ['Limiter la climatisation', 'Douche rapide', 'Eau du robinet'],
    printemps: ['Aller à vélo', 'Repas végétarien', 'Zéro emballage'],
    automne: ['Aller à vélo', 'Éteindre les lumières', 'Repas végétarien']
  };

  // --- SUGGESTIONS SAISONNIÈRES (filtrage assoupli) ---
  // On ne filtre que sur le nom du geste, peu importe la catégorie
  const saisonNames = seasonGesturesMap[currentSeason] || [];
  const seasonalSuggestions = suggestions.filter(g =>
    saisonNames.includes(g.name)
  );
  // 4. Icône de saison
  const seasonIcon = {
    hiver: '❄️', ete: '☀️', printemps: '🌸', automne: '🍂'
  }[currentSeason];

  // --- SUGGESTIONS SAISONNIÈRES TOUJOURS AFFICHÉES ---
  // Si aucune suggestion saisonnière, on affiche une liste par défaut
  const defaultSeasonalSuggestions = [
    { _id: 's1', name: 'Aérer la maison 10 min', category: 'Maison', co2Saved: 1, description: 'Aère ta maison chaque jour, même en hiver.' },
    { _id: 's2', name: "Boire de l'eau du robinet", category: 'Alimentation', co2Saved: 0.5, description: "Privilégie l'eau du robinet à l'eau en bouteille." },
    { _id: 's3', name: 'Privilégier les fruits de saison', category: 'Alimentation', co2Saved: 1, description: 'Consomme des fruits et légumes de saison.' }
  ];
  const seasonalSuggestionsToShow = seasonalSuggestions.length > 0 ? seasonalSuggestions : defaultSeasonalSuggestions;

  // Table de correspondance pour suggestions saisonnières
  const suggestionDetails = {
    'Limiter la climatisation': {
      name: 'Limiter la climatisation',
      category: 'Énergie',
      description: "Limiter l'utilisation de la climatisation pour économiser de l'énergie."
    },
    'Douche rapide': {
      name: 'Douche rapide',
      category: 'Eau',
      description: "Prendre une douche de moins de 5 minutes pour économiser l'eau."
    },
    'Eau du robinet': {
      name: 'Eau du robinet',
      category: 'Eau',
      description: "Boire l'eau du robinet plutôt que de l'eau en bouteille."
    },
    'Baisser le chauffage': {
      name: 'Baisser le chauffage',
      category: 'Énergie',
      description: "Baisser le chauffage de 1°C pour réduire la consommation d'énergie."
    },
    'Éteindre les lumières': {
      name: 'Éteindre les lumières',
      category: 'Énergie',
      description: "Éteindre toutes les lumières inutiles pour économiser de l'énergie."
    },
    'Aller à vélo': {
      name: 'Aller à vélo',
      category: 'Transport',
      description: "Prendre le vélo ou marcher au lieu de la voiture."
    },
    'Repas végétarien': {
      name: 'Repas végétarien',
      category: 'Alimentation',
      description: "Préparer un repas 100% végétarien pour réduire son empreinte carbone."
    },
    'Zéro emballage': {
      name: 'Zéro emballage',
      category: 'Déchets',
      description: "N'utiliser aucun emballage jetable aujourd'hui."
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setUserData(response.data);
      } catch (error) {
        setError("Impossible de charger le profil utilisateur. Veuillez vous reconnecter.");
      }
    };
    fetchUserData();
    // Récupérer les stats de la communauté
    const fetchCommunityStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/stats/main');
        setCommunityStats(res.data);
      } catch (err) {
        setCommunityStats(null);
      }
    };
    fetchCommunityStats();
    // Suggestions personnalisées
    const fetchSuggestions = async () => {
      try {
        const res = await axiosInstance.get('/gestures');
        if (userData && userData.gestures) {
          // Catégories où l'utilisateur a le moins de gestes
          const userGesturesByCat = {};
          userData.gestures.forEach(g => {
            userGesturesByCat[g.category] = (userGesturesByCat[g.category] || 0) + 1;
          });
          // Catégories triées par nombre de gestes croissant
          const sortedCats = Object.entries(userGesturesByCat).sort((a,b)=>a[1]-b[1]).map(([cat])=>cat);
          // Catégories manquantes (jamais faites)
          const allCats = Array.from(new Set(res.data.map(g=>g.category).filter(Boolean)));
          const missingCats = allCats.filter(cat => !userGesturesByCat[cat]);
          // On privilégie les catégories jamais faites, puis les moins faites
          const priorityCats = [...missingCats, ...sortedCats];
          // On propose des gestes de ces catégories, non déjà réalisés
          const userGestureNames = new Set(userData.gestures.map(g=>g.name));
          const suggestionsList = res.data.filter(g => priorityCats.includes(g.category) && !userGestureNames.has(g.name));
          setSuggestions(suggestionsList.slice(0, 3)); // max 3 suggestions
        } else {
          setSuggestions(res.data.slice(0, 3));
        }
      } catch (err) {
        setSuggestions([]);
      }
    };
    fetchSuggestions();
    // Récupère les 3 derniers calculs CO2 au chargement
    const fetchCarbonHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axiosInstance.get('/stats/carboncalculations', { headers: { Authorization: 'Bearer ' + token } });
        setCarbonHistory(res.data.slice(0, 3));
      } catch {}
    };
    fetchCarbonHistory();
  }, []);

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) return;
    setShowLoader(true);
    try {
      await axios.delete('http://localhost:5000/api/users/delete', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        data: { password }
      });
      setShowLoader(false);
      showNotification('Compte supprimé avec succès.', 'success');
      localStorage.removeItem('token');
      setTimeout(() => {
        navigate('/');
        window.location.reload();
      }, 1500);
    } catch (err) {
      setShowLoader(false);
      if (err.response && err.response.data && err.response.data.error) {
        showNotification(err.response.data.error, 'error');
      } else {
        showNotification('Erreur lors de la suppression du compte.', 'error');
      }
    }
  };

  // Fonction pour ouvrir le formulaire de modification avec les valeurs actuelles
  const openEditForm = () => {
    setEditUsername(userData.username);
    setEditEmail(userData.email);
    setShowEdit(true);
  };

  // Fonction pour gérer la modification du profil
  const handleEditProfile = async (e) => {
    e.preventDefault();
    setShowLoader(true);
    try {
      const response = await axios.put('http://localhost:5000/api/users/profile', {
        username: editUsername,
        email: editEmail
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setShowLoader(false);
      showNotification('Profil mis à jour avec succès.', 'success');
      setUserData({ ...userData, username: editUsername, email: editEmail });
      setShowEdit(false);
    } catch (err) {
      setShowLoader(false);
      if (err.response && err.response.data && err.response.data.error) {
        showNotification(err.response.data.error, 'error');
      } else {
        showNotification('Erreur lors de la modification du profil.', 'error');
      }
    }
  };

  // Fonction pour gérer le changement de mot de passe
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showNotification('Les nouveaux mots de passe ne correspondent pas.', 'error');
      return;
    }
    setShowLoader(true);
    try {
      await axios.put('http://localhost:5000/api/users/change-password', {
        currentPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setShowLoader(false);
      showNotification('Mot de passe modifié avec succès.', 'success');
      setShowPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setShowLoader(false);
      if (err.response && err.response.data && err.response.data.error) {
        showNotification(err.response.data.error, 'error');
      } else {
        showNotification('Erreur lors du changement de mot de passe.', 'error');
      }
    }
  };

  // Fonction pour gérer la sélection d'un nouveau fichier image
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Fonction pour envoyer la nouvelle photo au backend
  const handleAvatarUpload = async (e) => {
    e.preventDefault();
    if (!avatarFile) return;
    setShowLoader(true);
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    try {
      const response = await axios.post('http://localhost:5000/api/users/avatar', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setShowLoader(false);
      showNotification('Photo de profil mise à jour !', 'success');
      setUserData({ ...userData, avatar: response.data.avatar });
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      setShowLoader(false);
      showNotification("Erreur lors de l'upload de la photo.", 'error');
    }
  };

  // Sauvegarde de la bio et couleur dans le localStorage
  const saveCustomization = async (e) => {
    e.preventDefault();
    localStorage.setItem('customBio', customBio);
    localStorage.setItem('customColor', customColor);
    // Sauvegarde de la ville côté backend
    try {
      await axios.put('http://localhost:5000/api/users/profile', { city: editCity }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUserData({ ...userData, city: editCity });
    } catch (err) {}
    setShowCustomize(false);
  };

  // Fonction pour choisir l'icône et la couleur selon le type de badge
  const getBadgeStyle = (badge) => {
    let bg = '#bdbdbd'; // bronze par défaut
    let icon = '🏅';
    if (badge.type === 'or') { bg = '#ffe082'; icon = '🥇'; }
    else if (badge.type === 'argent') { bg = '#e0e0e0'; icon = '🥈'; }
    else if (badge.type === 'vert') { bg = '#c8e6c9'; icon = '🌱'; }
    else if (badge.type === 'bleu') { bg = '#b3e5fc'; icon = '💧'; }
    return { bg, icon };
  };

  // Fonction pour recharger les données utilisateur après ajout d'un geste
  const refreshUserData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUserData(response.data);
      triggerDiagnosticHighlight();
    } catch (error) {
      setError("Impossible de charger le profil utilisateur. Veuillez vous reconnecter.");
    }
  };

  // 1. Fonction utilitaire pour associer une icône à chaque catégorie de geste
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Transport': return '🚲';
      case 'Énergie': return '💡';
      case 'Déchets': return '♻️';
      case 'Alimentation': return '🥕';
      case 'Eau': return '💧';
      case 'Autre': return '🌱';
      default: return '🌍';
    }
  };

  // 3. Calcul du rang utilisateur dans la communauté
  const getUserRank = () => {
    if (!communityStats || !userData) return null;
    const userCO2 = userData.gestures?.reduce((sum,g)=>sum+(g.co2Saved||0),0) || 0;
    const sorted = [...(communityStats.topUsers||[])].sort((a,b)=>b.totalCO2-a.totalCO2);
    const userIndex = sorted.findIndex(u => u.username === userData.username);
    if (userIndex === -1) return null;
    const percent = Math.round(((userIndex+1)/sorted.length)*100);
    return {rank: userIndex+1, total: sorted.length, percent};
  };
  const userRank = getUserRank();

  // 5. Ajout d'un état pour l'animation de badge débloqué
  const [unlockedBadge, setUnlockedBadge] = useState(null);

  // 6. Gestion de l'animation d'apparition des gestes (CSS simple)
  const gestureListRef = React.useRef();
  useEffect(() => {
    if (gestureListRef.current) {
      gestureListRef.current.childNodes.forEach((node, i) => {
        node.style.opacity = 0;
        setTimeout(() => {
          node.style.transition = 'opacity 0.5s';
          node.style.opacity = 1;
        }, 100 * i);
      });
    }
  }, [userData?.gestures, sortGestures]);

  // 2. Fonction pour obtenir une icône selon la catégorie de geste
  const getSuggestionIcon = (cat) => {
    switch(cat) {
      case 'Transport': return '🚲';
      case 'Énergie': return '💡';
      case 'Déchets': return '♻️';
      case 'Alimentation': return '🥕';
      case 'Eau': return '💧';
      case 'Autre': return '🌱';
      default: return '🌍';
    }
  };

  // Fonction pour ajouter un geste test
  const addTestGesture = async () => {
    try {
      await addGestureByName('Éteindre les lumières', 'Énergie', 2, 'Éteins toutes les lumières inutiles.');
      setConfetti(true);
      setTimeout(()=>setConfetti(false), 2000);
    } catch (err) {
      showNotification("Erreur lors de l'ajout du geste test.", 'error');
    }
  };

  // Fonction générique pour ajouter un geste par nom
  const addGestureByName = async (name, category = 'Autre', co2Saved = 1, description = '') => {
    try {
      await axios.post('http://localhost:5000/api/gestures', {
        name,
        category,
        co2Saved,
        date: new Date().toISOString(),
        description: description || `Ajout automatique via interaction.`
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      await refreshUserData();
      showNotification(`Geste "${name}" ajouté !`, 'success');
    } catch (err) {
      showNotification(`Erreur lors de l'ajout du geste "${name}".`, 'error');
    }
  };

  // Handler pour valider un défi (ouvre la modale de choix de geste)
  const handleValidateChallenge = (challenge) => {
    setChallengeToValidate(challenge);
    setShowGestureModal(true);
  };

  // Handler pour ajouter un geste depuis une suggestion (pas de défi)
  const handleAddGestureFromSuggestion = (gesture) => {
    setShowConfirm({
      message: `Ajouter le geste "${gesture.name}" à ta liste ?`,
      onConfirm: () => {
        addGestureByName(gesture.name, gesture.category, gesture.co2Saved, gesture.description);
        setConfetti(true);
        setTimeout(() => setConfetti(false), 2000);
      }
    });
  };

  // Handler pour la modale de défi (choix du geste pour valider le défi)
  const handleAddGestureForChallenge = (gesture) => {
    setShowGestureModal(false);
    if (!challengeToValidate) {
      // Sécurité : ne rien faire si pas de défi en cours
      return;
    }
    setShowConfirm({
      message: `Ajouter le geste "${gesture.name}" pour valider le défi "${challengeToValidate.title}" ?`,
      onConfirm: () => {
        addGestureByName(gesture.name, gesture.category, gesture.co2Saved, gesture.description);
        setConfetti(true);
        setTimeout(() => setConfetti(false), 2000);
      }
    });
  };

  // Fonction pour demander confirmation avant de supprimer un geste
  const handleDeleteGesture = (g) => {
    setShowConfirm({
      message: `Supprimer le geste "${g.name}" de ta liste ?`,
      onConfirm: () => {
        deleteGesture(g._id);
        setConfetti(true);
        setTimeout(()=>setConfetti(false), 2000);
      }
    });
  };

  // Fonction pour supprimer un geste (appel API)
  const deleteGesture = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/gestures/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      await refreshUserData();
      showNotification('Geste supprimé !', 'success');
    } catch (err) {
      showNotification('Erreur lors de la suppression du geste.', 'error');
    }
  };

  // Fonction de partage pour le badge Ambassadeur
  const handleShareDashboard = () => {
    navigator.clipboard.writeText(window.location.href);
    localStorage.setItem('sharedOnce', '1');
    showNotification('Lien partagé !', 'success');
    // Forcer le refresh pour débloquer le badge
    setUserData({ ...userData });
  };

  // Fonction d'explication pour les autres badges
  const handleBadgeInfo = (badge) => {
    if (badge.id === 'commentator') {
      showNotification('Pour débloquer ce badge, poste au moins 5 commentaires sur les gestes.', 'info');
    } else if (badge.id === 'supporter') {
      showNotification('Pour débloquer ce badge, laisse au moins 2 conseils sur des gestes.', 'info');
    } else if (badge.id === 'regular') {
      showNotification('Pour débloquer ce badge, sois actif chaque semaine pendant 4 semaines.', 'info');
    }
  };

  // Fonction pour ajouter un geste depuis une suggestion saisonnière (ajout direct, sans doublon)
  const handleAddSeasonSuggestion = async (gName) => {
    const gesture = suggestionDetails[gName] || { name: gName, category: 'Autre', co2Saved: 1, description: '' };
    // Vérifier si le geste existe déjà dans la liste de l'utilisateur
    if (userData?.gestures?.some(g => g.name === gesture.name)) {
      showNotification('Ce geste est déjà dans ta liste !', 'info');
      return;
    }
    try {
      await addGestureByName(gesture.name, gesture.category, gesture.co2Saved, gesture.description);
      setConfetti(true);
      showNotification('Geste ajouté avec succès !', 'success');
      setTimeout(() => setConfetti(false), 2000);
    } catch (err) {
      // Afficher le vrai message d'erreur si disponible
      const msg = err?.response?.data?.error || err.message || `Erreur lors de l'ajout du geste "${gesture.name}".`;
      showNotification(msg, 'error');
    }
  };

  // 8. État pour feedback visuel sur le diagnostic (pulse animé)
  const [diagnosticHighlight, setDiagnosticHighlight] = useState(false);
  const [animatedGestures, setAnimatedGestures] = useState([]); // Pour gérer l'animation d'apparition

  // Fonction pour déclencher le feedback visuel sur le diagnostic (pulse)
  const triggerDiagnosticHighlight = () => {
    setDiagnosticHighlight(true);
    setTimeout(() => setDiagnosticHighlight(false), 600);
  };

  // Effet pour animer l'apparition des gestes (fade-in)
  useEffect(() => {
    if (Array.isArray(userData?.gestures)) {
      setAnimatedGestures([]); // On vide d'abord
      setTimeout(() => {
        setAnimatedGestures(userData.gestures.map(g => g._id));
      }, 50); // Légère attente pour déclencher l'animation
    }
  }, [userData?.gestures]);

  // Fonction pour obtenir une image ou icône selon la catégorie de geste
  function getCategoryImage(category) {
    switch (category) {
      case 'Transport': return '🚲';
      case 'Énergie': return '💡';
      case 'Déchets': return '♻️';
      case 'Alimentation': return '🥕';
      case 'Eau': return '💧';
      case 'Maison': return '🏠';
      case 'Autre': return '🌱';
      default: return '🌍';
    }
  }

  // Fonction pour obtenir une icône/image unique pour chaque badge
  function getBadgeIcon(badge) {
    switch (badge.id) {
      case 'ambassador': return '🌟';
      case 'commentator': return '💬';
      case 'supporter': return '🤝';
      case 'regular': return '📅';
      case 'goal-co2': return '🌍';
      case 'goal-gestes': return '💪';
      case 'goal-cat': return '🔄';
      case 'eco-expert': return '🥇';
      case 'eco-depart': return '🎉';
      default: return '🌍';
    }
  }

  // 9. État pour la modale d'info badge
  const [badgeInfo, setBadgeInfo] = useState(null);

  // 10. État pour la modale d'info statistique
  const [statInfo, setStatInfo] = useState(null);
  // Fonction utilitaire pour animer un compteur (pour débutant)
  function useAnimatedNumber(value, duration = 800) {
    const [display, setDisplay] = useState(value);
    const ref = useRef();
    useEffect(() => {
      let start = null;
      let from = ref.current ?? value;
      let to = value;
      function animate(ts) {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        setDisplay(Math.round(from + (to - from) * progress));
        if (progress < 1) requestAnimationFrame(animate);
        else ref.current = to;
      }
      requestAnimationFrame(animate);
      // eslint-disable-next-line
    }, [value]);
    return display;
  }

  // Animation de compteur pour les stats (toujours AVANT le return)
  const gesturesCount = userData?.gestures?.length || 0;
  const co2Count = userData?.gestures?.reduce((sum,g)=>sum+(g.co2Saved||0),0) || 0;
  const categoriesCount = userData?.gestures ? Array.from(new Set(userData.gestures.map(g=>g.category))).length : 0;
  const animatedGestes = useAnimatedNumber(gesturesCount);
  const animatedCO2 = useAnimatedNumber(co2Count);
  const animatedCategories = useAnimatedNumber(categoriesCount);

  // 11. État pour la modale d'article
  const [articleModal, setArticleModal] = useState(null);
  // Articles d'exemple (à remplacer par des vrais articles ou une API plus tard)
  const blogArticles = [
    {
      id: 1,
      title: "5 gestes simples pour économiser l'énergie à la maison",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
      summary: "Découvrez comment réduire votre consommation d'énergie au quotidien avec des gestes faciles à adopter.",
      content: "Éteignez les lumières inutiles, privilégiez les ampoules LED, débranchez les appareils en veille, baissez le chauffage d'un degré, et aérez votre logement 10 minutes par jour. Ces gestes simples permettent de réduire votre facture et votre impact environnemental.",
      category: 'Énergie',
    },
    {
      id: 2,
      title: "Pourquoi privilégier l'eau du robinet ?",
      image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
      summary: "L'eau du robinet est économique, écologique et contrôlée. Voici pourquoi il faut l'adopter !",
      content: "Boire l'eau du robinet permet d'éviter les déchets plastiques, de réduire le transport de bouteilles, et de faire des économies. En France, elle est très contrôlée et de bonne qualité. Pensez à utiliser une carafe filtrante si besoin.",
      category: 'Eau',
    },
    {
      id: 3,
      title: "Réduire ses déchets : astuces pour débuter le zéro déchet",
      image: "https://images.unsplash.com/photo-1508873699372-7aeab60b44c9?auto=format&fit=crop&w=600&q=80",
      summary: "Le zéro déchet commence par de petits changements. Voici quelques idées pour s'y mettre facilement.",
      content: "Utilisez des sacs réutilisables, achetez en vrac, compostez vos déchets organiques, refusez les objets à usage unique, et privilégiez les produits durables. Chaque geste compte !",
      category: 'Déchets',
    },
    {
      id: 4,
      title: "Manger local et de saison : pourquoi et comment ?",
      image: "https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=600&q=80",
      summary: "Adopter une alimentation locale et de saison, c'est bon pour la planète et la santé. Découvrez comment faire !",
      content: "Privilégiez les fruits et légumes de saison, achetez auprès de producteurs locaux, limitez les produits transformés. Cela réduit l'empreinte carbone et favorise l'économie locale.",
      category: 'Alimentation',
      isNew: true
    },
    {
      id: 5,
      title: "Se déplacer autrement : la mobilité douce au quotidien",
      image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80",
      summary: "Marche, vélo, transports en commun... Adoptez la mobilité douce pour réduire votre impact environnemental.",
      content: "Privilégiez la marche ou le vélo pour les petits trajets, utilisez les transports en commun, pensez au covoiturage. Moins de pollution, plus de bien-être !",
      category: 'Transport',
      isNew: true
    }
  ];

  if (error) {
    return <div className="dashboard-error-message">{error}</div>;
  }

  if (!userData) {
    return <div className="dashboard-loading">Chargement du tableau de bord...</div>;
  }

  // Sécurisation de l'accès aux badges utilisateur
  const badges = Array.isArray(userData?.badges) ? userData.badges : [];
  const allBadges = [
    ...badges,
    ...communityBadges.filter(b => !badges.some(ob => ob.id === b.id))
  ];

  return (
    <div className="dashboard-main-container pro-modern">
      {/* En-tête profil */}
      <div className="dashboard-profile-card pro-card">
        <div className="dashboard-avatar" style={{backgroundColor: customColor}}>
          {userData?.avatarUrl ? (
            <img src={userData.avatarUrl} alt="avatar" />
          ) : (
            <span>{userData?.username?.[0]?.toUpperCase() || '?'}</span>
          )}
        </div>
        <div className="dashboard-profile-infos">
          <div className="dashboard-username">{userData?.username}</div>
          <div className="dashboard-city">{userData?.city}</div>
          <div className="dashboard-bio">{customBio}</div>
        </div>
        <button className="dashboard-edit-btn" title="Modifier mon profil" onClick={openEditForm}>✏️</button>
      </div>
      {/* Statistiques clés */}
      <div className="dashboard-stats-cards pro-grid-3" style={{display:'flex',gap:32,justifyContent:'center',margin:'32px 0'}}>
        {/* Bloc Gestes réalisés */}
        <div
          className="dashboard-stat-card pro-card"
          style={{
            background:'#fff',
            borderRadius:18,
            boxShadow:'0 4px 18px #b3c6e633',
            padding:'28px 18px',
            minWidth:180,
            textAlign:'center',
            cursor:'pointer',
            transition:'box-shadow 0.2s, transform 0.2s',
            animation:'fadeInStat 0.7s',
            position:'relative',
          }}
          onMouseOver={e=>{e.currentTarget.style.transform='scale(1.07)';e.currentTarget.style.boxShadow='0 0 0 8px #90caf9aa';}}
          onMouseOut={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow='0 4px 18px #b3c6e633';}}
          onClick={()=>setStatInfo({title:'Gestes réalisés',value:gesturesCount,details:userData?.gestures?.map(g=>g.name).join(', ')||'Aucun geste'})}
        >
          <style>{`@keyframes fadeInStat { from { opacity: 0; transform: translateY(24px);} to { opacity: 1; transform: none; } }`}</style>
          <div style={{fontSize:36,marginBottom:8}}>📝</div>
          <div style={{color:'#90caf9',fontWeight:'bold',fontSize:'1em',letterSpacing:1}}>GESTES RÉALISÉS</div>
          <div style={{fontWeight:'bold',fontSize:'2em',color:'#1976d2',marginTop:6}}>{animatedGestes}</div>
        </div>
        {/* Bloc CO2 économisé */}
        <div
          className="dashboard-stat-card pro-card"
          style={{
            background:'#fff',
            borderRadius:18,
            boxShadow:'0 4px 18px #b3c6e633',
            padding:'28px 18px',
            minWidth:180,
            textAlign:'center',
            cursor:'pointer',
            transition:'box-shadow 0.2s, transform 0.2s',
            animation:'fadeInStat 0.7s',
            position:'relative',
          }}
          onMouseOver={e=>{e.currentTarget.style.transform='scale(1.07)';e.currentTarget.style.boxShadow='0 0 0 8px #a5d6a7aa';}}
          onMouseOut={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow='0 4px 18px #b3c6e633';}}
          onClick={()=>setStatInfo({title:'CO₂ économisé',value:co2Count,details:'Total du CO₂ économisé par tous vos gestes.'})}
        >
          <div style={{fontSize:36,marginBottom:8}}>🌱</div>
          <div style={{color:'#a5d6a7',fontWeight:'bold',fontSize:'1em',letterSpacing:1}}>CO₂ ÉCONOMISÉ</div>
          <div style={{fontWeight:'bold',fontSize:'2em',color:'#388e3c',marginTop:6}}>{animatedCO2}</div>
          <div style={{fontSize:'1em',color:'#388e3c'}}>kg</div>
        </div>
        {/* Bloc Catégories */}
        <div
          className="dashboard-stat-card pro-card"
          style={{
            background:'#fff',
            borderRadius:18,
            boxShadow:'0 4px 18px #b3c6e633',
            padding:'28px 18px',
            minWidth:180,
            textAlign:'center',
            cursor:'pointer',
            transition:'box-shadow 0.2s, transform 0.2s',
            animation:'fadeInStat 0.7s',
            position:'relative',
          }}
          onMouseOver={e=>{e.currentTarget.style.transform='scale(1.07)';e.currentTarget.style.boxShadow='0 0 0 8px #ffe082aa';}}
          onMouseOut={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow='0 4px 18px #b3c6e633';}}
          onClick={()=>setStatInfo({title:'Catégories',value:categoriesCount,details:userData?.gestures ? Array.from(new Set(userData.gestures.map(g=>g.category))).join(', ') : 'Aucune catégorie'})}
        >
          <div style={{fontSize:36,marginBottom:8}}>📂</div>
          <div style={{color:'#ffe082',fontWeight:'bold',fontSize:'1em',letterSpacing:1}}>CATÉGORIES</div>
          <div style={{fontWeight:'bold',fontSize:'2em',color:'#b26a00',marginTop:6}}>{animatedCategories}</div>
        </div>
        {/* Modale d'info statistique */}
        {statInfo && (
          <div className="pro-modal-bg" style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'#0007',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div className="pro-modal-content" style={{background:'#fff',borderRadius:18,padding:'32px 28px',boxShadow:'0 8px 32px #0003',minWidth:320,maxWidth:400,position:'relative'}}>
              <button onClick={()=>setStatInfo(null)} style={{position:'absolute',top:12,right:16,fontSize:22,background:'none',border:'none',cursor:'pointer',color:'#1976d2'}}>×</button>
              <h2 style={{marginBottom:12}}>{statInfo.title}</h2>
              <div style={{fontSize:'2em',fontWeight:'bold',color:'#1976d2',marginBottom:10}}>{statInfo.value}</div>
              <div style={{color:'#555',marginBottom:10}}>{statInfo.details}</div>
            </div>
          </div>
        )}
      </div>
      {/* Graphique interactif */}
      <div className="dashboard-chart-card pro-card" style={{background:'#fff',borderRadius:18,boxShadow:'0 4px 18px #b3c6e633',padding:'32px 24px',margin:'32px auto',maxWidth:700}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
          <span style={{fontSize:'1.7em'}}>📊</span>
          <h2 style={{margin:0,fontSize:'1.25em',fontWeight:'bold',color:'#1976d2'}}>Économies de CO₂ par catégorie</h2>
        </div>
        <div style={{color:'#555',fontSize:'1em',marginBottom:18,marginLeft:4}}>
          Visualisez l'impact de vos gestes selon chaque domaine de la vie quotidienne.
        </div>
        <ChartComponent gestures={userData?.gestures || []} />
        {(!userData?.gestures || userData.gestures.length === 0) && (
          <div className="dashboard-empty-message">Commence à ajouter des gestes pour voir ton impact !</div>
        )}
      </div>
      {/* Badges/récompenses */}
      <div className="dashboard-badges-card pro-card" style={{background:'#fff',borderRadius:18,boxShadow:'0 4px 18px #b3c6e633',padding:'32px 24px',margin:'32px auto',maxWidth:700}}>
        <style>{`
          @keyframes fadeInBadge { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: none; } }
        `}</style>
        <h3 className="dashboard-section-title" style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:'1.5em'}}>🏅</span> Mes badges
        </h3>
        <div className="badges-list pro-grid-4" style={{display:'flex',flexWrap:'wrap',gap:24,justifyContent:'center',marginTop:18}}>
          {allBadges.length === 0 && <div>Aucun badge débloqué pour le moment.</div>}
          {allBadges.map((badge, i) => {
            const isLocked = !badge.achieved;
            return (
              <div
                key={badge.id || i}
                className={`badge-card pro-badge${isLocked ? ' badge-locked' : ''}`}
                title={badge.description}
                onClick={() => setBadgeInfo(badge)}
                style={{
                  opacity: isLocked ? 0.5 : 1,
                  border:'2.5px solid #eee',
                  borderRadius:18,
                  padding:20,
                  minWidth:120,
                  minHeight:140,
                  background:'#fff',
                  boxShadow: isLocked ? '0 2px 8px #bdbdbd44' : '0 4px 18px #90caf944',
                  textAlign:'center',
                  position:'relative',
                  transition:'box-shadow 0.2s, transform 0.2s',
                  cursor:'pointer',
                  animation:'fadeInBadge 0.7s',
                  margin:'8px 0',
                  outline: isLocked ? 'none' : '2px solid #1976d2',
                }}
                onMouseOver={e => {e.currentTarget.style.transform='scale(1.08)';e.currentTarget.style.boxShadow='0 0 0 8px #90caf9aa';}}
                onMouseOut={e => {e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow=isLocked?'0 2px 8px #bdbdbd44':'0 4px 18px #90caf944';}}
              >
                <div style={{fontSize:48,marginBottom:10}}>{getBadgeIcon(badge)}</div>
                <div style={{fontWeight:'bold',margin:'10px 0 6px 0',fontSize:'1.08em',color:'#1976d2'}}>{badge.name || badge.title}</div>
                <div style={{fontSize:13,color:'#555',minHeight:36}}>{badge.description}</div>
                {isLocked && <div style={{position:'absolute',top:8,right:8,fontSize:22}} title="Verrouillé">🔒</div>}
            </div>
            );
          })}
        </div>
        {/* Modale d'info badge */}
        {badgeInfo && (
          <div className="pro-modal-bg" style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'#0007',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div className="pro-modal-content" style={{background:'#fff',borderRadius:18,padding:'32px 28px',boxShadow:'0 8px 32px #0003',minWidth:320,maxWidth:400,position:'relative'}}>
              <button onClick={()=>setBadgeInfo(null)} style={{position:'absolute',top:12,right:16,fontSize:22,background:'none',border:'none',cursor:'pointer',color:'#1976d2'}}>×</button>
              <h2 style={{marginBottom:12,display:'flex',alignItems:'center',gap:10}}>
                {getBadgeIcon(badgeInfo)} {badgeInfo.name || badgeInfo.title}
              </h2>
              <div style={{marginBottom:10}}><b>Description :</b> {badgeInfo.description}</div>
              {badgeInfo.achieved
                ? <div style={{color:'#388e3c',fontWeight:'bold',marginTop:10}}>Badge débloqué ! 🎉</div>
                : <div style={{color:'#b26a00',fontWeight:'bold',marginTop:10}}>Pour débloquer ce badge : <br/>{badgeInfo.unlockTip || badgeInfo.description}</div>
              }
            </div>
          </div>
        )}
      </div>
      {/* Défis du jour et suggestions saisonnières */}
      <div className="dashboard-challenges-card pro-card" style={{background:'#fff',borderRadius:18,boxShadow:'0 4px 18px #b3c6e633',padding:'32px 24px',margin:'32px auto',maxWidth:700}}>
        <style>{`
          @keyframes fadeInCard { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: none; } }
        `}</style>
        <h3 className="dashboard-section-title" style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:'1.5em'}}>🏆</span> Défi du jour
        </h3>
        {dailyChallenge ? (
          <div className="dashboard-daily-challenge pro-highlight" style={{
            display:'flex',alignItems:'center',gap:18,background:'#e3f2fd',borderRadius:14,padding:'18px 18px',margin:'18px 0',animation:'fadeInCard 0.7s'}}>
            <span style={{fontSize:'2.2em'}}>{getCategoryImage(dailyChallenge.category)}</span>
            <div>
              <div style={{fontWeight:'bold',fontSize:'1.1em',color:'#1976d2'}}>{dailyChallenge?.name}</div>
              <div style={{color:'#555',marginTop:2}}>{dailyChallenge?.description}</div>
            </div>
            <button
              onClick={()=>handleValidateChallenge(dailyChallenge)}
              disabled={hasDoneDaily}
              style={{
                marginLeft:'auto',
                background: hasDoneDaily ? '#bdbdbd' : '#1976d2',
                color:'#fff',
                border:'none',
                borderRadius:8,
                padding:'8px 18px',
                fontWeight:'bold',
                cursor: hasDoneDaily ? 'not-allowed' : 'pointer',
                fontSize:'1em',
                boxShadow:'0 2px 8px #1976d233',
                transition:'transform 0.1s',
                opacity: hasDoneDaily ? 0.6 : 1
              }}
              onMouseDown={e=>e.currentTarget.style.transform='scale(0.97)'}
              onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}
              onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
            >
              {hasDoneDaily ? 'Défi validé !' : 'Valider'}
            </button>
          </div>
        ) : (
          <div className="dashboard-empty-message">Aucun défi du jour disponible.</div>
        )}
        <h3 className="dashboard-section-title" style={{display:'flex',alignItems:'center',gap:10,marginTop:28}}>
          Suggestions saisonnières <span style={{fontSize:22}}>{seasonIcon}</span>
        </h3>
        <div className="dashboard-suggestions-list pro-flex-wrap" style={{justifyContent:'center', gap: '18px', marginBottom: '10px',marginTop:10}}>
          {saisonNames.map((g, i) => (
            <div key={i} style={{
              display:'flex',alignItems:'center',gap:10,background:'#f8fbff',borderRadius:12,padding:'12px 18px',boxShadow:'0 2px 8px #b3c6e622',animation:'fadeInCard 0.7s',margin:'6px 0'}}>
              <span style={{fontSize:'1.7em'}}>{getCategoryImage(suggestionDetails[g]?.category)}</span>
              <span style={{fontWeight:'bold',fontSize:'1.08em'}}>{g}</span>
              <button className="suggestion-btn pro-suggestion-btn" onClick={() => handleAddSeasonSuggestion(g)} style={{marginLeft:10,background:'#1976d2',color:'#fff',border:'none',borderRadius:8,padding:'6px 14px',fontWeight:'bold',cursor:'pointer',fontSize:'0.98em',boxShadow:'0 2px 8px #1976d233',transition:'transform 0.1s'}} onMouseDown={e=>e.currentTarget.style.transform='scale(0.97)'} onMouseUp={e=>e.currentTarget.style.transform='scale(1)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>Ajouter</button>
            </div>
          ))}
        </div>
        {/* Suggestions personnalisées pour l'utilisateur */}
        <h3 className="dashboard-section-title" style={{display:'flex',alignItems:'center',gap:10,marginTop:28}}>
          <span style={{fontSize:'1.3em'}}>✨</span> Suggestions pour toi
        </h3>
        <div className="dashboard-suggestions-list pro-flex-wrap" style={{justifyContent:'center', gap: '18px', marginBottom: '10px',marginTop:10}}>
          {suggestions.length === 0 && <div style={{color:'#b26a00'}}>Aucune suggestion personnalisée pour le moment.</div>}
          {suggestions.map((g, i) => (
            <div key={g._id || i} style={{
              display:'flex',alignItems:'center',gap:10,background:'#f8fbff',borderRadius:12,padding:'12px 18px',boxShadow:'0 2px 8px #b3c6e622',animation:'fadeInCard 0.7s',margin:'6px 0'}}>
              <span style={{fontSize:'1.7em'}}>{getCategoryImage(g.category)}</span>
              <span style={{fontWeight:'bold',fontSize:'1.08em'}}>{g.name}</span>
              <span style={{color:'#888',fontSize:'0.98em',marginLeft:6}}>{g.category}</span>
              <button onClick={() => handleAddGestureFromSuggestion(g)} style={{marginLeft:10,background:'#1976d2',color:'#fff',border:'none',borderRadius:8,padding:'6px 14px',fontWeight:'bold',cursor:'pointer',fontSize:'0.98em',boxShadow:'0 2px 8px #1976d233',transition:'transform 0.1s'}} onMouseDown={e=>e.currentTarget.style.transform='scale(0.97)'} onMouseUp={e=>e.currentTarget.style.transform='scale(1)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>Ajouter</button>
            </div>
          ))}
        </div>
      </div>
      {/* Affichage professionnelle pour diagnostic : liste des gestes */}
      <div style={{
        background: diagnosticHighlight ? '#e3f2fd' : '#fff',
        color:'#1976d2',
        padding:24,
        borderRadius:18,
        margin:'24px auto',
        fontSize:'1.08rem',
        border:'1.5px solid #b3c6e6',
        boxShadow: diagnosticHighlight ? '0 0 0 8px #90caf9aa' : '0 4px 18px #b3c6e633',
        maxWidth:700,
        width:'100%',
        transition:'box-shadow 0.5s cubic-bezier(.4,2,.6,1), background 0.3s',
        position:'relative',
        animation: diagnosticHighlight ? 'pulse 0.6s' : 'none'
      }}>
        <style>{`
          @keyframes fadeInRow { from { opacity: 0; transform: translateY(16px);} to { opacity: 1; transform: none; } }
          @keyframes pulse { 0% { box-shadow: 0 0 0 0 #90caf9aa; } 70% { box-shadow: 0 0 0 8px #90caf9aa; } 100% { box-shadow: 0 4px 18px #b3c6e633; } }
        `}</style>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
          <span style={{fontSize:'1.7em'}}>📋</span>
          <b style={{fontSize:'1.13em'}}>Diagnostic de vos gestes</b>
        </div>
        {Array.isArray(userData?.gestures) && userData.gestures.length > 0
          ? (
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:'1em',marginTop:6,background:'#f8fbff',borderRadius:10,overflow:'hidden',boxShadow:'0 2px 8px #b3c6e622'}}>
              <thead>
                <tr style={{background:'#e3f2fd'}}>
                  <th style={{padding:'8px 12px',border:'1.5px solid #b3c6e6',fontWeight:'bold'}}>Nom</th>
                  <th style={{padding:'8px 12px',border:'1.5px solid #b3c6e6',fontWeight:'bold'}}>Catégorie</th>
                  <th style={{padding:'8px 12px',border:'1.5px solid #b3c6e6',fontWeight:'bold'}}>CO₂ (kg)</th>
                  <th style={{padding:'8px 12px',border:'1.5px solid #b3c6e6',fontWeight:'bold'}}>Date</th>
                  <th style={{padding:'8px 12px',border:'1.5px solid #b3c6e6',fontWeight:'bold'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {userData.gestures.map((g,i) => (
                  <tr key={g._id || i}
                    style={{
                      background:i%2===0?'#f0f4ff':'#fff',
                      cursor:'pointer',
                      transition:'background 0.25s',
                      opacity: animatedGestures.includes(g._id) ? 1 : 0,
                      animation: animatedGestures.includes(g._id) ? 'fadeInRow 0.5s' : 'none'
                    }}
                    onClick={()=>setSelectedGesture(g)}
                    onMouseOver={e=>e.currentTarget.style.background='#e3f2fd'}
                    onMouseOut={e=>e.currentTarget.style.background=i%2===0?'#f0f4ff':'#fff'}
                  >
                    <td style={{padding:'7px 12px',border:'1.5px solid #b3c6e6'}}>{g.name}</td>
                    <td style={{padding:'7px 12px',border:'1.5px solid #b3c6e6'}}>
                      <span style={{marginRight:6}}>{getCategoryIcon(g.category)}</span>{g.category}
                    </td>
                    <td style={{padding:'7px 12px',border:'1.5px solid #b3c6e6'}}>{g.co2Saved}</td>
                    <td style={{padding:'7px 12px',border:'1.5px solid #b3c6e6'}}>{g.date ? new Date(g.date).toLocaleDateString() : ''}</td>
                    <td style={{padding:'7px 12px',border:'1.5px solid #b3c6e6',textAlign:'center'}}>
                      <button onClick={e => {e.stopPropagation(); setSelectedGesture(g);}} style={{background:'none',border:'none',color:'#1976d2',fontSize:18,cursor:'pointer'}} title="Voir le détail">🔍</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
          : <div style={{color:'#b26a00',display:'flex',alignItems:'center',gap:10,fontSize:'1.08em',marginTop:8}}>
              <span style={{fontSize:'1.5em'}}>ℹ️</span>
              <span>Aucun geste enregistré pour cet utilisateur.<br/>Clique sur <b style={{color:'#1976d2'}}>+ Ajouter un geste</b> pour commencer à enregistrer tes actions éco-responsables.</span>
            </div>}
        </div>
      {/* Modale de détail du geste sélectionné */}
      {selectedGesture && (
        <div className="pro-modal-bg" style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'#0007',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div className="pro-modal-content" style={{background:'#fff',borderRadius:18,padding:'32px 28px',boxShadow:'0 8px 32px #0003',minWidth:320,maxWidth:400,position:'relative'}}>
            <button onClick={()=>setSelectedGesture(null)} style={{position:'absolute',top:12,right:16,fontSize:22,background:'none',border:'none',cursor:'pointer',color:'#1976d2'}}>×</button>
            <h2 style={{marginBottom:12,display:'flex',alignItems:'center',gap:10}}>
              {getCategoryIcon(selectedGesture.category)} {selectedGesture.name}
            </h2>
            <div style={{marginBottom:10}}><b>Catégorie :</b> {selectedGesture.category}</div>
            <div style={{marginBottom:10}}><b>Description :</b> {selectedGesture.description || <span style={{color:'#888'}}>Aucune description</span>}</div>
            <div style={{marginBottom:10}}><b>CO₂ économisé :</b> {selectedGesture.co2Saved} kg</div>
            <div style={{marginBottom:10}}><b>Date :</b> {selectedGesture.date ? new Date(selectedGesture.date).toLocaleDateString() : <span style={{color:'#888'}}>Non renseignée</span>}</div>
            <div style={{display:'flex',gap:16,marginTop:18}}>
              <button onClick={()=>setSelectedGesture(null)} style={{background:'#1976d2',color:'#fff',border:'none',borderRadius:8,padding:'8px 18px',fontWeight:'bold',cursor:'pointer'}}>Fermer</button>
              <button onClick={async()=>{await deleteGesture(selectedGesture._id); setSelectedGesture(null);}} style={{background:'#c62828',color:'#fff',border:'none',borderRadius:8,padding:'8px 18px',fontWeight:'bold',cursor:'pointer'}}>Supprimer</button>
      </div>
          </div>
        </div>
      )}
      <div style={{width:'100%',maxWidth:700,margin:'0 auto'}}>
        <ExportTools gestures={userData?.gestures || []} />
      </div>
      {/* Actions rapides et export modernisé */}
      <div className="dashboard-actions-card pro-card pro-flex-row" style={{gap:'32px', alignItems:'flex-start', flexWrap:'wrap'}}>
        <button
          className="dashboard-action-btn pro-main-btn"
          onClick={()=>setShowGestureModal(true)}
          style={{
            background:'#1976d2',
            color:'#fff',
            fontWeight:'bold',
            fontSize:'1.13em',
            border:'none',
            borderRadius:12,
            padding:'14px 28px',
            boxShadow:'0 2px 8px #1976d233',
            cursor:'pointer',
            display:'flex',
            alignItems:'center',
            gap:10,
            transition:'transform 0.1s, box-shadow 0.1s',
            marginBottom:8
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span style={{fontSize:'1.3em',fontWeight:'bold'}}>＋</span> Ajouter un geste
        </button>
        <div style={{flex:1, minWidth:320}}>
          <ExportTools gestures={userData?.gestures || []} />
        </div>
      </div>
      {/* Modale d'ajout de geste */}
      {showGestureModal && (
        <div className="modal-bg pro-modal-bg">
          <div className="pro-modal-content">
            <button onClick={()=>setShowGestureModal(false)} className="pro-modal-close">×</button>
            <AddGestureForm
              onGestureAdded={() => {
                refreshUserData();
                setShowGestureModal(false);
                setChallengeToValidate(null);
                // Affiche un toast de confirmation après validation du défi
                if (window?.showToast) {
                  window.showToast({
                    type: 'success',
                    message: 'Défi du jour validé, bravo !',
                    position: 'top',
                    playSound: true
                  });
                } else {
                  showNotification('Défi du jour validé, bravo !', 'success');
                }
              }}
              gesturePreset={challengeToValidate ? {
                name: challengeToValidate.gestureName,
                category: challengeToValidate.category,
                description: challengeToValidate.description || '',
                co2Saved: 1
              } : null}
            />
          </div>
        </div>
      )}
      {/* Section Articles à lire (blog) */}
      <div className="dashboard-blog-card pro-card" style={{background:'#fff',borderRadius:18,boxShadow:'0 4px 18px #b3c6e633',padding:'32px 24px',margin:'32px auto',maxWidth:900}}>
        <style>{`
          @keyframes fadeInBlog { from { opacity: 0; transform: translateY(32px);} to { opacity: 1; transform: none; } }
          .blog-card-article { width:280px; min-height:370px; max-width:100%; background:#f8fbff; border-radius:14px; box-shadow:0 2px 8px #b3c6e622; overflow:hidden; display:flex; flex-direction:column; animation:fadeInBlog 0.7s; margin:12px 0; cursor:pointer; transition:box-shadow 0.2s, transform 0.2s; position:relative; }
          .blog-card-article:hover { transform:scale(1.04); box-shadow:0 0 0 8px #90caf9aa; }
          .blog-card-img { width:100%; height:140px; object-fit:cover; border-radius:14px 14px 0 0; }
          .blog-card-content { padding:16px 14px; flex:1; display:flex; flex-direction:column; justify-content:flex-start; }
          .blog-card-title { font-weight:bold; font-size:1.08em; color:#1976d2; margin-bottom:8px; text-align:left; transition: text-shadow 0.2s; }
          .blog-card-article:hover .blog-card-title { text-shadow:0 2px 8px #1976d2aa; text-decoration:underline; }
          .blog-card-summary { color:#555; font-size:0.98em; margin-bottom:12px; flex:1; text-align:justify; line-height:1.5; max-height:60px; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; }
          .blog-card-btn { align-self:flex-end; background:#1976d2; color:#fff; border:none; border-radius:8px; padding:6px 16px; font-weight:bold; cursor:pointer; font-size:0.98em; box-shadow:0 2px 8px #1976d233; transition:transform 0.1s; margin-top:8px; display:flex; align-items:center; gap:6px; }
          .blog-badge-new { position:absolute; top:10px; left:10px; background:#ff9800; color:#fff; font-weight:bold; font-size:0.92em; border-radius:6px; padding:2px 10px; box-shadow:0 2px 8px #ff980033; letter-spacing:1px; }
          .blog-card-article[data-cat='Énergie'] { box-shadow:0 2px 8px #b3c6e622, 0 0 0 2px #1976d2; }
          .blog-card-article[data-cat='Eau'] { box-shadow:0 2px 8px #b3c6e622, 0 0 0 2px #2196f3; }
          .blog-card-article[data-cat='Déchets'] { box-shadow:0 2px 8px #b3c6e622, 0 0 0 2px #43a047; }
          .blog-card-article[data-cat='Alimentation'] { box-shadow:0 2px 8px #b3c6e622, 0 0 0 2px #ffb300; }
          .blog-card-article[data-cat='Transport'] { box-shadow:0 2px 8px #b3c6e622, 0 0 0 2px #8bc34a; }
          @media (max-width:900px) { .blog-card-article { width:100%; min-width:220px; } }
        `}</style>
        <h3 className="dashboard-section-title" style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
          <span style={{fontSize:'1.5em'}}>📰</span> Articles à lire
        </h3>
        <div style={{display:'flex',gap:32,flexWrap:'wrap',justifyContent:'center'}}>
          {blogArticles.map((art,i) => (
            <div key={art.id} className="blog-card-article" data-cat={art.category} onClick={()=>setArticleModal(art)}>
              {art.isNew && <div className="blog-badge-new">Nouveau</div>}
              <img src={art.image} alt={art.title} className="blog-card-img" />
              <div className="blog-card-content">
                <div className="blog-card-title">{art.title}</div>
                <div className="blog-card-summary">{art.summary}</div>
                <button className="blog-card-btn" onClick={e=>{e.stopPropagation();setArticleModal(art);}}><span>Lire l'article</span> <span style={{fontSize:'1.1em'}}>→</span></button>
              </div>
            </div>
          ))}
        </div>
        {/* Modale d'article complet */}
        {articleModal && (
          <div className="pro-modal-bg" style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'#0007',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div className="pro-modal-content" style={{background:'#fff',borderRadius:18,padding:'32px 28px',boxShadow:'0 8px 32px #0003',minWidth:320,maxWidth:500,position:'relative'}}>
              <button onClick={()=>setArticleModal(null)} style={{position:'absolute',top:12,right:16,fontSize:22,background:'none',border:'none',cursor:'pointer',color:'#1976d2'}}>×</button>
              <img src={articleModal.image} alt={articleModal.title} style={{width:'100%',height:160,objectFit:'cover',borderRadius:12,marginBottom:18}} />
              <h2 style={{marginBottom:12,color:'#1976d2'}}>{articleModal.title}</h2>
              <div style={{color:'#555',marginBottom:18,textAlign:'justify',lineHeight:1.6}}>{articleModal.content}</div>
            </div>
          </div>
        )}
      </div>
      {/* Résumé historique CO2 */}
      <div className="dashboard-card" style={{marginTop:24}}>
        <h3 style={{color:'#1976d2',marginBottom:10}}>Mes derniers calculs CO₂</h3>
        {carbonHistory.length === 0 ? (
          <div style={{color:'#888'}}>Aucun calcul enregistré.</div>
        ) : (
          <ul style={{listStyle:'none',padding:0,margin:0}}>
            {carbonHistory.map((item,i) => (
              <li key={item._id || i} style={{marginBottom:10,background:'#e0f7fa',borderRadius:10,padding:'8px 12px'}}>
                <b>{new Date(item.date).toLocaleString()}</b> — <span style={{color:'#ff7043'}}>Émissions : {item.emissions} kg</span> — <span style={{color:'#43e97b'}}>Économies : {item.economies} kg</span>
              </li>
            ))}
          </ul>
        )}
        <a href="/carbon-history" className="carbon-calc-action-btn" style={{marginTop:10,display:'inline-block'}}>Voir tout l'historique</a>
      </div>
    </div>
  );
};

export default UserDashboard;