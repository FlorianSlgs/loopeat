// middlewares/auth.middleware.js
const tokenService = require('../utils/token.service');
const authRepository = require('../modules/auth/auth.repository');

const authMiddleware = async (req, res, next) => {
  try {
    console.log('🔐 Vérification de l\'authentification...');
    console.log('🍪 Cookies reçus:', req.cookies);

    const token = req.cookies.auth_token;

    if (!token) {
      console.log('❌ Token manquant');
      return res.status(401).json({
        success: false,
        message: 'Non authentifié'
      });
    }

    // Vérifier le token
    const decoded = tokenService.verifyToken(token);

    if (!decoded || decoded.type !== 'auth') {
      console.log('❌ Token invalide');
      return res.status(401).json({
        success: false,
        message: 'Token invalide'
      });
    }

    const isPro = decoded.isPro || false;

    // Récupérer l'utilisateur depuis la base de données (user ou pro)
    const user = await authRepository.findUserByEmail(decoded.email, isPro);

    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Attacher l'utilisateur à la requête avec format adapté
    if (isPro) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        admin: user.admin,
        verified: user.verified,
        isPro: true
      };
    } else {
      req.user = {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        verified: user.verified,
        isPro: false
      };
    }

    console.log('✅ Utilisateur authentifié:', req.user.email, isPro ? '(PRO)' : '(USER)');
    next();
  } catch (error) {
    console.error('❌ Erreur dans authMiddleware:', error);
    return res.status(401).json({
      success: false,
      message: 'Erreur d\'authentification'
    });
  }
};

module.exports = authMiddleware;