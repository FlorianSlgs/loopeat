const { pool } = require('../config/database');

class Pro {
  // Trouver un professionnel par email
  static async findByEmail(email) {
    const query = `
      SELECT id, email, name, password, verified, admin
      FROM professionnal 
      WHERE email = $1 AND deleted = FALSE
    `;
    const result = await pool.query(query, [email.toLowerCase()]);
    return result.rows[0] || null;
  }

  // Créer un nouveau professionnel (non vérifié par défaut)
  static async create(email) {
    const query = `
      INSERT INTO professionnal (email, verified, name, password, admin)
      VALUES ($1, FALSE, '', '', FALSE)
      RETURNING id, email, verified, admin
    `;
    const result = await pool.query(query, [email.toLowerCase()]);
    return result.rows[0];
  }

  // Marquer l'email comme vérifié
  static async markAsVerified(email) {
    const query = `
      UPDATE professionnal 
      SET verified = TRUE, last_update = NOW()
      WHERE email = $1 AND deleted = FALSE
      RETURNING id, email, verified, admin
    `;
    const result = await pool.query(query, [email.toLowerCase()]);
    return result.rows[0] || null;
  }

  // Sauvegarder les informations du professionnel (nom)
  static async saveProInfo(email, name) {
    const query = `
      UPDATE professionnal 
      SET name = $1, last_update = NOW()
      WHERE email = $2 AND deleted = FALSE
      RETURNING id, email, name, verified, admin
    `;
    const result = await pool.query(query, [name, email.toLowerCase()]);
    return result.rows[0] || null;
  }

  // Compléter l'inscription avec mot de passe ET marquer comme vérifié
  static async completeRegistrationWithVerification(email, hashedPassword) {
    const query = `
      UPDATE professionnal 
      SET password = $1, verified = TRUE, last_update = NOW()
      WHERE email = $2 AND deleted = FALSE
      RETURNING id, email, name, verified, admin
    `;
    const result = await pool.query(query, [hashedPassword, email.toLowerCase()]);
    return result.rows[0] || null;
  }

  // Compléter l'inscription (méthode complète)
  static async completeRegistration(email, name, hashedPassword) {
    const query = `
      UPDATE professionnal 
      SET name = $1, password = $2, verified = TRUE, last_update = NOW()
      WHERE email = $3 AND deleted = FALSE
      RETURNING id, email, name, verified, admin
    `;
    const result = await pool.query(query, [
      name,
      hashedPassword,
      email.toLowerCase()
    ]);
    return result.rows[0] || null;
  }
}

module.exports = Pro;