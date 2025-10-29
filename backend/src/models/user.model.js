const { pool } = require('../config/database');

class User {
  // Trouver un utilisateur par email
  static async findByEmail(email) {
    const query = `
      SELECT id, email, first_name, last_name, password, verified, code
      FROM users 
      WHERE email = $1 AND deleted = FALSE
    `;
    const result = await pool.query(query, [email.toLowerCase()]);
    return result.rows[0] || null;
  }

  // Trouver un utilisateur par code
  static async findByCode(code) {
    const query = `
      SELECT id, email, first_name, last_name, password, verified, code
      FROM users 
      WHERE code = $1 AND deleted = FALSE
    `;
    const result = await pool.query(query, [code]);
    return result.rows[0] || null;
  }

  // Créer un nouvel utilisateur (non vérifié par défaut)
  static async create(email, code) {
    const query = `
      INSERT INTO users (email, code, verified, first_name, last_name, password)
      VALUES ($1, $2, FALSE, '', '', '')
      RETURNING id, email, verified, code
    `;
    const result = await pool.query(query, [email.toLowerCase(), code]);
    return result.rows[0];
  }

  // Marquer l'email comme vérifié
  static async markAsVerified(email) {
    const query = `
      UPDATE users 
      SET verified = TRUE, last_update = NOW()
      WHERE email = $1 AND deleted = FALSE
      RETURNING id, email, verified, code
    `;
    const result = await pool.query(query, [email.toLowerCase()]);
    return result.rows[0] || null;
  }

  // Sauvegarder les informations utilisateur (prénom et nom)
  static async saveUserInfo(email, firstName, lastName) {
    const query = `
      UPDATE users 
      SET first_name = $1, last_name = $2, last_update = NOW()
      WHERE email = $3 AND deleted = FALSE
      RETURNING id, email, first_name, last_name, verified, code
    `;
    const result = await pool.query(query, [firstName, lastName, email.toLowerCase()]);
    return result.rows[0] || null;
  }

  // Compléter l'inscription avec mot de passe ET marquer comme vérifié
  static async completeRegistrationWithVerification(email, hashedPassword) {
    const query = `
      UPDATE users 
      SET password = $1, verified = TRUE, last_update = NOW()
      WHERE email = $2 AND deleted = FALSE
      RETURNING id, email, first_name, last_name, verified, code
    `;
    const result = await pool.query(query, [hashedPassword, email.toLowerCase()]);
    return result.rows[0] || null;
  }
}

module.exports = User;