import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';

const CATEGORIES = [
  'Énergie',
  'Eau',
  'Transport',
  'Déchets',
  'Alimentation',
  'Maison',
  'Autre'
];

// Composant formulaire pour ajouter un geste
function AddGestureForm({ onGestureAdded }) {
  // État pour stocker les valeurs du formulaire
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    co2Saved: ''
  });
  // État pour afficher un message à l'utilisateur
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Effet pour pré-remplir les champs si window.prefillGestureData existe
  useEffect(() => {
    if (window.prefillGestureData) {
      setForm(f => ({
        ...f,
        ...window.prefillGestureData
      }));
      window.prefillGestureData = undefined;
    }
  }, []);

  // Fonction appelée à chaque changement dans un champ du formulaire
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setMessage('');
  };

  const validateForm = () => {
    if (!form.name.trim() || !form.description.trim() || !form.category.trim() || form.co2Saved === '') {
      setError('Tous les champs sont obligatoires.');
      return false;
    }
    if (!CATEGORIES.includes(form.category)) {
      setError('Merci de choisir une catégorie valide.');
      return false;
    }
    const co2 = Number(form.co2Saved);
    if (isNaN(co2) || co2 <= 0) {
      setError('Le CO2 économisé doit être un nombre positif.');
      return false;
    }
    return true;
  };

  // Fonction appelée lors de la soumission du formulaire
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!validateForm()) return;
    try {
      // Envoie les données au backend (POST)
      await axiosInstance.post('/gestures', {
        ...form,
        co2Saved: Number(form.co2Saved)
      });
      setMessage('Geste ajouté avec succès !');
      setForm({ name: '', description: '', category: '', co2Saved: '' });
      if (onGestureAdded) onGestureAdded();
    } catch (err) {
      // Afficher le vrai message d'erreur du serveur si disponible
      const msg = err?.response?.data?.error || err?.message || 'Erreur lors de l\'ajout du geste.';
      setError(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      margin:'0 auto',
      padding:'32px 28px',
      background:'#fff',
      borderRadius:18,
      maxWidth:420,
      boxShadow:'0 4px 18px #b3c6e633',
      display:'flex',
      flexDirection:'column',
      gap:18
    }}>
      <h2 style={{color:'#1976d2',marginBottom:8,display:'flex',alignItems:'center',gap:10}}>
        <span style={{fontSize:'1.3em'}}>＋</span> Ajouter un geste
      </h2>
      <label style={{fontWeight:'bold',color:'#1976d2'}}>Nom du geste
        <input name="name" placeholder="Ex : Prendre le vélo" value={form.name} onChange={handleChange} required style={{display:'block',marginTop:6,marginBottom:0,width:'100%',padding:10,borderRadius:8,border:'1.5px solid #b3c6e6',fontSize:'1em'}} />
      </label>
      <label style={{fontWeight:'bold',color:'#1976d2'}}>Description
        <input name="description" placeholder="Ex : Aller au travail à vélo" value={form.description} onChange={handleChange} required style={{display:'block',marginTop:6,marginBottom:0,width:'100%',padding:10,borderRadius:8,border:'1.5px solid #b3c6e6',fontSize:'1em'}} />
      </label>
      <label style={{fontWeight:'bold',color:'#1976d2'}}>Catégorie
        <select name="category" value={form.category} onChange={handleChange} required style={{display:'block',marginTop:6,marginBottom:0,width:'100%',padding:10,borderRadius:8,border:'1.5px solid #b3c6e6',fontSize:'1em',background:'#f8fbff'}}>
          <option value="">Choisir une catégorie</option>
          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </label>
      <label style={{fontWeight:'bold',color:'#1976d2'}}>CO₂ économisé (kg)
        <input name="co2Saved" placeholder="Ex : 2.5" value={form.co2Saved} onChange={handleChange} required type="number" min="0.01" step="0.01" style={{display:'block',marginTop:6,marginBottom:0,width:'100%',padding:10,borderRadius:8,border:'1.5px solid #b3c6e6',fontSize:'1em'}} />
      </label>
      <button type="submit" style={{
        background:'#1976d2',
        color:'#fff',
        border:'none',
        borderRadius:10,
        padding:'12px 0',
        fontWeight:'bold',
        fontSize:'1.1em',
        marginTop:8,
        boxShadow:'0 2px 8px #1976d233',
        cursor:'pointer',
        transition:'transform 0.1s, box-shadow 0.1s'
      }}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >Ajouter</button>
      {error && <div style={{marginTop:4, color:'#c62828', fontWeight:'bold',background:'#ffebee',padding:10,borderRadius:8}}>{error}</div>}
      {message && <div style={{marginTop:4, color:'#388e3c', fontWeight:'bold',background:'#e8f5e9',padding:10,borderRadius:8}}>{message}</div>}
    </form>
  );
}

export default AddGestureForm; 