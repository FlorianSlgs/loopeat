// password-step.ts
import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Header } from '../../features/header/header';
import { Auth } from '../../../common/services/core/auth/auth.service';
import { AuthStateService } from '../../../common/services/core/auth-state/auth-state.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-password-step',
  imports: [ReactiveFormsModule, Header],
  templateUrl: './password-step.html',
  styleUrl: './password-step.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PasswordStep implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(Auth);
  private readonly authStateService = inject(AuthStateService);

  passwordForm: FormGroup;
  isSubmitting = signal(false);
  showPassword = signal(false);
  errorMessage = signal<string>('');
  isPro = signal(false);

  constructor() {
    this.passwordForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    // 🆕 Vérifier qu'on a bien un email en mémoire
    const email = this.authStateService.getCurrentEmail();
    const isPro = this.authStateService.getIsPro();
    
    if (!email) {
      console.warn('⚠️ Pas d\'email en mémoire, redirection vers /connexion');
      this.router.navigate([isPro ? '/connexion-pro' : '/connexion']);
      return;
    }

    this.isPro.set(isPro);
    console.log('🔐 Password Step - Mode:', isPro ? 'PRO' : 'USER');
  }

  // Validateur personnalisé pour la force du mot de passe
  passwordStrengthValidator = (control: any) => {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|_<>]/.test(value);

    const valid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;
    return valid ? null : { passwordStrength: true };
  }

  // Validateur pour vérifier que les mots de passe correspondent
  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.passwordForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  hasPasswordMismatch(): boolean {
    const confirmField = this.passwordForm.get('confirmPassword');
    return !!(
      confirmField?.touched &&
      this.passwordForm.hasError('passwordMismatch')
    );
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  goBack(): void {
    // 🆕 Navigation dynamique en fonction du mode
    const basePath = this.isPro() ? '/connexion-pro' : '/connexion';
    console.log('⬅️ Retour vers:', `${basePath}/nom`);
    this.router.navigate([`${basePath}/nom`]);
  }

  goNext(): void {
    if (!this.passwordForm.valid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.passwordForm.controls).forEach(key => {
        this.passwordForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    
    const { password } = this.passwordForm.value;
    const isPro = this.isPro();
    
    console.log('🔒 Définition du mot de passe');
    console.log('🏢 Mode:', isPro ? 'PRO' : 'USER');
    
    // Appeler l'API pour définir le mot de passe
    this.authService.setPassword(password, isPro).subscribe({
      next: (response) => {
        console.log('✅ Mot de passe défini:', response);
        this.isSubmitting.set(false);
        
        if (response.success) {
          // Inscription terminée avec succès
          console.log('🎉 Inscription terminée, utilisateur connecté');
          
          // Nettoyer le state
          this.authStateService.clearState();
          
          // 🆕 Redirection dynamique en fonction du mode
          if (isPro) {
            console.log('➡️ Redirection vers /pro');
            this.router.navigate(['/pro']);
          } else {
            console.log('➡️ Redirection vers /utilisateurs');
            this.router.navigate(['/utilisateurs']);
          }
        } else {
          this.errorMessage.set(response.message || 'Erreur lors de la définition du mot de passe');
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('❌ Erreur lors de la définition du mot de passe:', error);
        this.isSubmitting.set(false);
        
        let errorMsg = 'Une erreur est survenue. Veuillez réessayer.';
        if (error.error && typeof error.error === 'object') {
          errorMsg = error.error.message || errorMsg;
        }
        
        this.errorMessage.set(errorMsg);
      }
    });
  }
}