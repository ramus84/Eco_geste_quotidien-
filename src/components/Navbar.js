import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { 
  FaHome, 
  FaChartLine, 
  FaPlus, 
  FaSignInAlt, 
  FaUserPlus, 
  FaInfoCircle, 
  FaQuestionCircle, 
  FaEnvelope, 
  FaShieldAlt, 
  FaLightbulb, 
  FaBell, 
  FaUser, 
  FaSignOutAlt,
  FaLeaf,
  FaCalculator,
  FaTrophy,
  FaCog,
  FaUserCircle,
  FaRocket
} from 'react-icons/fa';
import './Navbar.css';
import { NotificationContext, LoaderContext } from '../App';
import ThemeToggle from './ThemeToggle';
import ToastNotification from './ToastNotification';

const NavigationBar = () => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const infoRef = useRef(null);
  const { showNotification } = useContext(NotificationContext);
  const { setShowLoader } = useContext(LoaderContext);
  const navigate = useNavigate();

  // Ajout d'un état pour le menu utilisateur
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Ajout d'un état pour le menu notifications
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const notifMenuRef = useRef(null);
  // Notifications en mémoire (pour la démo)
  const [notifications, setNotifications] = useState(() => {
    // On peut charger depuis le localStorage si tu veux persister
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [
      { id: 1, type: 'success', message: 'Bravo, geste ajouté !', read: false },
      { id: 2, type: 'info', message: 'Nouveau défi du jour disponible.', read: false },
      { id: 3, type: 'error', message: 'Erreur de connexion.', read: true }
    ];
  });
  // Sauvegarde dans le localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);
  // Ajout d'un badge sur l'avatar si notifications non lues
  // Simulation notifications temps réel (démo)
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(n => [
        ...n,
        {
          id: Date.now(),
          type: 'info',
          message: `Nouvelle notification automatique à ${new Date().toLocaleTimeString()}`,
          read: false
        }
      ]);
    }, 30000); // toutes les 30 secondes
    return () => clearInterval(interval);
  }, []);
  // Gestion fermeture menu notifications au clic dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target)) {
        setNotifMenuOpen(false);
      }
    };
    if (notifMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notifMenuOpen]);
  // Fonctions pour marquer comme lue/supprimer
  const markAsRead = (id) => setNotifications(n => n.map(notif => notif.id === id ? { ...notif, read: true } : notif));
  const removeNotif = (id) => setNotifications(n => n.filter(notif => notif.id !== id));
  const unreadCount = notifications.filter(n => !n.read).length;

  // Ajout d'un état pour le toast
  const [toast, setToast] = useState(null);
  // Fonction pour déclencher une notification personnalisée (toast + menu)
  const triggerCustomNotif = (type = 'success', message = 'Action personnalisée réussie !') => {
    // Ajoute la notif dans le menu
    setNotifications(n => [
      ...n,
      { id: Date.now(), type, message, read: false }
    ]);
    // Affiche le toast
    setToast({ type, message });
    // Cache le toast après 4s
    setTimeout(() => setToast(null), 4000);
  };

  // Fonction pour déclencher un toast avancé (en haut, persistant, avec son)
  const triggerAdvancedToast = () => {
    setToast({
      type: 'info',
      message: 'Ceci est une notification avancée en haut, avec son et persistante !',
      position: 'top',
      persist: true,
      playSound: true
    });
  };

  // Gestion fermeture menu utilisateur au clic dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  // Récupération des infos utilisateur (nom, avatar)
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch {}
  const getInitials = (u) => {
    if (!u) return '?';
    if (u.avatarUrl) return null;
    const names = (u.username || u.name || '').split(' ');
    return names.length > 1 ? (names[0][0] + names[1][0]).toUpperCase() : (names[0]?.[0] || '?').toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (infoRef.current && !infoRef.current.contains(event.target)) {
        setInfoOpen(false);
      }
    };
    if (infoOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [infoOpen]);

  const handleLogout = () => {
    setShowLoader(true);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showNotification('Déconnexion réussie.', 'success');
    setTimeout(() => {
      setShowLoader(false);
      navigate('/');
      window.location.reload();
    }, 1200);
  };

  const isActive = (path) => location.pathname === path;

  const handleInfoOptionClick = (path) => {
    setInfoOpen(false);
    window.location.href = path;
  };

  return (
    <Navbar expand="lg" className="navbar-modern shadow-lg" sticky="top">
      <Container fluid className="px-4">
        {/* Logo et Titre modernisés */}
        <Navbar.Brand as={Link} to="/" className="brand-container" aria-label="Accueil ÉcoGestes">
          <div className="brand-logo pop-on-hover">
            <FaLeaf className="logo-icon" />
          </div>
          <div className="brand-text">
            <span className="brand-primary gradient-text">Éco</span>
            <span className="brand-secondary gradient-text">Gestes</span>
            <span className="brand-tagline">Quotidien</span>
          </div>
        </Navbar.Brand>
        {/* Ajout du switch de thème */}
        <div style={{marginLeft: 'auto', marginRight: 16}}>
          <ThemeToggle />
        </div>

        {/* Menu burger modernisé */}
        <Navbar.Toggle aria-controls="navbar-nav" className="navbar-toggler-custom burger-anim" aria-label="Ouvrir le menu" />
        
        <Navbar.Collapse id="navbar-nav">
          <Nav className="navbar-nav-main">
            {/* Navigation Principale */}
            <div className="nav-section primary">
              <Nav.Link 
                as={Link} 
                to="/" 
                className={`nav-item ${isActive('/') ? 'active underline-anim' : ''}`}
                aria-label="Accueil"
              >
                <FaHome className="nav-icon" />
                <span>Accueil</span>
              </Nav.Link>
              
              {token && (
                <Nav.Link 
                  as={Link} 
                  to="/dashboard" 
                  className={`nav-item ${isActive('/dashboard') ? 'active underline-anim' : ''}`}
                  aria-label="Tableau de bord"
                >
                  <FaChartLine className="nav-icon" />
                  <span>Tableau de bord</span>
                </Nav.Link>
              )}
            </div>

            {/* Actions Principales */}
            <div className="nav-section actions">
          {token ? (
                <Nav.Link
                  as={Link}
                  to="/user-dashboard"
                  className="btn-primary-action pulse"
                  aria-label="Ajouter un geste"
                >
                  <FaPlus className="action-icon" />
                  <span>Ajouter un geste</span>
                </Nav.Link>
              ) : (
                <div className="auth-buttons">
                  <Nav.Link as={Link} to="/login" className="btn-secondary" aria-label="Se connecter">
                    <FaSignInAlt className="btn-icon" />
                    <span>Se connecter</span>
                  </Nav.Link>
                  <Nav.Link as={Link} to="/register" className="btn-primary pulse" aria-label="S'inscrire">
                    <FaUserPlus className="btn-icon" />
                    <span>S'inscrire</span>
                  </Nav.Link>
                </div>
              )}
            </div>

            {/* Bouton de simulation d'action pour la démo */}
            {token && (
              <>
                <button
                  className="simulate-action-btn"
                  style={{marginLeft:16,background:'#43c59e',color:'#fff',border:'none',borderRadius:10,padding:'8px 16px',fontWeight:'bold',cursor:'pointer',boxShadow:'0 2px 8px #43c59e33',display:'flex',alignItems:'center',gap:8}}
                  onClick={()=>triggerCustomNotif('success', 'Bravo, tu as simulé une action !')}
                  aria-label="Simuler une action personnalisée"
                >
                  <FaRocket /> Simuler une action
                </button>
                <button
                  className="simulate-action-btn"
                  style={{marginLeft:12,background:'#1976d2',color:'#fff',border:'none',borderRadius:10,padding:'8px 16px',fontWeight:'bold',cursor:'pointer',boxShadow:'0 2px 8px #1976d233',display:'flex',alignItems:'center',gap:8}}
                  onClick={triggerAdvancedToast}
                  aria-label="Simuler une notification toast avancée"
                >
                  <FaRocket /> Simuler une notification avancée
                </button>
              </>
            )}

            {/* Menu Utilisateur modernisé avec avatar + badge nombre */}
            {token && (
              <div className="nav-section user-menu" ref={userMenuRef} style={{position:'relative'}}>
                <button
                  className="user-avatar-btn"
                  aria-label="Ouvrir le menu utilisateur"
                  onClick={() => setUserMenuOpen(v => !v)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    marginLeft: 18,
                    cursor: 'pointer',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                  }}
                >
                  {/* Affiche l'image de l'utilisateur si dispo, sinon initiales, sinon icône */}
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar utilisateur" className="user-avatar-img" />
                  ) : getInitials(user) !== '?' ? (
                    <span className="user-avatar-initials">{getInitials(user)}</span>
                  ) : (
                    <FaUserCircle className="user-avatar-icon" />
                  )}
                  {/* Badge rouge sur l'avatar avec nombre de notifications non lues */}
                  {unreadCount > 0 && <span className="notif-badge-anim user-avatar-badge">{unreadCount}</span>}
                </button>
                {/* Menu déroulant stylé */}
                {userMenuOpen && (
                  <div className="user-dropdown-menu animated-dropdown" tabIndex={-1} aria-label="Menu utilisateur">
                    <div className="user-dropdown-header">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Avatar utilisateur" className="user-avatar-img user-avatar-menu" />
                      ) : getInitials(user) !== '?' ? (
                        <span className="user-avatar-initials user-avatar-menu">{getInitials(user)}</span>
                      ) : (
                        <FaUserCircle className="user-avatar-icon user-avatar-menu" />
                      )}
                      <div className="user-dropdown-name">{user?.username || user?.name || 'Utilisateur'}</div>
                    </div>
                    <button className="user-dropdown-item" onClick={()=>{navigate('/account'); setUserMenuOpen(false);}}>
                      Profil
                    </button>
                    <button className="user-dropdown-item" onClick={()=>{handleLogout(); setUserMenuOpen(false);}}>
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Icône cloche notifications */}
            {token && (
              <div className="nav-section notif-menu" ref={notifMenuRef} style={{position:'relative',marginLeft:18}}>
                <button
                  className="notif-bell-btn"
                  aria-label="Ouvrir le menu notifications"
                  onClick={() => setNotifMenuOpen(v => !v)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    position: 'relative',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <FaBell className="notif-bell-icon" />
                  {/* Badge rouge si notifications non lues */}
                  {unreadCount > 0 && <span className="notif-badge-anim">{unreadCount}</span>}
                </button>
                {/* Menu déroulant notifications */}
                {notifMenuOpen && (
                  <div className="notif-dropdown-menu animated-dropdown" tabIndex={-1} aria-label="Menu notifications">
                    <div className="notif-dropdown-header">Notifications</div>
                    {notifications.length === 0 ? (
                      <div className="notif-dropdown-empty">Aucune notification</div>
                    ) : notifications.map(notif => (
                      <div key={notif.id} className={`notif-dropdown-item notif-${notif.type} ${notif.read ? 'notif-read' : ''}`}
                        style={{display:'flex',alignItems:'center',gap:10,justifyContent:'space-between'}}>
                        <span style={{flex:1}}>{notif.message}</span>
                        {!notif.read && <button className="notif-mark-btn" onClick={()=>markAsRead(notif.id)} title="Marquer comme lue">✓</button>}
                        <button className="notif-remove-btn" onClick={()=>removeNotif(notif.id)} title="Supprimer">×</button>
                      </div>
                    ))}
                </div>
                )}
              </div>
            )}

            {/* Menu Informations personnalisé */}
            <div className="nav-section info" ref={infoRef}>
              <div className="info-toggle" style={{cursor: 'pointer', display: 'flex', alignItems: 'center'}} onClick={() => setInfoOpen(!infoOpen)}>
                <FaInfoCircle className="info-icon" />
                <span>Informations</span>
              </div>
              {infoOpen && (
                <div className="dropdown-menu-modern" style={{position: 'absolute', zIndex: 1000, minWidth: '180px', background: 'white', border: '1px solid #ccc', boxShadow: '0 2px 8px rgba(0,0,0,0.15)'}}>
                  <div className="dropdown-item" style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}} onClick={() => handleInfoOptionClick('/about')}>
                    <FaInfoCircle className="dropdown-icon" />
                    <span>À propos</span>
                  </div>
                  <div className="dropdown-item" style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}} onClick={() => handleInfoOptionClick('/tips')}>
                    <FaLightbulb className="dropdown-icon" />
                    <span>Conseils éco</span>
                  </div>
                  <div className="dropdown-item" style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}} onClick={() => handleInfoOptionClick('/faq')}>
                    <FaQuestionCircle className="dropdown-icon" />
                    <span>FAQ</span>
                  </div>
                  <div className="dropdown-item" style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}} onClick={() => handleInfoOptionClick('/contact')}>
                    <FaEnvelope className="dropdown-icon" />
                    <span>Contact</span>
                  </div>
                  <div className="dropdown-item" style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}} onClick={() => handleInfoOptionClick('/legal')}>
                    <FaShieldAlt className="dropdown-icon" />
                    <span>Mentions légales</span>
                  </div>
                </div>
              )}
            </div>
        </Nav>
      </Navbar.Collapse>
      </Container>
      {/* Toast notification en bas ou en haut selon les options */}
      {toast && (
        <ToastNotification
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
          position={toast.position}
          persist={toast.persist}
          playSound={toast.playSound}
        />
      )}
    </Navbar>
  );
};

export default NavigationBar;
