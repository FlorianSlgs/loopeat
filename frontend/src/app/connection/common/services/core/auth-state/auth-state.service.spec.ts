import { TestBed } from '@angular/core/testing';
import { AuthStateService } from './auth-state.service';

describe('AuthStateService', () => {
  let service: AuthStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthStateService]
    });
    service = TestBed.inject(AuthStateService);
  });

  describe('setEmailCheckResult', () => {
    it('devrait mettre � jour tous les signaux d\'email check', () => {
      service.setEmailCheckResult('user@test.com', true, true, false, false);

      expect(service.getCurrentEmail()).toBe('user@test.com');
      expect(service.getUserExists()).toBe(true);
      expect(service.getRequiresPassword()).toBe(true);
      expect(service.getRequiresVerification()).toBe(false);
      expect(service.getIsPro()).toBe(false);
    });

    it('devrait g�rer le mode pro', () => {
      service.setEmailCheckResult('pro@test.com', false, false, true, true);

      expect(service.getCurrentEmail()).toBe('pro@test.com');
      expect(service.getUserExists()).toBe(false);
      expect(service.getRequiresPassword()).toBe(false);
      expect(service.getRequiresVerification()).toBe(true);
      expect(service.getIsPro()).toBe(true);
    });
  });

  describe('setUserNames', () => {
    it('devrait d�finir le pr�nom et nom', () => {
      service.setUserNames('John', 'Doe');

      expect(service.getFirstName()).toBe('John');
      expect(service.getLastName()).toBe('Doe');
    });
  });

  describe('setUser', () => {
    it('devrait d�finir l\'utilisateur complet', () => {
      const user = {
        id: 1,
        email: 'user@test.com',
        firstName: 'John',
        lastName: 'Doe',
        isPro: false
      };

      service.setUser(user);

      expect(service.getCurrentUser()).toEqual(user);
      expect(service.getCurrentEmail()).toBe('user@test.com');
      expect(service.getFirstName()).toBe('John');
      expect(service.getLastName()).toBe('Doe');
      expect(service.getIsPro()).toBe(false);
    });

    it('devrait g�rer un utilisateur sans firstName/lastName', () => {
      const user = { id: 1, email: 'user@test.com', isPro: true };

      service.setUser(user);

      expect(service.getCurrentUser()).toEqual(user);
      expect(service.getCurrentEmail()).toBe('user@test.com');
      expect(service.getIsPro()).toBe(true);
    });

    it('devrait g�rer isPro undefined comme false', () => {
      const user = { id: 1, email: 'user@test.com' };

      service.setUser(user);

      expect(service.getIsPro()).toBe(false);
    });

    it('devrait mettre email vide si user.email est undefined', () => {
      const user = { id: 1 };

      service.setUser(user);

      expect(service.getCurrentEmail()).toBe('');
    });
  });

  describe('clearState', () => {
    it('devrait r�initialiser tous les signaux', () => {
      service.setEmailCheckResult('user@test.com', true, true, false, false);
      service.setUserNames('John', 'Doe');
      service.setUser({ id: 1, email: 'user@test.com' });

      service.clearState();

      expect(service.getCurrentEmail()).toBe('');
      expect(service.getUserExists()).toBe(false);
      expect(service.getRequiresPassword()).toBe(false);
      expect(service.getRequiresVerification()).toBe(false);
      expect(service.getFirstName()).toBe('');
      expect(service.getLastName()).toBe('');
      expect(service.getIsPro()).toBe(false);
      expect(service.getCurrentUser()).toBeNull();
    });
  });
});
