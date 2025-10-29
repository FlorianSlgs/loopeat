import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { AuthInitService } from '../../../../connection/common/services/core/auth-init/auth-init.service';

@Component({
  selector: 'app-settings',
  imports: [],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Settings {
  private readonly authInitService = inject(AuthInitService);

  // Signals pour les données utilisateur
  nom = signal('Nom');
  prenom = signal('Prénom');
  email = signal('email@example.com');
  solde = signal(0);
  
  // Signals pour les champs de mot de passe
  currentPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');
  
  // Signal pour la confirmation de suppression
  deleteConfirmation = signal('');
  
  // Signal pour gérer quelle section est ouverte
  expandedSection = signal<string | null>(null);

  /**
   * Toggle l'expansion d'une section
   */
  toggleSection(section: string): void {
    if (this.expandedSection() === section) {
      this.expandedSection.set(null);
    } else {
      this.expandedSection.set(section);
    }
  }

  /**
   * Met à jour le nom
   */
  updateNom(): void {
    console.log('Mise à jour du nom:', this.nom());
    // Ici, vous ajouteriez l'appel API pour sauvegarder
    alert(`Nom mis à jour: ${this.nom()}`);
    this.expandedSection.set(null);
  }

  /**
   * Met à jour le prénom
   */
  updatePrenom(): void {
    console.log('Mise à jour du prénom:', this.prenom());
    // Ici, vous ajouteriez l'appel API pour sauvegarder
    alert(`Prénom mis à jour: ${this.prenom()}`);
    this.expandedSection.set(null);
  }

  /**
   * Met à jour l'email
   */
  updateEmail(): void {
    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email())) {
      alert('Veuillez entrer un email valide');
      return;
    }
    
    console.log('Mise à jour de l\'email:', this.email());
    // Ici, vous ajouteriez l'appel API pour sauvegarder
    alert(`Email mis à jour: ${this.email()}`);
    this.expandedSection.set(null);
  }

  /**
   * Met à jour le mot de passe
   */
  updatePassword(): void {
    // Validations
    if (!this.currentPassword()) {
      alert('Veuillez entrer votre mot de passe actuel');
      return;
    }
    
    if (this.newPassword().length < 8) {
      alert('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }
    
    if (this.newPassword() !== this.confirmPassword()) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    
    console.log('Changement de mot de passe');
    // Ici, vous ajouteriez l'appel API pour changer le mot de passe
    alert('Mot de passe changé avec succès');
    
    // Réinitialiser les champs
    this.currentPassword.set('');
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.expandedSection.set(null);
  }

  /**
   * Récupère la solde
   */
  recupererSolde(): void {
    console.log('Récupération de la solde:', this.solde());
    // Ici, vous ajouteriez l'appel API pour récupérer la solde
    alert(`Demande de récupération de ${this.solde()} € envoyée`);
    this.expandedSection.set(null);
  }

  /**
   * Déconnecte l'utilisateur
   */
  async logout() {
    console.log('Déconnexion de l\'utilisateur');
    await this.authInitService.logout();
    this.expandedSection.set(null);
  }

  /**
   * Supprime le compte utilisateur
   */
  deleteAccount(): void {
    if (this.deleteConfirmation() !== 'SUPPRIMER') {
      alert('Veuillez taper "SUPPRIMER" pour confirmer');
      return;
    }
    
    console.log('Suppression du compte');
    // Ici, vous ajouteriez l'appel API pour supprimer le compte
    if (confirm('Êtes-vous absolument certain de vouloir supprimer votre compte ?')) {
      alert('Compte supprimé. Vous allez être redirigé...');
      this.expandedSection.set(null);
    }
  }
}