# 🚀 DEPLOYMENT - Hoàn toàn MIỄN PHÍ

## 🎯 Tổng quan

- **Frontend:** Vercel (FREE tier)
- **Backend:** Railway (FREE $5/month) hoặc Render (FREE)
- **Database:** Supabase PostgreSQL (FREE 500MB)
- **File Storage:** Supabase Storage (FREE 1GB)
- **Email:** Gmail SMTP (FREE) hoặc Resend (FREE 3k emails/month)

**TỔNG CHI PHÍ: 0đ/tháng** ✅

---

## 📦 BƯỚC 1: Chuẩn bị Code

### 1. Push code lên GitHub

```powershell
# Khởi tạo git (nếu chưa có)
git init
git add .
git commit -m "Initial commit - ClassZone"

# Tạo repo trên GitHub: https://github.com/new
# Sau đó:
git remote add origin https://github.com/AnhTuano/CNTTK23M.git
git branch -M main
git push -u origin main
```

### 2. Tạo file `.gitignore` (quan trọng!)

```
# Dependencies
node_modules/
server/node_modules/

# Environment
.env
.env.local
server/.env
server/.env.local

# Build
dist/
server/dist/
.vite/

# Logs
*.log
```

---

## 🗄️ BƯỚC 2: Setup Database (Supabase - FREE)

### 1. Tạo Supabase Project

1. Vào https://supabase.com → Sign up (FREE)
2. New Project:
   - Name: `classzone`
   - Password: (lưu lại!)
   - Region: `Southeast Asia (Singapore)`
   - Pricing Plan: **FREE** ✅

### 2. Chạy Migrations từ Local

```powershell
# Trong folder server/
# Cập nhật DATABASE_URL trong .env với Supabase URL
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Generate và migrate
npm run prisma:generate
npm run prisma:migrate deploy
npm run prisma:seed
```

### 3. Enable Storage

1. Trong Supabase Dashboard → Storage
2. Create bucket: `classzone-files`
3. ✅ Make it public
4. Copy credentials từ Settings > API

---

## 🎨 BƯỚC 3: Deploy Frontend (Vercel - FREE)

### Setup:

1. **Vào Vercel:**
   - https://vercel.com
   - Sign up with GitHub (FREE - unlimited projects!)

2. **Import Project:**
   - Click "Add New... > Project"
   - Import `CNTTK23M` repository
   - Framework Preset: `Vite`
   - Root Directory: `./` (để mặc định)

3. **Configure Build:**
   ```
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```
   (Backend URL sẽ có sau bước 4)

5. **Deploy!**
   - Click "Deploy"
   - Đợi 2-3 phút
   - Frontend sẽ có URL: `https://your-app.vercel.app`

### Auto-Deploy:
- Mỗi lần push lên GitHub `main` branch → Vercel tự động deploy!

---

## 🔧 BƯỚC 4: Deploy Backend (Railway - FREE $5/month)

### OPTION A: Railway (Recommended - $5 credit/month)

#### 1. Setup Railway:

1. **Vào Railway:**
   - https://railway.app
   - Sign up with GitHub (FREE - $5 credit/month!)

2. **New Project:**
   - Click "New Project"
   - Deploy from GitHub repo
   - Select `CNTTK23M` repository

3. **Configure Service:**
   - Root Directory: `server`
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Watch Path: `server/**`

4. **Environment Variables:**

   Vào Settings > Variables, thêm tất cả:

   ```env
   NODE_ENV=production
   PORT=5000
   CLIENT_URL=https://your-app.vercel.app
   
   # Supabase Database URL
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   
   # JWT
   JWT_SECRET=your-production-secret-key-very-long-and-secure
   JWT_REFRESH_SECRET=your-refresh-secret-also-very-secure
   JWT_EXPIRES_IN=1h
   JWT_REFRESH_EXPIRES_IN=7d
   
   # Supabase Storage
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_KEY=eyJhbGc...
   
   # Email (Gmail hoặc Resend)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=ClassZone <your-email@gmail.com>
   
   # OAuth (optional)
   GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
   GOOGLE_CALLBACK_URL=https://your-backend.railway.app/api/auth/google/callback
   ```

5. **Deploy:**
   - Railway tự động deploy
   - Copy URL: `https://your-backend.railway.app`

6. **Update Frontend:**
   - Vào Vercel → Settings > Environment Variables
   - Update `VITE_API_URL`:
     ```
     VITE_API_URL=https://your-backend.railway.app/api
     ```
   - Redeploy frontend

---

### OPTION B: Render (Hoàn toàn FREE - nhưng chậm hơn)

#### 1. Setup Render:

1. **Vào Render:**
   - https://render.com
   - Sign up with GitHub (FREE!)

