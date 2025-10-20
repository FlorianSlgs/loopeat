const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

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

module.exports = router;