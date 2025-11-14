import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Auth } from './auth.service';
import { environment } from '../../../../../../environments/environment';

describe('Auth Service', () => {
  let service: Auth;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Auth]
    });

    service = TestBed.inject(Auth);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('checkEmail', () => {
    it('devrait vérifier un email utilisateur', (done) => {
      const mockResponse = { success: true, exists: true, requiresPassword: true };
      const email = 'user@test.com';

      service.checkEmail(email).subscribe(response => {
        expect(response).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/check-email`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: email.trim(), isPro: false });
      expect(req.request.withCredentials).toBe(true);
      req.flush(mockResponse);
    });

    it('devrait vérifier un email pro', (done) => {
      const mockResponse = { success: true, exists: false, requiresVerification: true };
      const email = 'pro@test.com';

      service.checkEmail(email, true).subscribe(response => {
        expect(response).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/check-email`);
      expect(req.request.body).toEqual({ email: email.trim(), isPro: true });
      req.flush(mockResponse);
    });
  });

  describe('verifyCode', () => {
    it('devrait vérifier un code de validation', (done) => {
      const mockResponse = { success: true, message: 'Code vérifié' };
      const email = 'user@test.com';
      const code = '1234';

      service.verifyCode(email, code).subscribe(response => {
        expect(response).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/verify-code`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: email.trim(), code, isPro: false });
      expect(req.request.withCredentials).toBe(true);
      req.flush(mockResponse);
    });
  });

  describe('setPassword', () => {
    it('devrait définir un mot de passe utilisateur', (done) => {
      const mockResponse = { success: true, message: 'Mot de passe défini', user: { id: 1 } };
      const password = 'SecurePass123!';

      service.setPassword(password).subscribe(response => {
        expect(response).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/set-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ password, isPro: false });
      expect(req.request.withCredentials).toBe(true);
      req.flush(mockResponse);
    });
  });

  describe('loginWithPassword', () => {
    it('devrait se connecter avec mot de passe', (done) => {
      const mockResponse = { success: true, user: { id: 1, email: 'user@test.com' } };
      const password = 'SecurePass123!';

      service.loginWithPassword(password).subscribe(response => {
        expect(response).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/login-with-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ password, isPro: false });
      expect(req.request.withCredentials).toBe(true);
      req.flush(mockResponse);
    });
  });

  describe('saveUserInfo', () => {
    it('devrait sauvegarder les informations utilisateur', (done) => {
      const mockResponse = { success: true, message: 'Informations sauvegardées' };
      const payload = { firstName: 'John', lastName: 'Doe' };

      service.saveUserInfo(payload).subscribe(response => {
        expect(response).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/save-user-info`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ ...payload, isPro: false });
      expect(req.request.withCredentials).toBe(true);
      req.flush(mockResponse);
    });
  });

  describe('getCurrentUser', () => {
    it('devrait récupérer l\'utilisateur actuel', (done) => {
      const mockResponse = { success: true, user: { id: 1, email: 'user@test.com' } };

      service.getCurrentUser().subscribe(response => {
        expect(response).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/me`);
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBe(true);
      req.flush(mockResponse);
    });

    it('devrait gérer l\'erreur si non authentifié', (done) => {
      service.getCurrentUser().subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/me`);
      req.flush({ message: 'Non authentifié' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    it('devrait déconnecter l\'utilisateur', (done) => {
      const mockResponse = { success: true, message: 'Déconnecté' };

      service.logout().subscribe(response => {
        expect(response).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/logout`);
      expect(req.request.method).toBe('POST');
      expect(req.request.withCredentials).toBe(true);
      req.flush(mockResponse);
    });
  });
});
