import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Header } from '../../features/header/header';

@Component({
  selector: 'app-email-step',
  imports: [ReactiveFormsModule, Header],
  templateUrl: './email-step.html',
  styleUrl: './email-step.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailStep {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  
  isSubmitting = signal(false);
  submitAttempted = signal(false);
  
  // Formulaire simple avec Validators.email
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });
  
  // Simplified computed
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
      // État désactivé : gris, pas de pointer, opacité réduite
      return `${baseClasses} bg-gray-300 text-gray-500 cursor-not-allowed opacity-60`;
    }
    
    // État actif : noir, pointer au survol, effet hover
    return `${baseClasses} bg-black text-white cursor-pointer hover:bg-gray-800 active:scale-98`;
  }
  
  handleSubmit(): void {
    console.log('Submit clicked!');
    console.log('Form valid?', this.loginForm.valid);
    console.log('Form value:', this.loginForm.value);
    
    this.submitAttempted.set(true);
    
    if (this.loginForm.valid) {
      this.isSubmitting.set(true);
      const value = this.loginForm.get('email')?.value;
      
      setTimeout(() => {
        console.log('Valeur soumise:', value);
        this.isSubmitting.set(false);
      }, 1500);
    }
  }
}