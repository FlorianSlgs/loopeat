// utils/websocket.service.js
const socketIo = require('socket.io');
const tokenService = require('./token.service');
const authRepository = require('../modules/auth/auth.repository');

class WebSocketService {
  constructor() {
    this.io = null;
    this.activeProposals = new Map(); // proposalId -> { userId, proId, timerId }
  }

  /**
   * Initialiser Socket.IO avec le serveur Express
   */
  initialize(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:4200',
        credentials: true,
        methods: ['GET', 'POST']
      }
    });

    // Middleware d'authentification Socket.IO
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          console.error('❌ [WS-AUTH] Token manquant');
          return next(new Error('Token manquant'));
        }

        const decoded = tokenService.verifyToken(token);
        
        // ✅ CORRIGÉ : Accepter les tokens de type 'websocket' ET 'auth'
        if (!decoded || (decoded.type !== 'websocket' && decoded.type !== 'auth')) {
          console.error('❌ [WS-AUTH] Token invalide, type:', decoded?.type);
          return next(new Error('Token invalide'));
        }

        console.log('✅ [WS-AUTH] Token valide, type:', decoded.type);

        const isPro = decoded.isPro || false;
        
        // ✅ AJOUTÉ : Supporter aussi userId pour les tokens WebSocket
        let user;
        if (decoded.email) {
          user = await authRepository.findUserByEmail(decoded.email, isPro);
        } else if (decoded.userId) {
          // Si le token contient userId, on peut l'utiliser directement
          user = { id: decoded.userId };
        }

        if (!user) {
          console.error('❌ [WS-AUTH] Utilisateur non trouvé');
          return next(new Error('Utilisateur non trouvé'));
        }

        // Attacher les infos utilisateur au socket
        socket.userId = user.id;
        socket.userEmail = decoded.email || `user_${user.id}`;
        socket.isPro = isPro;

        console.log(`🔌 [WS-AUTH] Connexion WebSocket: ${socket.userEmail} (${isPro ? 'PRO' : 'USER'})`);
        next();
      } catch (error) {
        console.error('❌ [WS-AUTH] Erreur auth WebSocket:', error.message);
        next(new Error('Authentification échouée'));
      }
    });

    // Gestion des connexions
    this.io.on('connection', (socket) => {
      console.log(`✅ [WS] Client connecté: ${socket.id} - User: ${socket.userEmail}`);

      // Rejoindre une room spécifique à l'utilisateur
      const userRoom = `user:${socket.userId}`;
      socket.join(userRoom);
      console.log(`👤 [WS] ${socket.userEmail} a rejoint la room: ${userRoom}`);

      // Écouter les événements
      this.setupSocketEvents(socket);

      socket.on('disconnect', () => {
        console.log(`❌ [WS] Client déconnecté: ${socket.id} - ${socket.userEmail}`);
      });
    });

    console.log('✅ WebSocket initialisé');
  }

  /**
   * Configurer les événements du socket
   */
  setupSocketEvents(socket) {
    // Rejoindre une room de proposition spécifique
    socket.on('join:proposal', (proposalId) => {
      socket.join(`proposal:${proposalId}`);
      console.log(`📦 [WS] ${socket.userEmail} a rejoint la proposition: ${proposalId}`);
    });

    // Quitter une room de proposition
    socket.on('leave:proposal', (proposalId) => {
      socket.leave(`proposal:${proposalId}`);
      console.log(`📤 [WS] ${socket.userEmail} a quitté la proposition: ${proposalId}`);
    });
  }

  /**
   * Créer une proposition avec timer de 5 minutes
   */
  startProposalTimer(proposalId, userId, proId) {
    // Si une proposition existe déjà, la nettoyer
    if (this.activeProposals.has(proposalId)) {
      this.cancelProposalTimer(proposalId);
    }

    console.log(`⏱️ [WS] Démarrage du timer pour la proposition: ${proposalId}`);

    // Notifier le user et le pro de la nouvelle proposition
    this.io.to(`user:${userId}`).emit('proposal:created', {
      proposalId,
      expiresIn: 300000 // 5 minutes en ms
    });

    this.io.to(`user:${proId}`).emit('proposal:created', {
      proposalId,
      expiresIn: 300000
    });

    // Créer un timer de 5 minutes
    const timerId = setTimeout(() => {
      console.log(`⏰ [WS] Timer expiré pour la proposition: ${proposalId}`);
      this.expireProposal(proposalId);
    }, 300000); // 5 minutes

    // Stocker les infos de la proposition
    this.activeProposals.set(proposalId, {
      userId,
      proId,
      timerId,
      createdAt: Date.now()
    });
  }

  /**
   * Annuler le timer d'une proposition
   */
  cancelProposalTimer(proposalId) {
    const proposal = this.activeProposals.get(proposalId);
    
    if (proposal) {
      clearTimeout(proposal.timerId);
      this.activeProposals.delete(proposalId);
      console.log(`🚫 [WS] Timer annulé pour la proposition: ${proposalId}`);
    }
  }

  /**
   * Expirer une proposition après 5 minutes
   */
  expireProposal(proposalId) {
    const proposal = this.activeProposals.get(proposalId);
    
    if (proposal) {
      // Notifier les utilisateurs concernés
      this.io.to(`user:${proposal.userId}`).emit('proposal:expired', {
        proposalId
      });

      this.io.to(`user:${proposal.proId}`).emit('proposal:expired', {
        proposalId
      });

      this.activeProposals.delete(proposalId);
    }
  }

  /**
   * Notifier l'acceptation d'une proposition
   */
  notifyProposalAccepted(proposalId, userId, proId) {
    console.log(`✅ [WS] Proposition acceptée: ${proposalId}`);
    
    // Annuler le timer
    this.cancelProposalTimer(proposalId);

    // Notifier les deux parties
    this.io.to(`user:${userId}`).emit('proposal:accepted', {
      proposalId
    });

    this.io.to(`user:${proId}`).emit('proposal:accepted', {
      proposalId
    });

    // Notifier aussi la room spécifique si elle existe
    this.io.to(`proposal:${proposalId}`).emit('proposal:accepted', {
      proposalId
    });
  }

  /**
   * Notifier le refus d'une proposition
   */
  notifyProposalRejected(proposalId, userId, proId, rejectedBy) {
    console.log(`❌ [WS] Proposition refusée par ${rejectedBy}: ${proposalId}`);
    
    // Annuler le timer
    this.cancelProposalTimer(proposalId);

    // Notifier les deux parties
    this.io.to(`user:${userId}`).emit('proposal:rejected', {
      proposalId,
      rejectedBy
    });

    this.io.to(`user:${proId}`).emit('proposal:rejected', {
      proposalId,
      rejectedBy
    });

    // Notifier aussi la room spécifique si elle existe
    this.io.to(`proposal:${proposalId}`).emit('proposal:rejected', {
      proposalId,
      rejectedBy
    });
  }

  /**
   * Obtenir le temps restant pour une proposition
   */
  getProposalTimeRemaining(proposalId) {
    const proposal = this.activeProposals.get(proposalId);
    
    if (!proposal) {
      return 0;
    }

    const elapsed = Date.now() - proposal.createdAt;
    const remaining = 300000 - elapsed; // 5 minutes - temps écoulé

    return Math.max(0, remaining);
  }
}

module.exports = new WebSocketService();