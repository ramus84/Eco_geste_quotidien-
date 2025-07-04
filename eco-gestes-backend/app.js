require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// Import des modèles
const Gesture = require('./models/Gesture');
const User = require('./models/user');

const app = express(); // <-- DÉCLARATION AVANT TOUT app.use()

// Configuration CORS améliorée (doit être AVANT toutes les routes et middlewares)
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Gérer les requêtes pré-vol (OPTIONS) pour toutes les routes
app.options('*', cors());

// Middleware pour parser le JSON AVANT toutes les routes !
app.use(express.json());

// Brancher la route messagesRoutes juste après la création de app
const messagesRoutes = require('./routes/messagesRoutes');
app.use('/api/messages', messagesRoutes);

// Import des routes
const userRoutes = require('./routes/userRoutes')
const statsRoutes = require('./routes/statsRoutes');
app.use('/api/messages', messagesRoutes);

// Import du middleware
const verifyToken = require('./verifyToken');

// Configuration des middlewares
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Connexion à MongoDB Atlas
// ATTENTION : L'erreur 'bad auth : authentication failed' signifie que l'identifiant ou le mot de passe dans l'URI MongoDB est incorrect.
// Vérifie bien le nom d'utilisateur et le mot de passe dans l'URI ci-dessous !
const mongoURI = 'mongodb+srv://hansgobel6:0484@cluster0.yu6xufv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoURI)
.then(() => console.log('✅ Connecté à MongoDB Atlas !'))
.catch(err => {
  console.error('❌ Erreur de connexion à MongoDB Atlas :', err.message);
  process.exit(1);
});


//Appel de la dépendance ejs
app.set('view engine', 'ejs');

const methodOverride = require('method-override');
app.use(methodOverride('_method'));


//Appel pour la configuration le body-parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());




// Configuration de Multer pour l'upload d'images//Appel pour la configuration le body-parser
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées'), false);
  }
};

const upload = multer({ storage, fileFilter });

// Configuration Swagger pour la documentation API
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes principales
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/messages', messagesRoutes);

// Route de santé pour tester la connexion
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Serveur ÉcoGestes opérationnel',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ===== ROUTES POUR LES GESTES ÉCOLOGIQUES =====

// Route pour obtenir tous les gestes
app.get('/api/gestures', async (req, res) => {
  try {
    const gestures = await Gesture.find();
    res.json(gestures);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des gestes' });
  }
});

// Route pour obtenir un geste par ID
app.get('/api/gestures/:id', async (req, res) => {
  try {
    const gesture = await Gesture.findById(req.params.id);
    if (!gesture) {
      return res.status(404).json({ error: 'Geste non trouvé' });
    }
    res.json(gesture);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération du geste' });
  }
});

// Route pour créer un nouveau geste
app.post('/api/gestures', verifyToken, async (req, res) => {
  try {
    const gestureData = { ...req.body, userId: req.user };
    const newGesture = new Gesture(gestureData);
    await newGesture.save();
    res.status(201).json(newGesture);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Erreur lors de la création du geste' });
  }
});

// Route pour modifier un geste
app.put('/api/gestures/:id', verifyToken, async (req, res) => {
  try {
    const gesture = await Gesture.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!gesture) {
      return res.status(404).json({ error: 'Geste non trouvé' });
    }
    res.json(gesture);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la modification du geste' });
  }
});

// Route pour supprimer un geste
app.delete('/api/gestures/:id', verifyToken, async (req, res) => {
  try {
    const gesture = await Gesture.findByIdAndDelete(req.params.id);
    if (!gesture) {
      return res.status(404).json({ error: 'Geste non trouvé' });
    }
    res.json({ message: 'Geste supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression du geste' });
  }
});

// Route pour l'upload d'image
app.post('/api/gestures/:id/upload', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const gesture = await Gesture.findById(req.params.id);
    if (!gesture) {
      return res.status(404).json({ error: 'Geste non trouvé' });
    }

    gesture.image = req.file.path;
    await gesture.save();

    res.json({ 
      message: 'Image téléchargée avec succès', 
      imagePath: req.file.path 
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de l\'upload de l\'image' });
  }
});

// ===== ROUTES POUR LES COMMENTAIRES =====

// Route pour obtenir les commentaires d'un geste
app.get('/api/gestures/:id/comments', async (req, res) => {
  try {
    const gesture = await Gesture.findById(req.params.id).populate('comments.user', 'username');
    if (!gesture) {
      return res.status(404).json({ error: 'Geste non trouvé' });
    }
    res.json(gesture.comments || []);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des commentaires' });
  }
});

// Route pour ajouter un commentaire
app.post('/api/gestures/:id/comments', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    const gesture = await Gesture.findById(req.params.id);
    
    if (!gesture) {
      return res.status(404).json({ error: 'Geste non trouvé' });
    }

    const user = await User.findById(req.user);
    const newComment = {
      content,
      user: req.user,
      createdAt: new Date()
    };

    gesture.comments = gesture.comments || [];
    gesture.comments.push(newComment);
    await gesture.save();

    // Retourner le commentaire avec les infos utilisateur
    const populatedComment = {
      ...newComment,
      user: {
        _id: user._id,
        username: user.username
      }
    };

    res.status(201).json(populatedComment);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de l\'ajout du commentaire' });
  }
});

// ===== ROUTES POUR LES LIKES =====

