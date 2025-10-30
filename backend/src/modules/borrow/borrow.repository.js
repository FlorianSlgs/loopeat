// modules/borrow/borrow.repository.js (version corrigée)
const { pool } = require('../../config/database');

class BorrowRepository {
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
   * Créer une proposition d'emprunt (avec plusieurs types possibles)
   */
  async createBorrowProposal(userId, proId, borrowItems) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Générer un batch_id unique pour grouper toutes les propositions ensemble
      const batchIdResult = await client.query('SELECT gen_random_uuid() as batch_id');
      const batchId = batchIdResult.rows[0].batch_id;

      const insertedRows = [];

      for (const item of borrowItems) {
        const query = `
          INSERT INTO users_boxes (
            user_id,
            borrowed_pro_id,
            number,
            type,
            accepted,
            borrowed,
            batch_id
          ) VALUES ($1, $2, $3, $4, NULL, NULL, $5)
          RETURNING *
        `;

        const result = await client.query(query, [
          userId,
          proId,
          item.number,
          item.type,
          batchId
        ]);

        insertedRows.push(result.rows[0]);
      }

      await client.query('COMMIT');
      return insertedRows;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Récupérer une proposition par son ID
   */
  async getProposalById(proposalId) {
    const query = `
      SELECT
        ub.*,
        u.email as user_email,
        u.first_name,
        u.last_name,
        p.email as pro_email,
        p.name as pro_name
      FROM users_boxes ub
      JOIN users u ON ub.user_id = u.id
      JOIN professionnal p ON ub.borrowed_pro_id = p.id
      WHERE ub.id = $1 AND ub.deleted IS NULL
    `;
    const result = await pool.query(query, [proposalId]);
    return result.rows[0];
  }

  /**
   * Récupérer toutes les propositions d'un batch par batch_id
   */
  async getProposalsByBatchId(batchId) {
    const query = `
      SELECT
        ub.*,
        u.email as user_email,
        u.first_name,
        u.last_name,
        p.email as pro_email,
        p.name as pro_name,
        EXTRACT(EPOCH FROM (NOW() - ub.created))::INTEGER as elapsed_seconds
      FROM users_boxes ub
      JOIN users u ON ub.user_id = u.id
      JOIN professionnal p ON ub.borrowed_pro_id = p.id
      WHERE ub.batch_id = $1 AND ub.deleted IS NULL
      ORDER BY ub.type ASC
    `;
    const result = await pool.query(query, [batchId]);
    return result.rows;
  }

