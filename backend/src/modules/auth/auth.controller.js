// modules/auth/auth.controller.js
const authService = require('./auth.service');
const tokenService = require('../../utils/token.service');

class AuthController {
  async checkEmail(req, res) {
    try {
      console.log('📨 Requête reçue sur /check-email');
      console.log('📦 Body:', req.body);
      console.log('🍪 Cookies:', req.cookies);
      
      const authToken = req.cookies.auth_token;
      
      if (authToken) {
        const decoded = tokenService.verifyToken(authToken);
        
        if (decoded && decoded.type === 'auth') {
          console.log('✅ Utilisateur déjà connecté:', decoded.email);
          
          const isPro = decoded.isPro || false;
          const user = await authService.getUserByEmail(decoded.email, isPro);
          
          // Format de réponse adapté
          const userResponse = isPro ? {
            id: user.id,
            email: user.email,
            name: user.name,
            admin: user.admin,
            verified: user.verified,
            isPro: true
          } : {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            verified: user.verified,
            isPro: false
          };
          
          return res.status(200).json({
            success: true,
            alreadyAuthenticated: true,
            user: userResponse,
            message: 'Vous êtes déjà connecté'
          });
        }
      }
      
      const { email, isPro } = req.body;

      if (!email) {
        console.log('❌ Email manquant dans la requête');
        return res.status(400).json({
          success: false,
          message: 'Email requis'
        });
      }

      console.log('✅ Email validé, appel du service...', isPro ? '(PRO)' : '(USER)');
      const result = await authService.checkEmail(email, isPro || false);
      console.log('✅ Résultat du service:', result);

      if (result.verified && result.requirePassword) {
        const loginToken = tokenService.generateRegistrationToken(email, isPro);
        
        res.cookie('login_session', loginToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 10 * 60 * 1000
        });

        console.log('🍪 Cookie de session de connexion créé pour:', email);
      }

      return res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('❌ Erreur dans checkEmail:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la vérification de l\'email'
      });
    }
  }

  async verifyCode(req, res) {
    try {
      console.log('📨 Requête reçue sur /verify-code');
      console.log('📦 Body:', req.body);
      
      const { email, code, isPro } = req.body;

      if (!email || !code) {
        console.log('❌ Email ou code manquant');
        return res.status(400).json({
          success: false,
          message: 'Email et code requis'
        });
      }

      const result = await authService.verifyCode(email, code);

      const registrationToken = tokenService.generateRegistrationToken(email, isPro);

      res.cookie('registration_token', registrationToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 10 * 60 * 1000
      });

      console.log('🍪 Cookie de registration créé pour:', email);

      return res.status(200).json({
        success: true,
        ...result,
        hasRegistrationToken: true,
        isPro: isPro || false
      });
    } catch (error) {
      console.error('❌ Erreur dans verifyCode:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la vérification du code'
      });
    }
  }

  async saveUserInfo(req, res) {
    try {
      console.log('📨 Requête reçue sur /save-user-info');
      console.log('📦 Body:', req.body);
      console.log('🍪 Cookies:', req.cookies);
      
      const registrationToken = req.cookies.registration_token;

      if (!registrationToken) {
        console.log('❌ Token de registration manquant');
        return res.status(401).json({
          success: false,
          message: 'Session expirée. Veuillez recommencer le processus d\'inscription.'
        });
      }

      const decoded = tokenService.verifyToken(registrationToken);

      if (!decoded || decoded.type !== 'registration') {
        console.log('❌ Token de registration invalide');
        return res.status(401).json({
          success: false,
          message: 'Session invalide. Veuillez recommencer le processus d\'inscription.'
        });
      }

      const email = decoded.email;
      const isPro = decoded.isPro || false;

      // Pour les pros : accepter "name" OU "firstName + lastName"
      if (isPro) {
        const name = req.body.name || `${req.body.firstName || ''} ${req.body.lastName || ''}`.trim();
        
        if (!name) {
          console.log('❌ Nom manquant');
          return res.status(400).json({
            success: false,
            message: 'Nom requis'
          });
        }

        const result = await authService.saveUserInfo(email, null, null, true, name);
        console.log('✅ Informations professionnel sauvegardées');

        return res.status(200).json({
          success: true,
          ...result
        });
      }

      // Pour les utilisateurs normaux
      const firstName = req.body.firstName || req.body.first_name;
      const lastName = req.body.lastName || req.body.last_name;

      if (!firstName || !lastName) {
        console.log('❌ Données manquantes');
        return res.status(400).json({
          success: false,
          message: 'Prénom et nom requis'
        });
      }

      const result = await authService.saveUserInfo(email, firstName, lastName, false);
      console.log('✅ Informations utilisateur sauvegardées');

      return res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('❌ Erreur dans saveUserInfo:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la sauvegarde des informations'
      });
    }
  }

  async setPassword(req, res) {
    try {
      console.log('📨 Requête reçue sur /set-password');
      console.log('📦 Body:', req.body);
      console.log('🍪 Cookies:', req.cookies);
      
      const registrationToken = req.cookies.registration_token;

      if (!registrationToken) {
        console.log('❌ Token de registration manquant');
        return res.status(401).json({
          success: false,
          message: 'Session expirée. Veuillez recommencer le processus d\'inscription.'
        });
      }

      const decoded = tokenService.verifyToken(registrationToken);

      if (!decoded || decoded.type !== 'registration') {
        console.log('❌ Token de registration invalide');
        return res.status(401).json({
          success: false,
          message: 'Session invalide. Veuillez recommencer le processus d\'inscription.'
        });
      }

      const { password } = req.body;
      const email = decoded.email;
      const isPro = decoded.isPro || false;

      if (!password) {
        console.log('❌ Mot de passe manquant');
        return res.status(400).json({
          success: false,
          message: 'Mot de passe requis'
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Le mot de passe doit contenir au moins 8 caractères'
        });
      }

      const result = await authService.setPassword(email, password, isPro);

      res.clearCookie('registration_token');

      const authToken = tokenService.generateAuthToken(result.user.id, result.user.email, isPro);

      res.cookie('auth_token', authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      console.log('🍪 Cookie d\'authentification créé pour:', email);
      console.log('✅ Inscription complétée avec succès');

      return res.status(200).json({
        success: true,
        ...result,
        authenticated: true
      });
    } catch (error) {
      console.error('❌ Erreur dans setPassword:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la définition du mot de passe'
      });
    }
  }

  async loginWithPassword(req, res) {
    try {
      console.log('📨 Requête reçue sur /login-with-password');
      console.log('📦 Body:', req.body);
      console.log('🍪 Cookies:', req.cookies);
      
      const loginSession = req.cookies.login_session;

      if (!loginSession) {
        console.log('❌ Session de connexion manquante');
        return res.status(401).json({
          success: false,
          message: 'Session expirée. Veuillez recommencer.'
        });
      }

      const decoded = tokenService.verifyToken(loginSession);

      if (!decoded || decoded.type !== 'registration') {
        console.log('❌ Session de connexion invalide');
        return res.status(401).json({
          success: false,
          message: 'Session invalide.'
        });
      }

      const { password } = req.body;
      const email = decoded.email;
      const isPro = decoded.isPro || false;

      if (!password) {
        console.log('❌ Mot de passe manquant');
        return res.status(400).json({
          success: false,
          message: 'Mot de passe requis'
        });
      }

      const result = await authService.loginWithPassword(email, password, isPro);

      res.clearCookie('login_session');

      const authToken = tokenService.generateAuthToken(result.user.id, result.user.email, isPro);

      res.cookie('auth_token', authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      console.log('🍪 Cookie d\'authentification créé pour:', email);
      console.log('✅ Connexion réussie');

      return res.status(200).json({
        success: true,
        ...result,
        authenticated: true
      });
    } catch (error) {
      console.error('❌ Erreur dans loginWithPassword:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la connexion'
      });
    }
  }

  async logout(req, res) {
    try {
      res.clearCookie('auth_token');
      res.clearCookie('login_session');
      res.clearCookie('registration_token');
      
      console.log('✅ Déconnexion réussie');

      return res.status(200).json({
        success: true,
        message: 'Déconnexion réussie'
      });
    } catch (error) {
      console.error('❌ Erreur dans logout:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la déconnexion'
      });
    }
  }

  async getCurrentUser(req, res) {
    try {
      return res.status(200).json({
        success: true,
        user: req.user
      });
    } catch (error) {
      console.error('❌ Erreur dans getCurrentUser:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'utilisateur'
      });
    }
  }
}

module.exports = new AuthController();