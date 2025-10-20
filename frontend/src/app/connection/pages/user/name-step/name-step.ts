// name-step.ts
import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Header } from '../../features/header/header';
import { Auth } from '../../../common/services/core/auth/auth.service';
import { AuthStateService } from '../../../common/services/core/auth-state/auth-state.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-name-step',
  imports: [ReactiveFormsModule, Header],
  templateUrl: './name-step.html',
  styleUrl: './name-step.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NameStep implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(Auth);
  private readonly authStateService = inject(AuthStateService);

  nameForm: FormGroup;
  isSubmitting = signal(false);
  errorMessage = signal<string>('');
  isPro = signal(false);

  constructor() {
    // Initialisation avec un formulaire vide, sera configuré dans ngOnInit
    this.nameForm = this.fb.group({});
  }

  ngOnInit(): void {
    const email = this.authStateService.getCurrentEmail();
    const isPro = this.authStateService.getIsPro();
    
    if (!email) {
      console.warn('⚠️ Pas d\'email en mémoire, redirection vers /connexion');
      this.router.navigate([isPro ? '/connexion-pro' : '/connexion']);
      return;
    }

    this.isPro.set(isPro);

    // Configurer le formulaire en fonction du mode
    if (isPro) {
      this.nameForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]]
      });
    } else {
      this.nameForm = this.fb.group({
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]]
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.nameForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  goBack(): void {
    const basePath = this.isPro() ? '/connexion-pro' : '/connexion';
    this.router.navigate([`${basePath}/verification`]);
  }

  goNext(): void {
    if (!this.nameForm.valid) {
      Object.keys(this.nameForm.controls).forEach(key => {
        this.nameForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    
    const isPro = this.isPro();
    let payload: any;

    if (isPro) {
      const { name } = this.nameForm.value;
      payload = { name: name.trim() };
      console.log('🏢 Sauvegarde du nom d\'établissement');
      console.log('📦 Nom:', name);
    } else {
      const { firstName, lastName } = this.nameForm.value;
      payload = { 
        first_name: firstName.trim(), 
        last_name: lastName.trim() 
      };
      console.log('👤 Sauvegarde des informations utilisateur');
      console.log('📦 Prénom:', firstName);
      console.log('📦 Nom:', lastName);
    }
    
    this.authService.saveUserInfo(payload, isPro).subscribe({
      next: (response) => {
        console.log('✅ Informations sauvegardées:', response);
        this.isSubmitting.set(false);
        
        if (response.success) {
          const basePath = isPro ? '/connexion-pro' : '/connexion';
          console.log(`🔐 Redirection vers ${basePath}/mdp`);
          this.router.navigate([`${basePath}/mdp`]);
        } else {
          this.errorMessage.set(response.message || 'Erreur lors de la sauvegarde');
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('❌ Erreur lors de la sauvegarde:', error);
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