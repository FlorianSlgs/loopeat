// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // À installer: npm install cookie-parser

console.log('📦 Chargement de app.js...');

const app = express();

// CORS avec credentials
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true // Important pour les cookies
}));

// Parser JSON et cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Important pour lire les cookies

// Log de toutes les requêtes
app.use((req, res, next) => {
  console.log(`📍 ${req.method} ${req.path}`);
  console.log('📦 Body:', req.body);
  console.log('🍪 Cookies:', req.cookies);
  next();
});

// Routes
console.log('📍 Chargement des routes...');
try {
  const authRoutes = require('./modules/auth/auth.routes');
  app.use('/api/auth', authRoutes);
  console.log('✅ Routes auth chargées');
} catch (err) {
  console.error('❌ Erreur lors du chargement des routes:', err);
  throw err;
}

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API Loopeat!', timestamp: new Date() });
});

// Gestion des erreurs 404
app.use((req, res) => {
  console.log('❌ Route non trouvée:', req.path);
  res.status(404).json({ message: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('❌ Erreur globale:', err);
  res.status(500).json({ 
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

console.log('✅ App Express configurée');

module.exports = app;