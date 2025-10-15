import { LoginRequest, RegisterRequest, AuthResponse, RegisterResponse, User, RegisterV2Request } from '@/types/user';
import { setAuthToken, removeAuthToken, getAuthToken, setUserData, removeUserData } from '@/utils/cookies';
import { translateErrorMessage } from '@/utils/auth.utils';
import { NetworkErrorType, NetworkError, AuthServiceConfig, UpdateProfileData } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Retry configuration
const RETRY_CONFIG: AuthServiceConfig['retryConfig'] = {
  maxRetries: 3,
  retryDelay: 1000,
  retryMultiplier: 2,
};

class AuthService {
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, { 
        ...defaultOptions, 
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`) as NetworkError;
        
        // Determine error type
        if (response.status >= 500) {
          error.type = NetworkErrorType.SERVER_ERROR;
          error.retryable = true;
        } else if (response.status === 401 || response.status === 403) {
          error.type = NetworkErrorType.AUTHENTICATION_ERROR;
          error.retryable = false;
        } else if (response.status === 400) {
          error.type = NetworkErrorType.VALIDATION_ERROR;
          error.retryable = false;
        } else {
          error.type = NetworkErrorType.UNKNOWN_ERROR;
          error.retryable = false;
        }
        
        error.status = response.status;
        throw error;
      }

      return response.json();
    } catch (error) {
      // Handle network errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          const timeoutError = new Error('Request timeout') as NetworkError;
          timeoutError.type = NetworkErrorType.TIMEOUT;
          timeoutError.retryable = true;
          throw timeoutError;
        }
        
        if (error.message.includes('fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
          const networkError = new Error('CONNECTION_REFUSED') as NetworkError;
          networkError.type = NetworkErrorType.NETWORK_ERROR;
          networkError.retryable = false; // Don't retry for connection refused
          throw networkError;
        }
      }

      // Retry logic for retryable errors
      if (retryCount < RETRY_CONFIG.maxRetries && (error as NetworkError).retryable) {
        const delay = RETRY_CONFIG.retryDelay * Math.pow(RETRY_CONFIG.retryMultiplier, retryCount);
        await this.delay(delay);
        return this.makeRequest<T>(endpoint, options, retryCount + 1);
      }

      throw error;
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      // Save token and user data to cookies (cross-subdomain)
      if (response.access_token) {
        setAuthToken(response.access_token);
      }
      
      if (response.user) {
        setUserData(response.user);
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      
      // Translate error message for better UX
      const translatedError = new Error(translateErrorMessage(error as Error));
      throw translatedError;
    }
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await this.makeRequest<RegisterResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      return response;
    } catch (error) {
      console.error('Register error:', error);
      
      // Translate error message for better UX
      const translatedError = new Error(translateErrorMessage(error as Error));
      throw translatedError;
    }
  }

  async registerV2(userData: RegisterV2Request): Promise<RegisterResponse> {
    try {
      const response = await this.makeRequest<RegisterResponse>('/auth/v2/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      return response;
    } catch (error) {
      console.error('RegisterV2 error:', error);
      
      // Translate error message for better UX
      const translatedError = new Error(translateErrorMessage(error as Error));
      throw translatedError;
    }
  }

  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        // Try to call logout endpoint if available
        try {
          await this.makeRequest('/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
        } catch (error) {
          // Ignore logout endpoint errors, still clear local data
          console.warn('Logout endpoint failed, clearing local data only:', error);
        }
      }
    } finally {
      // Always clear local data
      removeAuthToken();
      removeUserData();
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return typeof window !== 'undefined' ? getAuthToken() : null;
  }

  async getProfile(): Promise<User> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await this.makeRequest<User>('/users/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response;
    } catch (error) {
      // Handle connection refused errors gracefully
      if (error instanceof Error && error.message === 'CONNECTION_REFUSED') {
        console.warn('API server not available for profile check, user will be treated as guest');
        throw new Error('CONNECTION_REFUSED');
      }
      
      console.warn('Get profile error:', error);
      
      // If profile fetch fails due to auth issues, clear local data
      if ((error as NetworkError).type === NetworkErrorType.AUTHENTICATION_ERROR) {
        this.logout();
      }
      
      throw error;
    }
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      
      const response = await this.makeRequest<User>('/users/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      // Update user data in cookie (cross-subdomain)
      setUserData(response);
      
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      
      // For validation errors, throw the original error object to preserve structure
      if ((error as NetworkError).type === NetworkErrorType.VALIDATION_ERROR) {
        throw error;
      }
      
      // For other errors, translate error message for better UX
      const translatedError = new Error(translateErrorMessage(error as Error));
      throw translatedError;
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.makeRequest('/health', { method: 'GET' });
      return true;
    } catch (error) {
      console.warn('Health check failed:', error);
      return false;
    }
  }
}

export const authService = new AuthService();
export default authService;