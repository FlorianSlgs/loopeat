// src/app/apps/user/services/user-borrow-websocket.service.ts
import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../../../../environments/environment';
import { UserWebSocketEvent } from '../../models/borrow.model';

@Injectable({
  providedIn: 'root'
})
export class BorrowWebsocketService {
  private socket: Socket | null = null;
  private readonly connected = signal(false);
  
  // Signaux pour les événements
  readonly proposalCreated = signal<UserWebSocketEvent | null>(null);
  readonly proposalAccepted = signal<string | null>(null);
  readonly proposalRejected = signal<UserWebSocketEvent | null>(null);
  readonly proposalExpired = signal<string | null>(null);

  /**
   * Se connecter au serveur WebSocket
   */
  connect(authToken: string): void {
    if (this.socket?.connected) {
      console.log('🔌 Déjà connecté au WebSocket');
      return;
    }

    const socketUrl = environment.apiUrl.replace(/^http/, 'ws').replace('/api', '');
    
    console.log('🔌 [USER] Connexion au WebSocket:', socketUrl);

    this.socket = io(socketUrl, {
      auth: { token: authToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.setupEventListeners();
  }

  /**
   * Se déconnecter du serveur WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      console.log('🔌 [USER] Déconnexion du WebSocket');
      this.socket.disconnect();
      this.socket = null;
      this.connected.set(false);
    }
  }

  /**
   * Rejoindre la room d'une proposition
   */
  joinProposal(proposalId: string): void {
    if (this.socket?.connected) {
      console.log('📦 [USER] Rejoindre la proposition:', proposalId);
      this.socket.emit('join:proposal', proposalId);
    }
  }

  /**
   * Quitter la room d'une proposition
   */
  leaveProposal(proposalId: string): void {
    if (this.socket?.connected) {
      console.log('📤 [USER] Quitter la proposition:', proposalId);
      this.socket.emit('leave:proposal', proposalId);
    }
  }

  /**
   * Configurer les écouteurs d'événements
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ [USER] Connecté au WebSocket');
      this.connected.set(true);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ [USER] Déconnecté du WebSocket');
      this.connected.set(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ [USER] Erreur de connexion WebSocket:', error);
      this.connected.set(false);
    });

    this.socket.on('proposal:created', (data: UserWebSocketEvent) => {
      console.log('📦 [USER] Nouvelle proposition reçue:', data);
      this.proposalCreated.set(data);
    });

    this.socket.on('proposal:accepted', (data: UserWebSocketEvent) => {
      console.log('✅ [USER] Proposition acceptée:', data);
      this.proposalAccepted.set(data.proposalId);
    });

    this.socket.on('proposal:rejected', (data: UserWebSocketEvent) => {
      console.log('❌ [USER] Proposition refusée:', data);
      this.proposalRejected.set(data);
    });

    this.socket.on('proposal:expired', (data: UserWebSocketEvent) => {
      console.log('⏰ [USER] Proposition expirée:', data);
      this.proposalExpired.set(data.proposalId);
    });
  }

  /**
   * Obtenir le statut de connexion
   */
  isConnected(): boolean {
    return this.connected();
  }
}