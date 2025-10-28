// src/server.js
const http = require('http');
const app = require('./app');
const { testConnection } = require('./config/database');
const websocketService = require('./utils/websocket.service');

const PORT = process.env.PORT || 3000;

// Démarrer le serveur
const startServer = async () => {
  try {
    console.log('🚀 Démarrage du serveur...');
    
    // Tester la connexion à la base de données
    await testConnection();
    
    // Créer le serveur HTTP
    const server = http.createServer(app);
    
    // Initialiser WebSocket
    websocketService.initialize(server);
    
    // Démarrer le serveur
    server.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📡 API disponible sur http://localhost:${PORT}`);
      console.log(`🔌 WebSocket disponible sur ws://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Impossible de démarrer le serveur:', err);
    console.error('Stack trace:', err.stack);
    process.exit(1);
  }
};

startServer();