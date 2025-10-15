# Webhook Error Handling - Lưu và hiển thị lỗi chi tiết

## Tổng quan

Implement tính năng lưu và hiển thị lỗi chi tiết từ webhook để người dùng biết được lỗi cụ thể (ví dụ: số điện thoại đã được đăng ký) thay vì chỉ nhận được thông báo lỗi chung.

## Vấn đề trước đây

1. **Lỗi không rõ ràng**: Người dùng chỉ nhận được thông báo "Registration failed" chung chung
2. **Không biết lỗi cụ thể**: Không biết field nào bị lỗi (email, phone, username)
3. **UX kém**: Người dùng phải đoán lỗi và thử lại nhiều lần

## Giải pháp implement

### 1. Cập nhật WebhookErrorDto

**File**: `api_gateway/src/webhook/dto/webhook.dto.ts`

```typescript
export class WebhookErrorDto {
  // ... existing fields ...
  
  @ApiProperty({
    description: 'Chi tiết lỗi từ webhook response (nếu có)',
    example: { field: 'phone_number', message: 'Phone number already exists' },
    required: false,
  })
  webhookError?: {
    field?: string;
    message?: string;
    code?: string;
    details?: any;
  };

  @ApiProperty({
    description: 'Dữ liệu lỗi từ webhook response',
    example: { error: 'Validation failed', details: { phone_number: ['already exists'] } },
    required: false,
  })
  webhookResponse?: any;
}
```

### 2. Cập nhật WebhookService

**File**: `api_gateway/src/webhook/webhook.service.ts`

#### Thêm method extractWebhookError:

```typescript
private extractWebhookError(webhookResponse: any): {
  field?: string;
  message?: string;
  code?: string;
  details?: any;
} {
  if (!webhookResponse) return {};

  // Xử lý các format lỗi khác nhau từ webhook
  if (webhookResponse.error) {
    // Format: { error: "Phone number already exists" }
    return {
      message: webhookResponse.error,
      details: webhookResponse,
    };
  }

  if (webhookResponse.message) {
    // Format: { message: "Validation failed", details: { phone_number: ["already exists"] } }
    const details = webhookResponse.details || {};
    const firstField = Object.keys(details)[0];
    const firstError = Array.isArray(details[firstField]) 
      ? details[firstField][0] 
      : details[firstField];

    return {
      field: firstField,
      message: firstError || webhookResponse.message,
      code: webhookResponse.code,
      details: webhookResponse,
    };
  }

  if (webhookResponse.details) {
    // Format: { details: { phone_number: ["already exists"] } }
    const firstField = Object.keys(webhookResponse.details)[0];
    const firstError = Array.isArray(webhookResponse.details[firstField]) 
      ? webhookResponse.details[firstField][0] 
      : webhookResponse.details[firstField];

    return {
      field: firstField,
      message: firstError,
      details: webhookResponse,
    };
  }

  return {
    message: webhookResponse.toString(),
    details: webhookResponse,
  };
}
```

#### Cập nhật error handling trong registerV1 và registerV2:

```typescript
if (error.response) {
  // Server responded with error status - lưu chi tiết lỗi từ webhook
  const webhookResponse = error.response.data;
  const webhookError = this.extractWebhookError(webhookResponse);
  
  this.logger.error(
    `Webhook error details for user ${userData.email}:`,
    JSON.stringify(webhookResponse, null, 2)
  );

  throw new HttpException(
    {
      success: false,
      message: webhookResponse?.message || 'Auth webhook request failed',
      error: webhookResponse?.message || error.response.data?.message || error.message,
      statusCode: error.response.status,
      webhookError,
      webhookResponse,
    },
    error.response.status,
  );
}
```

### 3. Cập nhật AuthService

**File**: `api_gateway/src/auth/auth.service.ts`

#### Cập nhật error handling trong register() và registerV2():

