# Test Flappy Bird với API Integration

## 🎯 Cách test Flappy Bird và cập nhật count

### 1. **Chạy Games Service** (port 3009):
```bash
cd vaoluoi_games_service
npm run start:dev
```

### 2. **Chạy Games Frontend** (port 3005):
```bash
cd vaoluoi_games
npm run dev
```

### 3. **Truy cập và đăng nhập**:
- Mở: http://localhost:3005
- Đăng nhập với:
  - **Identifier**: `nathan@gmail.com`
  - **Password**: `998121`

### 4. **Chơi Flappy Bird**:
- Click vào game "Flappy Bird" từ trang chủ
- Game sẽ mở tại: `/games/flappybird/index.html`
- Nhấn **Space** để bắt đầu và nhảy

### 5. **Kiếm spins khi đạt milestone**:
- **25 điểm** → +2 spins (notification sẽ hiện)
- **50 điểm** → +3 spins
- **80 điểm** → +4 spins  
- **100 điểm** → +5 spins

## 🔧 Tích hợp API

Game Flappy Bird hiện có đã được tích hợp với:

### API Calls:
- **Login**: Lấy token từ localStorage
- **Update Milestone**: `POST /spins/:userId/flappy-milestone`
- **Notification**: Hiển thị popup khi đạt milestone

### Logic hoạt động:
1. Game check authentication từ localStorage
2. Khi đạt milestone, gọi API cập nhật count
3. Hiển thị notification với số spins nhận được
4. Count được cập nhật trong MongoDB

### Milestone Mapping:
- 25 điểm → count = 2
- 50 điểm → count = 3
- 80 điểm → count = 4
- 100 điểm → count = 5

## 🎮 Game Features

- **Level Progress Bar**: Hiển thị tiến độ đến milestone tiếp theo
- **Milestone Notifications**: Popup đẹp khi đạt milestone
- **High Score**: Lưu điểm cao nhất
- **Responsive**: Hoạt động tốt trên mọi thiết bị

## 🐛 Debug

Mở Developer Tools (F12) để xem:
- Console logs khi đạt milestone
- API calls và responses
- Authentication status

## ✅ Expected Results

Khi test thành công, bạn sẽ thấy:
1. **Notification popup** khi đạt 25, 50, 80, 100 điểm
2. **Console logs** hiển thị API calls
3. **Count được cập nhật** trong database
4. **Game hoạt động mượt mà** với logic milestone
