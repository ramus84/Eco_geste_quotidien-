import React, { useState } from 'react';
import axios from 'axios';

const GestureCard = ({ gesture }) => {
  const [image, setImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Fonction pour gérer le changement de fichier d'image
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Fonction pour gérer l'upload de l'image
  const handleImageUpload = async (e) => {
    e.preventDefault();

    if (!image) {
      setErrorMessage('Veuillez sélectionner une image à télécharger.');
      return;
    }

    // Créer un objet FormData pour l'upload de l'image
    const formData = new FormData();
    formData.append('image', image);

    try {
      const token = localStorage.getItem('token'); // Récupère le token JWT
      const response = await axios.post(
        `http://localhost:5000/api/gestures/${gesture._id}/upload`, // L'URL de l'API backend
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data', // Indiquer que le contenu est un fichier
          }
        }
      );
      alert('Image téléchargée avec succès!');
      // Optionnel : Mettre à jour l'état ou faire d'autres actions après l'upload
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'image:', error);
      setErrorMessage('Erreur lors de l\'upload de l\'image. Veuillez réessayer.');
    }
  };

  return (
    <div className="gesture-card">
      <h3>{gesture.name}</h3>
      <p>{gesture.co2Saved} kg CO₂ économisés</p>

      {/* Affichage du formulaire pour télécharger l'image */}
      <form onSubmit={handleImageUpload}>
        <input
          type="file"
          accept="image/*" // Autoriser uniquement les fichiers image
          onChange={handleImageChange}
        />
        <button type="submit">Télécharger l'image</button>
      </form>

      {/* Affichage du message d'erreur si nécessaire */}
      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}

      {/* Optionnel : Afficher l'image téléchargée si l'upload est réussi */}
      {gesture.image && <img src={`http://localhost:5000/${gesture.image}`} alt="Uploaded gesture" />}
    </div>
  );
};

export default GestureCard;
