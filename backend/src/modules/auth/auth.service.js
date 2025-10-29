// modules/auth/auth.service.js
const authRepository = require('./auth.repository');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const emailService = require('../../utils/email.service');

class AuthService {
  generateVerificationCode() {
    return crypto.randomInt(1000, 9999).toString();
  }

  /**
   * Génère un code unique de 4 chiffres pour un utilisateur
   * Vérifie que le code n'existe pas déjà dans la base de données
   */
  async generateUniqueUserCode(isPro = false) {
    let code;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 100;

    while (!isUnique && attempts < maxAttempts) {
      code = crypto.randomInt(1000, 9999).toString();
      isUnique = await authRepository.isUserCodeUnique(code, isPro);
      attempts++;
    }

    if (!isUnique) {
      throw new Error('Impossible de générer un code unique après plusieurs tentatives');
    }

    console.log(`✅ Code unique généré: ${code}`);
    return code;
  }

  async getUserByEmail(email, isPro = false) {
    const user = await authRepository.findUserByEmail(email, isPro);
    
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    if (isPro) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        verified: user.verified,
        admin: user.admin,
        code: user.code,
        isPro: true
      };
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      verified: user.verified,
      code: user.code,
      isPro: false
    };
  }

  async checkEmail(email, isPro = false) {
    console.log('🔍 Vérification de l\'email:', email, isPro ? '(PRO)' : '(USER)');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Email invalide');
    }

    try {
      const user = await authRepository.findUserByEmail(email, isPro);
      console.log('👤 Utilisateur trouvé:', user ? 'Oui' : 'Non');

      // ⚠️ NOUVELLE LOGIQUE POUR LES PROS
      if (isPro) {
        // Si l'email n'existe PAS dans la table professionnal
        if (!user) {
          console.log('❌ Email professionnel non autorisé');
          throw new Error('Cet email n\'est pas autorisé à s\'inscrire en tant que professionnel. Veuillez contacter l\'administrateur.');
        }

        // Si l'utilisateur existe avec un mot de passe ET est vérifié (compte complet)
        if (user.password && user.password !== '' && user.verified) {
          console.log('🔐 Professionnel existant vérifié avec mot de passe');
          
          return {
            exists: true,
            verified: true,
            requirePassword: true,
            hasSession: true,
            isPro: true,
            message: 'Veuillez entrer votre mot de passe'
          };
        }

        // Si l'utilisateur existe avec un mot de passe mais email non vérifié
        if (user.password && user.password !== '' && !user.verified) {
          console.log('📧 Email professionnel non vérifié, envoi d\'un nouveau code');
          const code = this.generateVerificationCode();
          await authRepository.createVerificationCode(email, code);
          await emailService.sendVerificationEmail(email, code);
          
          return {
            exists: true,
            verified: false,
            requireVerification: true,
            isPro: true,
            message: 'Email non vérifié. Code de vérification envoyé.'
          };
        }

        // L'email existe dans la table mais l'inscription n'est pas complétée
        console.log('📧 Professionnel pré-enregistré, envoi du code de vérification');
        const code = this.generateVerificationCode();
        await authRepository.createVerificationCode(email, code);
        await emailService.sendVerificationEmail(email, code);

        return {
          exists: true,
          verified: false,
          requireVerification: true,
          isPro: true,
          message: 'Code de vérification envoyé à votre email'
        };
      }

      // LOGIQUE POUR LES UTILISATEURS NORMAUX (inchangée)
      // Cas 1: L'utilisateur n'existe pas - créer un nouveau compte
      if (!user) {
        console.log('➕ Création d\'un nouvel utilisateur');
        
        // Générer un code unique pour l'utilisateur
        const userCode = await this.generateUniqueUserCode(isPro);
        
        await authRepository.createUserWithEmail(email, isPro, userCode);
        
        const code = this.generateVerificationCode();
        await authRepository.createVerificationCode(email, code);
        await emailService.sendVerificationEmail(email, code);

        return {
          exists: false,
          verified: false,
          requireVerification: true,
          isPro: false,
          message: 'Code de vérification envoyé à votre email'
        };
      }

      // Cas 2: L'utilisateur existe avec un mot de passe ET est vérifié (compte complet)
      if (user.password && user.password !== '' && user.verified) {
        console.log('🔐 Utilisateur existant vérifié avec mot de passe');
        
        return {
          exists: true,
          verified: true,
          requirePassword: true,
          hasSession: true,
          isPro: false,
          message: 'Veuillez entrer votre mot de passe'
        };
      }

      // Cas 3: L'utilisateur existe avec un mot de passe mais email non vérifié
      if (user.password && user.password !== '' && !user.verified) {
        console.log('📧 Email non vérifié, envoi d\'un nouveau code');
        const code = this.generateVerificationCode();
        await authRepository.createVerificationCode(email, code);
        await emailService.sendVerificationEmail(email, code);
        
        return {
          exists: true,
          verified: false,
          requireVerification: true,
          isPro: false,
          message: 'Email non vérifié. Code de vérification envoyé.'
        };
      }

      // Cas 4: L'utilisateur existe mais n'a pas encore complété l'inscription
      console.log('📧 Renvoi du code de vérification');
      const code = this.generateVerificationCode();
      await authRepository.createVerificationCode(email, code);
      await emailService.sendVerificationEmail(email, code);

      return {
        exists: true,
        verified: false,
        requireVerification: true,
        isPro: false,
        message: 'Code de vérification renvoyé à votre email'
      };
    } catch (error) {
      console.error('❌ Erreur dans checkEmail:', error);
      throw error;
    }
  }

  // Le reste des méthodes reste inchangé...
  async verifyCode(email, code) {
    console.log('🔍 Vérification du code pour:', email);
    
    if (!email || !code) {
      throw new Error('Email et code requis');
    }

    const verification = await authRepository.verifyCode(email, code);

    if (!verification) {
      throw new Error('Code invalide ou expiré');
    }

    console.log('✅ Code vérifié avec succès');
    return {
      verified: true,
      message: 'Email vérifié avec succès'
    };
  }

  async saveUserInfo(email, firstName, lastName, isPro = false, name = null) {
    console.log('💾 Sauvegarde des informations pour:', email, isPro ? '(PRO)' : '(USER)');
    
    if (isPro && name) {
      if (!email || !name) {
        throw new Error('Email et nom requis');
      }

      const user = await authRepository.findUserByEmail(email, true);
      
      if (!user) {
        throw new Error('Professionnel non trouvé');
      }

      const isCodeVerified = await authRepository.isCodeVerified(email);
      
      if (!isCodeVerified) {
        throw new Error('Veuillez d\'abord vérifier votre email');
      }

      const updatedUser = await authRepository.saveProInfo(email, name);

      if (!updatedUser) {
        throw new Error('Erreur lors de la sauvegarde des informations');
      }

      console.log('✅ Informations sauvegardées avec succès');
      return {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          admin: updatedUser.admin,
          code: updatedUser.code,
          isPro: true
        },
        message: 'Informations sauvegardées avec succès'
      };
    }

    if (!email || !firstName || !lastName) {
      throw new Error('Tous les champs sont requis');
    }

    const user = await authRepository.findUserByEmail(email, isPro);
    
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const isCodeVerified = await authRepository.isCodeVerified(email);
    
    if (!isCodeVerified) {
      throw new Error('Veuillez d\'abord vérifier votre email');
    }

    const updatedUser = await authRepository.saveUserInfo(email, firstName, lastName, isPro);

    if (!updatedUser) {
      throw new Error('Erreur lors de la sauvegarde des informations');
    }

    console.log('✅ Informations sauvegardées avec succès');
    
    if (isPro) {
      return {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          admin: updatedUser.admin,
          code: updatedUser.code,
          isPro: true
        },
        message: 'Informations sauvegardées avec succès'
      };
    }

    return {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        code: updatedUser.code,
        isPro: false
      },
      message: 'Informations sauvegardées avec succès'
    };
  }

  async setPassword(email, password, isPro = false) {
    console.log('🔐 Définition du mot de passe pour:', email, isPro ? '(PRO)' : '(USER)');
    
    if (!email || !password) {
      throw new Error('Email et mot de passe requis');
    }

    const user = await authRepository.findUserByEmail(email, isPro);
    
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const isCodeVerified = await authRepository.isCodeVerified(email);
    
    if (!isCodeVerified) {
      throw new Error('Veuillez d\'abord vérifier votre email');
    }

    if (isPro) {
      if (!user.name || user.name === '') {
        throw new Error('Veuillez d\'abord renseigner vos informations');
      }
    } else {
      if (!user.first_name || !user.last_name) {
        throw new Error('Veuillez d\'abord renseigner vos informations');
      }
    }

    if (user.password && user.password !== '') {
      throw new Error('Mot de passe déjà défini');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await authRepository.completeRegistrationWithVerification(
      email,
      hashedPassword,
      isPro
    );

    if (!updatedUser) {
      throw new Error('Erreur lors de la définition du mot de passe');
    }

    await authRepository.deleteVerificationCode(email);

    try {
      const userName = isPro ? updatedUser.name : updatedUser.first_name;
      await emailService.sendWelcomeEmail(email, userName);
    } catch (error) {
      console.error('⚠️ Erreur lors de l\'envoi de l\'email de bienvenue:', error);
    }

    console.log('✅ Inscription complétée et compte vérifié');
    
    if (isPro) {
      return {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          admin: updatedUser.admin,
          verified: true,
          code: updatedUser.code,
          isPro: true
        },
        message: 'Inscription complétée avec succès'
      };
    }

    return {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        verified: true,
        code: updatedUser.code,
        isPro: false
      },
      message: 'Inscription complétée avec succès'
    };
  }

  async loginWithPassword(email, password, isPro = false) {
    console.log('🔐 Tentative de connexion pour:', email, isPro ? '(PRO)' : '(USER)');
    
    if (!email || !password) {
      throw new Error('Email et mot de passe requis');
    }

    const user = await authRepository.findUserByEmail(email, isPro);
    
    if (!user || !user.password) {
      throw new Error('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Email ou mot de passe incorrect');
    }

    if (!user.verified) {
      throw new Error('Email non vérifié. Veuillez vérifier votre email.');
    }

    console.log('✅ Connexion réussie');
    
    if (isPro) {
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          admin: user.admin,
          verified: user.verified,
          code: user.code,
          isPro: true
        },
        message: 'Connexion réussie'
      };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        verified: user.verified,
        code: user.code,
        isPro: false
      },
      message: 'Connexion réussie'
    };
  }
}

module.exports = new AuthService();