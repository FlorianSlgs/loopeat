describe('Tests de connexion avec fixtures', () => {

  let testUsers: any;

  before(() => {
    // Charger les données de test depuis le fichier fixtures
    cy.fixture('users').then((users) => {
      testUsers = users;
    });
  });

  it('Devrait se connecter avec un utilisateur valide depuis les fixtures', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.validUser;

      // Utiliser la commande personnalisée login
      cy.login(email, password);

      // Vérifier que nous sommes sur la page utilisateur
      cy.url().should('include', '/utilisateurs');
    });
  });

  it('Devrait se connecter avec un utilisateur pro depuis les fixtures', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.validProUser;

      // Utiliser la commande personnalisée login avec isPro=true
      cy.login(email, password, true);

      // Vérifier que nous sommes sur la page pro
      cy.url().should('include', '/pro');
    });
  });

  it('Devrait échouer avec des identifiants invalides', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.invalidUser;

      cy.visit('/connexion');
      cy.get('input[type="text"]').type(email);
      cy.contains('button', 'Continuer').click();

      cy.url().should('include', '/connexion/mot-de-passe');

      cy.get('input[type="password"]').type(password);
      cy.contains('button', 'Se connecter').click();

      // Devrait rester sur la page de connexion et afficher une erreur
      cy.url().should('include', '/connexion/mot-de-passe');
      cy.get('.text-red-500').should('be.visible');
    });
  });
})
