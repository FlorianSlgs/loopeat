// modules/borrow/borrow.routes.js
const express = require('express');
const router = express.Router();
const borrowController = require('./borrow.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

console.log('📍 Chargement des routes borrow...');

/**
 * Routes communes (PRO et USER)
 */

// Récupérer une proposition par ID
router.get('/proposal/:proposalId', authMiddleware, (req, res) => {
  borrowController.getProposal(req, res);
});

/**
 * Routes pour les professionnels
 */

// Créer une proposition d'emprunt (PRO uniquement)
router.post('/propose', authMiddleware, (req, res) => {
  if (!req.user.isPro) {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux professionnels'
    });
  }
  borrowController.createProposal(req, res);
});

// Annuler une proposition (PRO uniquement)
router.post('/cancel/:proposalId', authMiddleware, (req, res) => {
  if (!req.user.isPro) {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux professionnels'
    });
  }
  borrowController.cancelProposal(req, res);
});

// Récupérer toutes les propositions actives (PRO uniquement)
router.get('/my-proposals', authMiddleware, (req, res) => {
  if (!req.user.isPro) {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux professionnels'
    });
  }
  borrowController.getMyProposals(req, res);
});

/**
 * Routes pour les utilisateurs
 */

// Récupérer les propositions en attente (USER uniquement)
router.get('/pending', authMiddleware, (req, res) => {
  if (req.user.isPro) {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux utilisateurs'
    });
  }
  borrowController.getPendingProposals(req, res);
});

// Accepter une proposition (USER uniquement)
router.post('/accept/:proposalId', authMiddleware, (req, res) => {
  if (req.user.isPro) {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux utilisateurs'
    });
  }
  borrowController.acceptProposal(req, res);
});

// Refuser une proposition (USER uniquement)
router.post('/reject/:proposalId', authMiddleware, (req, res) => {
  if (req.user.isPro) {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux utilisateurs'
    });
  }
  borrowController.rejectProposal(req, res);
});

console.log('✅ Routes borrow chargées');

module.exports = router;