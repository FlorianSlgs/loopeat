// modules/borrow/borrow.service.js
const borrowRepository = require('./borrow.repository');
const websocketService = require('../../utils/websocket.service');

class BorrowService {
  /**
   * Créer une proposition d'emprunt de boîtes
   */
  async createBorrowProposal(proId, userCode, borrowItems) {
    try {
      // Valider les données d'entrée
      if (!userCode || userCode.length !== 4) {
        throw new Error('Code utilisateur invalide (4 chiffres requis)');
      }

      if (!Array.isArray(borrowItems) || borrowItems.length === 0) {
        throw new Error('Au moins un type de boîte doit être spécifié');
      }

      // Valider chaque item
      for (const item of borrowItems) {
        if (!item.type || !item.number || item.number <= 0) {
          throw new Error('Type et nombre valides requis pour chaque boîte');
        }
      }

      // Vérifier que le professionnel existe
      const pro = await borrowRepository.findProById(proId);
      if (!pro) {
        throw new Error('Professionnel non trouvé ou non vérifié');
      }

      // Trouver l'utilisateur par son code
      const user = await borrowRepository.findUserByCode(userCode);
      if (!user) {
        throw new Error('Utilisateur non trouvé avec ce code');
      }

      // Nettoyer les anciennes propositions expirées de cet utilisateur
      await borrowRepository.deleteExpiredProposals(user.id);

      // Créer les propositions d'emprunt
      const proposals = await borrowRepository.createBorrowProposal(
        user.id,
        proId,
        borrowItems
      );

      // Démarrer le timer WebSocket pour chaque proposition
      proposals.forEach(proposal => {
        websocketService.startProposalTimer(proposal.id, user.id, proId);
      });

      return {
        success: true,
        message: 'Proposition(s) d\'emprunt créée(s) avec succès',
        proposals: proposals.map(p => ({
          id: p.id,
          type: p.type,
          number: p.number,
          created: p.created,
          expiresIn: 300000 // 5 minutes en ms
        })),
        user: {
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email
        }
      };
    } catch (error) {
      console.error('Erreur dans createBorrowProposal:', error);
      throw error;
    }
  }

  /**
   * Récupérer une proposition par son ID
   */
  async getProposalById(proposalId, userId, isPro) {
    try {
      const proposal = await borrowRepository.getProposalById(proposalId);

      if (!proposal) {
        throw new Error('Proposition non trouvée');
      }

      // Vérifier que l'utilisateur a le droit d'accéder à cette proposition
      if (isPro && proposal.borrowed_pro_id !== userId) {
        throw new Error('Accès non autorisé à cette proposition');
      }

      if (!isPro && proposal.user_id !== userId) {
        throw new Error('Accès non autorisé à cette proposition');
      }

      // Calculer le temps restant
      const timeRemaining = websocketService.getProposalTimeRemaining(proposalId);

      return {
        success: true,
        proposal: {
          id: proposal.id,
          type: proposal.type,
          number: proposal.number,
          accepted: proposal.accepted,
          borrowed: proposal.borrowed,
          created: proposal.created,
          timeRemaining,
          user: {
            firstName: proposal.first_name,
            lastName: proposal.last_name,
            email: proposal.user_email
          },
          pro: {
            name: proposal.pro_name,
            email: proposal.pro_email
          }
        }
      };
    } catch (error) {
      console.error('Erreur dans getProposalById:', error);
      throw error;
    }
  }

  /**
   * Récupérer les propositions en attente pour un utilisateur
   */
  async getUserPendingProposals(userId) {
    try {
      // Nettoyer les propositions expirées avant de récupérer les actives
      await borrowRepository.deleteExpiredProposals(userId);
      
      const proposals = await borrowRepository.getPendingProposals(userId);

      // Grouper les propositions par professionnel
      const groupedProposals = proposals.reduce((acc, proposal) => {
        const existingPro = acc.find(p => p.proId === proposal.pro_id);
        
        // Calculer le temps restant (5 minutes - temps écoulé)
        const timeRemaining = Math.max(0, 300 - proposal.elapsed_seconds) * 1000;

        const item = {
          id: proposal.id,
          type: proposal.type,
          number: proposal.number,
          timeRemaining
        };
        
        if (existingPro) {
          existingPro.items.push(item);
        } else {
          acc.push({
            proId: proposal.pro_id,
            proName: proposal.pro_name,
            proEmail: proposal.pro_email,
            created: proposal.created,
            items: [item]
          });
        }
        
        return acc;
      }, []);

      return {
        success: true,
        proposals: groupedProposals
      };
    } catch (error) {
      console.error('Erreur dans getUserPendingProposals:', error);
      throw error;
    }
  }

