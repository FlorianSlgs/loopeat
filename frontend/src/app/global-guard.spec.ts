import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { of, throwError } from 'rxjs';
import { globalGuard } from './global-guard';
import { Auth } from './connection/common/services/core/auth/auth.service';
import { AuthStateService } from './connection/common/services/core/auth-state/auth-state.service';

describe('globalGuard', () => {
  let authService: jest.Mocked<Auth>;
  let authStateService: jest.Mocked<AuthStateService>;
  let router: jest.Mocked<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    authService = {
      getCurrentUser: jest.fn()
    } as any;

    authStateService = {
      setUser: jest.fn()
    } as any;

    router = {
      navigate: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        { provide: Auth, useValue: authService },
        { provide: AuthStateService, useValue: authStateService },
        { provide: Router, useValue: router }
      ]
    });

    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = { url: '/utilisateurs' } as RouterStateSnapshot;
  });

  describe('Authentification réussie', () => {
    it('devrait autoriser un utilisateur normal sur /utilisateurs', (done) => {
      const mockUser = { id: 1, email: 'user@test.com', isPro: false, admin: false };
      authService.getCurrentUser.mockReturnValue(of({ success: true, user: mockUser }));
      mockState.url = '/utilisateurs';

      TestBed.runInInjectionContext(() => {
        const result = globalGuard(mockRoute, mockState);
        (result as any).subscribe((canActivate: boolean) => {
          expect(canActivate).toBe(true);
          expect(authStateService.setUser).toHaveBeenCalledWith(mockUser);
          expect(router.navigate).not.toHaveBeenCalled();
          done();
        });
      });
    });

    it('devrait autoriser un utilisateur pro sur /pro', (done) => {
      const mockUser = { id: 2, email: 'pro@test.com', isPro: true, admin: false };
      authService.getCurrentUser.mockReturnValue(of({ success: true, user: mockUser }));
      mockState.url = '/pro/dashboard';

      TestBed.runInInjectionContext(() => {
        const result = globalGuard(mockRoute, mockState);
        (result as any).subscribe((canActivate: boolean) => {
          expect(canActivate).toBe(true);
          expect(authStateService.setUser).toHaveBeenCalledWith(mockUser);
          expect(router.navigate).not.toHaveBeenCalled();
          done();
        });
      });
    });

    it('devrait autoriser un admin sur /admin', (done) => {
      const mockUser = { id: 3, email: 'admin@test.com', isPro: false, admin: true };
      authService.getCurrentUser.mockReturnValue(of({ success: true, user: mockUser }));
      mockState.url = '/admin';

      TestBed.runInInjectionContext(() => {
        const result = globalGuard(mockRoute, mockState);
        (result as any).subscribe((canActivate: boolean) => {
          expect(canActivate).toBe(true);
          expect(authStateService.setUser).toHaveBeenCalledWith(mockUser);
          expect(router.navigate).not.toHaveBeenCalled();
          done();
        });
      });
    });
  });

  describe('Restrictions d\'accès', () => {
    it('devrait bloquer un utilisateur normal accédant à /pro', (done) => {
      const mockUser = { id: 1, email: 'user@test.com', isPro: false, admin: false };
      authService.getCurrentUser.mockReturnValue(of({ success: true, user: mockUser }));
      mockState.url = '/pro/dashboard';

      TestBed.runInInjectionContext(() => {
        const result = globalGuard(mockRoute, mockState);
        (result as any).subscribe((canActivate: boolean) => {
          expect(canActivate).toBe(false);
          expect(authStateService.setUser).toHaveBeenCalledWith(mockUser);
          expect(router.navigate).toHaveBeenCalledWith(['/utilisateurs']);
          done();
        });
      });
    });

    it('devrait bloquer un utilisateur pro accédant à /utilisateurs', (done) => {
      const mockUser = { id: 2, email: 'pro@test.com', isPro: true, admin: false };
      authService.getCurrentUser.mockReturnValue(of({ success: true, user: mockUser }));
      mockState.url = '/utilisateurs/dashboard';

      TestBed.runInInjectionContext(() => {
        const result = globalGuard(mockRoute, mockState);
        (result as any).subscribe((canActivate: boolean) => {
          expect(canActivate).toBe(false);
          expect(authStateService.setUser).toHaveBeenCalledWith(mockUser);
          expect(router.navigate).toHaveBeenCalledWith(['/pro']);
          done();
        });
      });
    });

    it('devrait bloquer un utilisateur normal accédant à /admin et rediriger vers /utilisateurs', (done) => {
      const mockUser = { id: 1, email: 'user@test.com', isPro: false, admin: false };
      authService.getCurrentUser.mockReturnValue(of({ success: true, user: mockUser }));
      mockState.url = '/admin/test2';

      TestBed.runInInjectionContext(() => {
        const result = globalGuard(mockRoute, mockState);
        (result as any).subscribe((canActivate: boolean) => {
          expect(canActivate).toBe(false);
          expect(authStateService.setUser).toHaveBeenCalledWith(mockUser);
          expect(router.navigate).toHaveBeenCalledWith(['/utilisateurs']);
          done();
        });
      });
    });

    it('devrait bloquer un pro non-admin accédant à /admin et rediriger vers /pro', (done) => {
      const mockUser = { id: 2, email: 'pro@test.com', isPro: true, admin: false };
      authService.getCurrentUser.mockReturnValue(of({ success: true, user: mockUser }));
      mockState.url = '/admin/test2';

      TestBed.runInInjectionContext(() => {
        const result = globalGuard(mockRoute, mockState);
        (result as any).subscribe((canActivate: boolean) => {
          expect(canActivate).toBe(false);
          expect(authStateService.setUser).toHaveBeenCalledWith(mockUser);
          expect(router.navigate).toHaveBeenCalledWith(['/pro']);
          done();
        });
      });
    });
  });

  describe('Utilisateur non authentifié', () => {
    it('devrait rediriger vers /connexion si success est false', (done) => {
      authService.getCurrentUser.mockReturnValue(of({ success: false, user: null }));
      mockState.url = '/utilisateurs';

      TestBed.runInInjectionContext(() => {
        const result = globalGuard(mockRoute, mockState);
        (result as any).subscribe((canActivate: boolean) => {
          expect(canActivate).toBe(false);
          expect(authStateService.setUser).not.toHaveBeenCalled();
          expect(router.navigate).toHaveBeenCalledWith(['/connexion']);
          done();
        });
      });
    });

    it('devrait rediriger vers /connexion si user est null', (done) => {
      authService.getCurrentUser.mockReturnValue(of({ success: true, user: null }));
      mockState.url = '/utilisateurs';

      TestBed.runInInjectionContext(() => {
        const result = globalGuard(mockRoute, mockState);
        (result as any).subscribe((canActivate: boolean) => {
          expect(canActivate).toBe(false);
          expect(authStateService.setUser).not.toHaveBeenCalled();
          expect(router.navigate).toHaveBeenCalledWith(['/connexion']);
          done();
        });
      });
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait rediriger vers /connexion en cas d\'erreur API', (done) => {
      const error = new Error('Network error');
      authService.getCurrentUser.mockReturnValue(throwError(() => error));
      mockState.url = '/utilisateurs';

      TestBed.runInInjectionContext(() => {
        const result = globalGuard(mockRoute, mockState);
        (result as any).subscribe((canActivate: boolean) => {
          expect(canActivate).toBe(false);
          expect(authStateService.setUser).not.toHaveBeenCalled();
          expect(router.navigate).toHaveBeenCalledWith(['/connexion']);
          done();
        });
      });
    });

    it('devrait rediriger vers /connexion en cas d\'erreur 401', (done) => {
      const error = { status: 401, message: 'Unauthorized' };
      authService.getCurrentUser.mockReturnValue(throwError(() => error));
      mockState.url = '/pro';

      TestBed.runInInjectionContext(() => {
        const result = globalGuard(mockRoute, mockState);
        (result as any).subscribe((canActivate: boolean) => {
          expect(canActivate).toBe(false);
          expect(authStateService.setUser).not.toHaveBeenCalled();
          expect(router.navigate).toHaveBeenCalledWith(['/connexion']);
          done();
        });
      });
    });
  });

  describe('Cas limites', () => {
    it('devrait gérer isPro undefined comme false', (done) => {
      const mockUser = { id: 1, email: 'user@test.com', admin: false };
      authService.getCurrentUser.mockReturnValue(of({ success: true, user: mockUser }));
      mockState.url = '/utilisateurs';

      TestBed.runInInjectionContext(() => {
        const result = globalGuard(mockRoute, mockState);
        (result as any).subscribe((canActivate: boolean) => {
          expect(canActivate).toBe(true);
          expect(authStateService.setUser).toHaveBeenCalledWith(mockUser);
          done();
        });
      });
    });

    it('devrait bloquer isPro undefined essayant d\'accéder à /pro', (done) => {
      const mockUser = { id: 1, email: 'user@test.com', admin: false };
      authService.getCurrentUser.mockReturnValue(of({ success: true, user: mockUser }));
      mockState.url = '/pro/dashboard';

      TestBed.runInInjectionContext(() => {
        const result = globalGuard(mockRoute, mockState);
        (result as any).subscribe((canActivate: boolean) => {
          expect(canActivate).toBe(false);
          expect(router.navigate).toHaveBeenCalledWith(['/utilisateurs']);
          done();
        });
      });
    });

    it('devrait autoriser l\'accès à une route non protégée', (done) => {
      const mockUser = { id: 1, email: 'user@test.com', isPro: false, admin: false };
      authService.getCurrentUser.mockReturnValue(of({ success: true, user: mockUser }));
      mockState.url = '/autre-route';

      TestBed.runInInjectionContext(() => {
        const result = globalGuard(mockRoute, mockState);
        (result as any).subscribe((canActivate: boolean) => {
          expect(canActivate).toBe(true);
          expect(authStateService.setUser).toHaveBeenCalledWith(mockUser);
          expect(router.navigate).not.toHaveBeenCalled();
          done();
        });
      });
    });
  });
});
