// Script pour ajouter le geste "Aérer la maison 10 min" dans MongoDB
// Place ce fichier dans eco-gestes-backend/ puis exécute-le avec : node add_geste_aerer.js

const mongoose = require('mongoose');
const Gesture = require('./models/Gesture');
require('dotenv').config(); // Pour charger l'URL de la base depuis .env

// Récupère l'URL de la base MongoDB (modifie si besoin)
const url = process.env.DATABASE_URL || 'mongodb://localhost:27017/eco-gestes';

// Connexion à MongoDB
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('✅ Connecté à MongoDB');
    // Création du geste (catégorie "Autre" pour être accepté par le schéma)
    const geste = new Gesture({
      name: 'Aérer la maison 10 min',
      description: 'Aère ta maison chaque jour, même en hiver.',
      category: 'Autre', // Catégorie valide selon le schéma
      co2Saved: 1,
      userId: null // Optionnel : tu peux mettre un ObjectId d'admin si besoin
    });
    try {
      await geste.save();
      console.log('🎉 Geste ajouté avec succès !');
    } catch (err) {
      console.error('❌ Erreur lors de l\'ajout :', err.message);
    }
    mongoose.disconnect();
  })
  .catch(err => console.error('❌ Erreur de connexion MongoDB :', err)); 