import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PaymentService } from './payment';
import { environment } from '../../../../../../environments/environment';
import {
  RechargeResponse,
  SessionDetails,
  BalanceResponse,
  BalanceHistoryResponse,
  BalanceHistoryItem
} from '../../models/payment.model';

describe('PaymentService', () => {
  let service: PaymentService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/payment`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PaymentService]
    });

    service = TestBed.inject(PaymentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('createRechargeSession', () => {
    it('devrait créer une session de rechargement avec le montant spécifié', (done) => {
      const amount = 2000; // 20.00 EUR en centimes
      const mockResponse: RechargeResponse = {
        success: true,
        url: 'https://checkout.stripe.com/pay/cs_test_123',
        sessionId: 'cs_test_123'
      };

      service.createRechargeSession(amount).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.success).toBe(true);
        expect(response.sessionId).toBe('cs_test_123');
        expect(response.url).toContain('checkout.stripe.com');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/create-recharge-session`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ amount });
      expect(req.request.withCredentials).toBe(true);
      req.flush(mockResponse);
    });

    it('devrait gérer différents montants de rechargement', (done) => {
      const amount = 5000; // 50.00 EUR
      const mockResponse: RechargeResponse = {
        success: true,
        url: 'https://checkout.stripe.com/pay/cs_test_456',
        sessionId: 'cs_test_456'
      };

      service.createRechargeSession(amount).subscribe(response => {
        expect(response.sessionId).toBe('cs_test_456');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/create-recharge-session`);
      expect(req.request.body.amount).toBe(5000);
      req.flush(mockResponse);
    });

    it('devrait gérer les erreurs lors de la création de session', (done) => {
      const amount = 100; // Montant trop faible

      service.createRechargeSession(amount).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/create-recharge-session`);
      req.flush(
        { message: 'Montant minimum: 5.00 EUR' },
        { status: 400, statusText: 'Bad Request' }
      );
    });

    it('devrait gérer les erreurs serveur lors de la création', (done) => {
      const amount = 2000;

      service.createRechargeSession(amount).subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/create-recharge-session`);
      req.flush(
        { message: 'Erreur Stripe' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });
  });

  describe('verifySession', () => {
    it('devrait vérifier une session de paiement réussie', (done) => {
      const sessionId = 'cs_test_123';
      const mockResponse: SessionDetails = {
        success: true,
        session: {
          id: sessionId,
          status: 'complete',
          amount: 2000,
          currency: 'eur'
        }
      };

      service.verifySession(sessionId).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.session.id).toBe(sessionId);
        expect(response.session.status).toBe('complete');
        expect(response.session.amount).toBe(2000);
        expect(response.session.currency).toBe('eur');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/verify-session/${sessionId}`);
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBe(true);
      req.flush(mockResponse);
    });

    it('devrait gérer une session en attente', (done) => {
      const sessionId = 'cs_test_456';
      const mockResponse: SessionDetails = {
        success: true,
        session: {
          id: sessionId,
          status: 'open',
          amount: 5000,
          currency: 'eur'
        }
      };

      service.verifySession(sessionId).subscribe(response => {
        expect(response.session.status).toBe('open');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/verify-session/${sessionId}`);
      req.flush(mockResponse);
    });

    it('devrait gérer une session expirée', (done) => {
      const sessionId = 'cs_test_789';
      const mockResponse: SessionDetails = {
        success: true,
        session: {
          id: sessionId,
          status: 'expired',
          amount: 2000,
          currency: 'eur'
        }
      };

      service.verifySession(sessionId).subscribe(response => {
        expect(response.session.status).toBe('expired');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/verify-session/${sessionId}`);
      req.flush(mockResponse);
    });

    it('devrait gérer une session introuvable', (done) => {
      const sessionId = 'invalid_session';

      service.verifySession(sessionId).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/verify-session/${sessionId}`);
      req.flush(
        { message: 'Session non trouvée' },
        { status: 404, statusText: 'Not Found' }
      );
    });
  });

  describe('getUserBalance', () => {
    it('devrait récupérer le solde de l\'utilisateur', (done) => {
      const mockResponse: BalanceResponse = {
        success: true,
        balance: 1550 // 15.50 EUR en centimes
      };

      service.getUserBalance().subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.balance).toBe(1550);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/balance`);
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBe(true);
      req.flush(mockResponse);
    });

    it('devrait retourner un solde de zéro pour un nouvel utilisateur', (done) => {
      const mockResponse: BalanceResponse = {
        success: true,
        balance: 0
      };

      service.getUserBalance().subscribe(response => {
        expect(response.balance).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/balance`);
      req.flush(mockResponse);
    });

    it('devrait gérer les soldes élevés', (done) => {
      const mockResponse: BalanceResponse = {
        success: true,
        balance: 50000 // 500.00 EUR
      };

      service.getUserBalance().subscribe(response => {
        expect(response.balance).toBe(50000);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/balance`);
      req.flush(mockResponse);
    });

    it('devrait gérer l\'erreur si l\'utilisateur n\'est pas authentifié', (done) => {
      service.getUserBalance().subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/balance`);
      req.flush(
        { message: 'Non authentifié' },
        { status: 401, statusText: 'Unauthorized' }
      );
    });
  });

  describe('getBalanceHistory', () => {
    it('devrait récupérer l\'historique du solde avec limite par défaut', (done) => {
      const mockHistory: BalanceHistoryItem[] = [
        {
          id: 1,
          add: 2000,
          subtract: null,
          title: 'Rechargement Stripe',
          created: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          add: null,
          subtract: 500,
          title: 'Emprunt de boîte #123',
          created: '2024-01-15T12:30:00Z'
        },
        {
          id: 3,
          add: 5000,
          subtract: null,
          title: 'Rechargement Stripe',
          created: '2024-01-16T09:00:00Z'
        }
      ];

      const mockResponse: BalanceHistoryResponse = {
        success: true,
        history: mockHistory
      };

      service.getBalanceHistory().subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.history.length).toBe(3);
        expect(response.history[0].add).toBe(2000);
        expect(response.history[1].subtract).toBe(500);
        expect(response.history[2].title).toBe('Rechargement Stripe');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/history?limit=50`);
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBe(true);
      req.flush(mockResponse);
    });

    it('devrait récupérer l\'historique avec limite personnalisée', (done) => {
      const limit = 10;
      const mockResponse: BalanceHistoryResponse = {
        success: true,
        history: [
          {
            id: 1,
            add: 2000,
            subtract: null,
            title: 'Rechargement',
            created: '2024-01-15T10:00:00Z'
          }
        ]
      };

      service.getBalanceHistory(limit).subscribe(response => {
        expect(response.history.length).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/history?limit=${limit}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('devrait retourner un historique vide pour un nouvel utilisateur', (done) => {
      const mockResponse: BalanceHistoryResponse = {
        success: true,
        history: []
      };

      service.getBalanceHistory().subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.history.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/history?limit=50`);
      req.flush(mockResponse);
    });

    it('devrait gérer un historique avec uniquement des ajouts', (done) => {
      const mockHistory: BalanceHistoryItem[] = [
        {
          id: 1,
          add: 2000,
          subtract: null,
          title: 'Rechargement 1',
          created: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          add: 3000,
          subtract: null,
          title: 'Rechargement 2',
          created: '2024-01-16T10:00:00Z'
        }
      ];

      const mockResponse: BalanceHistoryResponse = {
        success: true,
        history: mockHistory
      };

      service.getBalanceHistory(20).subscribe(response => {
        expect(response.history.every(item => item.add !== null && item.subtract === null)).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/history?limit=20`);
      req.flush(mockResponse);
    });

    it('devrait gérer un historique avec uniquement des retraits', (done) => {
      const mockHistory: BalanceHistoryItem[] = [
        {
          id: 1,
          add: null,
          subtract: 500,
          title: 'Emprunt #1',
          created: '2024-01-15T12:00:00Z'
        },
        {
          id: 2,
          add: null,
          subtract: 300,
          title: 'Emprunt #2',
          created: '2024-01-16T12:00:00Z'
        }
      ];

      const mockResponse: BalanceHistoryResponse = {
        success: true,
        history: mockHistory
      };

      service.getBalanceHistory(20).subscribe(response => {
        expect(response.history.every(item => item.subtract !== null && item.add === null)).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/history?limit=20`);
      req.flush(mockResponse);
    });

    it('devrait gérer un historique mixte (ajouts et retraits)', (done) => {
      const mockHistory: BalanceHistoryItem[] = [
        {
          id: 1,
          add: 2000,
          subtract: null,
          title: 'Rechargement',
          created: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          add: null,
          subtract: 500,
          title: 'Emprunt',
          created: '2024-01-15T12:00:00Z'
        },
        {
          id: 3,
          add: 3000,
          subtract: null,
          title: 'Rechargement',
          created: '2024-01-16T10:00:00Z'
        }
      ];

      const mockResponse: BalanceHistoryResponse = {
        success: true,
        history: mockHistory
      };

      service.getBalanceHistory().subscribe(response => {
        const hasAdditions = response.history.some(item => item.add !== null);
        const hasSubtractions = response.history.some(item => item.subtract !== null);
        expect(hasAdditions).toBe(true);
        expect(hasSubtractions).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/history?limit=50`);
      req.flush(mockResponse);
    });

    it('devrait gérer les erreurs lors de la récupération de l\'historique', (done) => {
      service.getBalanceHistory().subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/history?limit=50`);
      req.flush(
        { message: 'Erreur serveur' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });
  });

  describe('Edge cases', () => {
    it('devrait gérer les montants de rechargement à zéro', (done) => {
      const amount = 0;

      service.createRechargeSession(amount).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/create-recharge-session`);
      req.flush(
        { message: 'Montant invalide' },
        { status: 400, statusText: 'Bad Request' }
      );
    });

    it('devrait gérer les montants négatifs', (done) => {
      const amount = -1000;

      service.createRechargeSession(amount).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/create-recharge-session`);
      req.flush(
        { message: 'Montant invalide' },
        { status: 400, statusText: 'Bad Request' }
      );
    });

    it('devrait gérer des limites d\'historique invalides', (done) => {
      const limit = -1;
      const mockResponse: BalanceHistoryResponse = {
        success: true,
        history: []
      };

      service.getBalanceHistory(limit).subscribe(response => {
        expect(response.history).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/history?limit=${limit}`);
      req.flush(mockResponse);
    });
  });
});
