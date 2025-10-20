import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private currentEmail = signal<string>('');
  private userExists = signal<boolean>(false);
  private requiresPassword = signal<boolean>(false);
  private requiresVerification = signal<boolean>(false);
  private firstName = signal<string>('');
  private lastName = signal<string>('');
  private isPro = signal<boolean>(false);
  private currentUser = signal<any>(null);

  // Getters en lecture seule
  getCurrentEmail = this.currentEmail.asReadonly();
  getUserExists = this.userExists.asReadonly();
  getRequiresPassword = this.requiresPassword.asReadonly();
  getRequiresVerification = this.requiresVerification.asReadonly();
  getFirstName = this.firstName.asReadonly();
  getLastName = this.lastName.asReadonly();
  getIsPro = this.isPro.asReadonly();
  getCurrentUser = this.currentUser.asReadonly();

  setEmailCheckResult(
    email: string, 
    exists: boolean, 
    requiresPassword: boolean, 
    requiresVerification: boolean,
    isPro: boolean = false
  ) {
    this.currentEmail.set(email);
    this.userExists.set(exists);
    this.requiresPassword.set(requiresPassword);
    this.requiresVerification.set(requiresVerification);
    this.isPro.set(isPro);
  }

  setUserNames(firstName: string, lastName: string) {
    this.firstName.set(firstName);
    this.lastName.set(lastName);
  }

  setUser(user: any) {
    this.currentUser.set(user);
    if (user) {
      this.currentEmail.set(user.email || '');
      this.isPro.set(user.isPro || false);
      if (user.firstName) {
        this.firstName.set(user.firstName);
      }
      if (user.lastName) {
        this.lastName.set(user.lastName);
      }
    }
  }

  clearState() {
    this.currentEmail.set('');
    this.userExists.set(false);
    this.requiresPassword.set(false);
    this.requiresVerification.set(false);
    this.firstName.set('');
    this.lastName.set('');
    this.isPro.set(false);
    this.currentUser.set(null);
  }
}