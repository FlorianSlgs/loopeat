// modules/accounts/accounts.routes.js
const express = require('express');
const router = express.Router();
const accountsController = require('./accounts.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

/**
 * GET /api/accounts/info
 * Récupérer le code et le nom de l'utilisateur
 */
router.get('/info', (req, res) => accountsController.getBasicInfo(req, res));

module.exports = router;