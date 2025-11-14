// ***********************************************
// Déclaration des types TypeScript pour les commandes personnalisées
// ***********************************************
declare namespace Cypress {
  interface Chainable<Subject = any> {
    /**
     * Commande personnalisée pour se connecter à l'application
     * @param email - L'adresse email de l'utilisateur
     * @param password - Le mot de passe de l'utilisateur
     * @param isPro - Si true, utilise le flow de connexion professionnel
     * @example cy.login('test@example.com', 'password123')
     */
    login(email: string, password: string, isPro?: boolean): Chainable<void>;
  }
}

// ***********************************************
// Commande de connexion réutilisable
// ***********************************************
Cypress.Commands.add('login', (email: string, password: string, isPro: boolean = false) => {
  const baseUrl = isPro ? '/connexion-pro' : '/connexion';
  const passwordUrl = isPro ? '/connexion-pro/mot-de-passe' : '/connexion/mot-de-passe';

  // Étape 1: Entrer l'email
  cy.visit(baseUrl);
  cy.get('input[type="text"]').type(email);
  cy.contains('button', 'Continuer').click();

  // Attendre la navigation vers la page de mot de passe
  cy.url().should('include', passwordUrl);

  // Étape 2: Entrer le mot de passe
  cy.get('input[type="password"]').type(password);
  cy.contains('button', 'Se connecter').click();

  // Attendre que la connexion soit complète
  cy.url().should('match', /\/(utilisateurs|pro)/);
});

// ***********************************************
// Autres commandes personnalisées peuvent être ajoutées ici
// ***********************************************
