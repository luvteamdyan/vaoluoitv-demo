# 📢 Hướng Dẫn Quản Lý Quảng Cáo - Sanity CMS

## 🚀 Setup Nhanh (5 phút)

### 1. Cài đặt
```bash
# Tại thư mục studio-sanity
cd studio-sanity
./install-nextjs-deps.sh

# Hoặc manual:
cd ../nextjs
npm install @sanity/client @sanity/image-url
```

### 2. Cấu hình
Thêm vào `nextjs/.env.local`:
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=3mt74yqx
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
```

### 3. Chạy
```bash
# Terminal 1: Sanity Studio
cd studio-sanity && npm run dev
# → http://localhost:3333

# Terminal 2: Next.js
cd nextjs && npm run dev
# → http://localhost:8080
```

---

## 📝 Tạo Quảng Cáo (Content Manager)

### Bước 1: Vào Sanity Studio
1. Mở `http://localhost:3333`
2. Login
3. Click menu **"Quảng cáo"** → **Create**

### Bước 2: Điền Form
```
Tiêu đề: "Banner Khuyến Mãi"
Vị trí: "main_ads" (hoặc vị trí khác)
Loại media: "Hình ảnh" (hoặc "Video")
  → Upload file HOẶC paste URL CDN
Link đích: "https://vaoluoitv.com/promo"
Alt Text: "Khuyến mãi 50%"
Kích hoạt: ✅
Độ ưu tiên: 80 (0-100, càng cao càng ưu tiên)
Ngày bắt đầu: 2025-10-01 (optional)
Ngày kết thúc: 2025-10-31 (optional)
```

### Bước 3: Publish
Click **Publish** → Quảng cáo hiển thị ngay!

---

## 💻 Sử Dụng Trong Code (Developer)

### Cách 1: Dùng Component Có Sẵn
```tsx
import SanityAdsBanner from '@/components/sections/SanityAdsBanner';

export default function HomePage() {
  return <SanityAdsBanner />;
}
```

### Cách 2: Fetch Riêng
```tsx
import { sanityAdsService } from '@/services/sanityAdsService';
import { SanityAdsPosition } from '@/types/sanity-ads';
import { getAdMediaUrl, shouldDisplayAd } from '@/utils/sanityAdHelpers';

// Fetch
const ad = await sanityAdsService.getAdByPosition(SanityAdsPosition.MAIN_ADS);

// Render
if (ad && shouldDisplayAd(ad)) {
  const mediaUrl = getAdMediaUrl(ad);
  return (
    <a href={ad.linkUrl}>
      {ad.mediaType === 'image' ? (
        <img src={mediaUrl} alt={ad.altText} />
      ) : (
        <video src={mediaUrl} autoPlay muted loop playsInline />
      )}
    </a>
  );
}
```

---

## 📍 Vị Trí Quảng Cáo

| Vị trí | Mã | Kích thước |
|--------|-----|------------|
| Banner chính | `main_ads` | 1280x100 |
| Banner phụ 1-3 | `sub_ads_1/2/3` | 640x100 |
| Hero chính | `hero_main` | 1920x1080 |
| Hero trái/phải | `hero_left/right` | 640x800 |
| Lịch thi đấu | `match_schedule` | 1280x100 |
| Banner dính đáy | `catfish_banner` | 1280x100 |

---

## 🔧 API Reference

### Service Methods
```typescript
// Lấy 1 quảng cáo
sanityAdsService.getAdByPosition('main_ads')

// Lấy nhiều quảng cáo
sanityAdsService.getAdsByPositions(['main_ads', 'sub_ads_1'])

// Lấy tất cả quảng cáo active
sanityAdsService.getActiveAds()

// Lấy theo campaign
sanityAdsService.getAdsByCampaign('PROMO_OCT_2025')

// Top performing
sanityAdsService.getTopPerformingAds(10)
```

