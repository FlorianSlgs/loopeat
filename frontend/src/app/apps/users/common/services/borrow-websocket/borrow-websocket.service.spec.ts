import { TestBed } from '@angular/core/testing';
import { BorrowWebsocketService } from './borrow-websocket.service';
import { UserWebSocketEvent } from '../../models/borrow.model';

// Mock de socket.io-client
class MockSocket {
  private listeners: Map<string, ((data?: unknown) => void)[]> = new Map();
  connected = false;

  on(event: string, callback: (data?: unknown) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  emit(event: string, data?: unknown): void {
    // Simulate emit - no-op for testing
    console.log(`Emit: ${event}`, data);
  }

  disconnect(): void {
    this.connected = false;
    this.trigger('disconnect');
  }

  // Helper pour déclencher des événements dans les tests
  trigger(event: string, data?: unknown): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  // Helper pour simuler une connexion réussie
  simulateConnect(): void {
    this.connected = true;
    this.trigger('connect');
  }

  // Helper pour simuler une erreur de connexion
  simulateConnectError(error: Error): void {
    this.connected = false;
    this.trigger('connect_error', error);
  }
}

// Mock du module socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn()
}));

describe('BorrowWebsocketService', () => {
  let service: BorrowWebsocketService;
  let mockSocket: MockSocket;
  const { io } = require('socket.io-client');

  beforeEach(() => {
    // Créer un nouveau mock socket pour chaque test
    mockSocket = new MockSocket();
    io.mockReturnValue(mockSocket);

    TestBed.configureTestingModule({
      providers: [BorrowWebsocketService]
    });

    service = TestBed.inject(BorrowWebsocketService);
  });

  afterEach(() => {
    // Nettoyer les mocks
    jest.clearAllMocks();
  });

  describe('connect', () => {
    it('devrait se connecter au serveur WebSocket avec le bon token', () => {
      const authToken = 'test-token-123';

      service.connect(authToken);

      expect(io).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          auth: { token: authToken },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5
        })
      );
    });

    it('devrait mettre à jour le signal connected lors de la connexion', () => {
      const authToken = 'test-token-123';

      service.connect(authToken);
      expect(service.isConnected()).toBe(false);

      mockSocket.simulateConnect();
      expect(service.isConnected()).toBe(true);
    });

    it('ne devrait pas se reconnecter si déjà connecté', () => {
      const authToken = 'test-token-123';

      service.connect(authToken);
      mockSocket.simulateConnect();

      // Essayer de se reconnecter
      service.connect(authToken);

      // io devrait n'avoir été appelé qu'une seule fois
      expect(io).toHaveBeenCalledTimes(1);
    });

    it('devrait construire l\'URL WebSocket correctement (http -> ws)', () => {
      const authToken = 'test-token-123';

      service.connect(authToken);

      const callArgs = io.mock.calls[0];
      const url = callArgs[0];

      // L'URL devrait commencer par ws:// ou wss://
      expect(url).toMatch(/^ws(s)?:\/\//);
    });
  });

  describe('disconnect', () => {
    it('devrait se déconnecter du serveur WebSocket', () => {
      const authToken = 'test-token-123';
      const disconnectSpy = jest.spyOn(mockSocket, 'disconnect');

      service.connect(authToken);
      mockSocket.simulateConnect();

      service.disconnect();

      expect(disconnectSpy).toHaveBeenCalled();
      expect(service.isConnected()).toBe(false);
    });

    it('ne devrait pas échouer si déjà déconnecté', () => {
      expect(() => service.disconnect()).not.toThrow();
    });

    it('devrait mettre à jour le signal connected lors de la déconnexion', () => {
      const authToken = 'test-token-123';

      service.connect(authToken);
      mockSocket.simulateConnect();
      expect(service.isConnected()).toBe(true);

      mockSocket.disconnect();
      expect(service.isConnected()).toBe(false);
    });
  });

  describe('joinProposal', () => {
    it('devrait rejoindre une room de proposition si connecté', () => {
      const authToken = 'test-token-123';
      const proposalId = 'prop-123';
      const emitSpy = jest.spyOn(mockSocket, 'emit');

      service.connect(authToken);
      mockSocket.simulateConnect();

      service.joinProposal(proposalId);

      expect(emitSpy).toHaveBeenCalledWith('join:proposal', proposalId);
    });

    it('ne devrait pas émettre si non connecté', () => {
      const proposalId = 'prop-123';
      const emitSpy = jest.spyOn(mockSocket, 'emit');

      service.joinProposal(proposalId);

      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe('leaveProposal', () => {
    it('devrait quitter une room de proposition si connecté', () => {
      const authToken = 'test-token-123';
      const proposalId = 'prop-123';
      const emitSpy = jest.spyOn(mockSocket, 'emit');

      service.connect(authToken);
      mockSocket.simulateConnect();

      service.leaveProposal(proposalId);

      expect(emitSpy).toHaveBeenCalledWith('leave:proposal', proposalId);
    });

    it('ne devrait pas émettre si non connecté', () => {
      const proposalId = 'prop-123';
      const emitSpy = jest.spyOn(mockSocket, 'emit');

      service.leaveProposal(proposalId);

      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe('WebSocket events', () => {
    beforeEach(() => {
      const authToken = 'test-token-123';
      service.connect(authToken);
      mockSocket.simulateConnect();
    });

    it('devrait mettre à jour proposalCreated lors de la réception d\'une nouvelle proposition', () => {
      const eventData: UserWebSocketEvent = {
        proposalId: 'prop-123',
        batchId: 'batch-123',
        expiresIn: 300
      };

      expect(service.proposalCreated()).toBeNull();

      mockSocket.trigger('proposal:created', eventData);

      expect(service.proposalCreated()).toEqual(eventData);
    });

    it('devrait mettre à jour proposalAccepted lors de l\'acceptation d\'une proposition', () => {
      const eventData: UserWebSocketEvent = {
        proposalId: 'prop-123'
      };

      expect(service.proposalAccepted()).toBeNull();

      mockSocket.trigger('proposal:accepted', eventData);

      expect(service.proposalAccepted()).toBe('prop-123');
    });

    it('devrait mettre à jour proposalRejected lors du rejet d\'une proposition', () => {
      const eventData: UserWebSocketEvent = {
        proposalId: 'prop-123',
        rejectedBy: 'pro'
      };

      expect(service.proposalRejected()).toBeNull();

      mockSocket.trigger('proposal:rejected', eventData);

      expect(service.proposalRejected()).toEqual(eventData);
    });

    it('devrait mettre à jour proposalExpired lors de l\'expiration d\'une proposition', () => {
      const eventData: UserWebSocketEvent = {
        proposalId: 'prop-123'
      };

      expect(service.proposalExpired()).toBeNull();

      mockSocket.trigger('proposal:expired', eventData);

      expect(service.proposalExpired()).toBe('prop-123');
    });

    it('devrait gérer les erreurs de connexion', () => {
      const error = new Error('Connection failed');

      mockSocket.simulateConnectError(error);

      expect(service.isConnected()).toBe(false);
    });
  });

  describe('isConnected', () => {
    it('devrait retourner false si non connecté', () => {
      expect(service.isConnected()).toBe(false);
    });

    it('devrait retourner true si connecté', () => {
      const authToken = 'test-token-123';

      service.connect(authToken);
      mockSocket.simulateConnect();

      expect(service.isConnected()).toBe(true);
    });

    it('devrait retourner false après déconnexion', () => {
      const authToken = 'test-token-123';

      service.connect(authToken);
      mockSocket.simulateConnect();
      expect(service.isConnected()).toBe(true);

      service.disconnect();
      expect(service.isConnected()).toBe(false);
    });
  });

  describe('Multiple events handling', () => {
    beforeEach(() => {
      const authToken = 'test-token-123';
      service.connect(authToken);
      mockSocket.simulateConnect();
    });

    it('devrait gérer plusieurs événements successifs', () => {
      const event1: UserWebSocketEvent = { proposalId: 'prop-1' };
      const event2: UserWebSocketEvent = { proposalId: 'prop-2' };

      mockSocket.trigger('proposal:created', event1);
      expect(service.proposalCreated()).toEqual(event1);

      mockSocket.trigger('proposal:created', event2);
      expect(service.proposalCreated()).toEqual(event2);
    });

    it('devrait gérer différents types d\'événements simultanément', () => {
      const createdEvent: UserWebSocketEvent = { proposalId: 'prop-1', expiresIn: 300 };
      const acceptedEvent: UserWebSocketEvent = { proposalId: 'prop-2' };
      const rejectedEvent: UserWebSocketEvent = { proposalId: 'prop-3', rejectedBy: 'user' };

      mockSocket.trigger('proposal:created', createdEvent);
      mockSocket.trigger('proposal:accepted', acceptedEvent);
      mockSocket.trigger('proposal:rejected', rejectedEvent);

      expect(service.proposalCreated()).toEqual(createdEvent);
      expect(service.proposalAccepted()).toBe('prop-2');
      expect(service.proposalRejected()).toEqual(rejectedEvent);
    });
  });

  describe('Batch proposals handling', () => {
    beforeEach(() => {
      const authToken = 'test-token-123';
      service.connect(authToken);
      mockSocket.simulateConnect();
    });

    it('devrait gérer les événements de batch avec plusieurs propositions', () => {
      const batchEvent: UserWebSocketEvent = {
        proposalId: 'prop-123',
        batchId: 'batch-123',
        isBatch: true,
        proposalIds: ['prop-1', 'prop-2', 'prop-3']
      };

      mockSocket.trigger('proposal:created', batchEvent);

      const received = service.proposalCreated();
      expect(received?.batchId).toBe('batch-123');
      expect(received?.isBatch).toBe(true);
      expect(received?.proposalIds).toHaveLength(3);
    });
  });
});
