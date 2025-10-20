// src/server.js
const app = require('./app');
const { testConnection } = require('./config/database');

const PORT = process.env.PORT || 3000;

// Démarrer le serveur
const startServer = async () => {
  try {
    console.log('🚀 Démarrage du serveur...');
    
    // Tester la connexion à la base de données
    await testConnection();
    
    // Démarrer le serveur Express
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📡 API disponible sur http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Impossible de démarrer le serveur:', err);
    console.error('Stack trace:', err.stack);
    process.exit(1);
  }
};

startServer();