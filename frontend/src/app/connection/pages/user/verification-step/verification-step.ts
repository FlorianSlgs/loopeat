import { Component } from '@angular/core';
import { Header } from '../../features/header/header';

@Component({
  selector: 'app-verification-step',
  imports: [Header],
  templateUrl: './verification-step.html',
  styleUrl: './verification-step.css'
})
export class VerificationStep {
  code: string[] = ['', '', '', ''];

  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Garde seulement le dernier caractère si plusieurs sont entrés
    if (value.length > 1) {
      input.value = value.slice(-1);
    }

    this.code[index] = input.value;

    // Passe à la case suivante si un chiffre a été entré
    if (input.value && index < 3) {
      const nextInput = input.nextElementSibling as HTMLInputElement;
      nextInput?.focus();
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

  resendCode(): void {
    console.log('Code renvoyé');
  }

  goBack(): void {
    console.log('Retour');
  }

  goNext(): void {
    const fullCode = this.code.join('');
    console.log('Code saisi :', fullCode);
  }
}