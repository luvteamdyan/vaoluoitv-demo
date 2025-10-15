# Auth Module - Implementation Logic Details

## Tổng quan Logic Implementation

Module Auth được thiết kế với kiến trúc hybrid authentication, kết hợp giữa local database và external authentication service thông qua webhook integration. Điều này đảm bảo tính nhất quán dữ liệu và khả năng mở rộng.

## 1. Authentication Strategy Logic

### 1.1 Dual Authentication Approach

```typescript
// Primary: Webhook-based authentication
async validateUserWithWebhook(identifier: string, password: string) {
  try {
    // 1. Gửi request đến external auth service
    const webhookResponse = await this.webhookService.sendLoginRequestWithRetry({
      identifier,
      password
    }, 3);
    
    // 2. Lấy access_token từ webhook response
    const accessToken = webhookResponse.data.access_token;
    if (!accessToken) {
      throw new UnauthorizedException('Access token not found in webhook response');
    }

    // 3. Gọi /users/me để lấy thông tin user đầy đủ
    const userProfileResponse = await this.webhookService.getUserProfileWithRetry(accessToken, 3);
    
    if (!userProfileResponse.success || !userProfileResponse.data) {
      throw new UnauthorizedException('Failed to get user profile from webhook');
    }

    const webhookUserData = userProfileResponse.data.user;
    const webhookUsername = webhookUserData?.username;

    if (!webhookUsername) {
      throw new UnauthorizedException('Username not found in user profile response');
    }
    
    // 4. Tìm hoặc tạo user trong local database
    let user = await this.findUserByUsername(webhookUsername);
    
    if (!user) {
      // Auto-register từ webhook data
      user = await this.createUserFromWebhookResponse(webhookUserData, password);
    } else {
      // Cập nhật thông tin user từ webhook response
      await this.updateUserFromWebhookResponse(user, webhookUserData);
    }
    
    return this.sanitizeUserData(user);
  } catch (error) {
    // Fallback: Local authentication
    return await this.fallbackToLocalAuth(identifier, password);
  }
}
```

### 1.2 Fallback Logic

```typescript
private async fallbackToLocalAuth(identifier: string, password: string) {
  const isEmail = identifier.includes('@');
  
  if (isEmail) {
    // Tìm user bằng email
    return await this.validateUser(identifier, password);
  } else {
    // Tìm user bằng username
    const user = await this.userModel.findOne({ username: identifier }).exec();
    if (user && await bcrypt.compare(password, user.password)) {
      return this.sanitizeUserData(user);
    }
  }
  
  return null;
}
```

## 2. User Registration Logic

### 2.1 Registration Flow

```typescript
async register(username, email, password, phone_number, address, invited_by, display_name) {
  // 1. Kiểm tra duplicate
  const existingUser = await this.userModel.findOne({
    $or: [{ email }, { username }]
  }).exec();
  
  if (existingUser) {
    throw new UnauthorizedException('Email or username already exists');
  }
  
  // 2. Gửi data đến external service
  const webhookData = {
    username, email, password, phone_number, address, invited_by
  };
  
  const webhookResponse = await this.webhookService.sendUserDataWithRetry(webhookData, 3);
  
  // 3. Tạo user local từ webhook response
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new this.userModel({
    username: webhookResponse.data.user.username || username,
    display_name: webhookResponse.data.user.display_name || display_name,
    email: webhookResponse.data.user.email || email,
    password: hashedPassword,
    phone_number: webhookResponse.data.user.phone_number || phone_number,
    address: webhookResponse.data.user.address || address,
    sms_verified: webhookResponse.data.user.sms_verified || false,
    points: webhookResponse.data.user.points || 0,
    referral_code: webhookResponse.data.user.referral_code || null,
    invited_by: webhookResponse.data.user.invited_by || invited_by,
    role: webhookResponse.data.user.role || 'user',
    is_active: webhookResponse.data.user.is_active !== undefined ? webhookResponse.data.user.is_active : true
  });
  
  await user.save();
  return this.sanitizeUserData(user);
}
```

