#!/bin/bash

echo "🌱 Chạy script seed dữ liệu wheel..."

# Kiểm tra xem có file .env không
if [ ! -f .env ]; then
    echo "⚠️ Không tìm thấy file .env, tạo file mẫu..."
    echo "DATABASE_URL=mongodb://localhost:27017/vaoluoi_games" > .env
fi

# Chạy script seed
npx ts-node src/scripts/seed-wheel-data.ts

echo "✅ Hoàn thành!"
