const User = require('../../models/user.model');
const Pro = require('../../models/pro.model');
const Verification = require('../../models/verification.model');

class AuthRepository {
  // Trouver par email (utilisateur ou pro)
  async findUserByEmail(email, isPro = false) {
    if (isPro) {
      return await Pro.findByEmail(email);
    }
    return await User.findByEmail(email);
  }

  // Créer avec email (utilisateur ou pro)
  async createUserWithEmail(email, isPro = false) {
    if (isPro) {
      return await Pro.create(email);
    }
    return await User.create(email);
  }

  async createVerificationCode(email, code) {
    return await Verification.createOrUpdate(email, code);
  }

  async verifyCode(email, code) {
    return await Verification.verifyCode(email, code);
  }

  async isCodeVerified(email) {
    return await Verification.isEmailVerified(email);
  }

  // Marquer comme vérifié (utilisateur ou pro)
  async markUserAsVerified(email, isPro = false) {
    if (isPro) {
      return await Pro.markAsVerified(email);
    }
    return await User.markAsVerified(email);
  }

  async deleteVerificationCode(email) {
    return await Verification.deleteByEmail(email);
  }

  // Sauvegarder les infos (utilisateur ou pro)
  async saveUserInfo(email, firstName, lastName, isPro = false) {
    if (isPro) {
      // Pour les pros, on combine firstName et lastName en name
      const name = `${firstName} ${lastName}`.trim();
      return await Pro.saveProInfo(email, name);
    }
    return await User.saveUserInfo(email, firstName, lastName);
  }

  // Version spécifique pour les pros avec un seul champ name
  async saveProInfo(email, name) {
    return await Pro.saveProInfo(email, name);
  }

  // Compléter l'inscription avec vérification (utilisateur ou pro)
  async completeRegistrationWithVerification(email, hashedPassword, isPro = false) {
    if (isPro) {
      return await Pro.completeRegistrationWithVerification(email, hashedPassword);
    }
    return await User.completeRegistrationWithVerification(email, hashedPassword);
  }

  // Compléter l'inscription complète (utilisateur ou pro)
  async completeUserRegistration(email, firstName, lastName, hashedPassword, isPro = false) {
    if (isPro) {
      const name = `${firstName} ${lastName}`.trim();
      return await Pro.completeRegistration(email, name, hashedPassword);
    }
    return await User.completeRegistration(email, firstName, lastName, hashedPassword);
  }
}

module.exports = new AuthRepository();