### Helper Functions
```typescript
// Media URL
getAdMediaUrl(ad) // Get URL
getOptimizedAdMediaUrl(ad, width, height) // Optimized
getResponsiveAdMediaUrls(ad) // Mobile/Tablet/Desktop URLs

// Validation
shouldDisplayAd(ad) // Check nên hiển thị?
isAdWithinDateRange(ad) // Check trong thời gian?
isValidMediaUrl(url) // Check URL hợp lệ?

// Metrics
calculateAdCTR(ad) // Tính CTR%
formatAdMetrics(ad) // Format metrics
getAdStatusText(ad) // "Đang hoạt động", "Đã hết hạn"...

// Tracking
getAdLinkWithTracking(ad, 'website', 'banner') // Add UTM params
```

---

## 🎯 Files Đã Tạo

### Sanity Schemas
- ✅ `schemaTypes/advertisement.ts` - Schema quảng cáo
- ✅ `schemaTypes/adsPosition.ts` - Schema vị trí
- ✅ `schemaTypes/index.ts` - Export

### Next.js Integration
- ✅ `src/lib/sanity.ts` - Client & helpers
- ✅ `src/services/sanityAdsService.ts` - Service (8 methods)
- ✅ `src/types/sanity-ads.ts` - TypeScript types
- ✅ `src/utils/sanityAdHelpers.ts` - Helpers (20+ functions)
- ✅ `src/components/sections/SanityAdsBanner.tsx` - Component

---

## 🐛 Troubleshooting

### ❓ Quảng cáo không hiển thị
**Check:**
1. `isActive` = true?
2. Trong khoảng `startDate` - `endDate`?
3. Media URL hợp lệ?
4. Priority đủ cao?

### ❓ CORS Error
1. Vào [Sanity Manage](https://sanity.io/manage)
2. Chọn project `luv-media`
3. API → CORS Origins
4. Add: `http://localhost:8080`, `https://vaoluoitv.com`

### ❓ Image không load
```typescript
// Debug
console.log(urlFor(ad.mediaImage).url());
```

### ❓ Video không tự động play
```tsx
// Cần muted + playsInline
<video autoPlay muted playsInline loop />
```

---

## 📊 Best Practices

### Content Manager
1. ✅ Test trước khi publish
2. ✅ Dùng alt text cho SEO
3. ✅ Tối ưu file size (< 500KB image, < 10MB video)
4. ✅ Set priority hợp lý
5. ✅ Schedule trước 1-2 ngày

### Developer
1. ✅ Dùng TypeScript types
2. ✅ Handle errors gracefully
3. ✅ Add loading states
4. ✅ Implement fallback
5. ✅ Cache responses (SWR/React Query)

---

## 🔐 CORS Setup (Production)

**Required origins:**
```
http://localhost:3000
http://localhost:8080
https://vaoluoitv.com
https://*.vaoluoitv.com
```

**Setup:**
1. [Sanity Manage](https://sanity.io/manage) → Project `3mt74yqx`
2. API → CORS Origins → Add origins above
3. Save

---

## 📚 Tham Khảo

### Sanity Docs
- 🌐 [Sanity Docs](https://sanity.io/docs)
- 🌐 [GROQ Queries](https://sanity.io/docs/groq)
- 🌐 [Image URLs](https://sanity.io/docs/image-url)

### Project Files
- 📁 Schemas: `/studio-sanity/schemaTypes/`
- 📁 Services: `/nextjs/src/services/sanityAdsService.ts`
- 📁 Helpers: `/nextjs/src/utils/sanityAdHelpers.ts`
- 📁 Types: `/nextjs/src/types/sanity-ads.ts`

### Support
- 💬 Slack: #dev-team
- 📧 Email: dev@luvmedia.com
- 🐛 Issues: GitHub/Jira

---

**Version:** 1.0.0 | **Updated:** Oct 2025 | **Team:** Luvmedia

