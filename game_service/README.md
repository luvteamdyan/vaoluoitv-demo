# Vaoluoi Games Service

Dịch vụ quản lý games và spins cho hệ thống Vaoluoi.

## Cấu hình môi trường

Tạo file `.env` với các biến môi trường sau:

```env
# Environment Configuration
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://Nguyen:admin@cluster0.wq9d5yn.mongodb.net/vaoluoi?retryWrites=true&w=majority&appName=Cluster0

# JWT Configuration
JWT_SECRET=Dri56GjNpiXPdJVACNfwFydEMXtOFp1buUfMVaMOpemjaVuTqdozRnUqV4XpztKSkVhOHm38g2jEEeJ6PlyQLOMBNqAn87cYcIbWiUYZHL9lB0KIV44a0Tv0QNdYwDiaXi76zYsAENraphBKb0RMWqhObwVO0EN4O9GOzKLgwqX12A2APGkVajR9Oq3EEgydPR8FOTnqJAJTEwSMeiDI08AUGwlNsvlCkVyc63cCVw1fVmN1WrxDrFKOyLkhuTOO
JWT_EXPIRES_IN=1d

# API Configuration
NEXT_PUBLIC_API_URL=https://auth.luck8event.com/api/v1
LUCK8_POINT_API_KEY=your-api-key-here

# Server Configuration
PORT=3009
```

### Logging Configuration

Service sử dụng `LoggerUtil` để kiểm soát log theo môi trường:

- **Development** (`NODE_ENV !== 'production'`): Hiển thị tất cả log (log, warn, debug, info)
- **Production** (`NODE_ENV=production`): Chỉ hiển thị error logs, ẩn debug logs

Để tắt debug logs trong production, đặt `NODE_ENV=production` trong file `.env`.

## Cài đặt và chạy

```bash
# Cài đặt dependencies
npm install

# Build dự án
npm run build

# Chạy development
npm run start:dev

# Chạy production
npm run start:prod
```

## API Endpoints

### Authentication

#### POST /auth/login
Đăng nhập người dùng thông qua auth service.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com"
  }
}
```

### Spins Management

Tất cả endpoints spins đều yêu cầu JWT token trong header:
```
Authorization: Bearer <jwt_token>
```

#### GET /spins
Lấy danh sách tất cả spins.

#### GET /spins/:userId
Lấy thông tin spin của user cụ thể.

#### POST /spins
Tạo spin mới cho user.

**Request Body:**
```json
{
  "user_id": "user_uuid",
  "count": 0
}
```

#### PATCH /spins/:userId/count
Cập nhật số lượng spin của user.

**Request Body:**
```json
{
  "count": 5
}
```

#### POST /spins/:userId/increment
Tăng số lượng spin của user.

**Request Body:**
```json
{
  "increment": 1
}
```

#### POST /spins/:userId/flappy-milestone
Cập nhật spin dựa trên milestone của game Flappy Bird.

**Request Body:**
```json
{
  "milestone": 25
}
```

**Milestone mapping:**
- 25 → count = 2
- 50 → count = 3  
- 80 → count = 4
- 100 → count = 5

#### POST /spins/:userId/memory-card-complete
Cập nhật spin khi người chơi hoàn thành tất cả 5 levels của Memory Card game.

**Request Body:**
```json
{
  "completed": true
}
```

**Reward:**
- Complete all 5 levels → +5 spins (once per day)

#### GET /spins/:userId/memory-card-status
Lấy trạng thái hoàn thành Memory Card game hôm nay.

**Response:**
```json
{
  "achievedMilestones": [5],
  "totalSpinsEarned": 5,
  "allMilestonesAchieved": true,
  "completedToday": true
}
```

## Database Schema

### Spins Collection
```typescript
{
  _id: ObjectId,
  user_id: string,    // UUID của user
  count: number,      // Số lượt quay (default: 0)
  createdAt: Date,
  updatedAt: Date
}
```

## Tích hợp với Game Flappy Bird

Khi người dùng chơi game Flappy Bird và đạt được các milestone levels (25, 50, 80, 100), game sẽ gọi endpoint:

```
POST /spins/:userId/flappy-milestone
```

Với body chứa milestone level, service sẽ tự động cập nhật count tương ứng.