require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Route de test simple
app.get('/api/health', (req, res) => {
  console.log('✅ Health check demandé');
  res.json({ 
    status: 'OK', 
    message: 'Serveur ÉcoGestes opérationnel',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Route de test pour les gestes
app.get('/api/gestures', (req, res) => {
  console.log('✅ Demande de gestes reçue');
  res.json([
    {
      _id: '1',
      name: 'Geste de test',
      description: 'Ceci est un geste de test',
      category: 'Test',
      co2Saved: 5,
      date: new Date().toISOString()
    }
  ]);
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur de test démarré sur le port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Gestes: http://localhost:${PORT}/api/gestures`);
});

module.exports = app; 