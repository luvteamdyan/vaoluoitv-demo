import { AUTH_MESSAGES, VALIDATION_RULES } from '@/constants/auth.constants';
import { LoginRequest } from '@/types/user';
import { RegisterFormData } from '@/types/auth';

// Re-export RegisterFormData for use in other files
export type { RegisterFormData } from '@/types/auth';

// Validation types
export interface ValidationError {
  [key: string]: string;
}

export interface LoginFormData extends LoginRequest {
  confirmPassword?: string;
}

// Email validation
export const validateEmail = (email: string): string | null => {
  if (!email.trim()) {
    return AUTH_MESSAGES.EMAIL_REQUIRED;
  }
  if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) {
    return AUTH_MESSAGES.EMAIL_INVALID;
  }
  return null;
};

// Username validation
export const validateUsername = (username: string): string | null => {
  if (!username.trim()) {
    return AUTH_MESSAGES.USERNAME_REQUIRED;
  }
  if (username.trim().length < VALIDATION_RULES.MIN_USERNAME_LENGTH) {
    return AUTH_MESSAGES.USERNAME_MIN_LENGTH;
  }
  if (username.includes(' ')) {
    return AUTH_MESSAGES.USERNAME_NO_SPACES;
  }
  return null;
};

// Phone number validation
export const validatePhoneNumber = (phoneNumber: string): string | null => {
  if (!phoneNumber.trim()) {
    return AUTH_MESSAGES.PHONE_REQUIRED;
  }
  
  const trimmedPhone = phoneNumber.trim();
  
  // Accept both international format (+84XXXXXXXXX) and local format (0XXXXXXXXX)
  const internationalRegex = /^\+84[0-9]{9,10}$/;
  const localRegex = /^0\d{9}$/;
  
  if (!internationalRegex.test(trimmedPhone) && !localRegex.test(trimmedPhone)) {
    return 'Số điện thoại phải có 10 số và bắt đầu bằng 0 (VD: 0901234567) hoặc format quốc tế +84';
  }
  
  return null;
};

// Display name validation
export const validateDisplayName = (displayName: string): string | null => {
  if (!displayName.trim()) {
    return 'Tên hiển thị là bắt buộc';
  }
  if (displayName.trim().length < VALIDATION_RULES.MIN_DISPLAY_NAME_LENGTH) {
    return AUTH_MESSAGES.DISPLAY_NAME_TOO_SHORT;
  }
  if (displayName.trim().length > VALIDATION_RULES.MAX_DISPLAY_NAME_LENGTH) {
    return AUTH_MESSAGES.DISPLAY_NAME_TOO_LONG;
  }
  return null;
};

// Address validation
export const validateAddress = (address: string): string | null => {
  if (!address.trim()) {
    return 'Địa chỉ là bắt buộc';
  }
  
  const trimmedAddress = address.trim();
  
  if (trimmedAddress.length < VALIDATION_RULES.MIN_ADDRESS_LENGTH) {
    return AUTH_MESSAGES.ADDRESS_MIN_LENGTH;
  }
  
  if (trimmedAddress.length > VALIDATION_RULES.MAX_ADDRESS_LENGTH) {
    return AUTH_MESSAGES.ADDRESS_TOO_LONG;
  }
  
  return null;
};

// Referral code validation
export const validateReferralCode = (referralCode: string): string | null => {
  if (referralCode && !VALIDATION_RULES.REFERRAL_CODE_REGEX.test(referralCode)) {
    return AUTH_MESSAGES.REFERRAL_CODE_INVALID;
  }
  return null;
};

// Password validation
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return AUTH_MESSAGES.PASSWORD_REQUIRED;
  }
  if (password.length < VALIDATION_RULES.MIN_PASSWORD_LENGTH) {
    return AUTH_MESSAGES.PASSWORD_MIN_LENGTH;
  }
  if (!VALIDATION_RULES.PASSWORD_REGEX.test(password)) {
    return AUTH_MESSAGES.PASSWORD_WEAK;
  }
  return null;
};

// Confirm password validation
export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) {
    return AUTH_MESSAGES.CONFIRM_PASSWORD_REQUIRED;
  }
  if (password !== confirmPassword) {
    return AUTH_MESSAGES.CONFIRM_PASSWORD_MISMATCH;
  }
  return null;
};

