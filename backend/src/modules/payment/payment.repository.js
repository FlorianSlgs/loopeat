// src/modules/payment/payment.repository.js
const { pool } = require('../../config/database');

const paymentRepository = {
  /**
   * Enregistrer un rechargement dans balance_history ET mettre à jour balance
   */
  async recordRecharge(userId, amount, stripeSessionId) {
    const client = await pool.connect();
    
    try {
      // Démarrer une transaction
      await client.query('BEGIN');
      
      console.log(`💾 Enregistrement du rechargement de ${amount}€ pour l'utilisateur ${userId}`);

      // Vérifier si ce rechargement n'a pas déjà été enregistré
      const existingRecharge = await client.query(
        `SELECT id FROM balance_history 
         WHERE title LIKE $1 
         AND user_id = $2
         AND created > NOW() - INTERVAL '1 hour'`,
        [`%${stripeSessionId}%`, userId]
      );

      if (existingRecharge.rows && existingRecharge.rows.length > 0) {
        console.log('⚠️ Rechargement déjà enregistré (webhook dupliqué)');
        await client.query('ROLLBACK');
        return existingRecharge.rows[0];
      }

      // 1. Insérer dans balance_history
      const historyResult = await client.query(
        `INSERT INTO balance_history (
          user_id,
          add,
          subtract,
          title,
          last_update,
          created
        ) VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *`,
        [
          userId,
          amount,
          null,
          `Rechargement de ${amount}€`
        ]
      );

      console.log('✅ Historique enregistré:', historyResult.rows[0].id);

      // 2. Vérifier si l'utilisateur a déjà une balance
      const existingBalance = await client.query(
        `SELECT id, amount FROM balance WHERE user_id = $1`,
        [userId]
      );

      if (existingBalance.rows.length > 0) {
        // Mettre à jour la balance existante
        const newAmount = parseFloat(existingBalance.rows[0].amount) + amount;
        await client.query(
          `UPDATE balance 
           SET amount = $1, 
               last_update = NOW() 
           WHERE user_id = $2`,
          [newAmount, userId]
        );
        console.log(`✅ Balance mise à jour: ${newAmount}€`);
      } else {
        // Créer une nouvelle balance
        await client.query(
          `INSERT INTO balance (user_id, amount, last_update, created)
           VALUES ($1, $2, NOW(), NOW())`,
          [userId, amount]
        );
        console.log(`✅ Balance créée: ${amount}€`);
      }

      // Valider la transaction
      await client.query('COMMIT');
      
      console.log('✅ Rechargement enregistré avec succès');

      return historyResult.rows[0];

    } catch (error) {
      // Annuler la transaction en cas d'erreur
      await client.query('ROLLBACK');
      console.error('❌ Erreur lors de l\'enregistrement du rechargement:', error);
      console.error('❌ Stack:', error.stack);
      throw error;
    } finally {
      // Libérer le client
      client.release();
    }
  },

  /**
   * Récupérer l'historique des rechargements d'un utilisateur
   */
  async getUserRechargeHistory(userId, limit = 10) {
    try {
      const result = await pool.query(
        `SELECT
          id,
          add as amount,
          title,
          created
         FROM balance_history
         WHERE user_id = $1
           AND add IS NOT NULL
           AND add > 0
           AND deleted IS NULL
         ORDER BY created DESC
         LIMIT $2`,
        [userId, limit]
      );

      return result.rows;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'historique:', error);
      throw error;
    }
  },

  /**
   * Récupérer l'historique complet (ajouts et retraits) d'un utilisateur
   */
  async getFullBalanceHistory(userId, limit = 50) {
    try {
      console.log(`📜 Récupération de l'historique pour user_id: ${userId}`);

      const result = await pool.query(
        `SELECT
          id,
          add,
          subtract,
          title,
          created
         FROM balance_history
         WHERE user_id = $1
         ORDER BY created DESC
         LIMIT $2`,
        [userId, limit]
      );

      console.log(`✅ ${result.rows.length} transactions trouvées`);
      console.log('Détails:', JSON.stringify(result.rows, null, 2));

      return result.rows;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'historique complet:', error);
      throw error;
    }
  },

  /**
   * Calculer le solde total d'un utilisateur
   */
  async getUserBalance(userId) {
    try {
      const result = await pool.query(
        `SELECT
          COALESCE(SUM(add), 0) as total_added,
          COALESCE(SUM(subtract), 0) as total_subtracted,
          COALESCE(SUM(add), 0) - COALESCE(SUM(subtract), 0) as balance
         FROM balance_history
         WHERE user_id = $1
           AND deleted IS NULL`,
        [userId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('❌ Erreur lors du calcul du solde:', error);
      throw error;
    }
  },

  /**
   * Récupérer la balance directement depuis la table balance
   */
  async getBalanceFromTable(userId) {
    try {
      const result = await pool.query(
        `SELECT amount
         FROM balance
         WHERE user_id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        // Si aucune balance n'existe, retourner 0
        return { amount: 0 };
      }

      return { amount: parseFloat(result.rows[0].amount) };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la balance:', error);
      throw error;
    }
  }
};

module.exports = paymentRepository;