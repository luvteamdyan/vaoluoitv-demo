# VaoLuoiTV Sync Service

Microservice chuyên dụng để đồng bộ dữ liệu trận đấu từ API bên ngoài.

## Tính năng

- ✅ Đồng bộ dữ liệu trận đấu từ API keovip.cc
- ✅ Manual sync với retry mechanism
- ✅ RESTful API với Swagger documentation
- ✅ JWT Authentication

## Cài đặt

```bash
# Cài đặt dependencies
npm install

# Copy file cấu hình
cp env.example .env

# Chỉnh sửa file .env với thông tin của bạn
```

## Cấu hình

Tạo file `.env` với các biến môi trường sau:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/vaoluoi_sync

# Server Configuration
PORT=3004
NODE_ENV=development

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379

# Sync API Configuration
SYNC_API_URL=https://api.keovip.cc
SYNC_API_KEY=your_api_key_here

# Auto Sync Configuration
AUTO_SYNC_ENABLED=false
SYNC_INTERVAL_MINUTES=30
```

## Chạy ứng dụng

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## API Endpoints

### Manual Sync
```bash
POST /api/v1/sync/manual
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "date": "23-09-2025",
  "force": false,
  "retry": 3
}
```

**Yêu cầu:**
- JWT Authentication
- Role: admin hoặc moderator

## Scripts tiện ích

```bash
# Sync thủ công cho ngày hiện tại (cần JWT token)
curl -X POST http://localhost:3004/api/v1/sync/manual \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -d '{"date":"'$(date +%d-%m-%Y)'"}'
```

## API Documentation

Sau khi chạy service, truy cập Swagger UI tại:
http://localhost:3004/api/docs

## Kiến trúc

```
src/
├── config/           # Cấu hình ứng dụng
├── schemas/          # MongoDB schemas
├── sync/             # Module sync chính
│   ├── controllers/  # REST controllers
│   ├── services/     # Business logic
│   └── dto/          # Data transfer objects
└── main.ts           # Entry point
```

## Authentication

Service sử dụng JWT authentication:
- Validate token với vaoluoi_be service
- Role-based access control
- Chỉ admin và moderator có quyền sync

## Lưu ý

- Service chạy độc lập với vaoluoi_be
- Sử dụng cùng database MongoDB
- Yêu cầu JWT token từ vaoluoi_be để authenticate
- Có thể scale horizontal
- Chỉ hỗ trợ manual sync