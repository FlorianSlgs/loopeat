// modules/give_back/give_back.controller.js
const giveBackService = require('./give_back.service');

class GiveBackController {
  /**
   * [PRO] Enregistrer le retour de boîtes
   * POST /api/give-back/record
   */
  async recordGiveBack(req, res) {
    try {
      console.log('📦 Enregistrement d\'un retour de boîtes');
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

      const result = await giveBackService.recordGiveBack(
        req.user.id,
        userCode,
        items
      );

      console.log('✅ Retour enregistré avec succès');
      return res.status(201).json(result);
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement du retour:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'enregistrement du retour'
      });
    }
  }

  /**
   * [PRO] Récupérer les boîtes empruntées d'un utilisateur par son code
   * GET /api/give-back/user-borrows/:userCode
   */
  async getUserBorrows(req, res) {
    try {
      console.log('📦 Récupération des boîtes empruntées d\'un utilisateur');
      console.log('Pro ID:', req.user.id);
      console.log('User Code:', req.params.userCode);

      const result = await giveBackService.getUserActiveBorrowsByCode(
        req.params.userCode
      );

      console.log('✅ Boîtes récupérées');
      return res.json(result);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des boîtes:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des boîtes'
      });
    }
  }
}

module.exports = new GiveBackController();