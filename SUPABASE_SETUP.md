# 🚀 Hướng dẫn Kết nối Supabase

## ✅ Đã hoàn thành
- [x] Tạo project Supabase
- [x] Lấy Database Connection String

## 📋 Các bước tiếp theo

### Bước 1: Cập nhật Database Password trong `.env`

1. **Reset Database Password** (nếu chưa có):
   - Vào Supabase Dashboard: https://supabase.com/dashboard/project/klrwyovdvojbbfrlqtbd
   - Settings > Database
   - Click "Reset Database Password"
   - Copy password mới

2. **Cập nhật file `server/.env`**:
   ```bash
   # Tìm dòng này:
   DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@db.klrwyovdvojbbfrlqtbd.supabase.co:5432/postgres"
   
   # Thay [YOUR_PASSWORD] bằng password thật, ví dụ:
   DATABASE_URL="postgresql://postgres:MySecurePassword123@db.klrwyovdvojbbfrlqtbd.supabase.co:5432/postgres"
   ```

### Bước 2: Lấy Supabase API Keys

1. **Vào Settings > API**:
   - URL: https://supabase.com/dashboard/project/klrwyovdvojbbfrlqtbd/settings/api

2. **Copy 2 keys vào `server/.env`**:
   ```bash
   # Project URL
   SUPABASE_URL=https://klrwyovdvojbbfrlqtbd.supabase.co
   
   # Anon (public) key - Dùng cho frontend
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
   # Service role key - Dùng cho backend (⚠️ GIỮ BÍ MẬT!)
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Bước 3: Enable Storage

1. **Vào Storage** trong Supabase Dashboard
2. **Create bucket** với tên `classzone-uploads`
3. **Configure policies**:
   ```sql
   -- Policy cho public read
   CREATE POLICY "Public Access"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'classzone-uploads');
   
   -- Policy cho authenticated users upload
   CREATE POLICY "Authenticated Upload"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'classzone-uploads');
   
   -- Policy cho users delete own files
   CREATE POLICY "Users Delete Own Files"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (bucket_id = 'classzone-uploads' AND owner = auth.uid());
   ```

### Bước 4: Chạy Prisma Migrations

```powershell
# Di chuyển vào folder server
cd server

# Install dependencies (nếu chưa)
npm install

# Generate Prisma Client
npx prisma generate

# Push schema lên Supabase database
npx prisma db push

# (Optional) Seed initial data
npx prisma db seed
```

### Bước 5: Setup Email Service (Chọn 1 trong 2)

#### OPTION A: Gmail SMTP (Khuyến nghị cho dev)

1. **Bật 2-Step Verification**:
   - Vào: https://myaccount.google.com/security
   - Bật "2-Step Verification"

2. **Tạo App Password**:
   - Vào: https://myaccount.google.com/apppasswords
   - Chọn "Mail" và "Other (Custom name)"
   - Nhập "ClassZone Backend"
   - Copy password 16 ký tự

3. **Cập nhật `server/.env`**:
   ```bash
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop  # 16 ký tự từ App Password
   EMAIL_FROM=ClassZone <noreply@classzone.com>
   ```

#### OPTION B: Resend (Khuyến nghị cho production)

1. **Đăng ký tài khoản**: https://resend.com
2. **Tạo API Key**: Dashboard > API Keys > Create
3. **Cập nhật `server/.env`**:
   ```bash
   RESEND_API_KEY=re_xxxxxxxxxxxx
   ```

### Bước 6: Generate JWT Secrets

```powershell
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy 2 strings và thay vào `server/.env`:
```bash
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
JWT_REFRESH_SECRET=z6y5x4w3v2u1t0s9r8q7p6o5n4m3l2k1j0i9h8g7f6e5d4c3b2a1
```

### Bước 7: Test Kết nối

```powershell
# Start backend server
cd server
npm run dev

# Kiểm tra logs, nên thấy:
# ✓ Database connected successfully
# ✓ Server running on port 5000
# ✓ Socket.IO initialized
```

### Bước 8: Test API

```powershell
# Test health endpoint
curl http://localhost:5000/health

# Response:
# {
#   "status": "ok",
#   "timestamp": "2025-11-01T...",
#   "database": "connected"
# }
```

## 🔍 Troubleshooting

### Lỗi: "Can't reach database server"
**Giải pháp**: Kiểm tra lại password trong DATABASE_URL, đảm bảo không có khoảng trắng

### Lỗi: "Invalid API key"
**Giải pháp**: 
- Kiểm tra SUPABASE_ANON_KEY và SUPABASE_SERVICE_KEY
- Đảm bảo copy đúng từ Settings > API (không có khoảng trắng)

### Lỗi: "Storage bucket not found"
**Giải pháp**:
- Tạo bucket `classzone-uploads` trong Storage
- Cấu hình policies (xem Bước 3)

### Lỗi Email: "Invalid login"
**Giải pháp**:
- Đảm bảo đã bật 2-Step Verification
- Dùng App Password, không phải password Gmail thường
- Loại bỏ khoảng trắng trong App Password

## 📚 Tài liệu tham khảo

- [Supabase Database](https://supabase.com/docs/guides/database)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Prisma with Supabase](https://www.prisma.io/docs/guides/database/supabase)
- [Gmail SMTP](https://support.google.com/mail/answer/185833)
- [Resend Docs](https://resend.com/docs)

## ✅ Checklist hoàn thành

- [ ] Database password đã cập nhật trong `.env`
- [ ] Supabase API keys đã cấu hình
- [ ] Storage bucket `classzone-uploads` đã tạo
- [ ] Prisma migrations đã chạy (`npx prisma db push`)
- [ ] Email service đã cấu hình (Gmail hoặc Resend)
- [ ] JWT secrets đã generate
- [ ] Backend server chạy thành công (`npm run dev`)
- [ ] Test API `/health` thành công

## 🎯 Bước tiếp theo

Sau khi hoàn thành checklist trên:

1. **Chạy frontend**:
   ```powershell
   # Terminal mới
   npm run dev
   ```

2. **Test tính năng**:
   - Đăng ký tài khoản mới
   - Login
   - Upload avatar
   - Tạo post mới
   - Test real-time chat

3. **Deploy lên production**:
   - Xem `DEPLOYMENT_FREE.md` để deploy lên Vercel + Railway (FREE)
