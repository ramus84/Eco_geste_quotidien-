const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/user');
const verifyToken = require('../verifyToken');

// Envoyer un message
router.post('/', verifyToken, async (req, res) => {
  const { toUser, content } = req.body;
  if (!toUser || !content) {
    return res.status(400).json({ error: 'Destinataire et contenu requis.' });
  }
  try {
    const recipient = await User.findById(toUser);
    if (!recipient) {
      return res.status(404).json({ error: 'Destinataire introuvable.' });
    }
    const message = new Message({
      fromUser: req.user,
      toUser,
      content
    });
    await message.save();
    res.status(201).json({ message: 'Message envoyé !', data: message });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message.' });
  }
});

// Récupérer tous les messages de l'utilisateur (reçus et envoyés)
router.get('/', verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { fromUser: req.user },
        { toUser: req.user }
      ]
    })
      .populate('fromUser', 'username email')
      .populate('toUser', 'username email')
      .sort({ date: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des messages.' });
  }
});

// Marquer un message comme lu
router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message non trouvé.' });
    }
    if (String(message.toUser) !== String(req.user)) {
      return res.status(403).json({ error: 'Non autorisé.' });
    }
    message.read = true;
    await message.save();
    res.json({ message: 'Message marqué comme lu.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
  }
});

// Route pour enregistrer un message de contact
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newMessage = new Message({ name, email, message });
    await newMessage.save();
    res.status(201).json({ message: 'Message enregistré avec succès !' });
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement du message :', err);
    res.status(500).json({ error: "Erreur lors de l'enregistrement du message." });
  }
});

module.exports = router; 