```typescript
} catch (error) {
  this.logger.error(
    `Webhook failed for user registration: ${email}`,
    error.stack,
  );

  // Xử lý lỗi chi tiết từ webhook - trả về trực tiếp message từ webhook
  if (error.response?.data) {
    const webhookError = error.response.data;
    const webhookErrorDetails = webhookError.webhookError;
    
    // Tạo thông báo lỗi chi tiết theo format field:message
    let errorMessage = 'Registration failed';
    
    if (webhookErrorDetails?.field && webhookErrorDetails?.message) {
      // Lỗi cụ thể về field - format: "field_name: error_message"
      errorMessage = `${webhookErrorDetails.field}: ${webhookErrorDetails.message}`;
    } else if (webhookErrorDetails?.message) {
      // Lỗi chung - sử dụng message trực tiếp từ webhook
      errorMessage = webhookErrorDetails.message;
    } else if (webhookError?.error) {
      // Fallback - sử dụng error trực tiếp từ webhook
      errorMessage = webhookError.error;
    } else if (webhookError?.message) {
      // Sử dụng message trực tiếp từ webhook response
      errorMessage = webhookError.message;
    }

    this.logger.error(
      `Webhook error for user ${email}: ${errorMessage}`,
      JSON.stringify(webhookError, null, 2)
    );

    throw new UnauthorizedException(errorMessage);
  }

  // Nếu webhook fail, throw error để không tạo user
  throw new UnauthorizedException(`Registration failed: ${error.message}`);
}
```

### 4. Cập nhật Frontend

**File**: `nextjs/src/components/modals/AuthModal.tsx`

#### Cải thiện error handling - sử dụng message trực tiếp:

```typescript
// Xử lý lỗi từ webhook và backend - sử dụng message trực tiếp
let errorMessage = 'Có lỗi xảy ra';
const fieldErrors: ValidationError = {};

if (error instanceof Error) {
  const message = error.message;
  
  // Kiểm tra xem có phải lỗi field-specific không
  if (message.includes(':')) {
    // Format: "field_name: error message"
    const [fieldName, ...errorParts] = message.split(':');
    const fieldError = errorParts.join(':').trim();
    
    // Map field name từ backend sang frontend
    const fieldMapping: { [key: string]: string } = {
      'phone_number': 'phone_number',
      'email': 'email', 
      'username': 'username',
      'password': 'password',
      'display_name': 'display_name',
      'address': 'address',
      'referral_code': 'referral_code'
    };
    
    const mappedField = fieldMapping[fieldName.trim()];
    if (mappedField) {
      fieldErrors[mappedField] = fieldError;
    } else {
      // Nếu không map được field, hiển thị như general error
      errorMessage = message;
    }
  } else {
    // Sử dụng message trực tiếp cho general errors
    errorMessage = message;
  }

  // Nếu có field errors, hiển thị ở field cụ thể
  if (Object.keys(fieldErrors).length > 0) {
    setErrors(fieldErrors);
    setShakeFields(new Set(Object.keys(fieldErrors)));
    // Clear shake animation after delay
    setTimeout(() => setShakeFields(new Set()), 500);
    return;
  }
}

setErrors({ general: errorMessage });
```

## Các format lỗi được hỗ trợ

### 1. Format field-specific (Backend → Frontend)
```
phone_number: Số điện thoại đã được đăng ký
email: Email đã tồn tại trong hệ thống
username: Tên người dùng không hợp lệ
password: Mật khẩu phải có ít nhất 8 ký tự
```

### 2. Format general error
```
Registration failed
Invalid request data
Server error occurred
```

### 3. Format webhook response (Backend xử lý)
```json
{
  "error": "Phone number already exists"
}
```

```json
{
  "message": "Validation failed",
  "details": {
    "phone_number": ["already exists"],
    "email": ["invalid format"]
  }
}
```

```json
{
  "details": {
    "phone_number": ["already exists"]
  }
}
```

## Cách hoạt động của hệ thống

### 1. Flow xử lý lỗi

```
Webhook Response → WebhookService.extractWebhookError() → AuthService → Frontend
```

1. **Webhook trả về lỗi**: `{ "details": { "phone_number": ["already exists"] } }`
2. **WebhookService parse**: `{ field: "phone_number", message: "already exists" }`
3. **AuthService format**: `"phone_number: already exists"`
4. **Frontend parse**: Hiển thị lỗi tại field `phone_number`

### 2. Ưu điểm của approach mới

- **Đơn giản**: Không cần handle từng trường hợp với `includes()`
- **Linh hoạt**: Hỗ trợ bất kỳ field nào thông qua field mapping
- **Maintainable**: Dễ thêm field mới mà không cần sửa frontend
- **Consistent**: Cùng một cách xử lý cho tất cả lỗi
- **Direct message**: Trả về trực tiếp message từ webhook thay vì wrap

### 3. Thay đổi quan trọng: Trả về message trực tiếp

**Trước đây**:
```json
{
  "message": "Registration failed: Auth webhook V1 request failed",
  "error": "Unauthorized",
  "statusCode": 401
}
```

**Sau khi cập nhật**:
```json
{
  "message": "Số điện thoại đã được sử dụng",
  "error": "Conflict", 
  "statusCode": 409
}
```

