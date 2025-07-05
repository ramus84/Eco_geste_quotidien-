import React, { useEffect, useRef, useState } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const getToastStyle = (type) => {
  switch(type) {
    case 'success': return { bg: 'rgba(67,197,158,0.98)', icon: <FaCheckCircle style={{color:'#fff',marginRight:10,fontSize:22}} /> };
    case 'error': return { bg: 'rgba(244,67,54,0.98)', icon: <FaExclamationCircle style={{color:'#fff',marginRight:10,fontSize:22}} /> };
    default: return { bg: 'rgba(33,150,243,0.98)', icon: <FaInfoCircle style={{color:'#fff',marginRight:10,fontSize:22}} /> };
  }
};

// Props : message, type, onClose, position ('top' ou 'bottom'), persist (bool), playSound (bool)
const ToastNotification = ({ message, type, onClose, position = 'bottom', persist = false, playSound = false }) => {
  const audioRef = useRef(null);
  const [audioOk, setAudioOk] = useState(true); // Pour désactiver le son si erreur

  // Joue le son à l'apparition si demandé
  useEffect(() => {
    if (playSound && audioRef.current && audioOk) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => setAudioOk(false)); // Si erreur, on désactive le son
    }
  }, [playSound, audioOk]);

  // Disparition automatique si non persistant
  useEffect(() => {
    if (!persist) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [persist, onClose]);

  if (!message) return null;
  const { bg, icon } = getToastStyle(type);
  // Positionnement dynamique
  const posStyle = position === 'top'
    ? { top: 32, bottom: 'auto', right: 32 }
    : { bottom: 32, top: 'auto', right: 32 };

  // Gestion d'erreur sur l'audio (désactive le son si erreur)
  const handleAudioError = () => setAudioOk(false);

  return (
    <div
      className="toast-animated"
      aria-live="polite"
      style={{
        position: 'fixed',
        ...posStyle,
        zIndex: 9999,
        minWidth: 260,
        maxWidth: 380,
        display: 'flex',
        alignItems: 'center',
        padding: '1rem 1.5rem',
        background: bg,
        color: 'white',
        borderRadius: '14px',
        boxShadow: '0 6px 32px rgba(44,197,158,0.18)',
        backdropFilter: 'blur(6px)',
        fontSize: '1.08em',
        animation: position === 'top' ? 'toastSlideInTop 0.5s cubic-bezier(.23,1.01,.32,1)' : 'toastSlideIn 0.5s cubic-bezier(.23,1.01,.32,1)',
      }}
    >
      {/* Son de notification (joué à l'apparition si playSound et pas d'erreur) */}
      {playSound && audioOk && (
        <audio ref={audioRef} src="/notification.mp3" preload="auto" onError={handleAudioError} />
      )}
      {icon}
      <span style={{flex:1}}>{message}</span>
      <button
        onClick={onClose}
        aria-label="Fermer la notification"
        style={{
          marginLeft: 18,
          background: 'none',
          color: 'white',
          border: 'none',
          fontWeight: 'bold',
          fontSize: 22,
          cursor: 'pointer',
          borderRadius: '50%',
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.18s',
        }}
        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.13)'}
        onMouseOut={e => e.currentTarget.style.background = 'none'}
      >
        <FaTimes />
      </button>
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateY(40px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toastSlideInTop {
          from { opacity: 0; transform: translateY(-40px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ToastNotification; 