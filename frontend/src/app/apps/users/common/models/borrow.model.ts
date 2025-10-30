// src/app/apps/user/models/user-borrow.model.ts

export interface UserBorrowProposal {
  id: string;
  type: number;
  number: number;
  timeRemaining: number;
  batchId?: string;
}

export interface UserBorrowProposalGroup {
  proId: string;
  proName: string;
  proEmail: string;
  created: string;
  items: UserBorrowProposal[];
}

export interface UserProposalDetails {
  id: string;
  type: number;
  number: number;
  accepted: boolean | null;
  borrowed: string | null;
  created: string;
  timeRemaining: number;
  batchId?: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  pro: {
    name: string;
    email: string;
  };
}

export interface BatchProposalsResponse {
  success: boolean;
  batchId: string;
  proposals: UserBorrowProposal[];
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  pro: {
    name: string;
    email: string;
  };
}

export interface UserWebSocketEvent {
  proposalId: string;
  batchId?: string;
  isBatch?: boolean;
  proposalIds?: string[];
  expiresIn?: number;
  rejectedBy?: 'user' | 'pro';
}

export enum UserProposalStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}