- **WebhookService**: Trả về `webhookResponse?.message` thay vì wrap message
- **AuthService**: Sử dụng message trực tiếp từ webhook response
- **Frontend**: Nhận được message gốc từ webhook

### 4. Field Mapping

```typescript
const fieldMapping: { [key: string]: string } = {
  'phone_number': 'phone_number',
  'email': 'email', 
  'username': 'username',
  'password': 'password',
  'display_name': 'display_name',
  'address': 'address',
  'referral_code': 'referral_code'
};
```

## Lợi ích đạt được

### 1. UX tốt hơn
- **Lỗi rõ ràng**: Người dùng biết chính xác field nào bị lỗi
- **Thông báo cụ thể**: "Số điện thoại đã được đăng ký" thay vì "Registration failed"
- **Hiển thị field-specific**: Lỗi hiển thị ngay tại field bị lỗi

### 2. Debug dễ hơn
- **Log chi tiết**: Lưu toàn bộ webhook response để debug
- **Field mapping**: Biết chính xác field nào gây lỗi
- **Error tracking**: Theo dõi được các loại lỗi phổ biến

### 3. Maintenance tốt hơn
- **Centralized error handling**: Tất cả lỗi webhook được xử lý ở một nơi
- **Extensible**: Dễ dàng thêm format lỗi mới
- **Consistent**: Cùng một cách xử lý cho tất cả endpoints

## Test Cases

### 1. Lỗi số điện thoại đã tồn tại
**Input**: Đăng ký với số điện thoại đã có trong hệ thống
**Expected**: Hiển thị lỗi "Số điện thoại đã được đăng ký. Vui lòng sử dụng số khác" tại field phone_number

### 2. Lỗi email đã tồn tại
**Input**: Đăng ký với email đã có trong hệ thống
**Expected**: Hiển thị lỗi "Email đã được đăng ký. Vui lòng sử dụng email khác" tại field email

### 3. Lỗi username đã tồn tại
**Input**: Đăng ký với username đã có trong hệ thống
**Expected**: Hiển thị lỗi "Tên người dùng đã tồn tại. Vui lòng chọn tên khác" tại field username

### 4. Lỗi validation
**Input**: Dữ liệu không hợp lệ (email sai format, password quá ngắn)
**Expected**: Hiển thị lỗi cụ thể tại field tương ứng

### 5. Lỗi network/server
**Input**: Webhook không phản hồi hoặc lỗi server
**Expected**: Hiển thị thông báo lỗi chung phù hợp

## Monitoring và Logging

### 1. Log chi tiết
```typescript
this.logger.error(
  `Webhook error details for user ${email}:`,
  JSON.stringify(webhookResponse, null, 2)
);
```

### 2. Metrics cần theo dõi
- **Error rate by field**: Tỷ lệ lỗi theo từng field
- **Common errors**: Các lỗi phổ biến nhất
- **User retry rate**: Tỷ lệ người dùng thử lại sau lỗi

### 3. Alerts
- **High error rate**: Khi tỷ lệ lỗi webhook tăng cao
- **New error patterns**: Khi xuất hiện format lỗi mới
- **Field-specific issues**: Khi một field cụ thể có nhiều lỗi

## Rollback Plan

Nếu cần rollback:

1. **Khôi phục WebhookErrorDto**:
   ```bash
   git checkout HEAD~1 -- api_gateway/src/webhook/dto/webhook.dto.ts
   ```

2. **Khôi phục WebhookService**:
   ```bash
   git checkout HEAD~1 -- api_gateway/src/webhook/webhook.service.ts
   ```

3. **Khôi phục AuthService**:
   ```bash
   git checkout HEAD~1 -- api_gateway/src/auth/auth.service.ts
   ```

4. **Khôi phục Frontend**:
   ```bash
   git checkout HEAD~1 -- nextjs/src/components/modals/AuthModal.tsx
   ```

## Future Enhancements

### 1. Error Translation
- Tự động dịch lỗi từ webhook sang tiếng Việt
- Hỗ trợ đa ngôn ngữ

### 2. Error Suggestions
- Đề xuất giải pháp cho từng loại lỗi
- Gợi ý username/email thay thế

### 3. Error Analytics
- Dashboard theo dõi lỗi real-time
- Phân tích xu hướng lỗi

---

**📅 Ngày cập nhật**: 15/01/2025  
**👨‍💻 Thực hiện bởi**: Development Team  
**🔗 Liên quan**: Auth Module, Webhook Service, Frontend Components
