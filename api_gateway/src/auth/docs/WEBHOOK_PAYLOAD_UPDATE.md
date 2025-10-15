# Webhook Payload Update - Referral Code Field

## Tổng quan

Tài liệu này mô tả việc cập nhật payload webhook để sử dụng trường `referral_code` thay vì `invited_by` khi gửi dữ liệu đến external webhook endpoint.

## Vấn đề

- Webhook endpoint `auth.luck8event.com/api/v1/auth/register` expect trường `referral_code` 
- Hiện tại payload đang gửi trường `invited_by`
- Điều này gây ra lỗi khi webhook endpoint không nhận được đúng trường dữ liệu

## Giải pháp

### 1. Cập nhật WebhookRequestDto

**File:** `src/webhook/dto/webhook.dto.ts`

```typescript
// Trước
@ApiProperty({
  description: 'Mã giới thiệu của người mời',
  example: 'VNLZHX0W',
  type: 'string',
  required: false,
})
@IsOptional()
@IsString({ message: 'Invited by must be a string' })
invited_by?: string;

// Sau
@ApiProperty({
  description: 'Mã giới thiệu của người mời',
  example: 'VNLZHX0W',
  type: 'string',
  required: false,
})
@IsOptional()
@IsString({ message: 'Referral code must be a string' })
referral_code?: string;
```

### 2. Cập nhật AuthService

**File:** `src/auth/auth.service.ts`

#### Method register()
```typescript
// Trước
const webhookData: WebhookRequestDto = {
  username,
  email,
  password,
  phone_number,
  address,
  invited_by,
};

// Sau
const webhookData: WebhookRequestDto = {
  username,
  email,
  password,
  phone_number,
  address,
  referral_code: invited_by, // Map từ invited_by sang referral_code
};
```

#### Method registerV2()
```typescript
// Trước
const webhookData: WebhookRequestDto = {
  username: registerDto.username,
  email: registerDto.email,
  password: registerDto.password,
  phone_number: registerDto.phone_number,
  address: registerDto.address,
  invited_by: registerDto.invited_by,
  recaptchaToken: registerDto.recaptchaToken,
};

// Sau
const webhookData: WebhookRequestDto = {
  username: registerDto.username,
  email: registerDto.email,
  password: registerDto.password,
  phone_number: registerDto.phone_number,
  address: registerDto.address,
  referral_code: registerDto.invited_by, // Map từ invited_by sang referral_code
  recaptchaToken: registerDto.recaptchaToken,
};
```

## Payload Webhook mới

### Request Payload
```json
{
  "username": "lee1",
  "display_name": "lee1", 
  "email": "lee1@vaoluoitv.com",
  "address": "123 Abc hungf vuong",
  "referral_code": "F5DXXP6P",
  "password": "Admin@123",
  "phone_number": "+84397013210",
  "recaptchaToken": "0cAFcWeA6nMyfZiJaup4iuhLrPZR_wyuPdUjRB"
}
```

## Lưu ý quan trọng

1. **Frontend không thay đổi**: Frontend vẫn gửi `invited_by` trong request
2. **Backend mapping**: Backend sẽ map `invited_by` thành `referral_code` khi gửi webhook
3. **Database schema**: Database vẫn lưu trường `invited_by` như cũ
4. **Webhook endpoint**: External webhook endpoint sẽ nhận `referral_code` thay vì `invited_by`

## Kiểm tra

Để kiểm tra thay đổi hoạt động đúng:

1. **Test registration**: Đăng ký user mới với mã giới thiệu
2. **Check webhook logs**: Xem payload được gửi đến webhook endpoint
3. **Verify response**: Kiểm tra webhook response có thành công không

## Files đã thay đổi

- `src/webhook/dto/webhook.dto.ts` - Cập nhật DTO
- `src/auth/auth.service.ts` - Cập nhật mapping logic
- `src/auth/docs/RECAPTCHA_V3_INTEGRATION.md` - Cập nhật documentation
- `src/auth/docs/WEBHOOK_PAYLOAD_UPDATE.md` - Tài liệu này
