const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const tokenService = require('../../utils/token.service');

// Routes publiques
router.post('/check-email', (req, res) => authController.checkEmail(req, res));
router.post('/verify-code', (req, res) => authController.verifyCode(req, res));

// Routes pour l'inscription en 2 étapes
router.post('/save-user-info', (req, res) => authController.saveUserInfo(req, res));
router.post('/set-password', (req, res) => authController.setPassword(req, res));

// Route pour connexion avec cookie de session
router.post('/login-with-password', (req, res) => authController.loginWithPassword(req, res));

// Déconnexion
router.post('/logout', (req, res) => authController.logout(req, res));

// Routes protégées
router.get('/me', authMiddleware, (req, res) => authController.getCurrentUser(req, res));

/**
 * Obtenir un token temporaire pour WebSocket
 * Le cookie httpOnly est automatiquement vérifié par authMiddleware
 * 
 * GET /api/auth/ws-token
 */
router.get('/ws-token', authMiddleware, async (req, res) => {
  try {
    console.log('🔑 [WS-TOKEN] Requête reçue');
    console.log('🔑 [WS-TOKEN] req.user:', req.user);

    const userId = req.user.id;
    const isPro = req.user.isPro || false;
    const email = req.user.email; // L'email est toujours présent (voir auth_middleware ligne 48 et 57)

    console.log(`🔑 [WS-TOKEN] Génération token pour ${isPro ? 'PRO' : 'USER'}: ${userId} (${email})`);

    // Vérifier que tokenService.generateToken existe
    if (typeof tokenService.generateToken !== 'function') {
      console.error('❌ [WS-TOKEN] tokenService.generateToken n\'est pas une fonction');
      console.error('❌ [WS-TOKEN] tokenService:', Object.keys(tokenService));
      return res.status(500).json({ 
        success: false, 
        message: 'Service de génération de token non disponible' 
      });
    }

    // Générer un token WebSocket temporaire (expire dans 5 minutes)
    const wsToken = tokenService.generateToken(
      { 
        userId, 
        email,
        isPro,
        type: 'websocket'
      },
      '5m'
    );

    console.log('✅ [WS-TOKEN] Token généré avec succès');

    res.json({
      success: true,
      wsToken: wsToken
    });

  } catch (error) {
    console.error('❌ [WS-TOKEN] Erreur génération token:', error);
    console.error('❌ [WS-TOKEN] Stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la génération du token WebSocket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;