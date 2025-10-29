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
   * Récupérer les boîtes empruntées actives par un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Array>} - Liste des boîtes empruntées
   */
  async getUserActiveBorrows(userId) {
    const query = `
      SELECT 
        ub.id,
        ub.number,
        ub.type,
        ub.borrowed,
        p.id as pro_id,
        p.name as pro_name,
        p.email as pro_email
      FROM users_boxes ub
      JOIN professionnal p ON ub.borrowed_pro_id = p.id
      WHERE ub.user_id = $1 
        AND ub.accepted = true
        AND ub.borrowed IS NOT NULL
        AND ub.give_back IS NULL
        AND ub.deleted IS NULL
      ORDER BY ub.borrowed DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
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

  /**
   * Récupérer les boîtes empruntées actives par un utilisateur
   */
  async getUserActiveBorrows(userId) {
    try {
      const borrows = await borrowRepository.getUserActiveBorrows(userId);

      // Calculer le nombre total de boîtes
      const totalBoxes = borrows.reduce((sum, borrow) => sum + borrow.number, 0);

      // Grouper par professionnel
      const groupedBorrows = borrows.reduce((acc, borrow) => {
        const existingPro = acc.find(p => p.proId === borrow.pro_id);
        
        const item = {
          id: borrow.id,
          type: borrow.type,
          number: borrow.number,
          borrowedDate: borrow.borrowed
        };
        
        if (existingPro) {
          existingPro.items.push(item);
          existingPro.totalBoxes += borrow.number;
        } else {
          acc.push({
            proId: borrow.pro_id,
            proName: borrow.pro_name,
            proEmail: borrow.pro_email,
            totalBoxes: borrow.number,
            items: [item]
          });
        }
        
        return acc;
      }, []);

      return {
        success: true,
        totalBoxes,
        borrows: groupedBorrows
      };
    } catch (error) {
      console.error('Erreur dans getUserActiveBorrows:', error);
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

      // Calculer le coût de cet emprunt spécifique
      const cost = borrowRepository.calculateBorrowCost([{
        type: proposalInfo.type,
        number: proposalInfo.number
      }]);

      console.log(`💰 Coût de l'emprunt: ${cost}€ (Type ${proposalInfo.type}, Quantité: ${proposalInfo.number})`);

      // Enregistrer le débit AVANT d'accepter la proposition
      const boxTypeLabels = {
        1: 'Boite Salade Verre',
        2: 'Boite Salade Plastique',
        3: 'Boîte Frite',
        4: 'Boîte Pizza',
        5: 'Gobelet',
        6: 'Burger'
      };

      const boxLabel = boxTypeLabels[proposalInfo.type] || `Type ${proposalInfo.type}`;
      const debitTitle = `Emprunt de ${proposalInfo.number} ${proposalInfo.number > 1 ? 's' : ''} ${boxLabel}`;

      await borrowRepository.recordDebit(
        userId,
        cost,
        debitTitle,
        proposalId
      );

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
          borrowed: acceptedProposal.borrowed,
          cost: cost
        }
      };
    } catch (error) {
      console.error('❌ Erreur dans acceptProposal:', error);
      throw error;
    }
  }

   /**
   * Récupérer l'historique des emprunts et retours d'un utilisateur
   */
  async getUserBorrowHistory(userId, limit = 50) {
    try {
      const history = await borrowRepository.getUserBorrowHistory(userId, limit);

      const boxTypeLabels = {
        1: 'Boite Salade Verre',
        2: 'Boite Salade Plastique',
        3: 'Boîte Frite',
        4: 'Boîte Pizza',
        5: 'Gobelet',
        6: 'Burger'
      };

      // Transformer les données pour le frontend
      const transactions = [];

      history.forEach(record => {
        const boxLabel = boxTypeLabels[record.type] || `Type ${record.type}`;
        
        // Transaction d'emprunt
        transactions.push({
          id: `borrow-${record.id}`,
          type: 'borrow',
          title: `${record.number} boîte${record.number > 1 ? 's' : ''} ${boxLabel} empruntée${record.number > 1 ? 's' : ''}`,
          amount: borrowRepository.calculateAmount(record.type, record.number, false),
          date: record.borrowed,
          proName: record.pro_name,
          boxType: record.type,
          boxNumber: record.number
        });

        // Transaction de retour (si elle existe)
        if (record.give_back) {
          transactions.push({
            id: `return-${record.id}`,
            type: 'return',
            title: `${record.number} boîte${record.number > 1 ? 's' : ''} ${boxLabel} rendue${record.number > 1 ? 's' : ''}`,
            amount: borrowRepository.calculateAmount(record.type, record.number, true),
            date: record.give_back,
            proName: record.pro_name,
            boxType: record.type,
            boxNumber: record.number
          });
        }
      });

      // Trier par date décroissante
      transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return {
        success: true,
        transactions: transactions.slice(0, limit)
      };
    } catch (error) {
      console.error('❌ Erreur dans getUserBorrowHistory:', error);
      throw error;
    }
  }

  /**
   * Récupérer l'inventaire complet d'un professionnel
   */
  async getProInventory(proId) {
    try {
      console.log('📦 Récupération de l\'inventaire pour pro:', proId);

      const inventory = await borrowRepository.getProBoxesInventory(proId);
      const totals = await borrowRepository.getProBoxesTotals(proId);

      const boxTypeLabels = {
        1: 'Boite Salade Verre',
        2: 'Boite Salade Plastique',
        3: 'Boîte Frite',
        4: 'Boîte Pizza',
        5: 'Gobelet',
        6: 'Burger'
      };

      // Formater les données
      const formattedInventory = inventory.map(box => ({
        type: box.type,
        label: boxTypeLabels[box.type] || `Type ${box.type}`,
        clean: parseInt(box.clean) || 0,
        dirty: parseInt(box.dirty) || 0,
        total: (parseInt(box.clean) || 0) + (parseInt(box.dirty) || 0)
      }));

      return {
        success: true,
        inventory: formattedInventory,
        totals: {
          totalClean: parseInt(totals.total_clean) || 0,
          totalDirty: parseInt(totals.total_dirty) || 0,
          totalBoxes: (parseInt(totals.total_clean) || 0) + (parseInt(totals.total_dirty) || 0)
        }
      };
    } catch (error) {
      console.error('❌ Erreur dans getProInventory:', error);
      throw error;
    }
  }

  /**
   * Accepter une proposition d'emprunt (USER)
   * Modifié pour inclure l'historique
   */
  async acceptProposal(proposalId, userId) {
    try {
      // Récupérer les infos avant acceptation
      const proposalInfo = await borrowRepository.getProposalById(proposalId);
      
      if (!proposalInfo) {
        throw new Error('Proposition non trouvée');
      }

      // Calculer le coût de cet emprunt spécifique
      const cost = borrowRepository.calculateBorrowCost([{
        type: proposalInfo.type,
        number: proposalInfo.number
      }]);

      console.log(`💰 Coût de l'emprunt: ${cost}€ (Type ${proposalInfo.type}, Quantité: ${proposalInfo.number})`);

      // Enregistrer le débit AVANT d'accepter la proposition
      const boxTypeLabels = {
        1: 'Pizza',
        2: 'Frites',
        3: 'Gobelet',
        4: 'Plastique Salade',
        5: 'Verre Salade',
        6: 'Burger'
      };

      const boxLabel = boxTypeLabels[proposalInfo.type] || `Type ${proposalInfo.type}`;
      const debitTitle = `Emprunt de ${proposalInfo.number} boîte${proposalInfo.number > 1 ? 's' : ''} ${boxLabel}`;

      await borrowRepository.recordDebit(
        userId,
        cost,
        debitTitle,
        proposalId
      );

      // Accepter la proposition (qui enregistre automatiquement dans boxes_history)
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
          borrowed: acceptedProposal.borrowed,
          cost: cost
        }
      };
    } catch (error) {
      console.error('❌ Erreur dans acceptProposal:', error);
      throw error;
    }
  }

  /**
   * 🆕 Récupérer l'historique mensuel d'un professionnel
   */
  async getMonthlyHistory(proId, limit = 12) {
    try {
      console.log('📊 Récupération de l\'historique mensuel pour pro:', proId);

      const history = await borrowRepository.getMonthlyHistory(proId, limit);

      // Formater les données pour le frontend
      const formattedHistory = history.map(record => ({
        id: record.id,
        month: record.month,
        numberOfBoxes: parseInt(record.number) || 0,
        created: record.created,
        lastUpdate: record.last_update
      }));

      return {
        success: true,
        history: formattedHistory
      };
    } catch (error) {
      console.error('❌ Erreur dans getMonthlyHistory:', error);
      throw error;
    }
  }
}

module.exports = new BorrowService();