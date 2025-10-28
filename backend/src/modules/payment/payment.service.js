// src/modules/payment/payment.service.js
const stripe = require('../../config/stripe');
const paymentRepository = require('./payment.repository');

const paymentService = {
  /**
   * Créer une session Stripe Checkout pour le rechargement
   */
  async createCheckoutSession(userId, amount, userEmail) {
    try {
      console.log(`💰 Création session pour ${amount}€ (user: ${userId})`);

      const session = await stripe.checkout.sessions.create({
        customer_email: userEmail,
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `Rechargement de compte`,
                description: `Ajout de ${amount}€ à votre solde Loopeat`,
              },
              unit_amount: Math.round(amount * 100), // Convertir en centimes
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/utilisateurs/recharge?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/utilisateurs/annule`,
        metadata: {
          userId: userId,
          amount: amount.toString(),
          type: 'balance_recharge'
        },
      });

      console.log('✅ Session Stripe créée:', session.id);

      return session;

    } catch (error) {
      console.error('❌ Erreur lors de la création de la session Stripe:', error);
      throw new Error('Impossible de créer la session de paiement');
    }
  },

  /**
   * Récupérer les détails d'une session
   */
  async getSessionDetails(sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la session:', error);
      throw new Error('Session introuvable');
    }
  },

  /**
   * Gérer les événements du webhook Stripe
   */
  async handleStripeWebhook(rawBody, signature) {
    let event;

    try {
      // Vérifier la signature du webhook
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('❌ Erreur de vérification de signature:', err.message);
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    console.log('📩 Événement Stripe:', event.type);

    // Gérer les différents types d'événements
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object);
        break;

      case 'checkout.session.async_payment_succeeded':
        await this.handleCheckoutCompleted(event.data.object);
        break;

      case 'checkout.session.async_payment_failed':
        console.log('❌ Paiement asynchrone échoué:', event.data.object.id);
        break;

      default:
        console.log(`ℹ️ Événement non géré: ${event.type}`);
    }

    return event;
  },

  /**
   * Traiter un paiement complété
   */
  async handleCheckoutCompleted(session) {
    try {
      console.log('✅ Paiement complété:', session.id);
      console.log('💰 Montant:', session.amount_total / 100, session.currency);

      // Vérifier que c'est bien un rechargement
      if (session.metadata.type !== 'balance_recharge') {
        console.log('ℹ️ Type de paiement non géré:', session.metadata.type);
        return;
      }

      // Vérifier que le paiement est bien réussi
      if (session.payment_status !== 'paid') {
        console.log('⚠️ Paiement non confirmé:', session.payment_status);
        return;
      }

      const userId = session.metadata.userId;
      const amount = parseFloat(session.metadata.amount);

      console.log(`💳 Rechargement de ${amount}€ pour l'utilisateur ${userId}`);

      // Enregistrer dans balance_history
      await paymentRepository.recordRecharge(
        userId,
        amount,
        session.id
      );

      console.log('✅ Rechargement enregistré dans la base de données');

    } catch (error) {
      console.error('❌ Erreur lors du traitement du paiement complété:', error);
      // Ne pas throw pour ne pas faire échouer le webhook
      // Stripe va réessayer si on renvoie une erreur
    }
  },

  /**
   * Récupérer le solde d'un utilisateur
   */
  async getUserBalance(userId) {
    try {
      const balance = await paymentRepository.getBalanceFromTable(userId);
      return balance;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du solde:', error);
      throw error;
    }
  },

  /**
   * Récupérer l'historique complet des transactions d'un utilisateur
   */
  async getBalanceHistory(userId, limit = 50) {
    try {
      const history = await paymentRepository.getFullBalanceHistory(userId, limit);
      return history;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'historique:', error);
      throw error;
    }
  }
};

module.exports = paymentService;