const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const verifyToken = require('../verifyToken');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Configuration Multer pour l'avatar utilisateur
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, 'avatar_' + req.user + '_' + Date.now() + path.extname(file.originalname));
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

// Route pour obtenir le profil de l'utilisateur connecté
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (err) {
    console.error('Erreur lors de la récupération du profil:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour modifier le profil utilisateur
router.put('/profile', verifyToken, async (req, res) => {
  const { username, email } = req.body;

  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Mettre à jour les champs
    if (username) user.username = username;
    if (email) user.email = email;

    await user.save();

    res.json({ 
      message: 'Profil mis à jour avec succès',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du profil:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour' });
  }
});

// Route pour changer le mot de passe
router.put('/change-password', verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier l'ancien mot de passe
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Mot de passe actuel incorrect' });
    }

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Mettre à jour le mot de passe
    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (err) {
    console.error('Erreur lors du changement de mot de passe:', err);
    res.status(500).json({ error: 'Erreur serveur lors du changement de mot de passe' });
  }
});

// Route pour supprimer un utilisateur et toutes ses données liées
router.delete('/delete', verifyToken, async (req, res) => {
  const { password } = req.body;
  try {
    // 1. Vérifier l'utilisateur
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    // 2. Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Mot de passe incorrect' });
    }
    // 3. Supprimer tous les gestes de l'utilisateur
    const Gesture = require('../models/Gesture');
    await Gesture.deleteMany({ userId: user._id });
    // 4. Supprimer tous les commentaires de l'utilisateur dans tous les gestes
    await Gesture.updateMany(
      { 'comments.user': user._id },
      { $pull: { comments: { user: user._id } } }
    );
    // 5. Supprimer l'utilisateur
    await user.deleteOne();
    res.json({ message: 'Compte et toutes les données associées supprimés avec succès.' });
  } catch (err) {
    console.error('Erreur lors de la suppression du compte:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression du compte' });
  }
});

// Route pour uploader/modifier l'avatar utilisateur
router.post('/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    // Mettre à jour le champ avatar avec le chemin du fichier
    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();
    res.json({ message: 'Avatar mis à jour avec succès', avatar: user.avatar });
  } catch (err) {
    console.error('Erreur lors de l\'upload de l\'avatar:', err);
    res.status(500).json({ error: 'Erreur serveur lors de l\'upload de l\'avatar' });
  }
});

// Route pour lister tous les utilisateurs (pour la messagerie)
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user || !user.isAdmin) return res.status(403).json({ error: 'Accès réservé aux admins.' });
    const users = await User.find({}, 'username email isAdmin');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs', details: err.message });
  }
});

// Config nodemailer (Gmail par défaut)
const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE || 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Mot de passe oublié : génère un token et envoie un email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Aucun utilisateur avec cet email.' });
    // Génère un token unique
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // 1h
    await user.save();
    // Lien de reset (à adapter selon ton frontend)
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    // Envoie l'email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `<p>Pour réinitialiser votre mot de passe, cliquez sur ce lien : <a href="${resetLink}">${resetLink}</a></p><p>Ce lien est valable 1 heure.</p>`
    });
    // Affiche aussi le token pour test
    res.json({ message: 'Email de réinitialisation envoyé', token, resetLink });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la demande de réinitialisation', details: err.message });
  }
});
// Réinitialisation du mot de passe
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ error: 'Token invalide ou expiré.' });
    user.password = password; // sera haché par le modèle
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Mot de passe réinitialisé avec succès.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la réinitialisation', details: err.message });
  }
});

// Route pour devenir admin (pour test uniquement)
// POST /api/users/make-admin
router.post('/make-admin', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    user.isAdmin = true;
    await user.save();
    res.json({ message: 'Vous êtes maintenant admin !' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour', details: err.message });
  }
});
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const user = new User({ username, email, password });
  await user.save();
  res.json({ message: 'Utilisateur créé avec succès', user });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: 'Mot de passe incorrect' });

  // GÉNÉRER UN VRAI TOKEN JWT
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.json({ token, username: user.username, userId: user._id });
});




module.exports = router; 