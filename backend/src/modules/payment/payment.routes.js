// src/modules/payment/payment.routes.js
const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// Route protégée - créer une session de rechargement
router.post('/create-recharge-session', authMiddleware, (req, res) => {
  paymentController.createRechargeSession(req, res);
});

// Route protégée - vérifier le statut d'une session
router.get('/verify-session/:sessionId', authMiddleware, (req, res) => {
  paymentController.verifySession(req, res);
});

// Webhook Stripe (NON protégé, mais vérifié par signature Stripe)
// Note: express.raw() est déjà appliqué dans app.js pour cette route
router.post('/webhook', (req, res) => {
  paymentController.handleWebhook(req, res);
});

module.exports = router;