
// Import User type
import { User } from '@/types/user';

// Auth form types
export type AuthMode = 'login' | 'register';

// Form data types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  display_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone_number: string;
  address: string;
  referral_code: string;
}

export interface UpdateProfileData {
  username?: string;
  display_name?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  is_active?: boolean;
}

// Union type for form data (kept for potential future use)
export type AuthFormData = LoginFormData | RegisterFormData;

// Validation error type
export interface ValidationError {
  [key: string]: string;
}

// Auth state type
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth context type
export interface AuthContextType extends AuthState {
  login: (user: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  clearError: () => void;
}

// Auth form props
export interface AuthFormProps {
  mode: AuthMode;
  onSuccess?: () => void;
  onModeChange?: (mode: AuthMode) => void;
  onShowToast?: (message: string, type: 'success' | 'error') => void;
  redirectTo?: string;
  className?: string;
}

// Auth popup props
export interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: AuthMode;
}

// Form validation hook options
export interface UseAuthFormOptions {
  mode: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
}

// Form validation hook return type
export interface UseAuthFormReturn {
  // Form data
  formData: AuthFormData;
  loginData: LoginFormData;
  registerData: RegisterFormData;
  
  // Form state
  errors: ValidationError;
  shakeFields: Set<string>;
  isValid: boolean;
  isTouched: boolean;
  
  // Actions
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validateForm: () => boolean;
  setFieldError: (field: string, message: string) => void;
  clearErrors: () => void;
  resetForm: () => void;
  switchMode: (mode: AuthMode) => void;
  
  // Mode
  mode: AuthMode;
}

// Toast types
export type ToastType = 'success' | 'error';

export interface ToastState {
  message: string;
  type: ToastType;
  isVisible: boolean;
}

export interface UseToastReturn {
  toast: ToastState;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

// Network error types
export enum NetworkErrorType {
  TIMEOUT = 'TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface NetworkError extends Error {
  type: NetworkErrorType;
  status?: number;
  retryable: boolean;
}

// Auth service configuration
export interface AuthServiceConfig {
  baseUrl: string;
  timeout: number;
  retryConfig: {
    maxRetries: number;
    retryDelay: number;
    retryMultiplier: number;
  };
}

// Form field types
export type FormFieldName = 'username' | 'email' | 'password' | 'confirmPassword';

// Input component props (kept for potential future use)
export interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  placeholder?: string;
  label?: string;
  shouldShake?: boolean;
}

// Button component props (kept for potential future use)
export interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'link';
  size?: 'sm' | 'md' | 'lg';
}

