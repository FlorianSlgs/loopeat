import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProBorrowService, BoxInventoryResponse, MonthlyHistoryResponse } from './pro-borrow.service';
import { environment } from '../../../../../../environments/environment';
import {
  CreateProposalRequest,
  CreateProposalResponse,
  ProBorrowProposalGroup,
  ProProposalDetails,
  BatchProposalsResponse
} from '../../models/pro-borrow.model';

describe('ProBorrowService', () => {
  let service: ProBorrowService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/borrow`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProBorrowService]
    });

    service = TestBed.inject(ProBorrowService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('createProposal', () => {
    it('devrait créer une proposition d\'emprunt', (done) => {
      const mockRequest: CreateProposalRequest = {
        userCode: 'USER123',
        items: [
          { type: 1, number: 2 },
          { type: 2, number: 1 }
        ]
      };

      const mockResponse: CreateProposalResponse = {
        success: true,
        message: 'Propositions créées',
        batchId: 'batch-123',
        proposals: [
          {
            id: 'prop-1',
            type: 1,
            number: 2,
            created: '2024-01-01T10:00:00Z',
            batchId: 'batch-123',
            expiresIn: 300
          },
          {
            id: 'prop-2',
            type: 2,
            number: 1,
            created: '2024-01-01T10:00:00Z',
            batchId: 'batch-123',
            expiresIn: 300
          }
        ],
        user: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com'
        }
      };

      service.createProposal(mockRequest).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.proposals.length).toBe(2);
        expect(response.batchId).toBe('batch-123');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/propose`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRequest);
      expect(req.request.withCredentials).toBe(true);
      req.flush(mockResponse);
    });

    it('devrait gérer les erreurs lors de la création', (done) => {
      const mockRequest: CreateProposalRequest = {
        userCode: 'INVALID',
        items: []
      };

      service.createProposal(mockRequest).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/propose`);
      req.flush({ message: 'Code utilisateur invalide' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('getProposal', () => {
    it('devrait récupérer une proposition par ID', (done) => {
      const proposalId = 'prop-123';
      const mockResponse = {
        success: true,
        proposal: {
          id: proposalId,
          type: 1,
          number: 2,
          accepted: null,
          borrowed: null,
          created: '2024-01-01T10:00:00Z',
          timeRemaining: 250,
          user: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com'
          },
          pro: {
            name: 'Restaurant ABC',
            email: 'pro@example.com'
          }
        }
      };

      service.getProposal(proposalId).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.proposal?.id).toBe(proposalId);
        expect(response.proposal?.user.firstName).toBe('John');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/proposal/${proposalId}`);
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBe(true);
      req.flush(mockResponse);
    });

    it('devrait gérer une proposition non trouvée', (done) => {
      const proposalId = 'invalid-id';

      service.getProposal(proposalId).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/proposal/${proposalId}`);
      req.flush({ message: 'Proposition non trouvée' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getBatchProposals', () => {
    it('devrait récupérer toutes les propositions d\'un batch', (done) => {
      const batchId = 'batch-123';
      const mockResponse: BatchProposalsResponse = {
        success: true,
        batchId,
        proposals: [
          {
            id: 'prop-1',
            type: 1,
            number: 2,
            accepted: null,
            borrowed: null,
            created: '2024-01-01T10:00:00Z',
            status: 'pending',
            timeRemaining: 250,
            batchId
          },
          {
            id: 'prop-2',
            type: 2,
            number: 1,
            accepted: null,
            borrowed: null,
            created: '2024-01-01T10:00:00Z',
            status: 'pending',
            timeRemaining: 250,
            batchId
          }
        ],
        user: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com'
        },
        pro: {
          name: 'Restaurant ABC',
          email: 'pro@example.com'
        }
      };

      service.getBatchProposals(batchId).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.batchId).toBe(batchId);
        expect(response.proposals.length).toBe(2);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/batch/${batchId}`);
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBe(true);
      req.flush(mockResponse);
    });
  });

  describe('getMyProposals', () => {
    it('devrait récupérer toutes les propositions actives du pro', (done) => {
      const mockResponse = {
        success: true,
        proposals: [
          {
            userId: 'user-1',
            firstName: 'John',
            lastName: 'Doe',
            userEmail: 'john@example.com',
            items: [
              {
                id: 'prop-1',
                type: 1,
                number: 2,
                accepted: null,
                borrowed: null,
                created: '2024-01-01T10:00:00Z',
                status: 'pending' as const,
                timeRemaining: 250
              }
            ]
          },
          {
            userId: 'user-2',
            firstName: 'Jane',
            lastName: 'Smith',
            userEmail: 'jane@example.com',
            items: [
              {
                id: 'prop-2',
                type: 2,
                number: 1,
                accepted: true,
                borrowed: '2024-01-01T11:00:00Z',
                created: '2024-01-01T10:00:00Z',
                status: 'accepted' as const,
                timeRemaining: 0
              }
            ]
          }
        ]
      };

      service.getMyProposals().subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.proposals?.length).toBe(2);
        expect(response.proposals?.[0].items.length).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/my-proposals`);
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBe(true);
      req.flush(mockResponse);
    });

    it('devrait retourner une liste vide si aucune proposition', (done) => {
      const mockResponse = {
        success: true,
        proposals: []
      };

      service.getMyProposals().subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.proposals?.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/my-proposals`);
      req.flush(mockResponse);
    });
  });

  describe('cancelProposal', () => {
    it('devrait annuler une proposition', (done) => {
      const proposalId = 'prop-123';
      const mockResponse = {
        success: true,
        proposal: {
          id: proposalId,
          accepted: false
        }
      };

      service.cancelProposal(proposalId).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.proposal?.id).toBe(proposalId);
        expect(response.proposal?.accepted).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/cancel/${proposalId}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      expect(req.request.withCredentials).toBe(true);
      req.flush(mockResponse);
    });

    it('devrait gérer l\'erreur si la proposition ne peut pas être annulée', (done) => {
      const proposalId = 'prop-123';

      service.cancelProposal(proposalId).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/cancel/${proposalId}`);
      req.flush({ message: 'Proposition déjà acceptée' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('getInventory', () => {
    it('devrait récupérer l\'inventaire des boîtes', (done) => {
      const mockResponse: BoxInventoryResponse = {
        success: true,
        inventory: [
          {
            type: 1,
            label: 'Petite boîte',
            clean: 10,
            dirty: 5,
            total: 15
          },
          {
            type: 2,
            label: 'Moyenne boîte',
            clean: 8,
            dirty: 3,
            total: 11
          },
          {
            type: 3,
            label: 'Grande boîte',
            clean: 6,
            dirty: 2,
            total: 8
          }
        ],
        totals: {
          totalClean: 24,
          totalDirty: 10,
          totalBoxes: 34
        }
      };

      service.getInventory().subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.inventory.length).toBe(3);
        expect(response.totals.totalBoxes).toBe(34);
        expect(response.totals.totalClean).toBe(24);
        expect(response.totals.totalDirty).toBe(10);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/inventory`);
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBe(true);
      req.flush(mockResponse);
    });

    it('devrait retourner un inventaire vide si aucune boîte', (done) => {
      const mockResponse: BoxInventoryResponse = {
        success: true,
        inventory: [],
        totals: {
          totalClean: 0,
          totalDirty: 0,
          totalBoxes: 0
        }
      };

      service.getInventory().subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.inventory.length).toBe(0);
        expect(response.totals.totalBoxes).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/inventory`);
      req.flush(mockResponse);
    });
  });

  describe('getMonthlyHistory', () => {
    it('devrait récupérer l\'historique mensuel avec limite par défaut', (done) => {
      const mockResponse: MonthlyHistoryResponse = {
        success: true,
        history: [
          {
            id: 'hist-1',
            month: '2024-01',
            numberOfBoxes: 150,
            created: '2024-01-01T00:00:00Z',
            lastUpdate: '2024-01-31T23:59:59Z'
          },
          {
            id: 'hist-2',
            month: '2024-02',
            numberOfBoxes: 180,
            created: '2024-02-01T00:00:00Z',
            lastUpdate: '2024-02-29T23:59:59Z'
          }
        ]
      };

      service.getMonthlyHistory().subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.history.length).toBe(2);
        expect(response.history[0].numberOfBoxes).toBe(150);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/monthly-history?limit=12`);
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBe(true);
      req.flush(mockResponse);
    });

    it('devrait récupérer l\'historique mensuel avec limite personnalisée', (done) => {
      const limit = 6;
      const mockResponse: MonthlyHistoryResponse = {
        success: true,
        history: [
          {
            id: 'hist-1',
            month: '2024-01',
            numberOfBoxes: 150,
            created: '2024-01-01T00:00:00Z',
            lastUpdate: '2024-01-31T23:59:59Z'
          }
        ]
      };

      service.getMonthlyHistory(limit).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.history.length).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/monthly-history?limit=${limit}`);
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBe(true);
      req.flush(mockResponse);
    });

    it('devrait retourner un historique vide si aucune donnée', (done) => {
      const mockResponse: MonthlyHistoryResponse = {
        success: true,
        history: []
      };

      service.getMonthlyHistory().subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.history.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/monthly-history?limit=12`);
      req.flush(mockResponse);
    });
  });
});
