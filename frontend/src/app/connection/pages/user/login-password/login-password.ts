// login-password.ts
import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Header } from '../../features/header/header';
import { Auth } from '../../../common/services/core/auth/auth.service';
import { AuthStateService } from '../../../common/services/core/auth-state/auth-state.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login-password',
  imports: [ReactiveFormsModule, Header],
  templateUrl: './login-password.html',
  styleUrl: './login-password.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPassword {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(Auth);
  private readonly authStateService = inject(AuthStateService);

  passwordForm: FormGroup;
  isSubmitting = signal(false);
  showPassword = signal(false);
  errorMessage = signal<string>('');
  userEmail = signal<string>('');

  constructor() {
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required]]
    });
  }

  isFieldInvalid(): boolean {
    const field = this.passwordForm.get('password');
    return !!(field && field.invalid && field.touched);
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  goBack(): void {
    this.router.navigate(['/connexion']);
  }

  getButtonClasses(): string {
    const baseClasses = 'w-full font-medium py-4 px-6 rounded-lg transition-all duration-200 text-lg';
    
    if (!this.passwordForm.valid || this.isSubmitting()) {
      return `${baseClasses} bg-gray-300 text-gray-500 cursor-not-allowed opacity-60`;
    }
    
    return `${baseClasses} bg-black text-white cursor-pointer hover:bg-gray-800 active:scale-98`;
  }

  handleSubmit(): void {
    if (!this.passwordForm.valid) {
      this.passwordForm.get('password')?.markAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    
    const { password } = this.passwordForm.value;
    
    console.log('🔐 Tentative de connexion avec mot de passe');
    
    // Envoyer uniquement le mot de passe, le cookie contient l'email
    this.authService.loginWithPassword(password).subscribe({
      next: (response) => {
        console.log('✅ Connexion réussie:', response);
        this.isSubmitting.set(false);
        
        if (response.success) {
          console.log('🎉 Utilisateur connecté');
          
          // Nettoyer le state
          this.authStateService.clearState();
          
          // Rediriger vers le dashboard
          this.router.navigate(['/utilisateurs']);
        } else {
          this.errorMessage.set(response.message || 'Erreur lors de la connexion');
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('❌ Erreur lors de la connexion:', error);
        this.isSubmitting.set(false);
        
        let errorMsg = 'Mot de passe incorrect.';
        if (error.error && typeof error.error === 'object') {
          errorMsg = error.error.message || errorMsg;
        }
        
        this.errorMessage.set(errorMsg);
      }
    });
  }
}