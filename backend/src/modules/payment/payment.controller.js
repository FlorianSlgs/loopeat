// src/modules/payment/payment.controller.js
const paymentService = require('./payment.service');

const paymentController = {
  /**
   * Créer une session Stripe Checkout pour recharger le solde
   */
  async createRechargeSession(req, res) {
    try {
      console.log('💳 Création d\'une session de rechargement...');
      console.log('👤 Utilisateur:', req.user);

      const { amount } = req.body;

      // Validation
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Montant invalide. Le montant doit être un nombre positif.'
        });
      }

      // Limiter les montants (optionnel, à adapter selon vos besoins)
      if (amount < 5) {
        return res.status(400).json({
          success: false,
          message: 'Le montant minimum est de 5€'
        });
      }

      if (amount > 1000) {
        return res.status(400).json({
          success: false,
          message: 'Le montant maximum est de 1000€'
        });
      }

      // Créer la session Stripe
      const session = await paymentService.createCheckoutSession(
        req.user.id,
        amount,
        req.user.email
      );

      console.log('✅ Session créée:', session.id);

      return res.status(200).json({
        success: true,
        url: session.url,
        sessionId: session.id
      });

    } catch (error) {
      console.error('❌ Erreur lors de la création de la session:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de la session de paiement',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Vérifier le statut d'une session de paiement
   */
  async verifySession(req, res) {
    try {
      console.log('🔍 Vérification de la session...');

      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'ID de session manquant'
        });
      }

      const sessionDetails = await paymentService.getSessionDetails(sessionId);

      // Vérifier que la session appartient bien à l'utilisateur connecté
      if (sessionDetails.metadata.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé à cette session'
        });
      }

      return res.status(200).json({
        success: true,
        session: {
          id: sessionDetails.id,
          status: sessionDetails.payment_status,
          amount: sessionDetails.amount_total / 100,
          currency: sessionDetails.currency
        }
      });

    } catch (error) {
      console.error('❌ Erreur lors de la vérification de la session:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification de la session',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Gérer les webhooks Stripe
   */
  async handleWebhook(req, res) {
    try {
      console.log('🔔 Webhook reçu de Stripe...');

      const sig = req.headers['stripe-signature'];

      if (!sig) {
        console.error('❌ Signature Stripe manquante');
        return res.status(400).send('Signature manquante');
      }

      // Vérifier et traiter l'événement
      const event = await paymentService.handleStripeWebhook(req.body, sig);

      console.log('✅ Webhook traité:', event.type);

      return res.json({ received: true });

    } catch (error) {
      console.error('❌ Erreur lors du traitement du webhook:', error);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }
  },

  /**
   * Récupérer le solde de l'utilisateur connecté
   */
  async getUserBalance(req, res) {
    try {
      console.log('💰 Récupération du solde pour l\'utilisateur:', req.user.id);

      const balance = await paymentService.getUserBalance(req.user.id);

      return res.status(200).json({
        success: true,
        balance: balance.amount
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération du solde:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du solde',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Récupérer l'historique des transactions de l'utilisateur connecté
   */
  async getBalanceHistory(req, res) {
    try {
      console.log('📜 Récupération de l\'historique pour l\'utilisateur:', req.user.id);

      const limit = parseInt(req.query.limit) || 50;
      const history = await paymentService.getBalanceHistory(req.user.id, limit);

      return res.status(200).json({
        success: true,
        history: history
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'historique:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'historique',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = paymentController;