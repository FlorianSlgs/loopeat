// src/config/stripe.js
require('dotenv').config();

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY manquante dans .env');
  throw new Error('Configuration Stripe manquante');
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

console.log('✅ Stripe configuré');

module.exports = stripe;