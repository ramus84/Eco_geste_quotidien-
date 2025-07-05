import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaChartLine, FaLightbulb, FaTrophy, FaCalculator, FaInfoCircle, FaQuestionCircle, FaLifeRing, FaShieldAlt, FaLock, FaFileContract, FaBlog, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaTint, FaBolt, FaRecycle, FaLeaf, FaArrowUp } from 'react-icons/fa';
import './Footer.css';
import { useState, useEffect } from 'react';

const inspirationalQuote = "« Le plus grand danger pour notre planète est de penser que quelqu’un d’autre va la sauver. » – Robert Swan";

const Footer = () => {
  // État pour afficher ou cacher le bouton retour en haut
  const [showTopBtn, setShowTopBtn] = useState(false);

  // Gestion de l'apparition du bouton selon le scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fonction pour remonter en haut en douceur
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-modern">
      <div className="footer-container" style={{alignItems:'flex-start'}}>
        {/* Logo et description */}
        <div className="footer-section" style={{flex:'1 1 260px',minWidth:220}}>
          <div className="footer-logo" style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
            <FaLeaf style={{fontSize:32,color:'#43c59e'}} />
            <span style={{fontWeight:'bold',fontSize:'1.3em',color:'#fff',letterSpacing:1}}>ÉcoGestes</span>
          </div>
          <div className="footer-description" style={{color:'#b8c5d6',fontSize:'1em',lineHeight:1.6}}>
            Plateforme pour adopter des gestes éco-responsables, suivre son impact et s’inspirer au quotidien.
          </div>
        </div>
        {/* Liens essentiels */}
        <div className="footer-section" style={{flex:'1 1 180px',minWidth:180}}>
          <h4>Navigation</h4>
          <ul>
            <li><Link to="/">Accueil</Link></li>
            <li><Link to="/dashboard">Tableau de bord</Link></li>
            <li><Link to="/tips">Conseils éco</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/legal">Mentions légales</Link></li>
          </ul>
        </div>
        {/* Réseaux sociaux */}
        <div className="footer-section" style={{flex:'1 1 180px',minWidth:180}}>
          <h4>Suivez-nous</h4>
          <div className="footer-socials" style={{display:'flex',gap:16,marginTop:10}}>
            <a href="https://facebook.com/ecogestes" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Facebook"><FaFacebook /></a>
            <a href="https://twitter.com/ecogestes" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Twitter"><FaTwitter /></a>
            <a href="https://instagram.com/ecogestes" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://linkedin.com/company/ecogestes" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="LinkedIn"><FaLinkedin /></a>
          </div>
        </div>
      </div>
      {/* Citation inspirante */}
      <div className="footer-quote">{inspirationalQuote}</div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} ÉcoGestes. Tous droits réservés.
      </div>
      {/* Bouton retour en haut */}
      {showTopBtn && (
        <button className="back-to-top" onClick={scrollToTop} aria-label="Retour en haut">
          <FaArrowUp />
        </button>
      )}
    </footer>
  );
};

export default Footer;
