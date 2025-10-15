# Vaoluoi Games

Ứng dụng web chơi game với hệ thống đăng nhập và kiếm spins thưởng.

## Tính năng

- **PostMessage Authentication**: Nhận token từ parent sites (vaoluoitv.com, luck8event.com) qua PostMessage API
- **Đăng nhập**: Tích hợp với auth service để xác thực người dùng
- **Flappy Bird Game**: Game Flappy Bird với hệ thống milestone và spins thưởng
- **Spins System**: Kiếm spins khi đạt các milestone levels (25, 50, 80, 100 điểm)
- **Responsive UI**: Giao diện đẹp và responsive với Tailwind CSS

## Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình môi trường
Tạo file `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3009
NEXT_PUBLIC_ALLOWED_ORIGINS=https://vaoluoitv.com,https://luck8event.com,http://localhost:3000,http://localhost:3001
```

### 3. Chạy dự án
```bash
# Development
npm run dev

# Production build
npm run build
npm run start
```

Dự án sẽ chạy trên: **http://localhost:3005**

## Cấu trúc dự án

```
src/
├── app/                    # Next.js App Router
│   ├── flappy-bird/       # Trang game Flappy Bird
│   └── page.tsx           # Trang chủ
├── components/
│   ├── auth/              # Components đăng nhập
│   └── game/              # Components game
├── contexts/              # React Contexts
│   └── AuthContext.tsx    # Context quản lý auth với PostMessage
├── hooks/                 # Custom React hooks
│   └── usePostMessage.ts  # Hook quản lý PostMessage lifecycle
└── services/              # API services
    ├── auth.service.ts    # Service đăng nhập
    ├── postmessage.service.ts # Service PostMessage authentication
    └── spin.service.ts    # Service quản lý spins
```

## Game Flappy Bird

### Cách chơi
- Nhấn **Space** hoặc **Click** để nhảy
- Tránh các ống nước
- Đạt điểm cao để nhận spins thưởng

### Milestone System
- **25 điểm** → +2 spins
- **50 điểm** → +3 spins  
- **80 điểm** → +4 spins
- **100 điểm** → +5 spins

### API Integration
Game tự động gọi API để cập nhật spins khi đạt milestone:
```
POST /spins/:userId/flappy-milestone
Body: { "milestone": 25 }
```

## API Endpoints

### Authentication
- `POST /auth/login` - Đăng nhập người dùng

### Spins Management
- `GET /spins/:userId` - Lấy thông tin spins
- `POST /spins/:userId/flappy-milestone` - Cập nhật milestone Flappy Bird
- `PATCH /spins/:userId/count` - Cập nhật số lượng spins
- `POST /spins/:userId/increment` - Tăng số lượng spins

## Yêu cầu hệ thống

- Node.js 18+
- Next.js 15+
- React 19+
- Tailwind CSS 4+

## PostMessage Authentication

Minigames_fe được thiết kế để nhận authentication token từ parent sites qua PostMessage API:

### Supported Parent Sites
- **vaoluoitv.com**: Token từ cookie `access_token` và `user`
- **luck8event.com**: Token từ localStorage `userToken` và `userData`

### Message Format
```javascript
// Từ vaoluoitv.com
{
  type: 'AUTH_TOKEN',
  source: 'vaoluoitv',
  token: 'jwt_token',
  user: { id: 'user_id', email: 'user@email.com' }
}

// Từ luck8event.com
{
  type: 'AUTH_TOKEN',
  source: 'luck8event',
  token: 'jwt_token',
  userData: { id: 'user_id', username: 'username', email: 'user@email.com', role: 'user', points: 100 }
}
```

### Parent Site Integration
Xem file `POSTMESSAGE_AUTH.md` để biết cách implement PostMessage từ parent sites.

## Tích hợp với Games Service

Dự án này tích hợp với `vaoluoi_games_service` (port 3009) để:
- Xác thực người dùng
- Quản lý spins và milestones
- Lưu trữ dữ liệu game

Đảm bảo Games Service đang chạy trước khi sử dụng ứng dụng này.