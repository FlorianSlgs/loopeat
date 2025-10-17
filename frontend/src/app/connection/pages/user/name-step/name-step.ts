import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Header } from '../../features/header/header';

@Component({
  selector: 'app-name-step',
  standalone: true,
  imports: [ReactiveFormsModule, Header],
  templateUrl: './name-step.html',
  styleUrl: './name-step.css'
})
export class NameStep {
  nameForm: FormGroup;
  isSubmitting = signal(false);

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.nameForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.nameForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  goBack(): void {
    // Navigation vers l'étape précédente
    this.router.navigate(['/verification']); // Ajustez selon votre routing
  }

  goNext(): void {
    if (this.nameForm.valid) {
      this.isSubmitting.set(true);
      
      // Récupérer les valeurs
      const { firstName, lastName } = this.nameForm.value;
      
      // TODO: Enregistrer les données (service, API, etc.)
      console.log('Nom:', lastName);
      console.log('Prénom:', firstName);
      
      // Simuler un délai de traitement
      setTimeout(() => {
        this.isSubmitting.set(false);
        // Navigation vers l'étape suivante
        this.router.navigate(['/next-step']); // Ajustez selon votre routing
      }, 500);
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.nameForm.controls).forEach(key => {
        this.nameForm.get(key)?.markAsTouched();
      });
    }
  }
}