  /**
   * Accepter une proposition d'emprunt (USER)
   */
  async acceptProposal(proposalId, userId) {
    try {
      // Récupérer les infos avant acceptation
      const proposalInfo = await borrowRepository.getProposalById(proposalId);
      
      if (!proposalInfo) {
        throw new Error('Proposition non trouvée');
      }

      // Accepter la proposition
      const acceptedProposal = await borrowRepository.acceptProposal(proposalId, userId);

      // Notifier via WebSocket
      websocketService.notifyProposalAccepted(
        proposalId,
        proposalInfo.user_id,
        proposalInfo.borrowed_pro_id
      );

      return {
        success: true,
        message: 'Proposition acceptée avec succès',
        proposal: {
          id: acceptedProposal.id,
          type: acceptedProposal.type,
          number: acceptedProposal.number,
          accepted: acceptedProposal.accepted,
          borrowed: acceptedProposal.borrowed
        }
      };
    } catch (error) {
      console.error('Erreur dans acceptProposal:', error);
      throw error;
    }
  }

  /**
   * Refuser une proposition d'emprunt (USER ou PRO)
   */
  async rejectProposal(proposalId, userId, isPro = false) {
    try {
      // Récupérer les infos avant rejet
      const proposalInfo = await borrowRepository.getProposalById(proposalId);
      
      if (!proposalInfo) {
        throw new Error('Proposition non trouvée');
      }

      // Refuser la proposition
      const rejectedProposal = await borrowRepository.rejectProposal(proposalId, userId, isPro);

      // Notifier via WebSocket
      websocketService.notifyProposalRejected(
        proposalId,
        proposalInfo.user_id,
        proposalInfo.borrowed_pro_id,
        isPro ? 'pro' : 'user'
      );

      return {
        success: true,
        message: 'Proposition refusée avec succès',
        proposal: {
          id: rejectedProposal.id,
          accepted: rejectedProposal.accepted
        }
      };
    } catch (error) {
      console.error('Erreur dans rejectProposal:', error);
      throw error;
    }
  }

  /**
   * Récupérer les propositions envoyées par un professionnel (actives uniquement)
   */
  async getProProposals(proId) {
    try {
      const proposals = await borrowRepository.getProProposals(proId);

      // Grouper les propositions par utilisateur
      const groupedProposals = proposals.reduce((acc, proposal) => {
        const existingUser = acc.find(p => p.userId === proposal.user_id);
        
        // Calculer le temps restant
        const timeRemaining = Math.max(0, 300 - proposal.elapsed_seconds) * 1000;

        // Déterminer le statut
        let status = 'pending';
        if (proposal.accepted === true) status = 'accepted';
        if (proposal.accepted === false) status = 'rejected';

        const item = {
          id: proposal.id,
          type: proposal.type,
          number: proposal.number,
          accepted: proposal.accepted,
          borrowed: proposal.borrowed,
          created: proposal.created,
          status,
          timeRemaining
        };
        
        if (existingUser) {
          existingUser.items.push(item);
        } else {
          acc.push({
            userId: proposal.user_id,
            firstName: proposal.first_name,
            lastName: proposal.last_name,
            userEmail: proposal.user_email,
            items: [item]
          });
        }
        
        return acc;
      }, []);

      return {
        success: true,
        proposals: groupedProposals
      };
    } catch (error) {
      console.error('Erreur dans getProProposals:', error);
      throw error;
    }
  }
}

module.exports = new BorrowService();