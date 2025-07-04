// Script pour insérer plusieurs gestes dans MongoDB
// Place ce fichier dans eco-gestes-backend/ puis exécute-le avec : node add_gestes_batch.js

const mongoose = require('mongoose');
const Gesture = require('./models/Gesture');
require('dotenv').config();

const url = process.env.DATABASE_URL || 'mongodb://localhost:27017/eco-gestes';

// Remplace par ton vrai userId (copié depuis /api/users/profile)
const myUserId = 'TON_USER_ID_ICI'; // exemple : '648e1f2a3b2c4d5e6f7a8b9c'

// Tableau de gestes à insérer (tu peux en ajouter autant que tu veux)
const gestes = [
  {
    name: 'Aérer la maison 10 min',
    description: 'Aère ta maison chaque jour, même en hiver.',
    category: 'Autre',
    co2Saved: 1,
    userId: myUserId
  },
  {
    name: "Boire de l'eau du robinet",
    description: "Privilégie l'eau du robinet à l'eau en bouteille.",
    category: 'Alimentation',
    co2Saved: 0.5,
    userId: myUserId
  },
  {
    name: 'Privilégier les fruits de saison',
    description: 'Consomme des fruits et légumes de saison.',
    category: 'Alimentation',
    co2Saved: 1,
    userId: myUserId
  },
  // Ajoute ici d'autres gestes si tu veux...
];

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('✅ Connecté à MongoDB');
    // On supprime d'abord les éventuels doublons pour ces gestes
    for (const g of gestes) {
      await Gesture.deleteMany({ name: g.name });
    }
    // On ajoute tous les gestes
    try {
      await Gesture.insertMany(gestes);
      console.log('🎉 Gestes ajoutés avec succès !');
    } catch (err) {
      console.error('❌ Erreur lors de l\'ajout :', err.message);
    }
    mongoose.disconnect();
  })
  .catch(err => console.error('❌ Erreur de connexion MongoDB :', err)); 