// models/accounts.model.js
const { pool } = require('../config/database');

class AccountsModel {
  /**
   * Récupérer le code et le nom de l'utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @param {boolean} isPro - Si c'est un professionnel
   * @returns {Promise<Object>} - Code et nom
   */
  static async getUserBasicInfo(userId, isPro = false) {
    const table = isPro ? 'professionnal' : 'users';
    
    const query = `
      SELECT 
        id,
        email,
        ${isPro ? 'name' : 'first_name, last_name'},
        code
      FROM ${table}
      WHERE id = $1
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }
}

module.exports = AccountsModel;