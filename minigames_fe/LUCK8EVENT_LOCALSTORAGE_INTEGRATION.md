# Luck8Event LocalStorage Integration

## Tổng quan

Minigames_fe đã được implement thêm fallback mechanism để nhận token từ localStorage của luck8event.com khi PostMessage không hoạt động hoặc không có sẵn.

## Cách hoạt động

### 1. Authentication Strategies

Minigames_fe sẽ tự động detect và sử dụng strategy phù hợp:

- **`cookie`**: Khi không trong iframe (standalone)
- **`postmessage`**: Khi trong iframe cross-origin
- **`localstorage`**: Khi trong iframe same-origin (games.luck8event.com)

### 2. Fallback Flow

```
1. Check cookies (existing auth)
   ↓ (nếu không có)
2. Check localStorage của parent window (same-origin iframe)
   ↓ (nếu không có)
3. Wait for PostMessage (cross-origin iframe)
   ↓ (nếu timeout)
4. No authentication
```

### 3. LocalStorage Keys

Luck8Event.com cần lưu trữ dữ liệu với các key sau:

```javascript
// Token
localStorage.setItem('userToken', 'jwt_token_here');

// User data
localStorage.setItem('userData', JSON.stringify({
  id: 'user_id',
  username: 'username',
  email: 'user@example.com',
  role: 'user',
  points: 1000
}));
```

## Implementation Details

### 1. LocalStorage Fallback Utility

File: `src/utils/localStorageFallback.ts`

- `getParentLocalStorageAuth()`: Lấy auth data từ parent localStorage
- `setupParentLocalStorageListener()`: Listen cho thay đổi localStorage
- `convertLuck8EventToUser()`: Convert data format
- `getAuthStrategy()`: Detect strategy phù hợp

### 2. AuthContext Updates

File: `src/contexts/AuthContext.tsx`

- Thêm `localstorage` vào `tokenSource` type
- Thêm `authStrategy` để track strategy đang dùng
- Implement `handleLocalStorageAuth()` function
- Update initialization logic với fallback flow

### 3. Proxy Script Updates

File: `public/shared/luck8event-auth-proxy.js`

- Update domain từ `games.vaoluoitv.com` thành `games.luck8event.com`
- Giữ nguyên logic PostMessage cho cross-origin cases

## Domain Configuration

### Production Domains

- **Luck8Event**: `https://luck8event.com`
- **Minigames**: `https://games.luck8event.com`

### Development Domains

- **Luck8Event**: `http://localhost:3000`
- **Minigames**: `http://localhost:3001`

## Usage Examples

### 1. Trong Luck8Event.com

```html
<!-- Thêm script proxy -->
<script src="https://games.luck8event.com/shared/luck8event-auth-proxy.js"></script>

<!-- Iframe minigames -->
<iframe 
  id="minigames-iframe"
  src="https://games.luck8event.com"
  width="100%" 
  height="600px"
  frameborder="0">
</iframe>
```

### 2. Authentication Flow

```javascript
// Sau khi user login thành công trên luck8event.com
localStorage.setItem('userToken', response.token);
localStorage.setItem('userData', JSON.stringify(response.user));

// Script proxy sẽ tự động gửi auth data đến minigames
// Hoặc minigames sẽ tự động đọc từ localStorage (same-origin)
```

### 3. Debug Information

Trong development, có thể enable debug info:

```tsx
import { AuthDebugInfo } from './components/debug/AuthDebugInfo';

// Trong component
<AuthDebugInfo show={true} />
```

## Security Considerations

### 1. Same-Origin Policy

- LocalStorage fallback chỉ hoạt động trong same-origin iframe
- Cross-origin iframe vẫn sử dụng PostMessage

### 2. Token Validation

- Tất cả tokens đều được validate JWT format
- Tokens được lưu trong cookies với SameSite=Lax

### 3. Origin Validation

- PostMessage chỉ accept từ whitelisted origins
- LocalStorage access được kiểm tra same-origin

## Testing

### 1. Same-Origin Testing

```bash
# Start luck8event.com on port 3000
cd luck8event-project
npm run dev

# Start minigames_fe on port 3001  
cd minigames_fe
npm run dev
```

### 2. Cross-Origin Testing

```bash
# Deploy minigames_fe to games.luck8event.com
# Test với luck8event.com production
```

### 3. Debug Mode

```tsx
// Enable debug info
<AuthDebugInfo show={true} />
```

## Troubleshooting

### 1. LocalStorage không hoạt động

- Kiểm tra same-origin policy
- Verify domain configuration
- Check browser console cho errors

### 2. PostMessage timeout

- Kiểm tra proxy script có được load không
- Verify iframe selector
- Check network connectivity

### 3. Token không hợp lệ

- Kiểm tra JWT format
- Verify token expiration
- Check user data structure

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_ALLOWED_ORIGINS=https://luck8event.com,https://games.luck8event.com
```

## Migration Notes

### Từ vaoluoitv.com

1. Update domain configuration
2. Deploy minigames_fe lên games.luck8event.com
3. Update proxy script domain
4. Test authentication flow

### Backward Compatibility

- Vẫn hỗ trợ vaoluoitv.com qua PostMessage
- Cookie-based auth vẫn hoạt động
- LocalStorage fallback chỉ cho luck8event domain
