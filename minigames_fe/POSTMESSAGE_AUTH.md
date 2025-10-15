# PostMessage Authentication Integration

## Tổng quan

Minigames_fe sử dụng PostMessage API để nhận authentication token từ parent sites thay vì chia sẻ cookie cross-subdomain. Điều này giúp tăng cường bảo mật và đơn giản hóa việc tích hợp.

## Cách hoạt động

1. Minigames_fe được embed trong iframe tại parent site
2. Parent site detect khi iframe đã load xong
3. Parent site gửi authentication data qua PostMessage
4. Minigames_fe validate origin và xử lý authentication
5. User được authenticate và có thể chơi game

## Supported Parent Sites

### Site A: vaoluoitv.com
- **Token storage**: Cookie
- **Cookie names**: `access_token`, `user`
- **User data format**: `{ id: string, email: string }`

### Site B: luck8event.com
- **Token storage**: localStorage
- **Keys**: `userToken`, `userData`
- **User data format**: `{ id: string, username: string, email: string, role: string, points: number }`

## Message Format

### Từ vaoluoitv.com
```javascript
{
  type: 'AUTH_TOKEN',
  source: 'vaoluoitv',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  user: {
    id: 'a846d782-82ad-4072-8058-1e1b4a6270b4',
    email: 'admin@vaoluoitv.com'
  }
}
```

### Từ luck8event.com
```javascript
{
  type: 'AUTH_TOKEN',
  source: 'luck8event',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  userData: {
    id: 'a846d782-82ad-4072-8058-1e1b4a6270b4',
    username: 'vladmin',
    email: 'admin@vaoluoitv.com',
    role: 'admin',
    points: 640
  }
}
```

## Parent Site Implementation

### 1. Vaoluoitv.com Implementation

```javascript
// Detect when iframe is loaded
window.addEventListener('load', () => {
  const iframe = document.getElementById('minigames-iframe');
  
  iframe.addEventListener('load', () => {
    // Get token from cookie
    const token = getCookie('access_token');
    const userStr = getCookie('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        
        // Send authentication data to iframe
        iframe.contentWindow.postMessage({
          type: 'AUTH_TOKEN',
          source: 'vaoluoitv',
          token: token,
          user: user
        }, 'https://minigames.yourdomain.com');
        
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  });
});

// Helper function to get cookie
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}
```

### 2. Luck8event.com Implementation

```javascript
// Detect when iframe is loaded
window.addEventListener('load', () => {
  const iframe = document.getElementById('minigames-iframe');
  
  iframe.addEventListener('load', () => {
    // Get token from localStorage
    const token = localStorage.getItem('userToken');
    const userDataStr = localStorage.getItem('userData');
    
    if (token && userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        
        // Send authentication data to iframe
        iframe.contentWindow.postMessage({
          type: 'AUTH_TOKEN',
          source: 'luck8event',
          token: token,
          userData: userData
        }, 'https://minigames.yourdomain.com');
        
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  });
});
```

### 3. Generic Implementation với Error Handling

```javascript
class MinigamesAuth {
  constructor(iframeId, minigamesOrigin) {
    this.iframeId = iframeId;
    this.minigamesOrigin = minigamesOrigin;
    this.iframe = null;
    this.authSent = false;
  }

  init() {
    this.iframe = document.getElementById(this.iframeId);
    
    if (!this.iframe) {
      console.error('Minigames iframe not found');
      return;
    }

    // Listen for iframe load
    this.iframe.addEventListener('load', () => {
      this.sendAuth();
    });

    // Listen for acknowledgment
    window.addEventListener('message', (event) => {
      if (event.origin !== this.minigamesOrigin) return;
      
      if (event.data.type === 'AUTH_RECEIVED') {
        console.log('Authentication sent successfully');
        this.authSent = true;
      } else if (event.data.type === 'AUTH_ERROR') {
        console.error('Authentication error:', event.data.message);
      }
    });
  }

  sendAuth() {
    if (this.authSent) return;

    const authData = this.getAuthData();
    
    if (authData) {
      this.iframe.contentWindow.postMessage(authData, this.minigamesOrigin);
    } else {
      console.warn('No authentication data available');
    }
  }

  getAuthData() {
    // Implement based on your site's authentication method
    // Return null if no auth data available
    return null;
  }
}

// Usage
const auth = new MinigamesAuth('minigames-iframe', 'https://minigames.yourdomain.com');
auth.init();
```

## Security Considerations

### Origin Validation
Minigames_fe chỉ chấp nhận messages từ whitelist origins:
- `https://vaoluoitv.com`
- `https://luck8event.com`
- `http://localhost:3000` (development)
- `http://localhost:3001` (development)

### JWT Token Validation
- Basic format validation (header.payload.signature)
- Base64 encoding check
- Expiration check (handled by backend)

