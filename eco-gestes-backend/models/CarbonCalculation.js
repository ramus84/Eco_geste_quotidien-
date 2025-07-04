const mongoose = require('mongoose');

// Schéma pour stocker un calcul CO2
const CarbonCalculationSchema = new mongoose.Schema({
  // Les données saisies par l'utilisateur (km, kWh, repas, etc.)
  inputs: {
    type: Object,
    required: true
  },
  // Résultat total des émissions (kg CO2)
  emissions: {
    type: Number,
    required: true
  },
  // Résultat total des économies (kg CO2)
  economies: {
    type: Number,
    required: true
  },
  // Répartition des émissions (transport, énergie, alimentation)
  repartition: {
    transport: { type: Number, required: true },
    energie: { type: Number, required: true },
    alimentation: { type: Number, required: true }
  },
  // Conseils personnalisés générés
  conseils: [{ type: String }],
  // Date de l'enregistrement
  date: {
    type: Date,
    default: Date.now
  },
  // (Optionnel) ID de l'utilisateur si connecté
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
});

module.exports = mongoose.model('CarbonCalculation', CarbonCalculationSchema); 