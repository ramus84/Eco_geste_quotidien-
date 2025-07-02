const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const verifyToken = require('../verifyToken');

const router = express.Router();

// Route pour l'inscription d'un nouvel utilisateur
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà' });
    }

    // Hasher le mot de passe (crypter pour la sécurité)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer le nouvel utilisateur
    const newUser = new User({ 
      username, 
      email, 
      password: hashedPassword 
    });
    await newUser.save();

    // Créer un token JWT pour l'authentification
    const token = jwt.sign(
      { id: newUser._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      message: 'Utilisateur créé avec succès',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (err) {
    console.error('Erreur lors de l\'inscription:', err);
    res.status(500).json({ error: 'Erreur serveur lors de l\'inscription' });
  }
});

// Route pour la connexion d'un utilisateur
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Trouver l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Créer un token JWT
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({ 
      message: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Erreur lors de la connexion:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
  }
});

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

module.exports = router; 