// Login form validation
export const validateLoginForm = (formData: LoginFormData): ValidationError => {
  const errors: ValidationError = {};
  
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validatePassword(formData.password);
  if (passwordError) errors.password = passwordError;
  
  return errors;
};

// Register form validation
export const validateRegisterForm = (formData: RegisterFormData): ValidationError => {
  const errors: ValidationError = {};
  
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;
  
  const usernameError = validateUsername(formData.username);
  if (usernameError) errors.username = usernameError;
  
  const displayNameError = validateDisplayName(formData.display_name);
  if (displayNameError) errors.display_name = displayNameError;
  
  const passwordError = validatePassword(formData.password);
  if (passwordError) errors.password = passwordError;
  
  const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
  
  const phoneError = validatePhoneNumber(formData.phone_number);
  if (phoneError) errors.phone_number = phoneError;
  
  const addressError = validateAddress(formData.address);
  if (addressError) errors.address = addressError;
  
  const referralError = validateReferralCode(formData.referral_code);
  if (referralError) errors.referral_code = referralError;
  
  return errors;
};

// Error message translation
export const translateErrorMessage = (error: Error): string => {
  const message = error.message.toLowerCase();
  
  if (message.includes('invalid email or password') || message.includes('invalid credentials')) {
    return AUTH_MESSAGES.INVALID_CREDENTIALS;
  }
  if (message.includes('user not found')) {
    return AUTH_MESSAGES.USER_NOT_FOUND;
  }
  if (message.includes('email or username already exists') || message.includes('email already exists') || message.includes('user already exists')) {
    return AUTH_MESSAGES.EMAIL_OR_USERNAME_ALREADY_EXISTS;
  }
  if (message.includes('username already exists')) {
    return AUTH_MESSAGES.USERNAME_ALREADY_EXISTS;
  }
  if (message.includes('invalid email')) {
    return AUTH_MESSAGES.INVALID_EMAIL;
  }
  if (message.includes('password too weak')) {
    return AUTH_MESSAGES.PASSWORD_TOO_WEAK;
  }
  if (message.includes('network error')) {
    return AUTH_MESSAGES.NETWORK_ERROR;
  }
  if (message.includes('unauthorized')) {
    return AUTH_MESSAGES.UNAUTHORIZED;
  }
  if (message.includes('validation failed')) {
    return AUTH_MESSAGES.VALIDATION_FAILED;
  }
  
  return error.message;
};

// Parse API validation errors
export const parseApiValidationErrors = (error: unknown): ValidationError => {
  const errors: ValidationError = {};
  
  // Handle different error formats from API
  if (error && typeof error === 'object' && 'message' in error && Array.isArray(error.message)) {
    // Format: { "message": ["Display name phải từ 2 đến 100 ký tự"], "error": "Bad Request", "statusCode": 400 }
    error.message.forEach((msg: string) => {
      // Map field names from API to form field names
      if (msg.toLowerCase().includes('display name') || msg.toLowerCase().includes('tên hiển thị')) {
        errors.display_name = msg;
      } else if (msg.toLowerCase().includes('phone') || msg.toLowerCase().includes('số điện thoại')) {
        errors.phone_number = msg;
      } else if (msg.toLowerCase().includes('address') || msg.toLowerCase().includes('địa chỉ')) {
        errors.address = msg;
      } else if (msg.toLowerCase().includes('email')) {
        errors.email = msg;
      } else if (msg.toLowerCase().includes('username') || msg.toLowerCase().includes('tên đăng nhập')) {
        errors.username = msg;
      } else {
        // If we can't map to a specific field, put it in general
        errors.general = msg;
      }
    });
  } else if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    // Single string message
    errors.general = error.message;
  } else if (error && typeof error === 'object' && 'errors' in error && typeof error.errors === 'object' && error.errors !== null) {
    // Format: { "errors": { "field": ["message"] } }
    const errorObj = error.errors as Record<string, unknown>;
    Object.keys(errorObj).forEach(field => {
      const fieldErrors = errorObj[field];
      if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
        errors[field] = fieldErrors[0];
      }
    });
  } else {
    // Fallback to general error
    const errorMessage = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' ? error.message : 'Có lỗi xảy ra';
    errors.general = errorMessage;
  }
  
  return errors;
};

// Check if form has errors
export const hasFormErrors = (errors: ValidationError): boolean => {
  return Object.keys(errors).length > 0;
};
