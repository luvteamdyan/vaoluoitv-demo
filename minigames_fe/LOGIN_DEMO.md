# Demo Login Information

## Thông tin đăng nhập test

Để test hệ thống, sử dụng thông tin sau:

```
identifier: "nathan@gmail.com"
password: "998121"
```

## Cách test

1. **Chạy Games Service** (port 3009):
   ```bash
   cd vaoluoi_games_service
   npm run start:dev
   ```

2. **Chạy Games Frontend** (port 3005):
   ```bash
   cd vaoluoi_games
   npm run dev
   ```

3. **Truy cập**: http://localhost:3005

4. **Đăng nhập** với thông tin trên

5. **Chơi Flappy Bird** và đạt các milestone:
   - 25 điểm → +2 spins
   - 50 điểm → +3 spins
   - 80 điểm → +4 spins
   - 100 điểm → +5 spins

## API Request Format

Login request sẽ gửi:
```json
{
  "identifier": "nathan@gmail.com",
  "password": "998121"
}
```

## Expected Response

```json
{
  "access_token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "nathan@gmail.com"
  }
}
```

## Milestone API

Khi đạt milestone, game sẽ gọi:
```json
POST /spins/:userId/flappy-milestone
{
  "milestone": 25
}
```

Response:
```json
{
  "_id": "spin_id",
  "user_id": "user_id",
  "count": 2,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```
