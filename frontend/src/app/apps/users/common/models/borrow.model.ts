// src/app/apps/user/models/user-borrow.model.ts

export interface UserBorrowProposal {
  id: string;
  type: number;
  number: number;
  timeRemaining: number;
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
  expiresIn?: number;
  rejectedBy?: 'user' | 'pro';
}

export enum UserProposalStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}