  /**
   * Récupérer les propositions en attente (accepted = NULL et créées il y a moins de 5 minutes)
   */
  async getPendingProposals(userId) {
    const query = `
      SELECT 
        ub.id,
        ub.number,
        ub.type,
        ub.created,
        ub.accepted,
        p.id as pro_id,
        p.name as pro_name,
        p.email as pro_email,
        EXTRACT(EPOCH FROM (NOW() - ub.created)) as elapsed_seconds
      FROM users_boxes ub
      JOIN professionnal p ON ub.borrowed_pro_id = p.id
      WHERE ub.user_id = $1 
        AND ub.accepted IS NULL
        AND ub.borrowed IS NULL 
        AND ub.deleted IS NULL
        AND ub.created > NOW() - INTERVAL '5 minutes'
      ORDER BY ub.created DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  /**
   * Accepter une proposition d'emprunt (USER)
   */
  async acceptProposal(proposalId, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Vérifier que la proposition existe et appartient à l'utilisateur
      const checkQuery = `
        SELECT * FROM users_boxes
        WHERE id = $1 
          AND user_id = $2 
          AND accepted IS NULL 
          AND deleted IS NULL
          AND created > NOW() - INTERVAL '5 minutes'
      `;
      const checkResult = await client.query(checkQuery, [proposalId, userId]);

      if (checkResult.rows.length === 0) {
        throw new Error('Proposition non trouvée, expirée ou déjà traitée');
      }

      const proposal = checkResult.rows[0];

      // Mettre à jour la proposition avec accepted = true et la date d'emprunt
      const updateQuery = `
        UPDATE users_boxes
        SET accepted = true, borrowed = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      const updateResult = await client.query(updateQuery, [proposalId]);

      // Mettre à jour l'inventaire du professionnel (retirer des boîtes propres)
      const updateProBoxesQuery = `
        UPDATE pro_boxes
        SET clean = clean - $1
        WHERE pro_id = $2 AND type = $3 AND clean >= $1
        RETURNING *
      `;
      const proBoxesResult = await client.query(updateProBoxesQuery, [
        proposal.number,
        proposal.borrowed_pro_id,
        proposal.type
      ]);

      if (proBoxesResult.rows.length === 0) {
        throw new Error('Stock insuffisant chez le professionnel');
      }

      await client.query('COMMIT');
      return updateResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Refuser une proposition d'emprunt (USER ou PRO)
   */
  async rejectProposal(proposalId, userId, isPro = false) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Vérifier que la proposition existe
      let checkQuery;
      if (isPro) {
        checkQuery = `
          SELECT * FROM users_boxes
          WHERE id = $1
            AND borrowed_pro_id = $2
            AND accepted IS NULL
            AND deleted IS NULL
            AND created > NOW() - INTERVAL '5 minutes'
        `;
      } else {
        checkQuery = `
          SELECT * FROM users_boxes
          WHERE id = $1
            AND user_id = $2
            AND accepted IS NULL
            AND deleted IS NULL
            AND created > NOW() - INTERVAL '5 minutes'
        `;
      }

      const checkResult = await client.query(checkQuery, [proposalId, userId]);

      if (checkResult.rows.length === 0) {
        throw new Error('Proposition non trouvée, expirée ou déjà traitée');
      }

      // Mettre à jour avec accepted = false
      const updateQuery = `
        UPDATE users_boxes
        SET accepted = false
        WHERE id = $1
        RETURNING *
      `;
      const result = await client.query(updateQuery, [proposalId]);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Accepter un batch entier de propositions (USER)
   */
  async acceptBatch(batchId, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Vérifier que toutes les propositions du batch existent et appartiennent à l'utilisateur
      const checkQuery = `
        SELECT * FROM users_boxes
        WHERE batch_id = $1
          AND user_id = $2
          AND accepted IS NULL
          AND deleted IS NULL
          AND created > NOW() - INTERVAL '5 minutes'
      `;
      const checkResult = await client.query(checkQuery, [batchId, userId]);

      if (checkResult.rows.length === 0) {
        throw new Error('Propositions non trouvées, expirées ou déjà traitées');
      }

      const proposals = checkResult.rows;
      const updatedProposals = [];

      // Pour chaque proposition du batch
      for (const proposal of proposals) {
        // Mettre à jour la proposition avec accepted = true et la date d'emprunt
        const updateQuery = `
          UPDATE users_boxes
          SET accepted = true, borrowed = CURRENT_TIMESTAMP
          WHERE id = $1
          RETURNING *
        `;
        const updateResult = await client.query(updateQuery, [proposal.id]);

        // Mettre à jour l'inventaire du professionnel (retirer des boîtes propres)
        const updateProBoxesQuery = `
          UPDATE pro_boxes
          SET clean = clean - $1
          WHERE pro_id = $2 AND type = $3 AND clean >= $1
          RETURNING *
        `;
        const proBoxesResult = await client.query(updateProBoxesQuery, [
          proposal.number,
          proposal.borrowed_pro_id,
          proposal.type
        ]);

        if (proBoxesResult.rows.length === 0) {
          throw new Error(`Stock insuffisant chez le professionnel pour le type ${proposal.type}`);
        }

        // Enregistrer dans l'historique mensuel
        const historyQuery = `
          INSERT INTO boxes_history (pro_id, number, month, created, last_update)
          VALUES ($1, $2, DATE_TRUNC('month', CURRENT_DATE), NOW(), NOW())
          ON CONFLICT (pro_id, month)
          DO UPDATE SET
            number = boxes_history.number + EXCLUDED.number,
            last_update = NOW()
          RETURNING *
        `;
        await client.query(historyQuery, [proposal.borrowed_pro_id, proposal.number]);

        updatedProposals.push(updateResult.rows[0]);
      }

      await client.query('COMMIT');
      return updatedProposals;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Refuser un batch entier de propositions (USER ou PRO)
   */
  async rejectBatch(batchId, userId, isPro = false) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Vérifier que toutes les propositions du batch existent
      let checkQuery;
      if (isPro) {
        checkQuery = `
          SELECT * FROM users_boxes
          WHERE batch_id = $1
            AND borrowed_pro_id = $2
            AND accepted IS NULL
            AND deleted IS NULL
            AND created > NOW() - INTERVAL '5 minutes'
        `;
      } else {
        checkQuery = `
          SELECT * FROM users_boxes
          WHERE batch_id = $1
            AND user_id = $2
            AND accepted IS NULL
            AND deleted IS NULL
            AND created > NOW() - INTERVAL '5 minutes'
        `;
      }

      const checkResult = await client.query(checkQuery, [batchId, userId]);

      if (checkResult.rows.length === 0) {
        throw new Error('Propositions non trouvées, expirées ou déjà traitées');
      }

      // Mettre à jour toutes les propositions du batch avec accepted = false
      const updateQuery = `
        UPDATE users_boxes
        SET accepted = false
        WHERE batch_id = $1
        RETURNING *
      `;
      const result = await client.query(updateQuery, [batchId]);

      await client.query('COMMIT');
      return result.rows;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Récupérer les propositions envoyées par un professionnel (actives uniquement)
   */
  async getProProposals(proId) {
    const query = `
      SELECT 
        ub.id,
        ub.number,
        ub.type,
        ub.accepted,
        ub.borrowed,
        ub.created,
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.email as user_email,
        EXTRACT(EPOCH FROM (NOW() - ub.created)) as elapsed_seconds
      FROM users_boxes ub
      JOIN users u ON ub.user_id = u.id
      WHERE ub.borrowed_pro_id = $1 
        AND ub.deleted IS NULL
        AND ub.created > NOW() - INTERVAL '5 minutes'
      ORDER BY ub.created DESC
    `;
    const result = await pool.query(query, [proId]);
    return result.rows;
  }

  /**
   * Expirer les propositions non traitées après 5 minutes
   */
  async expireOldProposals() {
    const query = `
      UPDATE users_boxes
      SET accepted = false
      WHERE accepted IS NULL
        AND borrowed IS NULL
        AND deleted IS NULL
        AND created < NOW() - INTERVAL '5 minutes'
      RETURNING id
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Supprimer les propositions expirées (accepted = NULL et plus de 10 minutes)
   */
  async deleteExpiredProposals(userId = null) {
    let query = `
      DELETE FROM users_boxes
      WHERE accepted IS NULL
        AND borrowed IS NULL
        AND deleted IS NULL
        AND created < NOW() - INTERVAL '10 minutes'
    `;
    
    const params = [];
    
    // Si un userId est fourni, on ne supprime que ses propositions
    if (userId) {
      query += ` AND user_id = $1`;
      params.push(userId);
    }
    
    query += ` RETURNING id`;
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Récupérer les boîtes empruntées actives par un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Array>} - Liste des boîtes empruntées
   */
  async getUserActiveBorrows(userId) {
    const query = `
      SELECT 
        ub.id,
        ub.number,
        ub.type,
        ub.borrowed,
        p.id as pro_id,
        p.name as pro_name,
        p.email as pro_email
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
   * Enregistrer un débit dans balance_history ET mettre à jour balance
   * @param {number} userId - ID de l'utilisateur
   * @param {number} amount - Montant à débiter
   * @param {string} title - Description de la transaction
   * @param {number} proposalId - ID de la proposition (optionnel)
   */
  async recordDebit(userId, amount, title, proposalId = null) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      console.log(`💸 Enregistrement du débit de ${amount}€ pour l'utilisateur ${userId}`);

      // 1. Vérifier si l'utilisateur a assez de solde
      const balanceResult = await client.query(
        `SELECT amount FROM balance WHERE user_id = $1`,
        [userId]
      );

      const currentBalance = balanceResult.rows.length > 0 
        ? parseFloat(balanceResult.rows[0].amount) 
        : 0;

      if (currentBalance < amount) {
        throw new Error(`Solde insuffisant. Solde actuel: ${currentBalance}€, Montant requis: ${amount}€`);
      }

      // 2. Insérer dans balance_history
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
          null,
          amount,
          title
        ]
      );

      console.log('✅ Historique enregistré:', historyResult.rows[0].id);

      // 3. Mettre à jour la balance
      const newAmount = currentBalance - amount;
      
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
        // Créer une nouvelle balance (cas rare, normalement déjà créée)
        await client.query(
          `INSERT INTO balance (user_id, amount, last_update, created)
           VALUES ($1, $2, NOW(), NOW())`,
          [userId, newAmount]
        );
        console.log(`✅ Balance créée: ${newAmount}€`);
      }

