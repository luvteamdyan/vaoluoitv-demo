export interface AuthUser {
  id: string;
  external_id?: string;
  email: string;
  username?: string;
}

export interface AuthResponse {
  user: AuthUser;
  access_token?: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  username?: string;
  external_id?: string;
}

export interface JwtUser {
  userId: string;
  email: string;
  username?: string;
  external_id?: string;
  sub: string;
}
