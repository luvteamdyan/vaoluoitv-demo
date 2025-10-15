# 🎬 Sanity Studio - Luv Media

Hệ thống quản lý quảng cáo cho Football Livestream.

---

## 🚀 Quick Start (5 phút)

### 1. Cài đặt
```bash
# Auto-install
./install-nextjs-deps.sh

# Hoặc manual
cd ../nextjs
npm install @sanity/client @sanity/image-url
```

### 2. Config
Thêm vào `nextjs/.env.local`:
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=3mt74yqx
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
```

### 3. Chạy
```bash
npm run dev  # → http://localhost:3333
```

---

## 📚 Documentation

📘 **[QUANG_CAO_GUIDE.md](./docs/QUANG_CAO_GUIDE.md)** - Hướng dẫn đầy đủ

Bao gồm:
- Setup & cài đặt
- Tạo quảng cáo (Content Manager)
- Sử dụng trong code (Developer)
- API Reference
- Troubleshooting

---

## ✨ Features

### Quản Lý Quảng Cáo
- ✅ Upload hình ảnh & video
- ✅ Lên lịch hiển thị
- ✅ 9 vị trí quảng cáo
- ✅ Quản lý độ ưu tiên
- ✅ Tracking metrics

### Vị Trí
- `main_ads` - Banner chính (1280x100)
- `sub_ads_1/2/3` - Banner phụ (640x100)
- `hero_main` - Hero (1920x1080)
- `match_schedule` - Lịch thi đấu (1280x100)
- `catfish_banner` - Banner dính đáy (1280x100)

---

## 💻 Usage

```tsx
import SanityAdsBanner from '@/components/sections/SanityAdsBanner';

export default function HomePage() {
  return <SanityAdsBanner />;
}
```

---

## 🔧 Files Created

**Sanity:**
- `schemaTypes/advertisement.ts`
- `schemaTypes/adsPosition.ts`

**Next.js:**
- `src/lib/sanity.ts` - Client
- `src/services/sanityAdsService.ts` - Service
- `src/types/sanity-ads.ts` - Types
- `src/utils/sanityAdHelpers.ts` - Helpers
- `src/components/sections/SanityAdsBanner.tsx` - Component

---

## 📞 Support

- 📖 Doc: [QUANG_CAO_GUIDE.md](./docs/QUANG_CAO_GUIDE.md)
- 💬 Slack: #dev-team
- 🌐 Sanity: [sanity.io/docs](https://sanity.io/docs)

---

**v1.0.0** | Oct 2025 | Luvmedia Team