### Timeout Protection
- 10 seconds timeout để tránh chờ vô hạn
- Fallback về login form nếu không nhận được token

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_ALLOWED_ORIGINS=https://vaoluoitv.com,https://luck8event.com,http://localhost:3000,http://localhost:3001
```

### Allowed Origins
Có thể config qua environment variable `NEXT_PUBLIC_ALLOWED_ORIGINS` hoặc sử dụng defaults.

## Troubleshooting

### Common Issues

1. **Message không được nhận**
   - Kiểm tra origin có trong whitelist không
   - Kiểm tra iframe đã load xong chưa
   - Kiểm tra console có error không

2. **Authentication failed**
   - Kiểm tra JWT token format
   - Kiểm tra user data structure
   - Kiểm tra network connectivity

3. **Timeout error**
   - Kiểm tra parent site có gửi message không
   - Tăng timeout nếu cần
   - Kiểm tra iframe loading

### Debug Mode
```javascript
// Enable debug logging
localStorage.setItem('minigames_debug', 'true');
```

### Console Logs
Minigames_fe sẽ log các thông tin sau:
- PostMessage service started/stopped
- Authentication received from [source]
- Authentication successful/failed
- Timeout warnings

## Migration từ Cookie-based Auth

### Before (Cookie cross-subdomain)
```javascript
// Cookie được set với domain .vaoluoitv.com
setCookie('access_token', token, 7, true);
```

### After (PostMessage)
```javascript
// Cookie chỉ cho same-origin
setCookie('access_token', token, 7);
// Authentication qua PostMessage từ parent site
```

## API Reference

### PostMessage Service
- `startListening(onMessage)` - Bắt đầu lắng nghe
- `stopListening()` - Dừng lắng nghe
- `getListeningStatus()` - Kiểm tra trạng thái
- `getAllowedOrigins()` - Lấy danh sách origins được phép

### usePostMessage Hook
- `state.isListening` - Trạng thái listening
- `state.lastMessage` - Message cuối cùng nhận được
- `state.source` - Nguồn authentication
- `state.error` - Lỗi nếu có
- `startListening()` - Bắt đầu listening
- `stopListening()` - Dừng listening
- `reset()` - Reset state

## Examples

### Complete Integration Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>Parent Site</title>
</head>
<body>
    <iframe 
        id="minigames-iframe" 
        src="https://minigames.yourdomain.com"
        width="100%" 
        height="600px"
        frameborder="0">
    </iframe>

    <script>
        class MinigamesIntegration {
            constructor() {
                this.iframe = document.getElementById('minigames-iframe');
                this.minigamesOrigin = 'https://minigames.yourdomain.com';
                this.authSent = false;
            }

            init() {
                this.iframe.addEventListener('load', () => {
                    this.sendAuthentication();
                });

                window.addEventListener('message', (event) => {
                    if (event.origin !== this.minigamesOrigin) return;
                    this.handleResponse(event.data);
                });
            }

            sendAuthentication() {
                if (this.authSent) return;

                const authData = this.getAuthData();
                
                if (authData) {
                    this.iframe.contentWindow.postMessage(authData, this.minigamesOrigin);
                    console.log('Authentication sent to minigames');
                }
            }

            getAuthData() {
                // Vaoluoitv.com implementation
                const token = this.getCookie('access_token');
                const userStr = this.getCookie('user');
                
                if (token && userStr) {
                    try {
                        const user = JSON.parse(userStr);
                        return {
                            type: 'AUTH_TOKEN',
                            source: 'vaoluoitv',
                            token: token,
                            user: user
                        };
                    } catch (error) {
                        console.error('Error parsing user data:', error);
                    }
                }

                // Luck8event.com implementation
                const userToken = localStorage.getItem('userToken');
                const userDataStr = localStorage.getItem('userData');
                
                if (userToken && userDataStr) {
                    try {
                        const userData = JSON.parse(userDataStr);
                        return {
                            type: 'AUTH_TOKEN',
                            source: 'luck8event',
                            token: userToken,
                            userData: userData
                        };
                    } catch (error) {
                        console.error('Error parsing user data:', error);
                    }
                }

                return null;
            }

            handleResponse(response) {
                if (response.type === 'AUTH_RECEIVED') {
                    console.log('Authentication successful');
                    this.authSent = true;
                } else if (response.type === 'AUTH_ERROR') {
                    console.error('Authentication failed:', response.message);
                }
            }

            getCookie(name) {
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);
                if (parts.length === 2) return parts.pop().split(';').shift();
            }
        }

        // Initialize
        const integration = new MinigamesIntegration();
        integration.init();
    </script>
</body>
</html>
```

## Support

Nếu gặp vấn đề với PostMessage integration, vui lòng:
1. Kiểm tra console logs
2. Verify origin trong whitelist
3. Test với debug mode
4. Contact development team
