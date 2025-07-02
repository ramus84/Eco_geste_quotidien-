const express = require('express');
const router = express.Router();
const Gesture = require('../models/Gesture');
const User = require('../models/user');

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

module.exports = router; 