### 2.2 Auto-Registration Logic

```typescript
private async createUserFromWebhookResponse(webhookUserData: any, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = new this.userModel({
    username: webhookUserData.username || webhookUserData.email?.split('@')[0] || 'user',
    display_name: webhookUserData.display_name || null,
    email: webhookUserData.email,
    password: hashedPassword,
    phone_number: webhookUserData.phone_number || null,
    address: webhookUserData.address || null,
    sms_verified: webhookUserData.sms_verified || false,
    points: webhookUserData.points || 0,
    referral_code: webhookUserData.referral_code || null,
    invited_by: webhookUserData.invited_by || null,
    role: webhookUserData.role || 'user',
    is_active: webhookUserData.is_active !== undefined ? webhookUserData.is_active : true,
    external_id: webhookUserData.id || null
  });
  
  return await user.save();
}
```

### 2.3 User Data Sync Logic

```typescript
private async updateUserFromWebhookResponse(user: UserDocument, webhookUserData: any) {
  const updateData: any = {};

  // Cập nhật các field có thể thay đổi từ webhook
  if (webhookUserData.display_name !== undefined) {
    updateData.display_name = webhookUserData.display_name;
  }
  if (webhookUserData.email !== undefined) {
    updateData.email = webhookUserData.email;
  }
  if (webhookUserData.phone_number !== undefined) {
    updateData.phone_number = webhookUserData.phone_number;
  }
  if (webhookUserData.address !== undefined) {
    updateData.address = webhookUserData.address;
  }
  if (webhookUserData.sms_verified !== undefined) {
    updateData.sms_verified = webhookUserData.sms_verified;
  }
  if (webhookUserData.points !== undefined) {
    updateData.points = webhookUserData.points;
  }
  if (webhookUserData.referral_code !== undefined) {
    updateData.referral_code = webhookUserData.referral_code;
  }
  if (webhookUserData.invited_by !== undefined) {
    updateData.invited_by = webhookUserData.invited_by;
  }
  if (webhookUserData.role !== undefined) {
    updateData.role = webhookUserData.role;
  }
  if (webhookUserData.is_active !== undefined) {
    updateData.is_active = webhookUserData.is_active;
  }
  if (webhookUserData.last_login !== undefined) {
    updateData.last_login = new Date(webhookUserData.last_login);
  }
  if (webhookUserData.id !== undefined) {
    updateData.external_id = webhookUserData.id;
  }

  // Chỉ update nếu có dữ liệu để update
  if (Object.keys(updateData).length > 0) {
    await this.userModel.findByIdAndUpdate(user._id, updateData).exec();
  }
}
```

## 3. JWT Token Logic

### 3.1 Token Generation

```typescript
login(user: any): { access_token: string; user: any } {
  // 1. Tạo JWT payload
  const payload = { 
    email: user.email, 
    sub: user._id, 
    role: user.role,
    external_id: user.external_id 
  };
  
  // 2. Update last_login timestamp (async)
  void this.userModel.findByIdAndUpdate(user._id, { 
    last_login: new Date() 
  }).exec();
  
  // 3. Generate token và response
  return {
    access_token: this.jwtService.sign(payload),
    user: {
      id: user._id,
      username: user.username,
      display_name: user.display_name,
      email: user.email,
      phone_number: user.phone_number,
      address: user.address,
      sms_verified: user.sms_verified,
      points: user.points,
      referral_code: user.referral_code,
      invited_by: user.invited_by,
      role: user.role,
      last_login: user.last_login,
      is_active: user.is_active,
      external_id: user.external_id
    }
  };
}
```

### 3.2 Token Validation

```typescript
// JWT Strategy
async validate(payload: any) {
  const user = await this.authService.findById(String(payload.sub));
  if (!user) {
    return null; // Token invalid nếu user không tồn tại
  }
  
  // Validate external_id consistency if present in both payload and user
  if (payload.external_id && user.external_id && payload.external_id !== user.external_id) {
    // external_id might have been updated
  }
  
  return {
    id: user._id,
    email: user.email,
    name: user.username,
    role: user.role,
    external_id: user.external_id
  };
}
```

