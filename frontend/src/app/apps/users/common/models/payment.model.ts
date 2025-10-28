export interface RechargeResponse {
  success: boolean;
  url: string;
  sessionId: string;
}

export interface SessionDetails {
  success: boolean;
  session: {
    id: string;
    status: string;
    amount: number;
    currency: string;
  };
}

export interface BalanceResponse {
  success: boolean;
  balance: number;
}

export interface BalanceHistoryItem {
  id: number;
  add: number | null;
  subtract: number | null;
  title: string;
  created: string;
}

export interface BalanceHistoryResponse {
  success: boolean;
  history: BalanceHistoryItem[];
}