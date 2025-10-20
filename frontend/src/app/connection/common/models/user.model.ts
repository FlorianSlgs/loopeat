export interface User {
  id?: number;
  email: string;
  firstName?: string;
  lastName?: string;
  verified?: boolean;
}

export interface CheckEmailResponse {
  success: boolean;
  exists: boolean;
  verified: boolean;
  requireVerification?: boolean;
  requirePassword?: boolean;
  message: string;
}

export interface VerifyCodeResponse {
  success: boolean;
  verified: boolean;
  message: string;
}