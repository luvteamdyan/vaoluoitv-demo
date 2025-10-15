import { 
  getAuthToken, 
  removeAuthToken, 
  getUserData, 
  removeUserData 
} from '../utils/cookies';

// LocalStorage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export interface User {
  id: string;
  email: string;
  username?: string;
  [key: string]: unknown;
}

interface LoginCredentials {
  identifier: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  user: User;
}

class AuthService {
  private apiBaseUrl: string;

  constructor() {
    // Get API URL from environment or use default
    this.apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://games-api.vaoluoitv.com';
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.identifier,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(errorData.message || 'Invalid credentials');
      }

      const data: LoginResponse = await response.json();
      
      // Save token and user
      this.setToken(data.access_token);
      this.setUser(data.user);
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  logout(): void {
    // Clear token and user from both cookies and localStorage
    removeAuthToken();
    removeUserData();
    this.removeTokenFromLocalStorage();
    this.removeUserFromLocalStorage();
  }

  getToken(): string | null {
    // Ưu tiên localStorage trước, fallback sang cookies
    const localStorageToken = this.getTokenFromLocalStorage();
    if (localStorageToken) {
      return localStorageToken;
    }
    return getAuthToken();
  }

  getUser(): User | null {
    // Ưu tiên localStorage trước, fallback sang cookies
    const localStorageUser = this.getUserFromLocalStorage();
    if (localStorageUser) {
      return localStorageUser;
    }
    return getUserData();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // LocalStorage methods
  setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving token to localStorage:', error);
    }
  }

  setUser(user: User): void {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  }

  private getTokenFromLocalStorage(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error reading token from localStorage:', error);
      return null;
    }
  }

  private getUserFromLocalStorage(): User | null {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error reading user from localStorage:', error);
      return null;
    }
  }

  private removeTokenFromLocalStorage(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token from localStorage:', error);
    }
  }

  private removeUserFromLocalStorage(): void {
    try {
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error removing user from localStorage:', error);
    }
  }
}

export const authService = new AuthService();
