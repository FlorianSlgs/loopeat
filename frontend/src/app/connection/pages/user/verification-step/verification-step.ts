import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Header } from '../../features/header/header';
import { Auth } from '../../../common/services/core/auth/auth.service';
import { AuthStateService } from '../../../common/services/core/auth-state/auth-state.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-verification-step',
  imports: [Header],
  templateUrl: './verification-step.html',
  styleUrl: './verification-step.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerificationStep implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(Auth);
  private readonly authStateService = inject(AuthStateService);

  code: string[] = ['', '', '', ''];
  currentEmail = signal<string>('');
  isVerifying = signal<boolean>(false);
  errorMessage = signal<string>('');
  isCodeVerified = signal<boolean>(false);
  isPro = signal(false);

  ngOnInit(): void {
    const email = this.authStateService.getCurrentEmail();
    const isPro = this.authStateService.getIsPro();
    
    if (!email) {
      this.router.navigate([isPro ? '/connexion-pro' : '/connexion']);
      return;
    }
    
    this.currentEmail.set(email);
    this.isPro.set(isPro);
    
    console.log('🔐 Verification Step - Email:', email);
    console.log('🔐 Verification Step - Mode:', isPro ? 'PRO' : 'USER');
  }

  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Garde seulement le dernier caractère numérique
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue.length > 1) {
      input.value = numericValue.slice(-1);
    } else {
      input.value = numericValue;
    }

    this.code[index] = input.value;
    this.errorMessage.set(''); // Réinitialise l'erreur lors de la saisie

    // Passe à la case suivante si un chiffre a été entré
    if (input.value && index < 3) {
      const nextInput = input.nextElementSibling as HTMLInputElement;
      nextInput?.focus();
    }

    // Vérifie automatiquement si les 4 chiffres sont entrés
    if (this.isCodeComplete() && index === 3 && !this.isVerifying() && !this.isCodeVerified()) {
      this.verifyCode();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;

    // Retour arrière : revient à la case précédente si vide
    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prevInput = input.previousElementSibling as HTMLInputElement;
      prevInput?.focus();
    }
  }

  isCodeComplete(): boolean {
    return this.code.every(digit => digit !== '');
  }

  // verification-step.ts - verifyCode
verifyCode(): void {
  if (this.isVerifying() || this.isCodeVerified()) {
    console.log('⚠️ Vérification déjà en cours ou code déjà vérifié');
    return;
  }

  if (!this.isCodeComplete()) {
    this.errorMessage.set('Veuillez saisir les 4 chiffres du code');
    return;
  }

  const fullCode = this.code.join('');
  const email = this.currentEmail();
  const isPro = this.isPro();

  if (!email) {
    this.errorMessage.set('Email non trouvé. Veuillez recommencer.');
    const basePath = isPro ? '/connexion-pro' : '/connexion';
    this.router.navigate([basePath]);
    return;
  }

  console.log('🔍 Début vérification du code:', fullCode);
  console.log('🏢 Mode:', isPro ? 'PRO' : 'USER');
  this.isVerifying.set(true);
  this.errorMessage.set('');

  this.authService.verifyCode(email, fullCode, isPro).subscribe({
    next: (response) => {
      console.log('✅ Code vérifié:', response);
      this.isVerifying.set(false);
      this.isCodeVerified.set(true);

      if (response.success && response.verified) {
        const basePath = isPro ? '/connexion-pro' : '/connexion';
        
        // 🎯 LOGIQUE ULTRA-SIMPLE
        // Si on arrive ici, c'est qu'on a vérifié un code
        // Donc inscription non finalisée → toujours aller à /nom
        console.log(`📝 Redirection vers ${basePath}/nom`);
        this.router.navigate([`${basePath}/nom`]);
      } else {
        this.errorMessage.set(response.message || 'Code invalide');
        this.isCodeVerified.set(false);
        this.clearCode();
      }
    },
    error: (error: HttpErrorResponse) => {
      console.error('❌ Erreur de vérification:', error);
      this.isVerifying.set(false);
      this.isCodeVerified.set(false);
      
      let errorMsg = 'Code invalide. Veuillez réessayer.';
      if (error.error && typeof error.error === 'object') {
        errorMsg = error.error.message || errorMsg;
      }
      
      this.errorMessage.set(errorMsg);
      this.clearCode();
    }
  });
}

  clearCode(): void {
    this.code = ['', '', '', ''];
    // Focus sur le premier input
    setTimeout(() => {
      const firstInput = document.querySelector('input[type="text"]') as HTMLInputElement;
      firstInput?.focus();
    }, 100);
  }

  resendCode(): void {
    const email = this.currentEmail();
    const isPro = this.isPro(); // 🆕 Récupérer le mode
    
    if (!email) {
      this.errorMessage.set('Email non trouvé. Veuillez recommencer.');
      return;
    }

    // Réinitialise le flag de vérification
    this.isCodeVerified.set(false);

    console.log('📨 Renvoi du code pour:', email, isPro ? '(PRO)' : '(USER)');

    // 🆕 Passer isPro à checkEmail
    this.authService.checkEmail(email, isPro).subscribe({
      next: (response) => {
        console.log('✅ Code renvoyé');
        this.errorMessage.set('');
        alert('Un nouveau code a été envoyé à votre adresse email');
        this.clearCode();
      },
      error: (error: HttpErrorResponse) => {
        console.error('❌ Erreur lors du renvoi:', error);
        this.errorMessage.set('Erreur lors du renvoi du code');
      }
    });
  }

  goBack(): void {
    const basePath = this.isPro() ? '/connexion-pro' : '/connexion';
    this.authStateService.clearState();
    this.router.navigate([basePath]);
  }

  goNext(): void {
    this.verifyCode();
  }
}