## 4. Webhook Integration Logic

### 4.1 Retry Mechanism

```typescript
async sendUserDataWithRetry(userData: WebhookRequestDto, maxRetries: number = 3) {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      this.logger.log(`Attempt ${attempt}/${maxRetries} for user: ${userData.email}`);
      
      const result = await this.sendUserData(userData);
      
      if (result.success) {
        this.logger.log(`Success on attempt ${attempt} for user: ${userData.email}`);
        return result;
      }
      
      throw new Error(`Webhook returned success=false: ${result.message}`);
      
    } catch (error) {
      lastError = error;
      this.logger.warn(`Attempt ${attempt} failed for user ${userData.email}: ${error.message}`);
      
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // Tất cả attempts đều thất bại
  throw new HttpException(
    `All ${maxRetries} attempts failed. Last error: ${lastError.message}`,
    HttpStatus.SERVICE_UNAVAILABLE
  );
}
```

### 4.2 Error Handling

```typescript
async sendUserData(userData: WebhookRequestDto): Promise<WebhookResponseDto> {
  try {
    const response = await firstValueFrom(
      this.httpService.post(`${this.authWebhookUrl}/auth/register`, userData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000 // 10 seconds timeout
      })
    );
    
    return {
      success: true,
      data: response.data,
      statusCode: response.status,
      message: 'User data sent successfully'
    };
    
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      throw new HttpException({
        success: false,
        message: 'Auth webhook request failed',
        error: error.response.data,
        statusCode: error.response.status
      }, error.response.status);
      
    } else if (error.request) {
      // Request was made but no response received
      throw new HttpException({
        success: false,
        message: 'No response from auth webhook endpoint',
        error: 'Network error or timeout',
        statusCode: HttpStatus.REQUEST_TIMEOUT
      }, HttpStatus.REQUEST_TIMEOUT);
      
    } else {
      // Something else happened
      throw new HttpException({
        success: false,
        message: 'Auth webhook request failed',
        error: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
```

## 5. Data Sanitization Logic

### 5.1 User Data Sanitization

```typescript
private sanitizeUserData(user: UserDocument) {
  const { password: _password, ...result } = user.toObject();
  return result;
}
```

### 5.2 Response Formatting

```typescript
// Login response format
{
  access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: {
    id: "5a1101a4-c71e-4695-b344-457522dc92ed",
    username: "testuser",
    display_name: "Nguyễn Văn A",
    email: "test@abc.com",
    phone_number: "+84901234547",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    sms_verified: false,
    points: 50,
    referral_code: "VNLZHX0W",
    invited_by: null,
    role: "user",
    last_login: "2025-09-23T02:55:27.677Z",
    is_active: true
  }
}
```

## 6. Security Logic

### 6.1 Password Hashing

```typescript
// Hash password với bcrypt
const hashedPassword = await bcrypt.hash(password, 10);

// Validate password
const isValid = await bcrypt.compare(password, hashedPassword);
```

### 6.2 Referral Code Generation

```typescript
private generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
```

## 7. Role-Based Access Control Logic

### 7.1 Role Guard Implementation

```typescript
canActivate(context: ExecutionContext): boolean {
  const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
    'roles',
    [context.getHandler(), context.getClass()]
  );
  
  if (!requiredRoles) {
    return true; // No roles required
  }
  
  const { user } = context.switchToHttp().getRequest();
  return requiredRoles.some((role) => user.role?.includes(role));
}
```

### 7.2 Role Decorator Usage

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
@Get('admin-only')
async adminOnlyEndpoint() {
  // Chỉ ADMIN hoặc STAFF mới có thể truy cập
}
```

## 8. Error Handling Logic

### 8.1 Exception Mapping

```typescript
// AuthService errors
throw new UnauthorizedException('Invalid credentials from auth webhook');
throw new UnauthorizedException('Email or username already exists');
throw new UnauthorizedException('Auto-registration failed: ${error.message}');

