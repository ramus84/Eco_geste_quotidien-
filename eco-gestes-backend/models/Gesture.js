const mongoose = require('mongoose');

// Schéma pour les commentaires
const CommentSchema = new mongoose.Schema({
  content: { 
    type: String, 
    required: true,
    maxlength: 500 // Limite de 500 caractères
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Définition du schéma pour un geste éco-responsable
const GestureSchema = new mongoose.Schema({
  // Informations de base
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  description: { 
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // Impact environnemental
  impact: { 
    type: Number,
    min: 0,
    description: 'Impact environnemental en points'
  },
  co2Saved: { 
    type: Number,
    min: 0,
    required: true,
    description: 'CO2 économisé en kg'
  },
  
  // Catégorisation
  category: { 
    type: String,
    required: true,
    enum: ['Transport', 'Énergie', 'Déchets', 'Alimentation', 'Eau', 'Autre'],
    default: 'Autre'
  },
  
  // Métadonnées
  date: { 
    type: Date, 
    default: Date.now 
  },
  imageUrl: { 
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v) || !v;
      },
      message: 'L\'URL de l\'image doit être valide'
    }
  },
  
  // Relations
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  
  // Système de commentaires et likes
  comments: [CommentSchema],
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  
  // Statistiques
  viewCount: { 
    type: Number, 
    default: 0 
  },
  
  // Tags pour faciliter la recherche
  tags: [{ 
    type: String,
    trim: true
  }],
  
  // Statut du geste
  isPublic: { 
    type: Boolean, 
    default: true 
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true, // Ajoute automatiquement createdAt et updatedAt
  toJSON: { virtuals: true }, // Inclut les champs virtuels dans le JSON
  toObject: { virtuals: true }
});

// Index pour améliorer les performances des requêtes
GestureSchema.index({ category: 1, date: -1 });
GestureSchema.index({ userId: 1, date: -1 });
GestureSchema.index({ co2Saved: -1 });
GestureSchema.index({ tags: 1 });

// Champs virtuels (calculés)
GestureSchema.virtual('likesCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

GestureSchema.virtual('commentsCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

GestureSchema.virtual('averageRating').get(function() {
  if (!this.comments || this.comments.length === 0) return 0;
  // Ici vous pourriez ajouter un système de notation
  return 0;
});

// Méthodes d'instance
GestureSchema.methods.addComment = function(userId, content) {
  this.comments.push({ user: userId, content });
  return this.save();
};

GestureSchema.methods.toggleLike = function(userId) {
  const userIndex = this.likes.indexOf(userId);
  if (userIndex === -1) {
    this.likes.push(userId);
  } else {
    this.likes.splice(userIndex, 1);
  }
  return this.save();
};

GestureSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Méthodes statiques
GestureSchema.statics.findByCategory = function(category) {
  return this.find({ category, isPublic: true }).sort({ date: -1 });
};

GestureSchema.statics.findTopGestures = function(limit = 10) {
  return this.find({ isPublic: true })
    .sort({ co2Saved: -1 })
    .limit(limit);
};

GestureSchema.statics.findByUser = function(userId) {
  return this.find({ userId }).sort({ date: -1 });
};

// Middleware pre-save pour valider les données
GestureSchema.pre('save', function(next) {
  // S'assurer que le nom commence par une majuscule
  if (this.name) {
    this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);
  }
  
  // Générer des tags automatiquement si pas fournis
  if (!this.tags || this.tags.length === 0) {
    this.tags = [this.category, 'éco-responsable'];
  }
  
  next();
});

// Middleware pre-remove pour nettoyer les données associées
GestureSchema.pre('remove', function(next) {
  // Ici vous pourriez nettoyer les fichiers d'images associés
  // ou d'autres données liées
  next();
});

module.exports = mongoose.model('Gesture', GestureSchema); 