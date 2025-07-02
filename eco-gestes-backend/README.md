# 🌱 Éco-Gestes Backend API

## 📋 Description

Backend API complète pour l'application Éco-Gestes, une plateforme permettant aux utilisateurs de partager et suivre leurs gestes écologiques au quotidien.

## ✨ Fonctionnalités Principales

### 🔐 Authentification & Sécurité
- **Inscription/Connexion** avec JWT
- **Hachage sécurisé** des mots de passe (bcrypt)
- **Middleware d'authentification** pour protéger les routes
- **Gestion des tokens** avec expiration

### 📝 Gestion des Gestes Écologiques
- **CRUD complet** (Créer, Lire, Modifier, Supprimer)
- **Catégorisation** : Transport, Énergie, Déchets, Alimentation, Eau, Autre
- **Calcul d'impact** : CO2 économisé en kg
- **Upload d'images** avec validation
- **Tags automatiques** pour la recherche

### 💬 Système Social
- **Commentaires** sur les gestes
- **Système de likes** 
- **Statistiques** de vues
- **Profils utilisateurs** avec historique

### 📊 Export & Rapports
- **Export PDF** des gestes
- **Export Excel** avec graphiques
- **Statistiques détaillées** par catégorie
- **Top des gestes** les plus efficaces

### 🔔 Notifications
- **Notifications push** (navigateur)
- **Emails automatiques** (quotidiens)
- **Rappels personnalisables**
- **Configuration par utilisateur**

### 🎨 Interface Avancée
- **Thème sombre/clair** avec sauvegarde
- **Animations fluides** et transitions
- **Design responsive** mobile-first
- **Accessibilité** optimisée

## 🚀 Installation

### Prérequis
- Node.js >= 16.0.0
- MongoDB (local ou Atlas)
- npm >= 8.0.0

### Étapes d'installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd eco-gestes-backend
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer l'environnement**
```bash
cp env.example .env
```

4. **Modifier le fichier .env**
```env
# Configuration du serveur
PORT=5000

# Base de données MongoDB
MONGODB_URI=mongodb://localhost:27017/ecoGeste

# Clé secrète JWT (changez cette valeur !)
JWT_SECRET=votre_cle_secrete_tres_longue_et_complexe_ici

# Configuration email (optionnel)
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_application

# Mode de développement
NODE_ENV=development
```

5. **Démarrer MongoDB**
```bash
# Local
mongod

# Ou utiliser MongoDB Atlas (cloud)
```

6. **Lancer l'application**
```bash
# Développement (avec nodemon)
npm run dev

# Production
npm start

# Backend uniquement
npm run server
```

## 📚 API Documentation

### Endpoints Principaux

#### 🔐 Authentification
```
POST /api/users/register    - Inscription
POST /api/users/login       - Connexion
GET  /api/users/profile     - Profil utilisateur
PUT  /api/users/profile     - Modifier le profil
PUT  /api/users/change-password - Changer le mot de passe
```

#### 📝 Gestes Écologiques
```
GET    /api/gestures           - Liste des gestes
GET    /api/gestures/:id       - Détail d'un geste
POST   /api/gestures           - Créer un geste
PUT    /api/gestures/:id       - Modifier un geste
DELETE /api/gestures/:id       - Supprimer un geste
POST   /api/gestures/:id/upload - Upload d'image
```

#### 💬 Commentaires & Likes
```
GET  /api/gestures/:id/comments - Liste des commentaires
POST /api/gestures/:id/comments - Ajouter un commentaire
GET  /api/gestures/:id/likes    - Nombre de likes
POST /api/gestures/:id/like     - Liker/Unliker
```

#### 📊 Export & Statistiques
```
GET  /api/statistics           - Statistiques générales
POST /api/export/pdf          - Export PDF
POST /api/export/excel        - Export Excel
```

#### 🔔 Notifications
```
POST /api/notifications/subscribe   - S'abonner
POST /api/notifications/unsubscribe - Se désabonner
PUT  /api/notifications/settings    - Configurer
```

### Exemples d'utilisation

#### Créer un geste
```javascript
const response = await fetch('/api/gestures', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-auth-token': 'votre_token_jwt'
  },
  body: JSON.stringify({
    name: 'Prendre le vélo',
    description: 'Aller au travail en vélo au lieu de la voiture',
    co2Saved: 2.5,
    category: 'Transport'
  })
});
```

#### Ajouter un commentaire
```javascript
const response = await fetch('/api/gestures/123/comments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-auth-token': 'votre_token_jwt'
  },
  body: JSON.stringify({
    content: 'Excellent geste ! Je le fais aussi depuis 2 mois.'
  })
});
```

## 🗄️ Structure de la Base de Données

### Modèle User
```javascript
{
  username: String,
  email: String,
  password: String (hashé),
  createdAt: Date,
  updatedAt: Date
}
```

### Modèle Gesture
```javascript
{
  name: String,
  description: String,
  co2Saved: Number,
  category: String,
  date: Date,
  imageUrl: String,
  userId: ObjectId,
  comments: [CommentSchema],
  likes: [ObjectId],
  viewCount: Number,
  tags: [String],
  isPublic: Boolean,
  isVerified: Boolean
}
```

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **JWT** - Authentification
- **bcrypt** - Hachage des mots de passe
- **Multer** - Upload de fichiers
- **PDFKit** - Génération de PDF
- **ExcelJS** - Génération d'Excel
- **Nodemailer** - Envoi d'emails
- **node-cron** - Tâches planifiées

### Sécurité
- **CORS** - Protection cross-origin
- **Validation** - Validation des données
- **Sanitisation** - Nettoyage des entrées
- **Rate limiting** - Protection contre les abus

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm run test:watch
```

## 📦 Déploiement

### Variables d'environnement de production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ecoGeste
JWT_SECRET=cle_secrete_tres_longue_et_complexe
EMAIL_USER=notifications@votreapp.com
EMAIL_PASS=mot_de_passe_application
```

### Plateformes de déploiement
- **Heroku** - Déploiement simple
- **Vercel** - Performance optimisée
- **Railway** - Déploiement automatique
- **DigitalOcean** - Contrôle total

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence ISC. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

- **Documentation API** : `http://localhost:5000/api-docs`
- **Health Check** : `http://localhost:5000/api/health`
- **Issues** : [GitHub Issues](https://github.com/votre-repo/issues)

## 🔮 Roadmap

### Version 2.0
- [ ] Système de badges et récompenses
- [ ] Challenges communautaires
- [ ] Intégration réseaux sociaux
- [ ] API publique pour développeurs
- [ ] Système de modération

### Version 2.1
- [ ] Intelligence artificielle pour suggestions
- [ ] Gamification avancée
- [ ] Intégration IoT
- [ ] Application mobile native

---

**🌱 Ensemble, changeons le monde un geste à la fois !** 