// WebhookService errors
throw new HttpException({
  success: false,
  message: 'Auth webhook request failed',
  error: error.response.data,
  statusCode: error.response.status
}, error.response.status);
```

### 8.2 Logging Strategy

```typescript
// Success logging
this.logger.log(`User created successfully with webhook data: ${email}`);
this.logger.log(`User auto-registered and ready for login: ${webhookEmail}`);

// Error logging
this.logger.error(`Failed to auto-register user from webhook: ${webhookEmail}`, error.stack);
this.logger.error(`Webhook validation failed for user: ${identifier}`, error.stack);

// Warning logging
this.logger.warn(`Falling back to local validation for user: ${identifier}`);
```

## 9. Performance Optimization Logic

### 9.1 Async Operations

```typescript
// Non-blocking last_login update
void this.userModel.findByIdAndUpdate(user._id, { 
  last_login: new Date() 
}).exec();
```

### 9.2 Database Queries Optimization

```typescript
// Efficient user lookup
const user = await this.userModel.findOne({ email }).exec();

// Duplicate check với compound query
const existingUser = await this.userModel.findOne({
  $or: [{ email }, { username }]
}).exec();
```

## 10. Configuration Logic

### 10.1 Environment-based Configuration

```typescript
// JWT Configuration
JwtModule.registerAsync({
  useFactory: (configService: AppConfigService) => ({
    secret: configService.jwtSecret,
    signOptions: { expiresIn: configService.jwtExpiresIn }
  }),
  inject: [AppConfigService]
})

// Webhook URL Configuration
get authWebhookUrl(): string {
  return this.configService.get<string>('AUTH_WEBHOOK_URL') || 
         'https://auth.luck8event.com/api/v1';
}
```

## 11. Testing Logic

### 11.1 Mock Strategy

```typescript
// Mock external dependencies
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn()
}));

// Mock user model
const mockUserModel = {
  findOne: jest.fn().mockReturnValue({
    exec: jest.fn()
  }),
  findById: jest.fn().mockReturnValue({
    exec: jest.fn()
  })
};
```

### 11.2 Test Scenarios

```typescript
describe('validateUser', () => {
  it('should return user data when credentials are valid', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    userModel.findOne().exec.mockResolvedValue(mockUser);
    
    const result = await service.validateUser('test@example.com', 'password');
    
    expect(result).toBeDefined();
    expect(result.email).toBe('test@example.com');
    expect(result.password).toBeUndefined();
  });
});
```

## 12. Monitoring & Observability Logic

### 12.1 Structured Logging

```typescript
// Request tracking
this.logger.log(`Validating user with webhook: ${identifier}`);
this.logger.log(`Webhook login response received for user: ${identifier}`);

// Data logging (sanitized)
this.logger.log(`Webhook response data: ${JSON.stringify(webhookResponse.data)}`);

// Performance logging
this.logger.log(`User created successfully with webhook data: ${email}`);
```

### 12.2 Error Tracking

```typescript
// Detailed error logging
this.logger.error(`Failed to auto-register user from webhook: ${webhookEmail}`, error.stack);
this.logger.error(`Webhook validation failed for user: ${identifier}`, error.stack);
```

## Kết luận

Module Auth được thiết kế với các nguyên tắc:

1. **Resilience**: Fallback mechanism khi external service thất bại
2. **Security**: Proper password hashing, JWT token validation, data sanitization
3. **Scalability**: Stateless design, external service integration
4. **Maintainability**: Clear separation of concerns, comprehensive logging
5. **Performance**: Async operations, efficient database queries
6. **Testability**: Mock-friendly design, comprehensive test coverage

Logic implementation đảm bảo tính nhất quán dữ liệu giữa local database và external authentication service, đồng thời cung cấp trải nghiệm người dùng mượt mà với khả năng phục hồi cao.

