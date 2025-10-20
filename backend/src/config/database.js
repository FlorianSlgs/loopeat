const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Tester la connexion
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connexion à PostgreSQL réussie!');
    console.log(`📦 Base de données: ${process.env.DB_NAME}`);
    console.log(`🏠 Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    client.release();
  } catch (err) {
    console.error('❌ Erreur de connexion à PostgreSQL:', err.message);
    process.exit(1);
  }
};

module.exports = { pool, testConnection };