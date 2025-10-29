// modules/accounts/accounts.service.js
const AccountsModel = require('../../models/accounts.model');

class AccountsService {
  /**
   * Récupérer le code et le nom de l'utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @param {boolean} isPro - Si c'est un professionnel
   * @returns {Promise<Object>} - Code et nom
   */
  async getUserBasicInfo(userId, isPro = false) {
    console.log('📊 Récupération du code pour:', userId, isPro ? '(PRO)' : '(USER)');

    try {
      const userInfo = await AccountsModel.getUserBasicInfo(userId, isPro);

      if (!userInfo) {
        throw new Error('Utilisateur non trouvé');
      }

      // Formatter la réponse
      const response = {
        id: userInfo.id,
        email: userInfo.email,
        code: userInfo.code,
        isPro: isPro
      };

      // Ajouter les champs de nom selon le type d'utilisateur
      if (isPro) {
        response.name = userInfo.name;
      } else {
        response.firstName = userInfo.first_name;
        response.lastName = userInfo.last_name;
      }

      console.log('✅ Infos récupérées avec succès');
      return response;

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des infos:', error);
      throw error;
    }
  }
}

module.exports = new AccountsService();