import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const GestureDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gesture, setGesture] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:5000/api/gestures`)
      .then(res => {
        const found = res.data.find(g => g._id === id);
        setGesture(found);
        setForm(found);
      });
  }, [id]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/api/gestures/${id}`, form);
      setMessage('Geste modifié !');
      setEditMode(false);
      setGesture({ ...gesture, ...form });
    } catch {
      setMessage('Erreur lors de la modification');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Supprimer ce geste ?')) {
      await axios.delete(`http://localhost:5000/api/gestures/${id}`);
      navigate('/');
    }
  };

  if (!gesture) return <div>Chargement...</div>;

  return (
    <div>
      <h2>Détail du geste</h2>
      {editMode ? (
        <div>
          <input name="name" value={form.name || ''} onChange={handleChange} placeholder="Nom" /> <br />
          <input name="description" value={form.description || ''} onChange={handleChange} placeholder="Description" /> <br />
          <input name="impact" type="number" value={form.impact || ''} onChange={handleChange} placeholder="Impact" /> <br />
          <input name="co2Saved" type="number" value={form.co2Saved || ''} onChange={handleChange} placeholder="CO₂ économisé" /> <br />
          <input name="category" value={form.category || ''} onChange={handleChange} placeholder="Catégorie" /> <br />
          <input name="date" type="date" value={form.date ? form.date.substring(0,10) : ''} onChange={handleChange} placeholder="Date" /> <br />
          <input name="imageUrl" value={form.imageUrl || ''} onChange={handleChange} placeholder="URL de l'image" /> <br />
          <button onClick={handleSave}>Enregistrer</button>
          <button onClick={() => setEditMode(false)}>Annuler</button>
        </div>
      ) : (
        <div>
          <strong>{gesture.name}</strong><br />
          {gesture.description && <span>Description : {gesture.description}<br /></span>}
          {gesture.impact && <span>Impact : {gesture.impact} kg<br /></span>}
          {gesture.co2Saved && <span>CO₂ économisé : {gesture.co2Saved} kg<br /></span>}
          {gesture.category && <span>Catégorie : {gesture.category}<br /></span>}
          {gesture.date && <span>Date : {new Date(gesture.date).toLocaleDateString()}<br /></span>}
          {gesture.imageUrl && <img src={gesture.imageUrl} alt={gesture.name} style={{ maxWidth: '150px', display: 'block', marginTop: '0.5rem' }} />}
          <br />
          <button onClick={() => setEditMode(true)}>Modifier</button>
          <button onClick={handleDelete} style={{ color: 'red' }}>Supprimer</button>
        </div>
      )}
      {message && <p>{message}</p>}
      <button onClick={() => navigate('/')}>Retour à l'accueil</button>
    </div>
  );
};

export default GestureDetail; 