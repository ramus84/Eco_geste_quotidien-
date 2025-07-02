const jwt = require('jsonwebtoken');

/**
 * Middleware pour vérifier le token JWT d'authentification
 * Ce middleware vérifie que l'utilisateur est bien connecté
 * en validant le token envoyé dans les headers de la requête
 */
const verifyToken = (req, res, next) => {
  // Récupérer le token depuis les headers de la requête
  // Le token peut être envoyé de plusieurs façons :
  // - x-auth-token: token
  // - Authorization: Bearer token
  const token = req.header('x-auth-token') || 
                req.header('Authorization')?.replace('Bearer ', '');

  // Si aucun token n'est fourni
  if (!token) {
    return res.status(401).json({ 
      error: 'Accès refusé. Aucun token fourni.' 
    });
  }

  try {
    // Vérifier et décoder le token avec la clé secrète
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ajouter l'ID de l'utilisateur à l'objet request
    // pour que les routes suivantes puissent l'utiliser
    req.user = decoded.id;
    
    // Passer au middleware suivant
    next();
  } catch (err) {
    // Si le token est invalide ou expiré
    console.error('Erreur de vérification du token:', err.message);
    res.status(401).json({ 
      error: 'Token invalide ou expiré' 
    });
  }
};

module.exports = verifyToken;
// Note: Replace