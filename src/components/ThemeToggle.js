import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { FaSun, FaMoon, FaPalette, FaAdjust } from 'react-icons/fa';

/**
 * Composant pour basculer entre les thèmes sombre et clair
 * Menu déroulant personnalisé (comme le bouton Informations)
 */
const ThemeToggle = () => {
  const [theme, setTheme] = useState('light');
  const [isAnimating, setIsAnimating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // état pour ouvrir/fermer le menu
  const [menuVisible, setMenuVisible] = useState(false); // état pour l'animation de fermeture
  const menuRef = useRef(null); // référence pour détecter le clic extérieur

  // Charger le thème sauvegardé au montage du composant
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  // Gestion du clic extérieur pour fermer le menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Animation d'ouverture/fermeture du menu
  useEffect(() => {
    if (menuOpen) {
      setMenuVisible(true); // Affiche le menu (déclenche l'animation d'ouverture)
    } else if (menuVisible) {
      // Lance l'animation de fermeture puis cache le menu après la transition
      const timeout = setTimeout(() => setMenuVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [menuOpen]);

  // Fonction pour appliquer un thème
  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark', 'theme-auto');
    root.classList.add(`theme-${newTheme}`);
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
  };

  // Fonction pour basculer le thème rapidement (clair <-> sombre)
  const toggleTheme = () => {
    setIsAnimating(true);
    setTimeout(() => {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      applyTheme(newTheme);
      setIsAnimating(false);
    }, 300);
  };

  // Fonction pour définir un thème spécifique
  const setSpecificTheme = (newTheme) => {
    setIsAnimating(true);
    setTimeout(() => {
      applyTheme(newTheme);
      setIsAnimating(false);
      setMenuOpen(false); // Fermer le menu après sélection
    }, 300);
  };

  // Fonction pour détecter automatiquement le thème système
  const setAutoTheme = () => {
    setSpecificTheme('auto');
    // Optionnel : écouter les changements système
  };

  // Obtenir l'icône et le texte selon le thème actuel
  const getThemeInfo = () => {
    switch (theme) {
      case 'dark':
        return { icon: <FaMoon />, text: 'Sombre' };
      case 'auto':
        return { icon: <FaAdjust />, text: 'Auto' };
      default:
        return { icon: <FaSun />, text: 'Clair' };
    }
  };

  const themeInfo = getThemeInfo();

  return (
    <div className="theme-toggle" style={{ position: 'relative', display: 'inline-block' }} ref={menuRef}>
      {/* Conteneur vertical pour les deux boutons */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        {/* Bouton principal pour basculer rapidement */}
        <Button
          variant="outline-secondary"
          onClick={toggleTheme}
          disabled={isAnimating}
          className="theme-toggle-btn"
          title={`Basculer vers le thème ${theme === 'light' ? 'sombre' : 'clair'}`}
        >
          {isAnimating ? (
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          ) : (
            themeInfo.icon
          )}
        </Button>

        {/* Bouton pour ouvrir le menu personnalisé */}
        <Button
          variant="outline-secondary"
          size="sm"
          className="theme-dropdown"
          title="Options de thème"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: 'inline-flex', alignItems: 'center' }}
        >
          <FaPalette />
        </Button>
      </div>

      {/* Menu déroulant personnalisé avec animation de glissement et fermeture douce */}
      {menuVisible && (
        <div
          className={`theme-dropdown-menu${menuOpen ? ' open' : ' closing'}`}
          style={{
            position: 'absolute',
            left: 0,
            top: '110%',
            minWidth: 200,
            background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)', // fond dégradé
            backdropFilter: 'blur(10px)',
            border: '1.5px solid #43c59e22',
            boxShadow: '0 12px 32px #2d8a8a33, 0 2px 8px #43c59e22',
            zIndex: 1000,
            borderRadius: 18,
            padding: '10px 0 10px 0',
            marginTop: 4,
            maxHeight: 220,
            overflowY: 'auto',
            opacity: menuOpen ? 1 : 0,
            transform: menuOpen ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(-24px)', // zoom + slide
            transition: 'opacity 0.32s, transform 0.32s',
            boxSizing: 'border-box',
          }}
        >
          <style>{`
            .theme-dropdown-menu { animation: themeDropdownZoomIn 0.38s cubic-bezier(.23,1.01,.32,1); }
            @keyframes themeDropdownZoomIn { from { opacity: 0; transform: scale(0.92) translateY(-24px); } to { opacity: 1; transform: scale(1) translateY(0); } }
            .theme-dropdown-title { font-weight: bold; font-size: 1.08em; color: #1976d2; display: flex; align-items: center; gap: 8px; margin-bottom: 10px; padding: 0 18px; }
            .theme-option { transition: background 0.18s, color 0.18s, transform 0.12s, box-shadow 0.18s; cursor: pointer; display: flex; align-items: center; padding: 12px 18px; border-radius: 12px; font-size: 1.05em; margin: 0 8px 6px 8px; outline: none; border: none; position: relative; }
            .theme-option:hover .theme-icon, .theme-option:focus .theme-icon { animation: iconSpin 0.7s linear; }
            @keyframes iconSpin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
            .theme-option:hover, .theme-option:focus { background: linear-gradient(90deg, #43c59e22 0%, #2d8a8a11 100%); color: #2d8a8a; transform: translateX(4px) scale(1.03); box-shadow: 0 2px 8px #43c59e22; outline: 2px solid #43c59e44; }
            .theme-option:active { transform: scale(0.97); background: #e0f7fa; color: #1976d2; }
            .theme-option.active { background: #f0f0f0; color: #1976d2; font-weight: bold; box-shadow: 0 0 8px 2px #43c59e55; }
            .theme-option.active .theme-icon { filter: drop-shadow(0 0 6px #43c59e88); }
            @media (max-width: 600px) { .theme-dropdown-menu { min-width: 140px; padding: 6px 0 6px 0; } .theme-dropdown-title { padding: 0 10px; } }
          `}</style>
          <div className="theme-dropdown-title">
            <FaPalette style={{marginRight:6}} className="theme-icon" /> Choisir un thème
          </div>
          <div
            className={`theme-option light${theme === 'light' ? ' active' : ''}`}
            tabIndex={0}
            onClick={() => setSpecificTheme('light')}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setSpecificTheme('light')}
          >
            <FaSun className="me-2 theme-icon" style={{marginRight:8, transition:'color 0.2s'}} /> Thème clair {theme === 'light' && <span style={{ marginLeft: 'auto' }}>✓</span>}
          </div>
          <div
            className={`theme-option dark${theme === 'dark' ? ' active' : ''}`}
            tabIndex={0}
            onClick={() => setSpecificTheme('dark')}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setSpecificTheme('dark')}
          >
            <FaMoon className="me-2 theme-icon" style={{marginRight:8, transition:'color 0.2s'}} /> Thème sombre {theme === 'dark' && <span style={{ marginLeft: 'auto' }}>✓</span>}
          </div>
          <div
            className={`theme-option auto${theme === 'auto' ? ' active' : ''}`}
            tabIndex={0}
            onClick={setAutoTheme}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setAutoTheme()}
          >
            <FaAdjust className="me-2 theme-icon" style={{marginRight:8, transition:'color 0.2s'}} /> Suivre le système {theme === 'auto' && <span style={{ marginLeft: 'auto' }}>✓</span>}
          </div>
          <div style={{color:'#888',fontSize:'0.97em',marginTop:8,padding:'0 18px'}}>Le thème sera sauvegardé pour votre prochaine visite</div>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle; 