      await client.query('COMMIT');
      console.log('✅ Débit enregistré avec succès');

      return historyResult.rows[0];

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Erreur lors de l\'enregistrement du débit:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Calculer le coût total d'un emprunt selon les types de boîtes
   * @param {Array} items - Tableau des items [{type, number}]
   * @returns {number} - Coût total
   */
  calculateBorrowCost(items) {
    const priceMap = {
      1: 10,  // Verre Salade - 10€
      2: 4,   // Plastique Salade - 4€
      3: 2,   // Frites - 2€
      4: 20,  // Pizza - 20€
      5: 2,   // Gobelet - 2€
      6: 6    // Burger - 6€
    };

    let totalCost = 0;

    items.forEach(item => {
      const pricePerUnit = priceMap[item.type] || 0;
      totalCost += pricePerUnit * item.number;
    });

    return totalCost;
  }

  /**
   * Récupérer l'historique des emprunts et retours d'un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @param {number} limit - Nombre maximum de résultats
   * @returns {Promise<Array>} - Liste des transactions
   */
  async getUserBorrowHistory(userId, limit = 50) {
    const query = `
      SELECT 
        ub.id,
        ub.type,
        ub.number,
        ub.borrowed,
        ub.give_back,
        p.name as pro_name
      FROM users_boxes ub
      LEFT JOIN professionnal p ON ub.borrowed_pro_id = p.id
      WHERE ub.user_id = $1 
        AND ub.accepted = true
        AND ub.borrowed IS NOT NULL
        AND ub.deleted IS NULL
      ORDER BY 
        CASE 
          WHEN ub.give_back IS NOT NULL THEN ub.give_back
          ELSE ub.borrowed
        END DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }

  /**
   * Calculer le montant d'un emprunt ou retour
   * @param {number} type - Type de boîte (1-6)
   * @param {number} number - Nombre de boîtes
   * @param {boolean} isReturn - true si c'est un retour
   * @returns {number} - Montant (positif pour retour, négatif pour emprunt)
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
    
    return isReturn ? amount : -amount;
  }

  /**
   * Récupérer l'inventaire des boîtes d'un professionnel
   * @param {number} proId - ID du professionnel
   * @returns {Promise<Array>} - Liste des boîtes par type
   */
  async getProBoxesInventory(proId) {
    const query = `
      SELECT 
        type,
        clean,
        dirty
      FROM pro_boxes
      WHERE pro_id = $1 AND deleted IS NULL
      ORDER BY type ASC
    `;
    
    const result = await pool.query(query, [proId]);
    return result.rows;
  }

  /**
   * Calculer les totaux de boîtes propres et sales
   * @param {number} proId - ID du professionnel
   * @returns {Promise<Object>} - Totaux
   */
  async getProBoxesTotals(proId) {
    const query = `
      SELECT 
        COALESCE(SUM(clean), 0) as total_clean,
        COALESCE(SUM(dirty), 0) as total_dirty
      FROM pro_boxes
      WHERE pro_id = $1 AND deleted IS NULL
    `;
    
    const result = await pool.query(query, [proId]);
    return result.rows[0] || { total_clean: 0, total_dirty: 0 };
  }

   /**
   * Enregistrer l'emprunt dans l'historique mensuel
   * @param {number} proId - ID du professionnel
   * @param {number} numberOfBoxes - Nombre de boîtes empruntées
   */
  async recordMonthlyBorrowHistory(proId, numberOfBoxes) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Obtenir le premier jour du mois en cours
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);
      const monthKey = currentMonth.toISOString().split('T')[0]; // Format: YYYY-MM-01

      console.log(`📊 Enregistrement dans l'historique: ${numberOfBoxes} boîtes pour le mois ${monthKey}`);

      // Vérifier si un enregistrement existe déjà pour ce mois
      const checkQuery = `
        SELECT id, number 
        FROM boxes_history 
        WHERE pro_id = $1 AND month = $2 AND deleted IS NULL
      `;
      const checkResult = await client.query(checkQuery, [proId, monthKey]);

      if (checkResult.rows.length > 0) {
        // Mettre à jour l'enregistrement existant (additionner)
        const currentNumber = parseInt(checkResult.rows[0].number) || 0;
        const newNumber = currentNumber + numberOfBoxes;

        const updateQuery = `
          UPDATE boxes_history
          SET number = $1, last_update = NOW()
          WHERE id = $2
          RETURNING *
        `;
        const result = await client.query(updateQuery, [newNumber, checkResult.rows[0].id]);
        
        console.log(`✅ Historique mis à jour: ${currentNumber} + ${numberOfBoxes} = ${newNumber}`);
        
        await client.query('COMMIT');
        return result.rows[0];
      } else {
        // Créer un nouvel enregistrement pour ce mois
        const insertQuery = `
          INSERT INTO boxes_history (pro_id, number, month, created, last_update)
          VALUES ($1, $2, $3, NOW(), NOW())
          RETURNING *
        `;
        const result = await client.query(insertQuery, [proId, numberOfBoxes, monthKey]);
        
        console.log(`✅ Nouvel historique créé: ${numberOfBoxes} boîtes`);
        
        await client.query('COMMIT');
        return result.rows[0];
      }
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Erreur lors de l\'enregistrement dans boxes_history:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Accepter une proposition d'emprunt (USER)
   * Modifié pour enregistrer dans l'historique
   */
  async acceptProposal(proposalId, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Vérifier que la proposition existe et appartient à l'utilisateur
      const checkQuery = `
        SELECT * FROM users_boxes
        WHERE id = $1 
          AND user_id = $2 
          AND accepted IS NULL 
          AND deleted IS NULL
          AND created > NOW() - INTERVAL '5 minutes'
      `;
      const checkResult = await client.query(checkQuery, [proposalId, userId]);

      if (checkResult.rows.length === 0) {
        throw new Error('Proposition non trouvée, expirée ou déjà traitée');
      }

      const proposal = checkResult.rows[0];

      // Mettre à jour la proposition avec accepted = true et la date d'emprunt
      const updateQuery = `
        UPDATE users_boxes
        SET accepted = true, borrowed = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      const updateResult = await client.query(updateQuery, [proposalId]);

      // Mettre à jour l'inventaire du professionnel (retirer des boîtes propres)
      const updateProBoxesQuery = `
        UPDATE pro_boxes
        SET clean = clean - $1
        WHERE pro_id = $2 AND type = $3 AND clean >= $1
        RETURNING *
      `;
      const proBoxesResult = await client.query(updateProBoxesQuery, [
        proposal.number,
        proposal.borrowed_pro_id,
        proposal.type
      ]);

      if (proBoxesResult.rows.length === 0) {
        throw new Error('Stock insuffisant chez le professionnel');
      }

      // 🆕 Enregistrer dans l'historique mensuel
      // Utiliser une sous-requête pour éviter les problèmes de transaction
      const historyQuery = `
        INSERT INTO boxes_history (pro_id, number, month, created, last_update)
        VALUES ($1, $2, DATE_TRUNC('month', CURRENT_DATE), NOW(), NOW())
        ON CONFLICT (pro_id, month)
        DO UPDATE SET 
          number = boxes_history.number + EXCLUDED.number,
          last_update = NOW()
        RETURNING *
      `;
      await client.query(historyQuery, [proposal.borrowed_pro_id, proposal.number]);

      console.log(`📊 Historique mensuel mis à jour: +${proposal.number} boîtes`);

      await client.query('COMMIT');
      return updateResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Récupérer l'historique mensuel d'un professionnel
   * @param {number} proId - ID du professionnel
   * @param {number} limit - Nombre de mois à récupérer (par défaut 12)
   */
  async getMonthlyHistory(proId, limit = 12) {
    const query = `
      SELECT 
        id,
        pro_id,
        number,
        month,
        created,
        last_update
      FROM boxes_history
      WHERE pro_id = $1 AND deleted IS NULL
      ORDER BY month DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [proId, limit]);
    return result.rows;
  }
}

module.exports = new BorrowRepository();