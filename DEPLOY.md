# 🚀 HƯỚNG DẪN DEPLOY LÊN VERCEL

## 📋 Chuẩn Bị

### 1. Tạo Tài Khoản Vercel
- Truy cập: https://vercel.com
- Đăng nhập bằng GitHub
- Import repository: `CNTTK23M`

---

## 🎯 DEPLOY BACKEND (Server)

### Bước 1: Deploy Server
```bash
cd server
vercel
```

**Hoặc qua Vercel Dashboard:**
1. New Project → Import `CNTTK23M` repo
2. Framework Preset: **Other**
3. Root Directory: `server`
4. Build Command: `npm run vercel-build`
5. Output Directory: `dist`
6. Install Command: `npm install`

### Bước 2: Cấu Hình Environment Variables

**Vào Vercel Dashboard → Settings → Environment Variables, thêm:**

```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-frontend.vercel.app

# Database
DATABASE_URL=postgresql://postgres:Anhtu2609%21%21@db.klrwyovdvojbbfrlqtbd.supabase.co:5432/postgres

# JWT
JWT_SECRET=f000411fb1c8658a6cfe7a7ad1cb8912d846fc6e3dd8ea93afb97f62c0b0474d
JWT_REFRESH_SECRET=04db85803ba948a120c892f8cfc92b65b7451ad717096fde418b0f2a431d0725
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Supabase
SUPABASE_URL=https://klrwyovdvojbbfrlqtbd.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtscnd5b3Zkdm9qYmJmcmxxdGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NjYxNzksImV4cCI6MjA3NzU0MjE3OX0.Jmmla0AX7LYllmCxUU5TmqA-Bae5y-w7tQgUxLhlL1w
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtscnd5b3Zkdm9qYmJmcmxxdGJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTk2NjE3OSwiZXhwIjoyMDc3NTQyMTc5fQ.vces2N5MQfQ89rq2ois6sA0BDhBsrUkApmMZjzitLbU
SUPABASE_BUCKET_NAME=CNTTK23M

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tuanvik206@gmail.com
EMAIL_PASSWORD=yqhjxbckdzlgafbb
EMAIL_FROM=ClassZone <noreply@classzone.com>
```

### Bước 3: Deploy
- Click **Deploy**
- Đợi build xong (3-5 phút)
- Copy URL backend: `https://your-backend.vercel.app`

---

## 🎨 DEPLOY FRONTEND

### Bước 1: Tạo File .env
```bash
# Tại thư mục gốc, tạo file .env
VITE_API_URL=https://your-backend.vercel.app/api
```

### Bước 2: Deploy Frontend
```bash
vercel
```

**Hoặc qua Vercel Dashboard:**
1. New Project → Import `CNTTK23M` repo
2. Framework Preset: **Vite**
3. Root Directory: `.` (thư mục gốc)
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Install Command: `npm install`

### Bước 3: Environment Variables Frontend

**Vào Settings → Environment Variables:**
```env
VITE_API_URL=https://your-backend.vercel.app/api
```

### Bước 4: Redeploy
- Sau khi thêm env, click **Redeploy**
- Đợi build xong
- Copy URL frontend: `https://your-frontend.vercel.app`

---

## 🔄 CẬP NHẬT CLIENT_URL

### Quay lại Backend Settings:
1. Vào Backend project → Settings → Environment Variables
2. Sửa `CLIENT_URL` thành: `https://your-frontend.vercel.app`
3. Redeploy backend

---

## ✅ KIỂM TRA

### 1. Test Backend
```bash
curl https://your-backend.vercel.app/api/health
```

**Kết quả mong đợi:**
```json
{
  "status": "ok",
  "database": "connected"
}
```

### 2. Test Frontend
- Truy cập: `https://your-frontend.vercel.app`
- Thử đăng nhập/đăng ký
- Kiểm tra các chức năng:
  - ✅ Login/Register
  - ✅ Create Post
  - ✅ Chat (Socket.IO)
  - ✅ Upload Document
  - ✅ View Profile
  - ✅ Notifications

---

## 🐛 TROUBLESHOOTING

### Lỗi Database Connection
```bash
# Kiểm tra DATABASE_URL có đúng không
# Đảm bảo password đã encode ký tự đặc biệt: ! -> %21
```

### Lỗi CORS
```bash
# Đảm bảo CLIENT_URL trong backend env đúng với frontend URL
# Restart backend sau khi thay đổi
```

### Lỗi Socket.IO
```bash
# Socket.IO cần WebSocket support
# Vercel hỗ trợ WebSocket từ Node 18+
# Kiểm tra Node version trong vercel.json
```

### Build Failed
```bash
# Check logs trong Vercel Dashboard
# Thường do:
# - Missing dependencies
# - TypeScript errors
# - Environment variables thiếu
```

---

## 📊 MONITORING

### Vercel Dashboard
- **Deployments**: Xem lịch sử deploy
- **Analytics**: Traffic, performance
- **Logs**: Real-time logs
- **Settings**: Env vars, domains

### Database (Supabase)
- **Table Editor**: Xem data
- **Database**: Connection pooling
- **Storage**: File uploads
- **Logs**: Query logs

---

## 🎉 HOÀN TẤT!

**URLs:**
- Frontend: `https://your-frontend.vercel.app`
- Backend: `https://your-backend.vercel.app`
- Database: Supabase (đã config)
- Storage: Supabase (đã config)
- Email: Gmail SMTP (đã config)

**Cost:** 
- ✅ Vercel: **FREE** (Hobby tier)
- ✅ Supabase: **FREE** (500MB DB + 1GB Storage)
- ✅ Gmail SMTP: **FREE** (500 emails/day)

**Tổng chi phí: $0/tháng** 🎊
