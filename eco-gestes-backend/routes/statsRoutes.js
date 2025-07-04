const express = require('express');
const router = express.Router();
const Gesture = require('../models/Gesture');
const User = require('../models/user');
const CarbonCalculation = require('../models/CarbonCalculation'); // Import du modèle
const verifyToken = require('../verifyToken'); // Middleware d'authentification

// Catégories réelles du modèle Gesture
const categories = ['Transport', 'Énergie', 'Déchets', 'Alimentation', 'Eau', 'Autre'];

// Route pour obtenir les statistiques principales
router.get('/main', async (req, res) => {
  try {
    // Filtres optionnels (période, utilisateur)
    const { year, month, user } = req.query;
    let gestureFilter = {};
    if (year) {
      const start = new Date(year, month ? month - 1 : 0, 1);
      const end = month ? new Date(year, month, 1) : new Date(Number(year) + 1, 0, 1);
      gestureFilter.date = { $gte: start, $lt: end };
    }
    if (user) {
      gestureFilter.userId = user;
    }

    // Nombre de gestes par catégorie
    const gestesParCategorie = {};
    for (const cat of categories) {
      gestesParCategorie[cat] = await Gesture.countDocuments({ ...gestureFilter, category: cat });
    }

    // Top 5 utilisateurs les plus actifs (par nombre de gestes)
    const users = await User.find();
    const topUsers = users
      .map(u => ({ username: u.username, city: u.city, id: u._id, gestesRealises: u.gestures ? u.gestures.length : 0 }))
      .sort((a, b) => b.gestesRealises - a.gestesRealises)
      .slice(0, 5);

    // Progression CO2 par mois (champ co2Saved et date sur Gesture)
    const co2ParMois = Array(12).fill(0);
    const gestes = await Gesture.find(gestureFilter);
    let totalCO2 = 0;
    gestes.forEach(geste => {
      if (geste.date && geste.co2Saved) {
        const mois = new Date(geste.date).getMonth();
        co2ParMois[mois] += geste.co2Saved;
        totalCO2 += geste.co2Saved;
      }
    });

    // Répartition par ville (nombre de gestes et CO2)
    const gesturesByUser = await Gesture.aggregate([
      { $match: gestureFilter },
      { $group: { _id: "$userId", count: { $sum: 1 }, co2: { $sum: "$co2Saved" } } }
    ]);
    const usersMap = {};
    users.forEach(u => { usersMap[u._id.toString()] = u; });
    const repartitionVille = {};
    gesturesByUser.forEach(g => {
      const user = usersMap[g._id?.toString()];
      if (user && user.city) {
        if (!repartitionVille[user.city]) {
          repartitionVille[user.city] = { gestes: 0, co2: 0 };
        }
        repartitionVille[user.city].gestes += g.count;
        repartitionVille[user.city].co2 += g.co2;
      }
    });

    res.json({
      gestesParCategorie,
      topUsers,
      co2ParMois,
      totalCO2,
      repartitionVille
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route POST pour enregistrer un calcul de carbone
router.post('/carboncalculations', async (req, res) => {
  try {
    // On récupère les données envoyées par le frontend
    const { userId, value } = req.body;

    // On vérifie que les champs nécessaires sont présents
    if (!userId || value === undefined) {
      return res.status(400).json({ message: 'userId et value sont requis.' });
    }

    // On crée un nouveau document CarbonCalculation
    const CarbonCalculation = require('../models/CarbonCalculation');
    const newCalculation = new CarbonCalculation({
      userId,
      value
    });

    // On enregistre dans MongoDB
    await newCalculation.save();

    // On répond au frontend
    res.status(201).json({ message: 'Calcul de carbone enregistré !' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'enregistrement du calcul." });
  }
});

// Route pour récupérer l'historique des calculs CO2
// GET /api/stats/carboncalculations?userId=... (optionnel)
router.get('/carboncalculations', verifyToken, async (req, res) => {
  try {
    let filter = {};
    // Si admin (à personnaliser selon ton système), peut filtrer par userId
    if (req.query.userId) {
      filter.userId = req.query.userId;
    } else {
      // Sinon, on retourne seulement les calculs de l'utilisateur connecté
      filter.userId = req.userId;
    }
    const history = await CarbonCalculation.find(filter).sort({ date: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique', details: err.message });
  }
});

// Supprimer un calcul CO2 (auteur ou admin)
router.delete('/carbon-calculations/:id', verifyToken, async (req, res) => {
  try {
    const calc = await CarbonCalculation.findById(req.params.id);
    if (!calc) return res.status(404).json({ error: 'Calcul non trouvé' });
    // Vérifie si l'utilisateur est l'auteur ou admin
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ error: 'Utilisateur non trouvé' });
    if (String(calc.userId) !== String(req.userId) && !user.isAdmin) {
      return res.status(403).json({ error: 'Non autorisé à supprimer ce calcul' });
    }
    await calc.deleteOne();
    res.json({ message: 'Calcul supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression', details: err.message });
  }
});
// Modifier un calcul CO2 (auteur ou admin)
router.put('/carbon-calculations/:id', verifyToken, async (req, res) => {
  try {
    const calc = await CarbonCalculation.findById(req.params.id);
    if (!calc) return res.status(404).json({ error: 'Calcul non trouvé' });
    // Vérifie si l'utilisateur est l'auteur ou admin
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ error: 'Utilisateur non trouvé' });
    if (String(calc.userId) !== String(req.userId) && !user.isAdmin) {
      return res.status(403).json({ error: 'Non autorisé à modifier ce calcul' });
    }
    // Met à jour les champs autorisés
    const { inputs, emissions, economies, repartition, conseils } = req.body;
    if (inputs) calc.inputs = inputs;
    if (emissions !== undefined) calc.emissions = emissions;
    if (economies !== undefined) calc.economies = economies;
    if (repartition) calc.repartition = repartition;
    if (conseils) calc.conseils = conseils;
    await calc.save();
    res.json({ message: 'Calcul modifié avec succès', calc });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la modification', details: err.message });
  }
});

module.exports = router; 