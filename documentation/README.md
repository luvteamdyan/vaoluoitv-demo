# VaoLuoiTV Documentation Center

Tài liệu tổng hợp cho hệ thống VaoLuoiTV - Ứng dụng xem bóng đá trực tuyến.

## 📁 Cấu trúc Documentation

### 🔗 [API Documentation](./api/)
- **[external-apis/](./api/external-apis/)** - Tài liệu external APIs (Luck8Event, Articles)
- **[user-management/](./api/user-management/)** - Tài liệu user management APIs
- **[database/](./api/database/)** - Tài liệu database schema và relationships
- **API_DOCUMENTATION.md** - Tài liệu API tổng hợp của backend
- **README.md** - Tổng quan API documentation

### 🖥️ [Backend Documentation](./backend/)
- **[security/](./backend/security/)** - Tài liệu security và role-based access control
- **[chat/](./backend/chat/)** - Tài liệu chat system và security
- **[stream-keys/](./backend/stream-keys/)** - Tài liệu stream keys management
- **[upload/](./backend/upload/)** - Tài liệu upload service
- **[sync/](./backend/sync/)** - Module đồng bộ dữ liệu
- **README.md** - Hướng dẫn setup và chạy backend

### 🎨 [Frontend Documentation](./frontend/)
- **[games/](./frontend/games/)** - Tài liệu mini-games implementation
- **[components/](./frontend/components/)** - Tài liệu component architecture
- **[performance/](./frontend/performance/)** - Tài liệu performance optimization
- **[seo/](./frontend/seo/)** - Tài liệu SEO implementation
- **[streaming/](./frontend/streaming/)** - Tài liệu streaming workflow
- **[layout/](./frontend/layout/)** - Tài liệu layout design và responsive
- **[features/](./frontend/features/)** - Tài liệu các tính năng chính
- **README.md** - Tổng quan frontend documentation

### ⚙️ [Admin Documentation](./admin/)
- **COMPONENT_RESTRUCTURE.md** - Tái cấu trúc components
- **RESTRUCTURE_COMPLETE.md** - Hoàn thành tái cấu trúc
- **USERS_FEATURE.md** - Tính năng quản lý người dùng
- **STREAM_KEY_ASSIGNMENT_GUIDE.md** - Hướng dẫn gán stream key
- **STREAM_KEY_ASSIGNMENT_UPDATE.md** - Cập nhật gán stream key
- **STREAM_KEY_SCHEDULING_UPDATE.md** - Cập nhật lịch stream key

### 🚀 [Deployment & Guides](./deployment/)
- Các tài liệu về deployment và hướng dẫn DevOps

## 🆕 Recent Updates

### 📅 Latest Changes (15/01/2025)

#### ⭐ Webhook Error Handling Enhancement
- **[Backend Webhook Error Handling](./backend/WEBHOOK_ERROR_HANDLING.md)** - Lưu và hiển thị lỗi chi tiết từ webhook
- **Feature**: Lưu chi tiết lỗi từ webhook response và hiển thị field-specific errors
- **UX Improvement**: Người dùng biết chính xác field nào bị lỗi (VD: "Số điện thoại đã được đăng ký")
- **Error Mapping**: Xử lý nhiều format lỗi khác nhau từ webhook
- **Field Validation**: Hiển thị lỗi ngay tại field tương ứng với shake animation
- **Status**: Hoàn thành và sẵn sàng production

#### ⭐ Registration Endpoint Update
- **[Frontend Registration Update](./frontend/REGISTRATION_ENDPOINT_UPDATE.md)** - Loại bỏ reCAPTCHA và chuyển endpoint
- **Endpoint Change**: Từ `v2/register` sang `/register`
- **UX Improvement**: Loại bỏ bước xác thực reCAPTCHA gây khó khăn
- **Error Handling**: Cải thiện hiển thị lỗi từ webhook với thông báo tiếng Việt
- **Performance**: Đăng ký nhanh hơn, ít dependency hơn
- **Status**: Hoàn thành và sẵn sàng production

