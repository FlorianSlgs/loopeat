// modules/borrow/borrow.controller.js
const borrowService = require('./borrow.service');

class BorrowController {
  /**
   * [PRO] Créer une proposition d'emprunt
   * POST /api/borrow/propose
   */
  async createProposal(req, res) {
    try {
      console.log('📦 Création d\'une proposition d\'emprunt');
      console.log('Pro ID:', req.user.id);
      console.log('Body:', req.body);

      const { userCode, items } = req.body;

      if (!userCode) {
        return res.status(400).json({
          success: false,
          message: 'Code utilisateur requis'
        });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Au moins un type de boîte doit être spécifié'
        });
      }

      const result = await borrowService.createBorrowProposal(
        req.user.id,
        userCode,
        items
      );

      console.log('✅ Proposition créée avec succès');
      return res.status(201).json(result);
    } catch (error) {
      console.error('❌ Erreur lors de la création de la proposition:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la création de la proposition'
      });
    }
  }

  /**
   * [PRO/USER] Récupérer une proposition par ID
   * GET /api/borrow/proposal/:proposalId
   */
  async getProposal(req, res) {
    try {
      console.log('📦 Récupération d\'une proposition');
      console.log('User ID:', req.user.id);
      console.log('Proposal ID:', req.params.proposalId);

      const result = await borrowService.getProposalById(
        req.params.proposalId,
        req.user.id,
        req.user.isPro
      );

      console.log('✅ Proposition récupérée');
      return res.json(result);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la proposition:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération de la proposition'
      });
    }
  }

  /**
   * [USER] Récupérer les propositions en attente
   * GET /api/borrow/pending
   */
  async getPendingProposals(req, res) {
    try {
      console.log('📦 Récupération des propositions en attente');
      console.log('User ID:', req.user.id);

      const result = await borrowService.getUserPendingProposals(req.user.id);

      console.log('✅ Propositions récupérées:', result.proposals.length);
      return res.json(result);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des propositions:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des propositions'
      });
    }
  }

  /**
   * [USER] Accepter une proposition
   * POST /api/borrow/accept/:proposalId
   */
  async acceptProposal(req, res) {
    try {
      console.log('✅ Acceptation d\'une proposition');
      console.log('User ID:', req.user.id);
      console.log('Proposal ID:', req.params.proposalId);

      const result = await borrowService.acceptProposal(
        req.params.proposalId,
        req.user.id
      );

      console.log('✅ Proposition acceptée avec succès');
      return res.json(result);
    } catch (error) {
      console.error('❌ Erreur lors de l\'acceptation de la proposition:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'acceptation de la proposition'
      });
    }
  }

  /**
   * [USER] Refuser une proposition
   * POST /api/borrow/reject/:proposalId
   */
  async rejectProposal(req, res) {
    try {
      console.log('❌ Refus d\'une proposition (USER)');
      console.log('User ID:', req.user.id);
      console.log('Proposal ID:', req.params.proposalId);

      const result = await borrowService.rejectProposal(
        req.params.proposalId,
        req.user.id,
        false // isPro = false
      );

      console.log('✅ Proposition refusée avec succès');
      return res.json(result);
    } catch (error) {
      console.error('❌ Erreur lors du refus de la proposition:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors du refus de la proposition'
      });
    }
  }

  /**
   * [PRO] Annuler une proposition
   * POST /api/borrow/cancel/:proposalId
   */
  async cancelProposal(req, res) {
    try {
      console.log('❌ Annulation d\'une proposition (PRO)');
      console.log('Pro ID:', req.user.id);
      console.log('Proposal ID:', req.params.proposalId);

      const result = await borrowService.rejectProposal(
        req.params.proposalId,
        req.user.id,
        true // isPro = true
      );

      console.log('✅ Proposition annulée avec succès');
      return res.json(result);
    } catch (error) {
      console.error('❌ Erreur lors de l\'annulation de la proposition:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'annulation de la proposition'
      });
    }
  }

  /**
   * [PRO] Récupérer toutes les propositions actives
   * GET /api/borrow/my-proposals
   */
  async getMyProposals(req, res) {
    try {
      console.log('📦 Récupération des propositions du pro');
      console.log('Pro ID:', req.user.id);

      const result = await borrowService.getProProposals(req.user.id);

      console.log('✅ Propositions récupérées:', result.proposals.length);
      return res.json(result);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des propositions:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des propositions'
      });
    }
  }

  /**
   * [USER] Récupérer les boîtes empruntées actives
   * GET /api/borrow/active
   */
  async getActiveBorrows(req, res) {
    try {
      console.log('📦 Récupération des boîtes empruntées actives');
      console.log('User ID:', req.user.id);

      const result = await borrowService.getUserActiveBorrows(req.user.id);

      console.log('✅ Boîtes récupérées:', result.totalBoxes);
      return res.json(result);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des boîtes:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des boîtes empruntées'
      });
    }
  }

   /**
   * [USER] Récupérer l'historique des emprunts et retours
   * GET /api/borrow/history
   */
  async getBorrowHistory(req, res) {
    try {
      console.log('📜 Récupération de l\'historique des emprunts');
      console.log('User ID:', req.user.id);

      const limit = parseInt(req.query.limit) || 50;
      const result = await borrowService.getUserBorrowHistory(req.user.id, limit);

      console.log('✅ Historique récupéré:', result.transactions.length, 'transactions');
      return res.json(result);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'historique:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'historique'
      });
    }
  }

  /**
   * [PRO] Récupérer l'inventaire des boîtes
   * GET /api/borrow/inventory
   */
  async getInventory(req, res) {
    try {
      console.log('📦 Récupération de l\'inventaire');
      console.log('Pro ID:', req.user.id);

      const result = await borrowService.getProInventory(req.user.id);

      console.log('✅ Inventaire récupéré');
      return res.json(result);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'inventaire:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'inventaire'
      });
    }
  }

    /**
   * [PRO] Récupérer l'historique mensuel
   * GET /api/borrow/monthly-history
   */
  async getMonthlyHistory(req, res) {
    try {
      console.log('📊 Récupération de l\'historique mensuel');
      console.log('Pro ID:', req.user.id);

      const limit = parseInt(req.query.limit) || 12;
      const result = await borrowService.getMonthlyHistory(req.user.id, limit);

      console.log('✅ Historique récupéré:', result.history.length, 'mois');
      return res.json(result);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'historique:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'historique mensuel'
      });
    }
  }

  /**
   * [PRO/USER] Récupérer toutes les propositions d'un batch
   * GET /api/borrow/batch/:batchId
   */
  async getBatchProposals(req, res) {
    try {
      console.log('📦 Récupération d\'un batch de propositions');
      console.log('User ID:', req.user.id);
      console.log('Batch ID:', req.params.batchId);

      const result = await borrowService.getProposalsByBatchId(
        req.params.batchId,
        req.user.id,
        req.user.isPro
      );

      console.log('✅ Batch récupéré:', result.proposals.length, 'propositions');
      return res.json(result);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du batch:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération du batch'
      });
    }
  }

  /**
   * [USER] Accepter un batch entier de propositions
   * POST /api/borrow/batch/:batchId/accept
   */
  async acceptBatch(req, res) {
    try {
      console.log('✅ Acceptation d\'un batch de propositions');
      console.log('User ID:', req.user.id);
      console.log('Batch ID:', req.params.batchId);

      const result = await borrowService.acceptBatch(
        req.params.batchId,
        req.user.id
      );

      console.log('✅ Batch accepté avec succès');
      return res.json(result);
    } catch (error) {
      console.error('❌ Erreur lors de l\'acceptation du batch:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'acceptation du batch'
      });
    }
  }

  /**
   * [USER/PRO] Refuser un batch entier de propositions
   * POST /api/borrow/batch/:batchId/reject
   */
  async rejectBatch(req, res) {
    try {
      console.log('❌ Refus d\'un batch de propositions');
      console.log('User ID:', req.user.id);
      console.log('Batch ID:', req.params.batchId);

      const result = await borrowService.rejectBatch(
        req.params.batchId,
        req.user.id,
        req.user.isPro
      );

      console.log('✅ Batch refusé avec succès');
      return res.json(result);
    } catch (error) {
      console.error('❌ Erreur lors du refus du batch:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors du refus du batch'
      });
    }
  }

}

module.exports = new BorrowController();