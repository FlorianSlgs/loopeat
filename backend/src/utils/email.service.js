// utils/email.service.js
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    if (process.env.NODE_ENV === 'production') {
      // Configuration production (Gmail, SendGrid, etc.)
      this.transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    } else {
      // Configuration développement avec Gmail
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.DEV_EMAIL_USER,
          pass: process.env.DEV_EMAIL_PASSWORD
        }
      });
    }
  }

  displayEmailConfig() {
    console.log('');
    console.log('╔═════════════════════════════════════════════════════════════╗');
    console.log('║           📊 CONFIGURATION EMAIL - DEBUG                    ║');
    console.log('╠═════════════════════════════════════════════════════════════╣');
    console.log(`║  Environnement:     ${(process.env.NODE_ENV || 'development').padEnd(36)} ║`);
    console.log(`║  Service:           ${('gmail').padEnd(36)} ║`);
    
    if (process.env.NODE_ENV === 'production') {
      console.log(`║  Email configuré:   ${(process.env.EMAIL_USER ? '✅ Oui' : '❌ Non').padEnd(36)} ║`);
      console.log(`║  Email user:        ${(process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 20) + '...' : 'NON DÉFINI').padEnd(36)} ║`);
      console.log(`║  Password défini:   ${(process.env.EMAIL_PASSWORD ? '✅ Oui (caché)' : '❌ Non').padEnd(36)} ║`);
    } else {
      console.log(`║  Email configuré:   ${(process.env.DEV_EMAIL_USER ? '✅ Oui' : '❌ Non').padEnd(36)} ║`);
      console.log(`║  Email user:        ${(process.env.DEV_EMAIL_USER || 'NON DÉFINI').padEnd(36)} ║`);
      console.log(`║  Password défini:   ${(process.env.DEV_EMAIL_PASSWORD ? '✅ Oui (caché)' : '❌ Non').padEnd(36)} ║`);
      if (process.env.DEV_EMAIL_PASSWORD) {
        console.log(`║  Password (preview): ${(process.env.DEV_EMAIL_PASSWORD.substring(0, 4) + '****').padEnd(36)} ║`);
      }
    }
    
    console.log(`║  Transporter:       ${(this.transporter ? '✅ Initialisé' : '❌ Non initialisé').padEnd(36)} ║`);
    console.log('╚═════════════════════════════════════════════════════════════╝');
    console.log('');
  }

  async sendEmail({ to, subject, html }) {
    this.displayEmailConfig();

    if (!this.transporter) {
      throw new Error('Service email non configuré');
    }

    const mailOptions = {
      from: process.env.NODE_ENV === 'production' 
        ? process.env.EMAIL_USER 
        : process.env.DEV_EMAIL_USER,
      to,
      subject,
      html
    };

    console.log('📤 Tentative d\'envoi d\'email...');
    console.log(`   De: ${mailOptions.from}`);
    console.log(`   À: ${mailOptions.to}`);
    
    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('');
      console.log('╔═════════════════════════════════════════════╗');
      console.log('║          ✅ EMAIL ENVOYÉ AVEC SUCCÈS          ║');
      console.log('╠═════════════════════════════════════════════╣');
      console.log(`║  Message ID: ${(info.messageId || 'N/A').substring(0, 26).padEnd(28)} ║`);
      console.log(`║  Destinataire: ${to.padEnd(26)} ║`);
      console.log('╚═════════════════════════════════════════════╝');
      console.log('');
      
      return info;
    } catch (error) {
      console.log('');
      console.log('╔═════════════════════════════════════════════╗');
      console.log('║        ❌ ERREUR LORS DE L\'ENVOI D\'EMAIL      ║');
      console.log('╠═════════════════════════════════════════════╣');
      console.log(`║  Erreur: ${(error.message || 'Inconnue').substring(0, 35).padEnd(37)} ║`);
      console.log(`║  Code: ${(error.code || 'N/A').padEnd(39)} ║`);
      if (error.response) {
        console.log(`║  Response: ${(error.response.substring(0, 33)).padEnd(35)} ║`);
      }
      console.log('╚═════════════════════════════════════════════╝');
      console.log('');
      console.error('Détails complets de l\'erreur:', error);
      throw new Error('Impossible d\'envoyer l\'email');
    }
  }

  async sendVerificationEmail(email, code) {
    // Mode développement : afficher le code dans la console
    if (process.env.NODE_ENV !== 'production') {
      console.log('');
      console.log('╔═════════════════════════════════════════════╗');
      console.log('║     📧 EMAIL DE VÉRIFICATION (MODE DEV)       ║');
      console.log('╠═════════════════════════════════════════════╣');
      console.log(`║  Destinataire: ${email.padEnd(28)} ║`);
      console.log(`║  Code:         ${code.padEnd(28)} ║`);
      console.log('╚═════════════════════════════════════════════╝');
      console.log('');
    }

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; text-align: center;">Loopeat</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Bienvenue sur Loopeat ! 🌱</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Nous sommes ravis de vous accueillir. Voici votre code de vérification :
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
            <h1 style="color: #667eea; font-size: 48px; letter-spacing: 10px; margin: 0;">${code}</h1>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.5;">
            Ce code est valide pendant <strong>10 minutes</strong>.
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Si vous n'avez pas demandé ce code, ignorez cet email.<br>
            Aucune action n'a été effectuée sur votre compte.
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: email,
      subject: 'Code de vérification - Loopeat',
      html
    });
  }

  async sendWelcomeEmail(email, firstName) {
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; text-align: center;">Loopeat</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Bienvenue ${firstName} ! 🎉</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Votre inscription est maintenant complète. Nous sommes ravis de vous compter parmi nous !
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Vous pouvez dès maintenant profiter de toutes les fonctionnalités de Loopeat.
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            L'équipe Loopeat 🌱
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: email,
      subject: 'Bienvenue sur Loopeat ! 🌱',
      html
    });
  }

  async sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; text-align: center;">Loopeat</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Réinitialisation de mot de passe</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour continuer :
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.5;">
            Ce lien est valide pendant <strong>1 heure</strong>.
          </p>
          <p style="color: #666; font-size: 14px; line-height: 1.5;">
            Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
            <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.<br>
            Votre mot de passe restera inchangé.
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe - Loopeat',
      html
    });
  }
}

module.exports = new EmailService();