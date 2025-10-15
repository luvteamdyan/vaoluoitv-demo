# Registration Endpoint Update - Loại bỏ reCAPTCHA

## Tổng quan thay đổi

Thực hiện cập nhật hệ thống đăng ký người dùng để loại bỏ tính năng reCAPTCHA và chuyển từ endpoint `v2/register` sang `/register` nhằm cải thiện trải nghiệm người dùng.

## Vấn đề trước đây

1. **reCAPTCHA gây khó khăn**: Người dùng gặp khó khăn khi đăng ký do phải xác thực reCAPTCHA
2. **Endpoint phức tạp**: Sử dụng endpoint `v2/register` với yêu cầu `recaptchaToken`
3. **Xử lý lỗi không rõ ràng**: Lỗi từ webhook không được hiển thị đúng cách

## Thay đổi thực hiện

### 1. Cập nhật AuthModal Component

**File**: `nextjs/src/components/modals/AuthModal.tsx`

#### Loại bỏ reCAPTCHA:
```typescript
// XÓA: Import useRecaptcha
// import { useRecaptcha } from '@/hooks/useRecaptcha';

// XÓA: reCAPTCHA hook và state
// const { token: recaptchaToken, isLoading: isRecaptchaLoading, ... } = useRecaptcha({...});

// XÓA: reCAPTCHA error display
// {recaptchaError && (...)}
```

#### Chuyển đổi endpoint:
```typescript
// TRƯỚC: Sử dụng RegisterV2Request và registerV2()
const registerRequest: RegisterV2Request = {
  username: registerData.username,
  display_name: registerData.display_name,
  email: registerData.email,
  password: registerData.password,
  phone_number: registerData.phone_number,
  address: registerData.address,
  referral_code: registerData.referral_code,
  recaptchaToken: token, // XÓA
};

await authService.registerV2(registerRequest);

// SAU: Sử dụng RegisterRequest và register()
const registerRequest: RegisterRequest = {
  username: registerData.username,
  display_name: registerData.display_name,
  email: registerData.email,
  password: registerData.password,
  phone_number: registerData.phone_number,
  address: registerData.address,
  referral_code: registerData.referral_code,
};

await authService.register(registerRequest);
```

#### Cải thiện xử lý lỗi:
```typescript
// Xử lý lỗi từ webhook và backend
let errorMessage = 'Có lỗi xảy ra';

if (error instanceof Error) {
  const message = error.message;
  
  // Xử lý các loại lỗi cụ thể từ backend
  if (message.includes('Email or username already exists')) {
    errorMessage = 'Email hoặc tên người dùng đã tồn tại';
  } else if (message.includes('Registration failed')) {
    errorMessage = 'Đăng ký thất bại. Vui lòng thử lại sau';
  } else if (message.includes('HTTP error! status: 409')) {
    errorMessage = 'Tài khoản đã tồn tại';
  } else if (message.includes('HTTP error! status: 400')) {
    errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin';
  } else if (message.includes('HTTP error! status: 500')) {
    errorMessage = 'Lỗi server. Vui lòng thử lại sau';
  }
  // ... thêm các trường hợp khác
}
```

### 2. Cập nhật Type Definitions

**File**: `nextjs/src/types/user.ts`

```typescript
// CẬP NHẬT: RegisterRequest để bao gồm tất cả field cần thiết
export interface RegisterRequest {
  username: string;
  display_name: string;  // THÊM
  email: string;
  password: string;
  phone_number: string;  // THÊM
  address: string;       // THÊM
  referral_code: string; // THÊM
}

// GIỮ NGUYÊN: RegisterV2Request (có thể xóa sau nếu không dùng)
export interface RegisterV2Request {
  username: string;
  display_name: string;
  email: string;
  password: string;
  phone_number: string;
  address: string;
  referral_code: string;
  recaptchaToken: string; // Chỉ dùng cho v2
}
```

### 3. Xóa file không sử dụng

**File đã xóa**: `nextjs/src/hooks/useRecaptcha.ts`

- File này chứa toàn bộ logic reCAPTCHA v3
- Không còn cần thiết sau khi loại bỏ tính năng

## Lợi ích của thay đổi

### 1. Cải thiện UX
- **Đơn giản hóa**: Loại bỏ bước xác thực reCAPTCHA
- **Tốc độ**: Đăng ký nhanh hơn, ít bước hơn
- **Tỷ lệ thành công**: Giảm tỷ lệ bỏ cuộc do reCAPTCHA

### 2. Bảo trì dễ dàng
- **Code đơn giản**: Ít logic phức tạp hơn
- **Ít dependency**: Không phụ thuộc vào Google reCAPTCHA
- **Debug dễ hơn**: Ít layer xử lý

### 3. Xử lý lỗi tốt hơn
- **Thông báo rõ ràng**: Lỗi từ webhook được dịch sang tiếng Việt
- **Phân loại lỗi**: Xử lý từng loại lỗi cụ thể
- **User-friendly**: Thông báo lỗi dễ hiểu cho người dùng

## Endpoint Mapping

| Trước đây | Sau khi cập nhật |
|-----------|------------------|
| `POST /api/v1/auth/v2/register` | `POST /api/v1/auth/register` |
| Yêu cầu `recaptchaToken` | Không yêu cầu reCAPTCHA |
| `RegisterV2Request` | `RegisterRequest` |
| `authService.registerV2()` | `authService.register()` |

## Testing

### Test Cases cần kiểm tra:

1. **Đăng ký thành công**:
   - Tạo tài khoản mới với đầy đủ thông tin
   - Kiểm tra chuyển sang form đăng nhập sau khi thành công

2. **Xử lý lỗi**:
   - Email đã tồn tại → "Email hoặc tên người dùng đã tồn tại"
   - Dữ liệu không hợp lệ → "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin"
   - Lỗi server → "Lỗi server. Vui lòng thử lại sau"
   - Mất kết nối → "Không thể kết nối đến server. Vui lòng thử lại sau"

3. **Validation**:
   - Kiểm tra validation form vẫn hoạt động đúng
   - Kiểm tra hiển thị lỗi field-specific

4. **Performance**:
   - Đăng ký nhanh hơn (không cần load reCAPTCHA)
   - Ít request hơn (không cần gọi Google API)

## Rollback Plan

Nếu cần rollback:

1. **Khôi phục file useRecaptcha.ts**:
   ```bash
   git checkout HEAD~1 -- nextjs/src/hooks/useRecaptcha.ts
   ```

2. **Khôi phục AuthModal.tsx**:
   ```bash
   git checkout HEAD~1 -- nextjs/src/components/modals/AuthModal.tsx
   ```

3. **Khôi phục types**:
   ```bash
   git checkout HEAD~1 -- nextjs/src/types/user.ts
   ```

## Monitoring

### Metrics cần theo dõi:

1. **Registration Success Rate**: Tỷ lệ đăng ký thành công
2. **Registration Completion Time**: Thời gian hoàn thành đăng ký
3. **Error Rate**: Tỷ lệ lỗi đăng ký
4. **User Drop-off**: Tỷ lệ bỏ cuộc trong quá trình đăng ký

### Logs cần kiểm tra:

- Registration requests và responses
- Error messages từ webhook
- Performance metrics

---

**📅 Ngày cập nhật**: 15/01/2025  
**👨‍💻 Thực hiện bởi**: Development Team  
**🔗 Liên quan**: Auth Module, Frontend Components
