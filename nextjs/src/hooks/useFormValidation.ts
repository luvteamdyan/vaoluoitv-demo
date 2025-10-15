import { useState, useCallback } from 'react';
import { 
  validateLoginForm, 
  validateRegisterForm, 
  ValidationError, 
  LoginFormData, 
  RegisterFormData,
  hasFormErrors 
} from '@/utils/auth.utils';

export const useFormValidation = <T extends LoginFormData | RegisterFormData>(
  initialData: T,
  validationFn: (data: T) => ValidationError
) => {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<ValidationError>({});
  const [shakeFields, setShakeFields] = useState<Set<string>>(new Set());

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
      // Remove from shake fields
      setShakeFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(name);
        return newSet;
      });
    }
  }, [errors]);

  const validateForm = useCallback((): boolean => {
    const validationErrors = validationFn(formData);
    setErrors(validationErrors);
    
    // Add fields with errors to shake animation
    const errorFields = Object.keys(validationErrors);
    if (errorFields.length > 0) {
      setShakeFields(new Set(errorFields));
      // Remove shake animation after it completes
      setTimeout(() => {
        setShakeFields(new Set());
      }, 500);
    }
    
    return !hasFormErrors(validationErrors);
  }, [formData, validationFn]);

  const setFieldError = useCallback((field: string, message: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: message
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
  }, [initialData]);

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    shakeFields,
    handleInputChange,
    validateForm,
    setFieldError,
    clearErrors,
    resetForm,
  };
};

// Specific hooks for login and register
export const useLoginForm = (initialData: LoginFormData = { email: '', password: '' }) => {
  return useFormValidation(initialData, validateLoginForm);
};

export const useRegisterForm = (initialData: RegisterFormData = { 
  email: '', 
  password: '', 
  username: '', 
  display_name: '',
  confirmPassword: '',
  phone_number: '',
  address: '',
  referral_code: ''
}) => {
  return useFormValidation(initialData, validateRegisterForm);
};
