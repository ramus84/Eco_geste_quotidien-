import React, { useState } from 'react';
import axiosInstance from '../axiosConfig';

// Formulaire d'édition d'un geste existant
function EditGestureForm({ gesture, onCancel, onSaved }) {
  // État local pour le formulaire
  const [form, setForm] = useState({
    name: gesture.name,
    description: gesture.description,
    category: gesture.category,
    co2Saved: gesture.co2Saved
  });
  const [message, setMessage] = useState('');

  // Gère les changements dans le formulaire
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Gère la soumission du formulaire
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/gestures/${gesture._id}`, {
        ...form,
        co2Saved: Number(form.co2Saved)
      });
      setMessage('Geste modifié avec succès !');
      if (onSaved) onSaved(); // Notifie le parent pour rafraîchir la liste
    } catch (err) {
      setMessage("Erreur lors de la modification du geste.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{margin:'10px',padding:'10px',background:'#fffde7',borderRadius:8}}>
      <h4>Modifier le geste</h4>
      <input name="name" value={form.name} onChange={handleChange} required style={{display:'block',marginBottom:8,width:'100%'}} />
      <input name="description" value={form.description} onChange={handleChange} required style={{display:'block',marginBottom:8,width:'100%'}} />
      <input name="category" value={form.category} onChange={handleChange} required style={{display:'block',marginBottom:8,width:'100%'}} />
      <input name="co2Saved" value={form.co2Saved} onChange={handleChange} required type="number" style={{display:'block',marginBottom:8,width:'100%'}} />
      <button type="submit" style={{background:'#1976d2',color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',fontWeight:'bold',marginRight:8}}>Enregistrer</button>
      <button type="button" onClick={onCancel} style={{background:'#bbb',color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',fontWeight:'bold'}}>Annuler</button>
      <div style={{marginTop:8}}>{message}</div>
    </form>
  );
}

export default EditGestureForm; 