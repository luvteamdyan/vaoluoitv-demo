# Luck8Event Integration Guide

## Tổng quan

Hướng dẫn tích hợp minigames_fe với luck8event.com (external project) để authentication hoạt động qua PostMessage API.

## Vấn đề

- Luck8event.com là project external, không có source code để chỉnh sửa
- Luck8event lưu authentication data trong localStorage (`userToken`, `userData`)
- Minigames_fe cần nhận authentication data để user có thể chơi game

## Giải pháp: Proxy Script

### 1. Tạo Proxy Script

File `public/shared/luck8event-auth-proxy.js` đã được tạo để:
- Đọc authentication data từ localStorage của luck8event
- Gửi data đến minigames_fe iframe qua PostMessage
- Xử lý retry logic và error handling
- Cung cấp API cho luck8event để sử dụng

### 2. Cách tích hợp vào Luck8Event

#### Bước 1: Thêm script vào Luck8Event

```html
<!-- Thêm vào trang luck8event.com -->
<script src="https://minigames.yourdomain.com/shared/luck8event-auth-proxy.js"></script>
```

#### Bước 2: Cấu hình script

```javascript
// Cấu hình trong luck8event.com
window.Luck8EventAuthProxy.config.minigamesOrigin = 'https://minigames.yourdomain.com';
window.Luck8EventAuthProxy.config.iframeSelector = '#minigames-iframe';
```

#### Bước 3: Sử dụng API (tùy chọn)

```javascript
// Gửi authentication data thủ công
window.Luck8EventAuthProxy.sendAuth();

// Lấy authentication data
const authData = window.Luck8EventAuthProxy.getAuthData();

// Lắng nghe kết quả authentication
window.addEventListener('minigamesAuthSuccess', (event) => {
  console.log('Authentication successful:', event.detail);
});

window.addEventListener('minigamesAuthError', (event) => {
  console.error('Authentication failed:', event.detail);
});
```

### 3. Cấu hình Minigames_fe

#### Cập nhật PostMessage Service

Minigames_fe đã hỗ trợ luck8event authentication trong:
- `src/services/postmessage.service.ts`
- `src/contexts/AuthContext.tsx`
- `src/hooks/usePostMessage.ts`

#### Cấu hình Allowed Origins

```typescript
// Trong postmessage.service.ts
allowedOrigins: [
  'https://vaoluoitv.com',
  'https://luck8event.com',  // Thêm domain luck8event
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:8080'
]
```

### 4. Message Format

#### Từ Luck8Event đến Minigames_fe

```javascript
{
  type: 'AUTH_TOKEN',
  source: 'luck8event',
  token: 'userToken_from_localStorage',
  userData: {
    id: 'user_id',
    username: 'username',
    email: 'user@email.com',
    role: 'user_role',
    points: 1000
  }
}
```

#### Response từ Minigames_fe về Luck8Event

```javascript
// Success
{
  type: 'AUTH_RECEIVED',
  success: true
}

// Error
{
  type: 'AUTH_ERROR',
  success: false,
  message: 'Error message'
}
```

### 5. Testing

#### Test trong Development

```javascript
// Test script trong console của luck8event.com
window.Luck8EventAuthProxy.getAuthData();
window.Luck8EventAuthProxy.sendAuth();
```

#### Test trong Production

1. Đăng nhập vào luck8event.com
2. Mở minigames iframe
3. Kiểm tra console logs
4. Verify authentication status trong minigames

### 6. Troubleshooting

#### Common Issues

1. **Iframe không tìm thấy**
   - Kiểm tra `iframeSelector` trong config
   - Đảm bảo iframe có đúng ID

2. **Authentication data không có**
   - Kiểm tra localStorage có `userToken` và `userData`
   - Verify user đã đăng nhập

3. **PostMessage không hoạt động**
   - Kiểm tra `minigamesOrigin` trong config
   - Verify CORS settings

4. **Timeout errors**
   - Tăng `timeout` trong config
   - Kiểm tra network connectivity

#### Debug Mode

```javascript
// Enable debug mode
window.Luck8EventAuthProxy.config.debug = true;
```

### 7. Security Considerations

1. **Origin Validation**: Script chỉ gửi message đến domain được cấu hình
2. **Data Validation**: Minigames_fe validate message format và JWT token
3. **HTTPS**: Sử dụng HTTPS trong production
4. **CORS**: Cấu hình CORS headers đúng cách

### 8. Deployment

#### Minigames_fe

1. Deploy minigames_fe với proxy script
2. Cấu hình allowed origins
3. Test authentication flow

#### Luck8Event

1. Thêm proxy script vào trang
2. Cấu hình script parameters
3. Test integration

### 9. Monitoring

#### Logs to Monitor

- Authentication success/failure
- PostMessage errors
- Timeout events
- Retry attempts

#### Metrics to Track

- Authentication success rate
- Average authentication time
- Error frequency by type

## Kết luận

Proxy script là giải pháp tối ưu để tích hợp minigames_fe với luck8event.com mà không cần chỉnh sửa source code của luck8event. Script tự động xử lý authentication flow và cung cấp API để luck8event có thể tương tác nếu cần.
