import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const getNotifStyle = (type) => {
  switch(type) {
    case 'success': return { bg: 'rgba(67,197,158,0.98)', icon: <FaCheckCircle style={{color:'#fff',marginRight:10,fontSize:22}} /> };
    case 'error': return { bg: 'rgba(244,67,54,0.98)', icon: <FaExclamationCircle style={{color:'#fff',marginRight:10,fontSize:22}} /> };
    default: return { bg: 'rgba(33,150,243,0.98)', icon: <FaInfoCircle style={{color:'#fff',marginRight:10,fontSize:22}} /> };
  }
};

const NotificationComponent = ({ message, type, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;
  const { bg, icon } = getNotifStyle(type);

  return (
    <div
      className="notif-animated"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 28,
        right: 28,
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
        animation: 'notifSlideIn 0.5s cubic-bezier(.23,1.01,.32,1)',
      }}
    >
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
        @keyframes notifSlideIn {
          from { opacity: 0; transform: translateY(-30px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default NotificationComponent;