2. **New Web Service:**
   - Connect repository: `CNTTK23M`
   - Name: `classzone-backend`
   - Region: `Singapore`
   - Branch: `main`
   - Root Directory: `server`
   - Runtime: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

3. **Plan:** 
   - Select **FREE** tier ✅
   - Lưu ý: Service sẽ sleep sau 15 phút không hoạt động

4. **Environment Variables:**
   (Giống Railway - thêm tất cả biến môi trường)

5. **Deploy:**
   - Click "Create Web Service"
   - Đợi deploy (5-10 phút lần đầu)
   - Copy URL: `https://classzone-backend.onrender.com`

#### Lưu ý Render FREE:
- ⏱️ Auto-sleep sau 15 phút không dùng
- 🐌 Lần đầu load sau khi sleep: ~1 phút
- 💡 Giải pháp: Dùng Uptime Monitor (FREE) để ping mỗi 10 phút

---

## 🔔 BƯỚC 5: Setup Uptime Monitor (FREE - giữ server luôn active)

### Better Uptime (FREE):

1. Vào: https://betterstack.com/better-uptime
2. Sign up (FREE)
3. Create Monitor:
   - URL: `https://your-backend.railway.app/health`
   - Check interval: `5 minutes`
   - Alert: Email của bạn

→ Server sẽ không bao giờ sleep! ✅

---

## 🔐 BƯỚC 6: Update OAuth Callbacks

### Google OAuth:

1. Vào https://console.cloud.google.com
2. Credentials > Edit OAuth 2.0 Client
3. Add Authorized redirect URIs:
   ```
   https://your-backend.railway.app/api/auth/google/callback
   https://your-app.vercel.app
   ```

### Facebook OAuth:

1. Vào https://developers.facebook.com
2. App Settings > Facebook Login > Settings
3. Add Valid OAuth Redirect URIs:
   ```
   https://your-backend.railway.app/api/auth/facebook/callback
   ```

---

## ✅ BƯỚC 7: Test Production

1. **Truy cập:**
   ```
   https://your-app.vercel.app
   ```

2. **Test các tính năng:**
   - ✅ Login/Register
   - ✅ Create post
   - ✅ Upload file (Supabase Storage)
   - ✅ Send email
   - ✅ Chat real-time

3. **Monitor:**
   - Frontend: Vercel Dashboard
   - Backend: Railway Dashboard
   - Database: Supabase Dashboard

---

## 📊 Monitoring & Analytics (Optional - FREE)

### 1. Vercel Analytics (FREE)

- Vào Vercel Project → Analytics
- Enable Analytics (FREE tier)
- View traffic, performance, Web Vitals

### 2. Sentry Error Tracking (FREE)

```powershell
npm install @sentry/react @sentry/node
```

Setup: https://sentry.io (FREE - 5,000 errors/month)

---

## 🔄 CI/CD Auto-Deploy

### GitHub Actions (FREE):

File `.github/workflows/deploy.yml` đã được tạo!

**Hoạt động:**
1. Push code lên GitHub
2. GitHub Actions chạy tests
3. Vercel & Railway tự động deploy
4. Nhận email thông báo

---

## 💰 TỔNG CHI PHÍ

| Service | Plan | Cost |
|---------|------|------|
| Vercel | FREE | **0đ** |
| Railway | FREE ($5 credit) | **0đ** |
| Supabase | FREE | **0đ** |
| Email (Gmail) | FREE | **0đ** |
| Monitoring | FREE | **0đ** |
| **TỔNG** | | **0đ/tháng** 🎉 |

---

## 🎯 Custom Domain (Optional - ~50k VNĐ/năm)

### Mua domain:

1. **Namecheap:** ~$1/năm (~25k VNĐ) - domain `.xyz`, `.online`
2. **Hostinger:** ~$0.99/năm cho `.com`

### Setup:

**Vercel (Frontend):**
1. Settings > Domains
2. Add domain: `classzone.com`
3. Update DNS records theo hướng dẫn

**Railway (Backend):**
1. Settings > Custom Domain
2. Add: `api.classzone.com`
3. Update DNS CNAME

---

## 🆘 Troubleshooting

### Lỗi: "Database connection failed"
- Verify DATABASE_URL trong Railway
- Check Supabase database đang chạy

### Lỗi: "CORS error"
- Update CLIENT_URL trong backend environment variables
- Restart Railway service

### Backend chậm (Render):
- Dùng Better Uptime để ping mỗi 5 phút
- Hoặc chuyển sang Railway

### Email không gửi được:
- Verify Gmail App Password đúng
- Check EMAIL_USER và EMAIL_PASSWORD

---

## 📚 Resources

- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Supabase Docs](https://supabase.com/docs)
- [Better Uptime](https://betterstack.com/better-uptime)

---

**🎉 CHÚC MỪNG! App của bạn đã live!**

Share link với bạn bè: `https://your-app.vercel.app` 🚀
