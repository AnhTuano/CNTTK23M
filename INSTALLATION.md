# 🚀 Hướng dẫn Cài đặt & Chạy ClassZone

## 📋 Yêu cầu hệ thống

- **Node.js:** >= 18.x ([Download](https://nodejs.org/))
- **PostgreSQL:** >= 14.x ([Download](https://www.postgresql.org/download/))
- **npm** hoặc **yarn**
- **Git**

## ⚡ Cài đặt Nhanh

### Bước 1: Clone Project

```powershell
git clone https://github.com/AnhTuano/CNTTK23M.git
cd CNTTK23M
```

### Bước 2: Cài đặt Backend

```powershell
cd server
npm install
```

### Bước 3: Cấu hình Database

1. Tạo database PostgreSQL:
```powershell
# Mở PowerShell với quyền admin
# Kết nối PostgreSQL (thay đổi username nếu cần)
psql -U postgres

# Trong psql shell:
CREATE DATABASE classzone;
\q
```

2. Tạo file `.env` từ template:
```powershell
copy .env.example .env
```

3. Sửa file `.env` với thông tin của bạn:
```env
DATABASE_URL="postgresql://postgres:your-password@localhost:5432/classzone?schema=public"
JWT_SECRET=my-super-secret-key-123456
JWT_REFRESH_SECRET=my-refresh-secret-key-789012
```

### Bước 4: Chọn Database Option

**OPTION A: Local PostgreSQL (Cần cài PostgreSQL trên máy)**

Xem hướng dẫn ở trên (Bước 3)

**OPTION B: Supabase - Database Cloud MIỄN PHÍ (Recommended!)**

1. Đăng ký Supabase (FREE - không cần thẻ):
   - Truy cập: https://supabase.com
   - Click "Start your project" và đăng ký
   
2. Tạo project mới:
   - Project name: `classzone`
   - Database password: (tạo và lưu lại!)
   - Region: `Southeast Asia (Singapore)`
   - Click "Create new project"

3. Lấy Database URL:
   - Đợi project khởi tạo (2-3 phút)
   - Vào `Settings > Database`
   - Copy `Connection string > URI`
   - Thay thế `[YOUR-PASSWORD]` bằng password bạn vừa tạo
   - Paste vào file `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

### Bước 5: Chạy Database Migrations

```powershell
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### Bước 6: Chạy Backend Server

```powershell
npm run dev
```

✅ Backend sẽ chạy tại: `http://localhost:5000`

### Bước 7: Cài đặt Frontend

Mở terminal/PowerShell mới:

```powershell
cd CNTTK23M
npm install
```

### Bước 8: Chạy Frontend

```powershell
npm run dev
```

✅ Frontend sẽ chạy tại: `http://localhost:3000`

## 🎉 Hoàn tất!

Truy cập `http://localhost:3000` để sử dụng ứng dụng!

### Tài khoản mặc định:

- **Email:** an.nv@example.com
- **Password:** password123
- **Role:** Admin

## 🔧 Cấu hình Tùy chọn (Tất cả MIỄN PHÍ!)

### 📁 File Storage (Upload ảnh/tài liệu)

**OPTION A: Supabase Storage - MIỄN PHÍ 1GB (Recommended!)**

1. Trong Supabase project (đã tạo ở Bước 4):
   - Vào tab `Storage`
   - Click "Create a new bucket"
   - Bucket name: `classzone-files`
   - ✅ Check "Public bucket"
   - Click "Create bucket"

2. Lấy credentials:
   - Vào `Settings > API`
   - Copy:
     - `Project URL`
     - `anon public` key
     - `service_role` key
   - Paste vào `.env`:
   ```env
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_KEY=eyJhbGc...
   ```

**OPTION B: Cloudinary - MIỄN PHÍ 25GB/month**

1. Đăng ký tại: https://cloudinary.com (FREE tier)
2. Lấy credentials từ Dashboard
3. Cập nhật `.env`:
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Email (Nodemailer + Gmail)

1. Bật 2-Factor Authentication cho Gmail
2. Tạo App Password: https://myaccount.google.com/apppasswords
3. Cập nhật `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### OAuth (Google & Facebook)

#### Google OAuth:
1. Tạo project tại: https://console.cloud.google.com
2. Enable Google+ API
3. Tạo OAuth 2.0 Client ID
4. Cập nhật `.env`:
```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

#### Facebook OAuth:
1. Tạo app tại: https://developers.facebook.com
2. Add Facebook Login product
3. Cập nhật `.env`:
```env
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/facebook/callback
```

## 🐳 Chạy với Docker (Optional)

```powershell
# Chạy toàn bộ stack (Postgres + Redis + Backend)
docker-compose up -d

# Xem logs
docker-compose logs -f server

# Stop services
docker-compose down
```

## 📊 Prisma Studio (Database GUI)

Mở database GUI để xem/chỉnh sửa data:

```powershell
cd server
npm run prisma:studio
```

Truy cập: `http://localhost:5555`

## 🛠️ Scripts Hữu ích

### Backend:
```powershell
cd server
npm run dev          # Chạy development server
npm run build        # Build production
npm run start        # Chạy production server
npm run prisma:studio    # Mở Prisma Studio
npm run prisma:seed      # Seed lại database
```

### Frontend:
```powershell
npm run dev          # Chạy development server
npm run build        # Build production
npm run preview      # Preview production build
```

## ❓ Troubleshooting

### Lỗi: "Cannot connect to database"
- Kiểm tra PostgreSQL đang chạy
- Verify DATABASE_URL trong .env
- Đảm bảo database "classzone" đã được tạo

### Lỗi: "Port 5000 already in use"
- Đổi PORT trong server/.env
- Hoặc kill process đang dùng port 5000

### Lỗi: "Module not found"
```powershell
# Delete node_modules và cài lại
rm -r node_modules
rm package-lock.json
npm install
```

### Lỗi Prisma
```powershell
cd server
rm -r node_modules/.prisma
npm run prisma:generate
```

## 📚 Tài liệu

- [Backend API Documentation](./server/README.md)
- [Full Project Documentation](./README_FULL.md)
- [Frontend Components](./components/README.md)

## 🤝 Cần Hỗ trợ?

- 📧 Email: anhtuano@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/AnhTuano/CNTTK23M/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/AnhTuano/CNTTK23M/discussions)

---

**Happy Coding! 🚀**
