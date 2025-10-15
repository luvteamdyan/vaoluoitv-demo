# Luck8 Event - Pikachu Matching Game

## Mô tả Game

Pikachu Matching là một trò chơi puzzle matching được thiết kế cho Luck8 Event. Người chơi cần tìm và kết nối các cặp Pokemon giống nhau trên bảng 8x8 bằng cách vẽ đường nối tối đa 3 đoạn thẳng.

## Cách Chơi

1. **Mục tiêu**: Tìm và kết nối các cặp Pokemon giống nhau trên bảng game
2. **Luật chơi**: 
   - Click vào 2 Pokemon giống nhau để kết nối chúng
   - Đường kết nối chỉ được phép có tối đa 3 đoạn thẳng
   - Khi ghép được cặp Pokemon, chúng sẽ biến mất và bạn được điểm
3. **Thời gian**: 60 giây để hoàn thành game
4. **Điểm số**: 
   - Điểm cơ bản: 100 điểm/cặp
   - Bonus combo: +50 điểm cho mỗi combo liên tiếp
   - Bonus thời gian: +2 điểm cho mỗi giây còn lại

## Tính Năng

- **Giao diện đẹp**: Thiết kế theo tone màu vàng-cam gradient của Luck8 Event
- **Responsive**: Tự động điều chỉnh theo kích thước màn hình
- **Hiệu ứng**: Animation mượt mà khi ghép cặp thành công
- **Âm thanh**: Âm thanh khi ghép cặp thành công
- **Gợi ý**: Tính năng hint để giúp người chơi khi gặp khó khăn
- **Thống kê**: Hiển thị điểm số, combo, và thời gian

## Công Nghệ Sử Dụng

- **HTML5**: Cấu trúc game
- **CSS3**: Styling với gradient, animation, và responsive design
- **JavaScript ES6+**: Logic game với class-based architecture
- **Web Audio API**: Tạo âm thanh đơn giản
- **Pokemon API**: Sử dụng sprites từ PokeAPI

## Cấu Trúc File

```
pikachu-matching/
├── index.html          # File HTML chính
├── style.css           # Stylesheet với design đẹp
├── game.js             # Logic game JavaScript
└── README.md           # Tài liệu này
```

## Cách Chạy Game

1. Mở file `index.html` trong trình duyệt web
2. Game sẽ tự động bắt đầu sau 1 giây
3. Click vào các Pokemon để ghép cặp
4. Sử dụng các nút điều khiển:
   - **Game Mới**: Bắt đầu game mới
   - **Tạm Dừng**: Tạm dừng game
   - **Gợi Ý**: Hiển thị gợi ý cho cặp tiếp theo

## Tối Ưu Hóa

- Game được thiết kế để hiển thị hoàn toàn trong 1 khung hình
- Sử dụng CSS Grid để tạo bảng game responsive
- Tối ưu hóa hiệu suất với thuật toán BFS cho việc tìm đường kết nối
- Sử dụng Web Audio API để tạo âm thanh mà không cần file audio

## Tương Thích

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Bản Quyền

Game sử dụng Pokemon sprites từ PokeAPI (https://pokeapi.co/) - một API công khai và miễn phí cho mục đích giáo dục và giải trí.