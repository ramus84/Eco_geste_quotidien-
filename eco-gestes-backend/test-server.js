const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Configuration CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

app.use(express.json());

// Route de test
app.get('/api/health', (req, res) => {
  console.log('✅ Health check demandé');
  res.json({ 
    status: 'OK', 
    message: 'Serveur de test opérationnel',
    timestamp: new Date().toISOString()
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

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur de test démarré sur le port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Gestes: http://localhost:${PORT}/api/gestures`);
});

// Gestion des erreurs
process.on('uncaughtException', (err) => {
  console.error('❌ Erreur non gérée:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée:', reason);
}); 