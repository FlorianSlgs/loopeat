// modules/give_back/give_back.routes.js
const express = require('express');
const router = express.Router();
const giveBackController = require('./give_back.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

console.log('🔙 Chargement des routes give_back...');

/**
 * Routes pour les professionnels uniquement
 */

// Enregistrer le retour de boîtes (PRO uniquement)
router.post('/record', authMiddleware, (req, res) => {
  if (!req.user.isPro) {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux professionnels'
    });
  }
  giveBackController.recordGiveBack(req, res);
});

// Récupérer les boîtes empruntées d'un utilisateur (PRO uniquement)
router.get('/user-borrows/:userCode', authMiddleware, (req, res) => {
  if (!req.user.isPro) {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux professionnels'
    });
  }
  giveBackController.getUserBorrows(req, res);
});

console.log('✅ Routes give_back chargées');

module.exports = router;