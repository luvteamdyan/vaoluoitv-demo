// Auth validation messages
export const AUTH_MESSAGES = {
  // Validation messages
  EMAIL_REQUIRED: 'Email không được để trống',
  EMAIL_INVALID: 'Email không đúng định dạng',
  USERNAME_REQUIRED: 'Tên đăng nhập không được để trống',
  USERNAME_MIN_LENGTH: 'Tên đăng nhập phải có ít nhất 3 ký tự',
  USERNAME_NO_SPACES: 'Tên đăng nhập không được chứa khoảng trắng',
  PASSWORD_REQUIRED: 'Mật khẩu không được để trống',
  PASSWORD_MIN_LENGTH: 'Mật khẩu phải có ít nhất 8 ký tự',
  PASSWORD_WEAK: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 số và 1 ký tự đặc biệt',
  CONFIRM_PASSWORD_REQUIRED: 'Vui lòng xác nhận mật khẩu',
  CONFIRM_PASSWORD_MISMATCH: 'Mật khẩu xác nhận không khớp',
  PHONE_REQUIRED: 'Số điện thoại không được để trống',
  PHONE_INVALID: 'Số điện thoại không đúng định dạng',
  ADDRESS_MIN_LENGTH: 'Địa chỉ phải có ít nhất 10 ký tự',
  ADDRESS_TOO_LONG: 'Địa chỉ không được quá 150 ký tự',
  REFERRAL_CODE_INVALID: 'Mã giới thiệu không hợp lệ',
  
  // Error messages
  LOGIN_FAILED: 'Đăng nhập thất bại',
  REGISTER_FAILED: 'Đăng ký thất bại',
  INVALID_CREDENTIALS: 'Mật khẩu hoặc email không hợp lệ, vui lòng nhập lại',
  USER_NOT_FOUND: 'Mật khẩu hoặc email không hợp lệ, vui lòng nhập lại',
  EMAIL_OR_USERNAME_ALREADY_EXISTS: 'Email hoặc tên đăng nhập này đã được sử dụng',
  EMAIL_ALREADY_EXISTS: 'Email hoặc tên đăng nhập này đã được sử dụng',
  USERNAME_ALREADY_EXISTS: 'Email hoặc tên đăng nhập này đã được sử dụng',
  NETWORK_ERROR: 'Lỗi kết nối mạng',
  UNAUTHORIZED: 'Mật khẩu hoặc email không hợp lệ, vui lòng nhập lại',
  INVALID_EMAIL: 'Email không hợp lệ',
  PASSWORD_TOO_WEAK: 'Mật khẩu quá yếu',
  VALIDATION_FAILED: 'Thông tin không hợp lệ',
  
  // Profile validation messages
  PROFILE_UPDATE_FAILED: 'Cập nhật hồ sơ thất bại',
  DISPLAY_NAME_TOO_SHORT: 'Tên hiển thị phải có ít nhất 2 ký tự',
  DISPLAY_NAME_TOO_LONG: 'Tên hiển thị không được quá 20 ký tự',
  PHONE_NUMBER_INVALID_FORMAT: 'Số điện thoại không đúng định dạng',
  ADDRESS_TOO_SHORT: 'Địa chỉ phải có ít nhất 10 ký tự',
  
  // Success messages
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  REGISTER_SUCCESS: 'Đăng ký thành công',
} as const;

// Validation rules
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MIN_USERNAME_LENGTH: 3,
  MIN_PASSWORD_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  PHONE_REGEX: /^\+84[0-9]{9,10}$/,
  MIN_ADDRESS_LENGTH: 10,
  MAX_ADDRESS_LENGTH: 150,
  REFERRAL_CODE_REGEX: /^[A-Z0-9]{8}$/,
  MIN_DISPLAY_NAME_LENGTH: 2,
  MAX_DISPLAY_NAME_LENGTH: 20,
} as const;

// Form placeholders
export const FORM_PLACEHOLDERS = {
  USERNAME: 'Tên đăng nhập',
  EMAIL: 'Địa chỉ Email',
  PASSWORD: 'Mật khẩu',
  CONFIRM_PASSWORD: 'Xác nhận mật khẩu',
  PHONE_NUMBER: '+84901234567',
  ADDRESS: '123 Đường ABC, Quận 1, TP.HCM',
  INVITED_BY: 'VNLZHX0W',
} as const;
