import React from 'react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  helpText?: string;
  className?: string;
  error?: string;
  shouldShake?: boolean;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ 
    label, 
    required = false, 
    helpText, 
    error, 
    shouldShake = false, 
    className = '',
    ...props 
  }, ref) => {
    const fieldId = props.id || props.name;
    const errorId = error ? `${fieldId}-error` : undefined;
    const helpId = helpText ? `${fieldId}-help` : undefined;

    return (
      <div className={`space-y-2 ${className}`}>
        <label 
          htmlFor={fieldId}
          className="block text-xs sm:text-sm font-medium text-gray-300"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
        
        <input
          ref={ref}
          id={fieldId}
          aria-describedby={errorId || helpId}
          aria-invalid={!!error}
          className={`
            w-full px-3 py-2 sm:px-4 sm:py-3 bg-black/50 border rounded-lg shadow-sm text-white text-sm sm:text-base
            focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 
            transition-all duration-200
            ${error 
              ? 'border-red-500 placeholder-red-400' 
              : 'border-gray-600 placeholder-gray-400'
            }
            ${shouldShake ? 'animate-shake' : ''}
          `}
          {...props}
        />
        
        {helpText && !error && (
          <p id={helpId} className="text-sm text-gray-400">
            {helpText}
          </p>
        )}
        
        {error && (
          <p 
            id={errorId} 
            className="text-sm text-red-400" 
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

// Specific form field components
export const NameField = React.forwardRef<HTMLInputElement, Omit<FormFieldProps, 'type' | 'autoComplete' | 'label'>>(
  (props, ref) => (
    <FormField
      ref={ref}
      type="text"
      autoComplete="name"
      label="Tên người dùng"
      helpText="Tên đăng nhập không được chứa khoảng trắng và phải có ít nhất 3 ký tự"
      required
      {...props}
    />
  )
);

export const EmailField = React.forwardRef<HTMLInputElement, Omit<FormFieldProps, 'type' | 'autoComplete' | 'label'>>(
  (props, ref) => (
    <FormField
      ref={ref}
      type="email"
      autoComplete="email"
      label="Địa chỉ Email"
      required
      {...props}
    />
  )
);

export const PasswordField = React.forwardRef<HTMLInputElement, Omit<FormFieldProps, 'type' | 'label'> & { autoComplete?: string }>(
  (props, ref) => (
    <FormField
      ref={ref}
      type="password"
      autoComplete={props.autoComplete || "current-password"}
      label="Mật khẩu"
      helpText="Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt"
      required
      {...props}
    />
  )
);

export const ConfirmPasswordField = React.forwardRef<HTMLInputElement, Omit<FormFieldProps, 'type' | 'autoComplete' | 'label'>>(
  (props, ref) => (
    <FormField
      ref={ref}
      type="password"
      autoComplete="new-password"
      label="Xác nhận mật khẩu"
      required
      {...props}
    />
  )
);

// Display Name Field
export const DisplayNameField = React.forwardRef<HTMLInputElement, Omit<FormFieldProps, 'type' | 'autoComplete' | 'label'>>(
  (props, ref) => (
    <FormField
      ref={ref}
      type="text"
      autoComplete="name"
      label="Tên hiển thị"
      required
      {...props}
    />
  )
);

// Phone Number Field
export const PhoneField = React.forwardRef<HTMLInputElement, Omit<FormFieldProps, 'type' | 'autoComplete' | 'label'>>(
  (props, ref) => (
    <FormField
      ref={ref}
      type="tel"
      autoComplete="tel"
      label="Số điện thoại"
      placeholder="+84901234567"
      helpText="Số điện thoại là bắt buộc."
      required
      {...props}
    />
  )
);

// Address Field
export const AddressField = React.forwardRef<HTMLInputElement, Omit<FormFieldProps, 'type' | 'autoComplete' | 'label'>>(
  (props, ref) => (
    <FormField
      ref={ref}
      type="text"
      autoComplete="street-address"
      label="Địa chỉ"
      placeholder="123 Đường ABC, Quận 1, TP.HCM"
      helpText="Địa chỉ phải có ít nhất 10 ký tự"
      required
      {...props}
    />
  )
);

// Referral Code Field
export const ReferralCodeField = React.forwardRef<HTMLInputElement, Omit<FormFieldProps, 'type' | 'autoComplete' | 'label'>>(
  (props, ref) => (
    <FormField
      ref={ref}
      type="text"
      autoComplete="off"
      label="Mã giới thiệu"
      placeholder="VNLZHX0W"
      helpText="Nhập mã giới thiệu từ người mời bạn (tùy chọn)"
      required={false}
      {...props}
    />
  )
);

NameField.displayName = 'NameField';
EmailField.displayName = 'EmailField';
PasswordField.displayName = 'PasswordField';
ConfirmPasswordField.displayName = 'ConfirmPasswordField';
DisplayNameField.displayName = 'DisplayNameField';
PhoneField.displayName = 'PhoneField';
AddressField.displayName = 'AddressField';
ReferralCodeField.displayName = 'ReferralCodeField';
