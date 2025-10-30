// modules/give_back/give_back.service.js
const giveBackRepository = require('./give_back.repository');

class GiveBackService {
  /**
   * Enregistrer le retour de boîtes par un utilisateur
   */
  async recordGiveBack(proId, userCode, returnItems) {
    try {
      // Valider les données d'entrée
      if (!userCode || userCode.length !== 4) {
        throw new Error('Code utilisateur invalide (4 chiffres requis)');
      }

      if (!Array.isArray(returnItems) || returnItems.length === 0) {
        throw new Error('Au moins un type de boîte doit être spécifié');
      }

      // Valider chaque item
      for (const item of returnItems) {
        if (!item.type || !item.number || item.number <= 0) {
          throw new Error('Type et nombre valides requis pour chaque boîte');
        }
      }

      // Vérifier que le professionnel existe
      const pro = await giveBackRepository.findProById(proId);
      if (!pro) {
        throw new Error('Professionnel non trouvé ou non vérifié');
      }

      // Trouver l'utilisateur par son code
      const user = await giveBackRepository.findUserByCode(userCode);
      if (!user) {
        throw new Error('Utilisateur non trouvé avec ce code');
      }

      // Vérifier que l'utilisateur a bien des boîtes empruntées
      const activeBorrows = await giveBackRepository.getUserActiveBorrows(user.id);
      if (activeBorrows.length === 0) {
        throw new Error('Cet utilisateur n\'a aucune boîte empruntée');
      }

      // Enregistrer le retour
      const result = await giveBackRepository.recordGiveBack(
        user.id,
        proId,
        returnItems
      );

      return {
        success: true,
        message: 'Retour enregistré avec succès',
        user: {
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email
        },
        returnedItems: result.processedItems,
        totalRefund: result.totalRefund
      };

    } catch (error) {
      console.error('Erreur dans recordGiveBack:', error);
      throw error;
    }
  }

  /**
   * Récupérer les boîtes empruntées actives d'un utilisateur (par code)
   */
  async getUserActiveBorrowsByCode(userCode) {
    try {
      if (!userCode || userCode.length !== 4) {
        throw new Error('Code utilisateur invalide (4 chiffres requis)');
      }

      const user = await giveBackRepository.findUserByCode(userCode);
      if (!user) {
        throw new Error('Utilisateur non trouvé avec ce code');
      }

      const borrows = await giveBackRepository.getUserActiveBorrows(user.id);

      const boxTypeLabels = {
        1: 'Boite Salade Verre',
        2: 'Boite Salade Plastique',
        3: 'Boite Frites',
        4: 'Boite Pizza',
        5: 'Gobelet',
        6: 'Boite Burger'
      };

      // Grouper par type
      const groupedBorrows = borrows.reduce((acc, borrow) => {
        const existing = acc.find(b => b.type === borrow.type);
        
        if (existing) {
          existing.totalNumber += borrow.number;
          existing.items.push({
            id: borrow.id,
            number: borrow.number,
            borrowedDate: borrow.borrowed,
            proName: borrow.pro_name
          });
        } else {
          acc.push({
            type: borrow.type,
            label: boxTypeLabels[borrow.type] || `Type ${borrow.type}`,
            totalNumber: borrow.number,
            items: [{
              id: borrow.id,
              number: borrow.number,
              borrowedDate: borrow.borrowed,
              proName: borrow.pro_name
            }]
          });
        }
        
        return acc;
      }, []);

      return {
        success: true,
        user: {
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email
        },
        borrows: groupedBorrows
      };

    } catch (error) {
      console.error('Erreur dans getUserActiveBorrowsByCode:', error);
      throw error;
    }
  }
}

module.exports = new GiveBackService();