#### 📊 Documentation Restructure Complete
- **✅ Frontend Docs**: Tổ chức theo categories (games, components, performance, SEO, streaming, layout, features)
- **✅ Backend Docs**: Tổ chức theo modules (security, chat, stream-keys, upload, sync)
- **✅ API Docs**: Tổ chức theo services (external-apis, user-management, database)
- **✅ Navigation Indexes**: Tạo README.md cho từng category để dễ navigation
- **✅ Main README**: Cập nhật với cấu trúc mới và links

#### ⭐ Luck8Event API Integration
- **[API Luck8Event](./api/external-apis/LUCK8EVENT_API_DOCUMENTATION.md)** - Tài liệu API hệ thống Luck8Event
- **Base URL**: `https://auth.luck8event.com/api/v1`
- **Service**: luck8member-api với Swagger UI
- **Features**: Health check, User management, Authentication
- **Status**: Endpoints cần token để truy cập

#### ⭐ Role-Based Access Control Enhancement
- **[Backend Role Changes](./backend/security/ROLE_CHANGES_DOCUMENTATION.md)** - Thêm role STAFF với quyền truy cập chi tiết
- **Modules Updated**: Matches, Stream Keys, Users
- **New Permissions**: GET, POST, PATCH cho STAFF role
- **Security**: Giữ nguyên quyền DELETE chỉ cho ADMIN

## 🏗️ Project Structure

```
vaoluoi-app/
├── 📄 documentation/               # 📑 Documentation Center
│   ├── api/                        # 🔗 API Documentation
│   ├── backend/                    # 🖥️ Backend Documentation  
│后   ├── frontend/                 # 🎨 Frontend Documentation
│   ├── admin/                      # ⚙️ Admin Documentation
│   └── deployment/                 # 🚀 Deployment Guides
├── vaoluoi_be/                     # Backend API Service
├── vaoluoi_fe/                     # Frontend React/Next.js
├── vaoluoi_admin/                  # Admin Dashboard Next.js
├── vaoluoi_secure_api/             # Secure API Gateway
├── vaoluoi_upload/                 # File Upload Service
├── server-config/                  # Server Configuration
└── screenshot/                     # App Screenshots
```

## 🔧 Quick Navigation

### 👨‍💻 Developers
- **New to project?** → [Backend README](./backend/README.md)
- **Setting changes?** → [Role Changes](./backend/ROLE_CHANGES_DOCUMENTATION.md)
- **API Reference** → [API Documentation](./api/)

### 🎨 Frontend Devs  
- **Performance issues?** → [Video Performance Analysis](./frontend/VIDEO_PERFORMANCE_ANALYSIS.md)
- **CDN problems?** → [Video CDN Troubleshooting](./frontend/VIDEO_CDN_TROUBLESHOOTING.md)
- **Layout issues?** → [Responsive Layout Guide](./frontend/RESPONSIVE_LAYOUT_GUIDE.md)

### ⚙️ Admin Panel
- **Component issues?** → [?](./admin/COMPONENT_RESTRUCTURE.md)
- **User management?** → [?](./admin/USERS_FEATURE.md)
- **Stream key setup?** → [?](./admin/STREAM_KEY_ASSIGNMENT_GUIDE.md)

### 🔗 Integration
- **External APIs?** → [External APIs](./api/external-apis/)
- **Database Schema?** → [Database Documentation](./api/database/)
- **User Management?** → [User Management APIs](./api/user-management/)

## 📋 Maintenance

### 🔄 Documentation Refresh Schedule
- **Weekly**: Update recent changes
- **Bi-weekly**: Review and reorganize
- **Monthly**: Full documentation audit

### 📝 Contributing Guidelines
1. Always place new docs in appropriate category folder
2. Update this README with new documents
3. Use clear, descriptive filenames
4. Include dates and version numbers

---

**📞 Support**: For documentation questions or updates, contact development team.  
**📅 Last Updated**: 15/01/2025  
**📝 Maintained by**: Development Team

