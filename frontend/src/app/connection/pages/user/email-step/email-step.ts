// email-step.ts
import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Header } from '../../features/header/header';
import { Auth } from '../../../common/services/core/auth/auth.service';
import { AuthStateService } from '../../../common/services/core/auth-state/auth-state.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-email-step',
  imports: [ReactiveFormsModule, Header],
  templateUrl: './email-step.html',
  styleUrl: './email-step.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailStep implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(Auth);
  private readonly authStateService = inject(AuthStateService);
  
  isSubmitting = signal(false);
  submitAttempted = signal(false);
  errorMessage = signal<string>('');
  isPro = signal(false);
  
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  ngOnInit(): void {
    this.isPro.set(this.route.snapshot.data['isPro'] || false);
  }
  
  isFieldInvalid() {
    const control = this.loginForm.get('email');
    return !!(control?.invalid && (control?.touched || this.submitAttempted()));
  }

  isFormValid() {
    return this.loginForm.valid;
  }

  getButtonClasses(): string {
    const baseClasses = 'w-92 font-medium py-4 px-6 rounded-lg transition-all duration-200 text-lg';
    
    if (!this.loginForm.valid || this.isSubmitting()) {
      return `${baseClasses} bg-gray-300 text-gray-500 cursor-not-allowed opacity-60`;
    }
    
    return `${baseClasses} bg-black text-white cursor-pointer hover:bg-gray-800 active:scale-98`;
  }
  
  handleSubmit(): void {
    console.log('🚀 === DÉBUT HANDLESUBMIT ===');
    
    this.submitAttempted.set(true);
    this.errorMessage.set('');
    
    if (!this.loginForm.valid) {
      console.log('❌ Formulaire invalide');
      return;
    }

    this.isSubmitting.set(true);
    const email = this.loginForm.get('email')?.value;
    const isPro = this.isPro();
    
    console.log('📧 Email extrait:', email);
    console.log('🏢 Mode Pro:', isPro);
    
    this.authService.checkEmail(email, isPro).subscribe({
      next: (response) => {
        console.log('✅ === RÉPONSE REÇUE ===');
        console.log('📦 Réponse complète:', response);
        
        this.authStateService.setEmailCheckResult(
          email,
          response.exists,
          response.requirePassword || false,
          response.requireVerification || false,
          isPro
        );

        const basePath = isPro ? '/connexion-pro' : '/connexion';

        // 🆕 CAS 1 : Utilisateur existant avec mot de passe → Connexion
        if (response.exists && response.verified && response.requirePassword) {
          console.log('🔑 Navigation vers mot-de-passe (utilisateur existant vérifié)');
          this.router.navigate([`${basePath}/mot-de-passe`]);
        }
        // 🆕 CAS 2 : Utilisateur existe mais email non vérifié → Renvoyer code
        else if (response.exists && !response.verified && response.requireVerification) {
          console.log('🔄 Inscription incomplète détectée - Renvoi du code de vérification');
          this.router.navigate([`${basePath}/verification`]);
        }
        // 🆕 CAS 3 : Nouvel utilisateur → Vérification
        else if (!response.exists && response.requireVerification) {
          console.log('📨 Nouvel utilisateur - Navigation vers vérification');
          this.router.navigate([`${basePath}/verification`]);
        }
        // 🆕 CAS 4 : Inscription incomplète avec vérification requise
        else if (response.exists && response.requireVerification) {
          console.log('🔄 Inscription en cours - Navigation vers vérification');
          this.router.navigate([`${basePath}/verification`]);
        }
        else {
          console.log('⚠️ Cas non géré:', response);
          this.errorMessage.set('État inattendu. Veuillez réessayer.');
        }
        
        this.isSubmitting.set(false);
      },
      error: (error: HttpErrorResponse) => {
        console.error('❌ === ERREUR DÉTECTÉE ===');
        console.error('📦 Erreur complète:', error);
        
        let errorMsg = 'Une erreur est survenue. Veuillez réessayer.';
        
        if (error.error && typeof error.error === 'object') {
          errorMsg = error.error.message || errorMsg;
        } else if (error.error && typeof error.error === 'string') {
          errorMsg = error.error;
        }
        
        this.errorMessage.set(errorMsg);
        this.isSubmitting.set(false);
      }
    });
  }
}