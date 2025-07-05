import React, { useState, useRef, useEffect } from 'react';

const StatAccordion = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  // Fermer si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={boxRef} style={{ marginBottom: '1rem', position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: '10px 20px',
          fontSize: '1.1rem',
          borderRadius: '8px',
          border: 'none',
          background: '#4CAF50',
          color: 'white',
          cursor: 'pointer',
          boxShadow: open ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
          transition: 'box-shadow 0.2s'
        }}
      >
        {title}
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '110%',
            left: 0,
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            padding: '15px',
            minWidth: '220px',
            zIndex: 100
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default StatAccordion; 