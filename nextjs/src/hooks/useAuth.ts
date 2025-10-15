import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LoginRequest, RegisterRequest } from '@/types/user';
import { authService } from '@/services/authService';
import { translateErrorMessage, ValidationError } from '@/utils/auth.utils';
import { AUTH_MESSAGES } from '@/constants/auth.constants';

interface UseAuthOptions {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const useLogin = (options: UseAuthOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError>({});
  const router = useRouter();

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    setErrors({});

    try {
      const response = await authService.login(credentials);
      
      if (options.onSuccess) {
        options.onSuccess();
      } else {
        router.push(options.redirectTo || '/');
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      // Always show the same error message for authentication failures
      setErrors({ general: AUTH_MESSAGES.INVALID_CREDENTIALS });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options, router]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    login,
    isLoading,
    errors,
    clearErrors,
  };
};

export const useRegister = (options: UseAuthOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError>({});
  const router = useRouter();

  const register = useCallback(async (userData: RegisterRequest) => {
    setIsLoading(true);
    setErrors({});

    try {
      const response = await authService.register(userData);
      
      if (options.onSuccess) {
        options.onSuccess();
      } else {
        router.push(options.redirectTo || '/login');
      }
      
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      // Show specific error for email/username already exists, otherwise show general error
      const errorMessage = error instanceof Error ? translateErrorMessage(error) : AUTH_MESSAGES.REGISTER_FAILED;
      if (errorMessage === AUTH_MESSAGES.EMAIL_OR_USERNAME_ALREADY_EXISTS || 
          errorMessage === AUTH_MESSAGES.EMAIL_ALREADY_EXISTS || 
          errorMessage === AUTH_MESSAGES.USERNAME_ALREADY_EXISTS) {
        setErrors({ general: AUTH_MESSAGES.EMAIL_OR_USERNAME_ALREADY_EXISTS });
      } else {
        setErrors({ general: AUTH_MESSAGES.INVALID_CREDENTIALS });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options, router]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    register,
    isLoading,
    errors,
    clearErrors,
  };
};
