const { pool } = require('../config/database');

class Verification {
  // Créer ou mettre à jour un code de vérification
  static async createOrUpdate(email, code) {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    const query = `
      INSERT INTO verification (email, code, expires_at, verified)
      VALUES ($1, $2, $3, FALSE)
      ON CONFLICT (email) 
      DO UPDATE SET 
        code = $2,
        created_at = NOW(),
        expires_at = $3,
        verified = FALSE
      RETURNING id, email, code, expires_at
    `;
    
    const result = await pool.query(query, [email.toLowerCase(), code, expiresAt]);
    return result.rows[0];
  }

  // Vérifier un code
  static async verifyCode(email, code) {
    const query = `
      UPDATE verification 
      SET verified = TRUE
      WHERE email = $1 
        AND code = $2 
        AND expires_at > NOW()
        AND verified = FALSE
      RETURNING id, email, verified
    `;
    
    const result = await pool.query(query, [email.toLowerCase(), code]);
    return result.rows[0] || null;
  }

  // Vérifier si un email est vérifié
  static async isEmailVerified(email) {
    const query = `
      SELECT verified 
      FROM verification 
      WHERE email = $1 
        AND verified = TRUE
        AND expires_at > NOW()
    `;
    
    const result = await pool.query(query, [email.toLowerCase()]);
    return result.rows[0]?.verified || false;
  }

  // Supprimer les codes expirés (nettoyage)
  static async cleanExpired() {
    const query = `
      DELETE FROM verification 
      WHERE expires_at < NOW()
    `;
    
    await pool.query(query);
  }

  // Supprimer un code de vérification après utilisation
  static async deleteByEmail(email) {
    const query = `
      DELETE FROM verification 
      WHERE email = $1
    `;
    
    await pool.query(query, [email.toLowerCase()]);
  }
}

module.exports = Verification;