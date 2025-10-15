export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface User {
  id: string;
  external_id?: string; // User ID from auth.luck8event.com
  username: string;
  display_name?: string;
  email: string;
  phone_number?: string;
  address?: string;
  sms_verified: boolean;
  points: number;
  referral_code: string;
  invited_by?: string;
  role: UserRole;
  last_login?: string;
  is_active: boolean;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  display_name: string;
  email: string;
  password: string;
  phone_number: string;
  address: string;
  referral_code: string;
}

export interface RegisterV2Request {
  username: string;
  display_name: string;
  email: string;
  password: string;
  phone_number: string;
  address: string;
  referral_code: string;
  recaptchaToken: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: Omit<User, 'id'>;
}
