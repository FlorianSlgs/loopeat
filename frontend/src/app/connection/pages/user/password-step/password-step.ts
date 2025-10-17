import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Header } from '../../features/header/header';

@Component({
  selector: 'app-password-step',
  standalone: true,
  imports: [ReactiveFormsModule, Header],
  templateUrl: './password-step.html',
  styleUrl: './password-step.css'
})
export class PasswordStep {
  passwordForm: FormGroup;
  isSubmitting = signal(false);
  showPassword = signal(false);

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
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

  // Validateur personnalisé pour la force du mot de passe
  passwordStrengthValidator(control: any) {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

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
    // Navigation vers l'étape précédente
    this.router.navigate(['/name']); // Ajustez selon votre routing
  }

  goNext(): void {
    if (this.passwordForm.valid) {
      this.isSubmitting.set(true);
      
      // Récupérer le mot de passe
      const { password } = this.passwordForm.value;
      
      // TODO: Enregistrer le mot de passe (service, API, etc.)
      console.log('Mot de passe défini');
      
      // Simuler un délai de traitement
      setTimeout(() => {
        this.isSubmitting.set(false);
        // Navigation vers l'étape suivante
        this.router.navigate(['/next-step']); // Ajustez selon votre routing
      }, 500);
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.passwordForm.controls).forEach(key => {
        this.passwordForm.get(key)?.markAsTouched();
      });
    }
  }
}