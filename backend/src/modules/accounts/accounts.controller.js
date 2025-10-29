// modules/accounts/accounts.controller.js
const accountsService = require('./accounts.service');

class AccountsController {
  /**
   * Récupérer le code et le nom
   * GET /api/accounts/info
   */
  async getBasicInfo(req, res) {
    try {
      console.log('📊 Requête reçue sur /accounts/info');
      console.log('👤 User:', req.user);

      const userId = req.user.id;
      const isPro = req.user.isPro || false;

      const userInfo = await accountsService.getUserBasicInfo(userId, isPro);

      return res.status(200).json({
        success: true,
        data: userInfo
      });

    } catch (error) {
      console.error('❌ Erreur dans getBasicInfo:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des informations'
      });
    }
  }
}

module.exports = new AccountsController();