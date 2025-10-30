// modules/borrow/borrow.routes.js
const express = require('express');
const router = express.Router();
const borrowController = require('./borrow.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

console.log('🔍 Chargement des routes borrow...');

/**
 * Routes communes (PRO et USER)
 */

// Récupérer une proposition par ID
router.get('/proposal/:proposalId', authMiddleware, (req, res) => {
  borrowController.getProposal(req, res);
});

// Récupérer toutes les propositions d'un batch par batch_id
router.get('/batch/:batchId', authMiddleware, (req, res) => {
  borrowController.getBatchProposals(req, res);
});

/**
 * Routes pour les professionnels
 */

// 🆕 Récupérer l'inventaire des boîtes (PRO uniquement)
router.get('/inventory', authMiddleware, (req, res) => {
  if (!req.user.isPro) {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux professionnels'
    });
  }
  borrowController.getInventory(req, res);
});

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

// 🆕 Récupérer l'historique mensuel (PRO uniquement)
router.get('/monthly-history', authMiddleware, (req, res) => {
  if (!req.user.isPro) {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux professionnels'
    });
  }
  borrowController.getMonthlyHistory(req, res);
});

/**
 * Routes pour les utilisateurs
 */

// 🆕 Récupérer les boîtes empruntées actives (USER uniquement)
router.get('/active', authMiddleware, (req, res) => {
  if (req.user.isPro) {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux utilisateurs'
    });
  }
  borrowController.getActiveBorrows(req, res);
});

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

// Accepter un batch entier de propositions (USER uniquement)
router.post('/batch/:batchId/accept', authMiddleware, (req, res) => {
  if (req.user.isPro) {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux utilisateurs'
    });
  }
  borrowController.acceptBatch(req, res);
});

// Refuser un batch entier de propositions (USER uniquement)
router.post('/batch/:batchId/reject', authMiddleware, (req, res) => {
  if (req.user.isPro) {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux utilisateurs'
    });
  }
  borrowController.rejectBatch(req, res);
});

// 🆕 Récupérer l'historique des emprunts et retours (USER uniquement)
router.get('/history', authMiddleware, (req, res) => {
  if (req.user.isPro) {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux utilisateurs'
    });
  }
  borrowController.getBorrowHistory(req, res);
});

console.log('✅ Routes borrow chargées');

module.exports = router;