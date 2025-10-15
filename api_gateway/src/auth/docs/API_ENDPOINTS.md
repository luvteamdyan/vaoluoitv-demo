# Auth Module - API Endpoints Documentation

## Tổng quan

Module Auth cung cấp các API endpoints cho authentication và authorization trong hệ thống API Gateway. Tất cả endpoints đều được document bằng Swagger/OpenAPI.

## Base URL
```
/api/v1/auth
```

## Authentication Endpoints

### 1. Đăng nhập (Login)

**Endpoint:** `POST /api/v1/auth/login`

**Mô tả:** Đăng nhập vào hệ thống bằng email/username và mật khẩu. Hệ thống sẽ gọi webhook đến external auth service trước để xác thực.

**Request Body:**
```json
{
  "email": "user@example.com", // hoặc username
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "5a1101a4-c71e-4695-b344-457522dc92ed",
    "username": "testuser",
    "display_name": "Nguyễn Văn A",
    "email": "test@abc.com",
    "phone_number": "+84901234547",
    "address": "123 Đường ABC, Quận 1, TP.HCM",
    "sms_verified": false,
    "points": 50,
    "referral_code": "VNLZHX0W",
    "invited_by": null,
    "role": "user",
    "last_login": "2025-09-23T02:55:27.677Z",
    "is_active": true,
    "external_id": "5a1101a4-c71e-4695-b344-457522dc92ed"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Thông tin đăng nhập không chính xác hoặc webhook xác thực thất bại

**Workflow:**
1. Validate input data
2. Gửi request đến external auth webhook
3. Tìm hoặc tạo user trong local database
4. Generate JWT token
5. Update last_login timestamp
6. Trả về access_token và user data

### 2. Đăng ký (Register)

**Endpoint:** `POST /api/v1/auth/register`

**Mô tả:** Tạo tài khoản người dùng mới. Hệ thống sẽ gửi dữ liệu đến webhook endpoint trước để đăng ký trên hệ thống chính.

**Request Body:**
```json
{
  "username": "testuser",
  "display_name": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "password123",
  "phone_number": "+84901234567",
  "address": "123 Đường ABC, Quận 1, TP.HCM",
  "invited_by": "VNLZHX0W"
}
```

**Response (201 Created):**
```json
{
  "message": "Registration successful",
  "user": {
    "id": "5a1101a4-c71e-4695-b344-457522dc92ed",
    "username": "testuser",
    "display_name": "Nguyễn Văn A",
    "email": "test@abc.com",
    "phone_number": "+84901234567",
    "address": "123 Đường ABC, Quận 1, TP.HCM",
    "sms_verified": false,
    "points": 0,
    "referral_code": "VNLZHX0W",
    "invited_by": "VNLZHX0W",
    "role": "user",
    "is_active": true,
    "external_id": "5a1101a4-c71e-4695-b344-457522dc92ed",
    "created_at": "2025-09-23T02:55:00.698Z",
    "updated_at": "2025-09-23T02:55:00.698Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Dữ liệu đầu vào không hợp lệ
- `409 Conflict`: Email đã tồn tại trong hệ thống
- `500 Internal Server Error`: Lỗi webhook hoặc không thể tạo tài khoản

**Validation Rules:**
- `username`: Required, string
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters
- `phone_number`: Optional, Vietnamese phone format
- `address`: Optional, string
- `invited_by`: Optional, string
- `display_name`: Optional, string

**Workflow:**
1. Validate input data
2. Kiểm tra duplicate email/username
3. Gửi data đến external webhook
4. Hash password
5. Generate referral code
6. Tạo user trong local database
7. Trả về user data

### 3. Validate Token

**Endpoint:** `GET /api/v1/auth/validate`

**Mô tả:** Endpoint để validate JWT token cho các microservice khác.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "user": {
        "id": "5a1101a4-c71e-4695-b344-457522dc92ed",
        "email": "test@abc.com",
        "role": "user",
        "name": "testuser",
        "external_id": "5a1101a4-c71e-4695-b344-457522dc92ed"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Token không hợp lệ hoặc đã hết hạn

**Workflow:**
1. Extract JWT token từ Authorization header
2. Verify token signature và expiration
3. Tìm user trong database bằng token payload
4. Trả về user information

## Webhook Endpoints

### 1. Send User Data

**Endpoint:** `POST /api/v1/webhook/send-user-data`

**Mô tả:** Gửi dữ liệu người dùng đến auth webhook endpoint.

**Request Body:**
```json
{
  "username": "testuser",
  "email": "user@example.com",
  "password": "password123",
  "phone_number": "+84901234567",
  "address": "123 Đường ABC, Quận 1, TP.HCM",
  "invited_by": "VNLZHX0W"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "123",
    "message": "User created successfully"
  },
  "statusCode": 200,
  "message": "User data sent successfully"
}
```

### 2. Send User Data with Retry

**Endpoint:** `POST /api/v1/webhook/send-user-data-with-retry`

**Mô tả:** Gửi dữ liệu người dùng với retry mechanism (tối đa 3 lần).

**Request Body:** Tương tự như endpoint trên

**Response:** Tương tự như endpoint trên

## Authentication Guards

### 1. JWT Auth Guard

**Sử dụng:** `@UseGuards(JwtAuthGuard)`

**Mô tả:** Bảo vệ endpoints yêu cầu authentication. Kiểm tra JWT token trong Authorization header.

**Headers Required:**
```
Authorization: Bearer <jwt_token>
```

### 2. Local Auth Guard

**Sử dụng:** `@UseGuards(LocalAuthGuard)`

**Mô tả:** Bảo vệ login endpoint. Sử dụng LocalStrategy để validate credentials.

### 3. Roles Guard

**Sử dụng:** `@UseGuards(RolesGuard)`

**Mô tả:** Bảo vệ endpoints yêu cầu specific roles. Phải sử dụng kết hợp với JwtAuthGuard.

**Example:**
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
@Get('admin-only')
```

## User Roles

```typescript
enum UserRole {
  ADMIN = 'admin',    // Quản trị viên
  USER = 'user',      // Người dùng thường
  CASTER = 'caster',  // Caster/Streamer
  STAFF = 'staff'     // Nhân viên
}
```

## Error Codes

| HTTP Status | Code | Mô tả |
|-------------|------|-------|
| 200 | OK | Request thành công |
| 201 | Created | Tạo resource thành công |
| 400 | Bad Request | Dữ liệu đầu vào không hợp lệ |
| 401 | Unauthorized | Không có quyền truy cập hoặc token không hợp lệ |
| 403 | Forbidden | Không đủ quyền để truy cập resource |
| 404 | Not Found | Resource không tồn tại |
| 409 | Conflict | Resource đã tồn tại (duplicate) |
| 408 | Request Timeout | Webhook timeout |
| 500 | Internal Server Error | Lỗi server |
| 503 | Service Unavailable | External service không khả dụng |

## Request/Response Examples

### Login Request
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Register Request
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "user@example.com",
    "password": "password123",
    "phone_number": "+84901234567",
    "address": "123 Đường ABC, Quận 1, TP.HCM"
  }'
```

### Validate Token Request
```bash
curl -X GET http://localhost:3000/api/v1/auth/validate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Security Considerations

### 1. Password Security
- Passwords được hash bằng bcrypt với salt rounds = 10
- Password không bao giờ được trả về trong response
- Minimum password length: 6 characters

### 2. Token Security
- JWT tokens có expiration time (default: 7 days)
- Tokens được signed bằng secret key
- Token validation được thực hiện ở mọi protected endpoint

### 3. Data Privacy
- Sensitive data không được log
- User data được sanitize trước khi trả về
- Proper error messages không expose internal details

## Rate Limiting

Hiện tại chưa implement rate limiting, nhưng được khuyến nghị cho production:

```typescript
// Future implementation
@UseGuards(ThrottlerGuard)
@Throttle(5, 60) // 5 requests per minute
@Post('login')
async login() { ... }
```

## Monitoring & Logging

### Logged Events
- Login attempts (success/failure)
- Registration attempts
- Token validation requests
- Webhook calls (success/failure)
- Error occurrences

### Metrics to Track
- Login success/failure rates
- Registration success rates
- Webhook response times
- Token validation frequency
- Error rates by endpoint

## Testing

### Unit Tests
- AuthService methods
- JWT token generation/validation
- Password hashing/validation
- Webhook integration

### Integration Tests
- Full authentication flow
- Webhook integration
- Database operations
- Error scenarios

### Test Data
```json
{
  "validUser": {
    "email": "test@example.com",
    "password": "password123"
  },
  "invalidUser": {
    "email": "invalid@example.com",
    "password": "wrongpassword"
  }
}
```

## Future Enhancements

### Planned Features
1. **Refresh Token**: Implement refresh token mechanism
2. **OAuth Integration**: Support Google, Facebook login
3. **Multi-factor Authentication**: SMS/Email OTP
4. **Password Reset**: Email-based password reset
5. **Account Lockout**: Brute force protection
6. **Session Management**: Active session tracking

### API Improvements
1. **Rate Limiting**: API rate limiting
2. **Caching**: Response caching for validation
3. **Health Checks**: Service health monitoring
4. **Metrics**: Prometheus metrics integration
5. **Documentation**: Enhanced Swagger documentation

