import React, { useState } from 'react';
import axiosInstance from '../axiosConfig';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const address = "12 rue de l'Écologie, 75000 Paris";
  const email = "contact@ecogestes.fr";
  const phone = "+33 1 23 45 67 89";
  const hours = "Lun-Ven : 9h-18h";

  // Regex pour valider les champs
  const nameRegex = /^[a-zA-ZÀ-ÿ' -]{2,30}$/;
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;
  const messageRegex = /^.{10,}$/;
  const [errors, setErrors] = useState({});

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const newErrors = {};
    if (!nameRegex.test(form.name)) newErrors.name = "Le nom doit faire entre 2 et 30 lettres, espaces ou tirets.";
    if (!emailRegex.test(form.email)) newErrors.email = "L'email n'est pas valide.";
    if (!messageRegex.test(form.message)) newErrors.message = "Le message doit contenir au moins 10 caractères.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    try {
      await axiosInstance.post('/messages/contact', form);
      setSent(true);
    } catch (err) {
      setErrors({ submit: "Erreur lors de l'envoi du message." });
    }
  };

  return (
    <div className="contact-main-container">
      <h2 className="contact-title">Contact</h2>
      <div className="contact-infos">
        <div className="contact-info-item">
          <span className="contact-icon" role="img" aria-label="adresse">📍</span>
          <span className="contact-info-label">Adresse :</span>
          <span className="contact-info-value">{address}</span>
          <button className="contact-map-btn" onClick={() => setShowMap(!showMap)}>
            <span role="img" aria-label="carte">🗺️</span> Voir la carte
          </button>
        </div>
        <div className="contact-info-item">
          <span className="contact-icon" role="img" aria-label="email">✉️</span>
          <span className="contact-info-label">Email :</span>
          <a className="contact-info-link" href={`mailto:${email}`}>{email}</a>
        </div>
        <div className="contact-info-item">
          <span className="contact-icon" role="img" aria-label="téléphone">📞</span>
          <span className="contact-info-label">Téléphone :</span>
          <a className="contact-info-link" href={`tel:${phone.replace(/ /g, '')}`}>{phone}</a>
        </div>
        <div className="contact-info-item">
          <span className="contact-icon" role="img" aria-label="horaires">⏰</span>
          <span className="contact-info-label">Horaires :</span>
          <span className="contact-info-value">{hours}</span>
        </div>
      </div>
      {showMap && (
        <div className="contact-map-container">
          <iframe
            title="Carte Paris"
            src="https://www.google.com/maps?q=12+rue+de+l'Écologie,+75000+Paris,+France&output=embed"
            width="100%"
            height="350"
            style={{border:0, borderRadius:'16px', boxShadow:'0 2px 12px rgba(44,62,80,0.12)'}}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      )}
      <div className="contact-form-section">
        <h3>Envoyer un message</h3>
        <p>Une question, une suggestion ? Remplis ce formulaire :</p>
        {sent ? (
          <div className="alert alert-success">Merci pour votre message ! Nous vous répondrons rapidement.</div>
        ) : (
          <form onSubmit={handleSubmit} className="contact-form">
            <label htmlFor="name">Nom</label>
            <input type="text" id="name" name="name" value={form.name} onChange={handleChange} required />
            {errors.name && <div style={{color:'red'}}>{errors.name}</div>}
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={form.email} onChange={handleChange} required />
            {errors.email && <div style={{color:'red'}}>{errors.email}</div>}
            <label htmlFor="message">Message</label>
            <textarea id="message" name="message" value={form.message} onChange={handleChange} required rows={4} />
            {errors.message && <div style={{color:'red'}}>{errors.message}</div>}
            <button type="submit">Envoyer</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Contact; 