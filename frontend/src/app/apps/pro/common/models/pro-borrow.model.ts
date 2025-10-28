// src/app/apps/pro/models/pro-borrow.model.ts

export interface ProBorrowItem {
  type: number;
  number: number;
}

export interface ProBorrowProposal {
  id: string;
  type: number;
  number: number;
  accepted: boolean | null;
  borrowed: string | null;
  created: string;
  status: 'pending' | 'accepted' | 'rejected';
  timeRemaining: number;
}

export interface ProBorrowProposalGroup {
  userId: string;
  firstName: string;
  lastName: string;
  userEmail: string;
  items: ProBorrowProposal[];
}

export interface ProProposalDetails {
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

export interface CreateProposalRequest {
  userCode: string;
  items: ProBorrowItem[];
}

export interface CreateProposalResponse {
  success: boolean;
  message: string;
  proposals: Array<{
    id: string;
    type: number;
    number: number;
    created: string;
    expiresIn: number;
  }>;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface ProWebSocketEvent {
  proposalId: string;
  expiresIn?: number;
  rejectedBy?: 'user' | 'pro';
}