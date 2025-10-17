require('dotenv').config();
const express = require('express');
const { pool, testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API Loopeat!' });
});

// Démarrer le serveur
const startServer = async () => {
  try {
    // Tester la connexion à la base de données
    await testConnection();
    
    // Démarrer le serveur Express
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📡 API disponible sur http://localhost:3001`);
    });
  } catch (err) {
    console.error('Impossible de démarrer le serveur:', err);
    process.exit(1);
  }
};

startServer();