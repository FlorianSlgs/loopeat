import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { of, throwError } from 'rxjs';
import { AuthInitService } from './auth-init.service';
import { Auth } from '../auth/auth.service';
import { AuthStateService } from '../auth-state/auth-state.service';

describe('AuthInitService', () => {
  let service: AuthInitService;
  let authService: jest.Mocked<Auth>;
  let authStateService: jest.Mocked<AuthStateService>;
  let router: jest.Mocked<Router>;

  const createService = (platformId: any) => {
    authService = {
      getCurrentUser: jest.fn(),
      logout: jest.fn()
    } as any;

    authStateService = {
      setUser: jest.fn(),
      clearState: jest.fn(),
      getCurrentUser: jest.fn()
    } as any;

    router = {
      navigate: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        AuthInitService,
        { provide: Auth, useValue: authService },
        { provide: AuthStateService, useValue: authStateService },
        { provide: Router, useValue: router },
        { provide: PLATFORM_ID, useValue: platformId }
      ]
    });

    return TestBed.inject(AuthInitService);
  };

  describe('initializeAuth - Browser', () => {
    beforeEach(() => {
      service = createService('browser');
    });

    it('devrait initialiser l\'authentification avec un utilisateur valide', async () => {
      const mockUser = { id: 1, email: 'user@test.com' };
      const mockResponse = { success: true, user: mockUser };
      authService.getCurrentUser.mockReturnValue(of(mockResponse) as any);

      await service.initializeAuth();

      expect(authService.getCurrentUser).toHaveBeenCalled();
      expect(authStateService.setUser).toHaveBeenCalledWith(mockUser);
    });

    it('devrait gérer l\'absence d\'utilisateur authentifié', async () => {
      const mockResponse = { success: false, user: null };
      authService.getCurrentUser.mockReturnValue(of(mockResponse) as any);

      await service.initializeAuth();

      expect(authService.getCurrentUser).toHaveBeenCalled();
      expect(authStateService.setUser).not.toHaveBeenCalled();
    });

    it('devrait gérer les erreurs API sans crash', async () => {
      authService.getCurrentUser.mockReturnValue(throwError(() => new Error('API error')) as any);

      await expect(service.initializeAuth()).resolves.not.toThrow();
      expect(authService.getCurrentUser).toHaveBeenCalled();
      expect(authStateService.setUser).not.toHaveBeenCalled();
    });

    it('ne devrait pas réinitialiser si déjà initialisé', async () => {
      const mockResponse = { success: true, user: { id: 1 } };
      authService.getCurrentUser.mockReturnValue(of(mockResponse) as any);

      await service.initializeAuth();
      await service.initializeAuth();

      expect(authService.getCurrentUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('initializeAuth - SSR', () => {
    beforeEach(() => {
      service = createService('server');
    });

    it('devrait skip l\'initialisation côté serveur', async () => {
      await service.initializeAuth();

      expect(authService.getCurrentUser).not.toHaveBeenCalled();
      expect(authStateService.setUser).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      service = createService('browser');
    });

    it('devrait déconnecter et rediriger vers /connexion', async () => {
      authService.logout.mockReturnValue(of({ success: true, message: 'Déconnecté' }) as any);

      await service.logout();

      expect(authService.logout).toHaveBeenCalled();
      expect(authStateService.clearState).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/connexion']);
    });

    it('devrait nettoyer l\'état même en cas d\'erreur', async () => {
      authService.logout.mockReturnValue(throwError(() => new Error('Logout failed')) as any);

      await service.logout();

      expect(authService.logout).toHaveBeenCalled();
      expect(authStateService.clearState).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/connexion']);
    });
  });

  describe('isAuthenticated', () => {
    beforeEach(() => {
      service = createService('browser');
    });

    it('devrait retourner true si utilisateur authentifié', () => {
      authStateService.getCurrentUser.mockReturnValue(() => ({ id: 1 }));

      expect(service.isAuthenticated()).toBe(true);
    });

    it('devrait retourner false si pas d\'utilisateur', () => {
      authStateService.getCurrentUser.mockReturnValue(() => null);

      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    beforeEach(() => {
      service = createService('browser');
    });

    it('devrait retourner le signal utilisateur', () => {
      const mockUserSignal = () => ({ id: 1, email: 'user@test.com' });
      authStateService.getCurrentUser.mockReturnValue(mockUserSignal as any);

      const result = service.getCurrentUser();

      expect(result).toBe(mockUserSignal);
    });
  });
});
