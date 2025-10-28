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

      const insertedRows = [];

      for (const item of borrowItems) {
        const query = `
          INSERT INTO users_boxes (
            user_id,
            borrowed_pro_id,
            number,
            type,
            accepted,
            borrowed
          ) VALUES ($1, $2, $3, $4, NULL, NULL)
          RETURNING *
        `;
        
        const result = await client.query(query, [
          userId,
          proId,
          item.number,
          item.type
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
}

module.exports = new BorrowRepository();