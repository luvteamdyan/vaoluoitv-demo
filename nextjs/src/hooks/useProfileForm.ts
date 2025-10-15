import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/user';
import { parseApiValidationErrors, validateDisplayName, validatePhoneNumber, validateAddress } from '@/utils/auth.utils';

export interface ProfileFormData {
  username: string;
  display_name: string;
  email: string;
  phone_number: string;
  address: string;
  points: number;
  sms_verified: boolean;
  referral_code: string;
  createdAt?: string;
  updatedAt?: string;
  invited_by?: string;
}

export interface ProfileFormErrors {
  [key: string]: string;
}

export function useProfileForm(user: User | null) {
  const { updateProfile } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    username: '',
    display_name: '',
    email: '',
    phone_number: '',
    address: '',
    points: 0,
    sms_verified: false,
    referral_code: '',
    createdAt: '',
    updatedAt: '',
    invited_by: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ProfileFormErrors>({});

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      // Display phone number without +84 prefix
      let displayPhone = user.phone_number || '';
      if (displayPhone.startsWith('+84')) {
        displayPhone = '0' + displayPhone.substring(3);
      } else if (displayPhone.startsWith('84')) {
        displayPhone = '0' + displayPhone.substring(2);
      }
      
      setFormData({
        username: user.username || '',
        display_name: user.display_name || '',
        email: user.email || '',
        phone_number: displayPhone,
        address: user.address || '',
        points: user.points || 0,
        sms_verified: user.sms_verified || false,
        referral_code: user.referral_code || '',
        createdAt: user.createdAt || '',
        updatedAt: user.updatedAt || '',
        invited_by: user.invited_by || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handlePhoneBlur = () => {
    // No formatting on blur - let user input naturally
    // Formatting will be done when sending to backend
  };

  const validateForm = (): boolean => {
    const newErrors: ProfileFormErrors = {};

    // Validate display name
    const displayNameError = validateDisplayName(formData.display_name);
    if (displayNameError) {
      newErrors.display_name = displayNameError;
    }

    // Validate phone number
    const phoneError = validatePhoneNumber(formData.phone_number);
    if (phoneError) {
      newErrors.phone_number = phoneError;
    }

    // Validate address
    const addressError = validateAddress(formData.address);
    if (addressError) {
      newErrors.address = addressError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (onSuccess?: () => void) => {
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Format phone number: remove leading 0 and add +84
      let formattedPhone = formData.phone_number.trim();
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+84' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('+84') && !formattedPhone.startsWith('84')) {
        formattedPhone = '+84' + formattedPhone;
      }

      // Send all fields (including read-only ones) to backend
      const updateData = {
        username: formData.username.trim(),
        display_name: formData.display_name.trim(),
        email: formData.email.trim(),
        phone_number: formattedPhone, // Format: 0901234567 -> +84901234567
        address: formData.address.trim()
      };

      // Double-check that editable fields are not empty
      if (!updateData.display_name || !updateData.phone_number || !updateData.address) {
        setErrors({
          general: "Tên hiển thị, số điện thoại và địa chỉ là bắt buộc"
        });
        setLoading(false);
        return;
      }

      await updateProfile(updateData);

      onSuccess?.();
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Parse API validation errors
      const apiErrors = parseApiValidationErrors(error);
      
      if (Object.keys(apiErrors).length > 0) {
        setErrors(apiErrors);
      } else {
        // Fallback to general error
        setErrors({
          general: "Có lỗi xảy ra khi cập nhật hồ sơ"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    if (user) {
      // Display phone number without +84 prefix
      let displayPhone = user.phone_number || '';
      if (displayPhone.startsWith('+84')) {
        displayPhone = '0' + displayPhone.substring(3);
      } else if (displayPhone.startsWith('84')) {
        displayPhone = '0' + displayPhone.substring(2);
      }
      
      setFormData({
        username: user.username || '',
        display_name: user.display_name || '',
        email: user.email || '',
        phone_number: displayPhone,
        address: user.address || '',
        points: user.points || 0,
        sms_verified: user.sms_verified || false,
        referral_code: user.referral_code || '',
        createdAt: user.createdAt || '',
        updatedAt: user.updatedAt || '',
        invited_by: user.invited_by || '',
      });
    }
    setErrors({});
  };

  return {
    formData,
    loading,
    errors,
    handleInputChange,
    handlePhoneBlur,
    handleSubmit,
    resetForm,
    validateForm,
  };
}
