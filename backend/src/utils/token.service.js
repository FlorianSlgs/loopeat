// utils/token.service.js
const jwt = require('jsonwebtoken');

class TokenService {
  // Générer un token temporaire pour la complétion de l'inscription (10 min)
  generateRegistrationToken(email, isPro = false) {
    return jwt.sign(
      { email, type: 'registration', isPro },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );
  }

  // Générer un token d'authentification permanent (7 jours)
  generateAuthToken(userId, email, isPro = false) {
    return jwt.sign(
      { userId, email, type: 'auth', isPro },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  // Vérifier un token
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  // Décoder un token sans vérifier (utile pour debug)
  decodeToken(token) {
    return jwt.decode(token);
  }
}

module.exports = new TokenService();