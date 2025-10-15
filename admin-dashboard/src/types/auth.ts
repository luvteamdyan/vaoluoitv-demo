// Auth interfaces dựa trên backend API
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  display_name?: string;
  role: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Error response từ API
export interface AuthError {
  message: string;
  statusCode: number;
}