// Route pour obtenir les likes d'un geste
app.get('/api/gestures/:id/likes', async (req, res) => {
  try {
    const gesture = await Gesture.findById(req.params.id);
    if (!gesture) {
      return res.status(404).json({ error: 'Geste non trouvé' });
    }

    const likes = gesture.likes || [];
    const userLiked = req.headers['x-auth-token'] ? 
      likes.includes(req.user) : false;

    res.json({ 
      likes: likes.length,
      userLiked
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des likes' });
  }
});

// Route pour liker/unliker un geste
app.post('/api/gestures/:id/like', verifyToken, async (req, res) => {
  try {
    const gesture = await Gesture.findById(req.params.id);
    if (!gesture) {
      return res.status(404).json({ error: 'Geste non trouvé' });
    }

    gesture.likes = gesture.likes || [];
    const userIndex = gesture.likes.indexOf(req.user);

    if (userIndex === -1) {
      // Ajouter le like
      gesture.likes.push(req.user);
    } else {
      // Retirer le like
      gesture.likes.splice(userIndex, 1);
    }

    await gesture.save();

    res.json({ 
      likes: gesture.likes.length,
      userLiked: userIndex === -1
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors du like/unlike' });
  }
});

// ===== ROUTES POUR L'EXPORT =====

// Route pour exporter en PDF
app.post('/api/export/pdf', verifyToken, async (req, res) => {
  try {
    const { gestures, filters } = req.body;
    
    // Créer un nouveau document PDF
    const doc = new PDFDocument();
    
    // Configurer les headers pour le téléchargement
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=eco-gestes.pdf');
    
    // Pipes le document PDF vers la réponse
    doc.pipe(res);
    
    // Ajouter le contenu au PDF
    doc.fontSize(24).text('Rapport Éco-Gestes', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });
    doc.moveDown(2);
    
    // Ajouter les gestes
    gestures.forEach((gesture, index) => {
      doc.fontSize(16).text(`${index + 1}. ${gesture.name}`);
      doc.fontSize(12).text(`Description: ${gesture.description}`);
      doc.fontSize(12).text(`CO2 économisé: ${gesture.co2Saved} kg`);
      doc.fontSize(12).text(`Catégorie: ${gesture.category}`);
      doc.moveDown();
    });
    
    // Finaliser le PDF
    doc.end();
  } catch (err) {
    console.error('Erreur lors de l\'export PDF:', err);
    res.status(500).json({ error: 'Erreur lors de l\'export PDF' });
  }
});

// Route pour exporter en Excel
app.post('/api/export/excel', verifyToken, async (req, res) => {
  try {
    const { gestures, filters } = req.body;
    
    // Créer un nouveau classeur Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Éco-Gestes');
    
    // Ajouter les en-têtes
    worksheet.columns = [
      { header: 'Nom', key: 'name', width: 30 },
      { header: 'Description', key: 'description', width: 50 },
      { header: 'CO2 économisé (kg)', key: 'co2Saved', width: 15 },
      { header: 'Catégorie', key: 'category', width: 20 },
      { header: 'Date', key: 'date', width: 15 }
    ];
    
    // Ajouter les données
    gestures.forEach(gesture => {
      worksheet.addRow({
        name: gesture.name,
        description: gesture.description,
        co2Saved: gesture.co2Saved,
        category: gesture.category,
        date: gesture.date ? new Date(gesture.date).toLocaleDateString('fr-FR') : ''
      });
    });
    
    // Configurer les headers pour le téléchargement
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=eco-gestes.xlsx');
    
    // Écrire le fichier Excel
    await workbook.xlsx.write(res);
  } catch (err) {
    console.error('Erreur lors de l\'export Excel:', err);
    res.status(500).json({ error: 'Erreur lors de l\'export Excel' });
  }
});

// Route pour obtenir les statistiques
app.get('/api/statistics', async (req, res) => {
  try {
    const totalGestures = await Gesture.countDocuments();
    const gestures = await Gesture.find();
    
    const totalCO2 = gestures.reduce((sum, gesture) => sum + (gesture.co2Saved || 0), 0);
    
    // Statistiques par catégorie
    const categoryStats = gestures.reduce((acc, gesture) => {
      acc[gesture.category] = (acc[gesture.category] || 0) + 1;
      return acc;
    }, {});
    
    // Top 5 des gestes les plus efficaces
    const topGestures = gestures
      .sort((a, b) => (b.co2Saved || 0) - (a.co2Saved || 0))
      .slice(0, 5)
      .map(gesture => ({
        name: gesture.name,
        co2Saved: gesture.co2Saved,
        category: gesture.category
      }));
    
    res.json({
      totalGestures,
      totalCO2,
      averageCO2: totalGestures > 0 ? totalCO2 / totalGestures : 0,
      categoryStats,
      topGestures
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors du calcul des statistiques' });
  }
});

// Configuration des notifications par email (optionnel)
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

  // Tâche cron pour envoyer des rappels quotidiens
cron.schedule('0 9 * * *', () => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'user@example.com',
      subject: '🌱 Faites un geste éco-responsable aujourd\'hui !',
    text: 'Pensez à adopter un geste éco-responsable aujourd\'hui pour lutter contre le réchauffement climatique.',
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.log('❌ Erreur d\'envoi de l\'email:', error);
    } else {
        console.log('✅ Email envoyé:', info.response);
      }
    });
  });
}

// Route de test pour vérifier que l'API fonctionne
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API Eco-Gestes fonctionne correctement',
    timestamp: new Date().toISOString()
  });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Définition du port du serveur
const PORT = process.env.PORT || 5000;
// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📚 Documentation API: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;