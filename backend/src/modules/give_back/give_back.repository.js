// modules/give_back/give_back.repository.js
const { pool } = require('../../config/database');

class GiveBackRepository {
  /**
   * Trouver un utilisateur par son code à 4 chiffres
   */
  async findUserByCode(code) {
    const query = `
      SELECT id, email, first_name, last_name, verified
      FROM users
      WHERE code = $1 AND deleted = false AND verified = true
    `;
    const result = await pool.query(query, [code]);
    return result.rows[0];
  }

  /**
   * Vérifier si le professionnel existe et est vérifié
   */
  async findProById(proId) {
    const query = `
      SELECT id, email, name, verified
      FROM professionnal
      WHERE id = $1 AND deleted = false AND verified = true
    `;
    const result = await pool.query(query, [proId]);
    return result.rows[0];
  }

  /**
   * Récupérer les boîtes empruntées actives d'un utilisateur
   */
  async getUserActiveBorrows(userId) {
    const query = `
      SELECT 
        ub.id,
        ub.number,
        ub.type,
        ub.borrowed,
        ub.borrowed_pro_id,
        p.name as pro_name
      FROM users_boxes ub
      JOIN professionnal p ON ub.borrowed_pro_id = p.id
      WHERE ub.user_id = $1 
        AND ub.accepted = true
        AND ub.borrowed IS NOT NULL
        AND ub.give_back IS NULL
        AND ub.deleted IS NULL
      ORDER BY ub.borrowed DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  /**
   * Enregistrer le retour de boîtes
   */
  async recordGiveBack(userId, proId, returnItems) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      console.log(`📦 Retour de ${returnItems.length} types de boîtes`);

      const processedItems = [];
      let totalRefund = 0;

      for (const item of returnItems) {
        const { type, number } = item;

        // Récupérer les boîtes empruntées de ce type (FIFO - First In First Out)
        const borrowQuery = `
          SELECT id, number, type
          FROM users_boxes
          WHERE user_id = $1
            AND type = $2
            AND accepted = true
            AND borrowed IS NOT NULL
            AND give_back IS NULL
            AND deleted IS NULL
          ORDER BY borrowed ASC
          LIMIT 1
        `;
        const borrowResult = await client.query(borrowQuery, [userId, type]);

        if (borrowResult.rows.length === 0) {
          throw new Error(`Aucune boîte de type ${type} empruntée par cet utilisateur`);
        }

        const borrowedBox = borrowResult.rows[0];

        if (borrowedBox.number < number) {
          throw new Error(`Nombre de boîtes à retourner (${number}) supérieur au nombre emprunté (${borrowedBox.number})`);
        }

        // Mettre à jour la boîte retournée
        const updateQuery = `
          UPDATE users_boxes
          SET give_back = CURRENT_TIMESTAMP,
              give_back_pro_id = $1
          WHERE id = $2
          RETURNING *
        `;
        const updateResult = await client.query(updateQuery, [proId, borrowedBox.id]);

        // Ajouter les boîtes sales dans l'inventaire du pro
        const updateProBoxesQuery = `
          UPDATE pro_boxes
          SET dirty = dirty + $1
          WHERE pro_id = $2 AND type = $3
          RETURNING *
        `;
        const proBoxesResult = await client.query(updateProBoxesQuery, [
          number,
          proId,
          type
        ]);

        if (proBoxesResult.rows.length === 0) {
          // Si aucune ligne n'existe pour ce type, la créer
          const insertProBoxesQuery = `
            INSERT INTO pro_boxes (pro_id, type, clean, dirty, created, last_update)
            VALUES ($1, $2, 0, $3, NOW(), NOW())
            RETURNING *
          `;
          await client.query(insertProBoxesQuery, [proId, type, number]);
        }

        // Calculer le remboursement pour ce type
        const refund = this.calculateAmount(type, number, true);
        totalRefund += refund;

        processedItems.push({
          id: updateResult.rows[0].id,
          type: type,
          number: number,
          refund: refund
        });

        console.log(`✅ ${number} boîte(s) de type ${type} retournée(s) - Remboursement: ${refund}€`);
      }

      // Enregistrer le crédit dans balance_history
      const boxTypeLabels = {
        1: 'Boite Salade Verre',
        2: 'Boite Salade Plastique',
        3: 'Boite Frites',
        4: 'Boite Pizza',
        5: 'Gobelet',
        6: 'Boite Burger'
      };

      const boxDetails = returnItems.map(item => {
        const boxLabel = boxTypeLabels[item.type] || `Type ${item.type}`;
        return `${item.number} ${boxLabel}`;
      }).join(' + ');

      const creditTitle = `Retour de ${boxDetails}`;

      await this.recordCredit(client, userId, totalRefund, creditTitle);

      await client.query('COMMIT');
      
      return {
        processedItems,
        totalRefund
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Erreur lors du retour des boîtes:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Enregistrer un crédit dans balance_history ET mettre à jour balance
   */
  async recordCredit(client, userId, amount, title) {
    try {
      console.log(`💰 Enregistrement du crédit de ${amount}€ pour l'utilisateur ${userId}`);

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
          title
        ]
      );

      console.log('✅ Historique enregistré:', historyResult.rows[0].id);

      // 2. Mettre à jour la balance
      const balanceResult = await client.query(
        `SELECT amount FROM balance WHERE user_id = $1`,
        [userId]
      );

      const currentBalance = balanceResult.rows.length > 0 
        ? parseFloat(balanceResult.rows[0].amount) 
        : 0;

      const newAmount = currentBalance + amount;
      
      if (balanceResult.rows.length > 0) {
        // Mettre à jour la balance existante
        await client.query(
          `UPDATE balance 
           SET amount = $1, 
               last_update = NOW() 
           WHERE user_id = $2`,
          [newAmount, userId]
        );
        console.log(`✅ Balance mise à jour: ${newAmount}€`);
      } else {
        // Créer une nouvelle balance (cas rare)
        await client.query(
          `INSERT INTO balance (user_id, amount, last_update, created)
           VALUES ($1, $2, NOW(), NOW())`,
          [userId, newAmount]
        );
        console.log(`✅ Balance créée: ${newAmount}€`);
      }

      console.log('✅ Crédit enregistré avec succès');

      return historyResult.rows[0];

    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement du crédit:', error);
      throw error;
    }
  }

  /**
   * Calculer le montant d'un retour
   */
  calculateAmount(type, number, isReturn = false) {
    const priceMap = {
      1: 10,  // Verre Salade - 10€
      2: 4,   // Plastique Salade - 4€
      3: 2,   // Frites - 2€
      4: 20,  // Pizza - 20€
      5: 2,   // Gobelet - 2€
      6: 6    // Burger - 6€
    };

    const pricePerUnit = priceMap[type] || 0;
    const amount = pricePerUnit * number;
    
    return amount; // Toujours positif pour un retour
  }

  /**
   * Calculer le remboursement total pour plusieurs types
   */
  calculateTotalRefund(items) {
    let total = 0;
    items.forEach(item => {
      total += this.calculateAmount(item.type, item.number, true);
    });
    return total;
  }
}

module.exports = new GiveBackRepository();