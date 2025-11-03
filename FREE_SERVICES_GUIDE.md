# 💰 HƯỚNG DẪN SỬ DỤNG DỊCH VỤ MIỄN PHÍ

Tất cả các dịch vụ dưới đây đều có **FREE TIER** không cần thẻ tín dụng!

## 🗄️ Database: Supabase (FREE)

### Tính năng miễn phí:
- ✅ 500MB PostgreSQL database
- ✅ Unlimited API requests
- ✅ 50,000 monthly active users
- ✅ Realtime subscriptions
- ✅ Authentication built-in

### Hướng dẫn setup:

1. **Đăng ký tài khoản:**
   - Truy cập: https://supabase.com
   - Click "Start your project" (FREE - không cần thẻ)
   - Đăng ký bằng GitHub hoặc Email

2. **Tạo project:**
   - Click "New Project"
   - Chọn Organization (hoặc tạo mới)
   - Đặt tên project: `classzone`
   - Tạo Database Password (lưu lại!)
   - Chọn Region: `Southeast Asia (Singapore)`
   - Click "Create new project"

3. **Lấy Database URL:**
   - Đợi project khởi tạo (2-3 phút)
   - Vào `Settings > Database`
   - Copy `Connection string > URI`
   - Paste vào `.env` file:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

4. **Enable Row Level Security (Optional nhưng recommended):**
   - Vào `Authentication > Policies`
   - Enable RLS cho các tables

---

## 📁 File Storage: Supabase Storage (FREE)

### Tính năng miễn phí:
- ✅ 1GB storage
- ✅ Unlimited uploads
- ✅ Image transformations
- ✅ CDN delivery

### Hướng dẫn setup:

1. **Enable Storage:**
   - Trong Supabase project, vào `Storage`
   - Click "Create a new bucket"
   - Bucket name: `classzone-files`
   - Public bucket: ✅ (để public access)
   - Click "Create bucket"

2. **Tạo folders:**
   ```
   classzone-files/
   ├── avatars/
   ├── covers/
   ├── documents/
   └── memories/
   ```

3. **Lấy credentials:**
   - Vào `Settings > API`
   - Copy:
     - `Project URL`
     - `anon public` key
     - `service_role` key (giữ bí mật!)
   - Paste vào `.env`:
   ```env
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_KEY=eyJhbGc...
   ```

---

## 📧 Email: 2 Options (FREE)

### **Option 1: Gmail SMTP (Hoàn toàn MIỄN PHÍ)**

#### Giới hạn:
- ✅ 500 emails/day (đủ dùng!)
- ✅ Không giới hạn recipients

#### Setup:

1. **Bật 2-Factor Authentication:**
   - Vào https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Tạo App Password:**
   - Vào https://myaccount.google.com/apppasswords
   - Select app: `Mail`
   - Select device: `Other (Custom name)` → Nhập "ClassZone"
   - Click "Generate"
   - Copy mã 16 ký tự (ví dụ: `abcd efgh ijkl mnop`)

3. **Cấu hình .env:**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop
   EMAIL_FROM=ClassZone <your-email@gmail.com>
   ```

### **Option 2: Resend (FREE - Chuyên nghiệp hơn)**

#### Tính năng miễn phí:
- ✅ 3,000 emails/month
- ✅ 100 emails/day
- ✅ Email templates
- ✅ Analytics

#### Setup:

1. **Đăng ký:**
   - Truy cập: https://resend.com
   - Sign up with GitHub (FREE - không cần thẻ)

2. **Tạo API Key:**
   - Vào Dashboard > API Keys
   - Click "Create API Key"
   - Name: `ClassZone`
   - Copy API key

3. **Cấu hình .env:**
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   EMAIL_FROM=ClassZone <onboarding@resend.dev>
   ```

---

## 🔐 OAuth: Google & Facebook (FREE)

### **Google OAuth (FREE)**

1. **Tạo Project:**
   - Truy cập: https://console.cloud.google.com
   - Click "New Project" → Tên: `ClassZone`
   - Chọn project vừa tạo

2. **Enable APIs:**
   - Vào `APIs & Services > Library`
   - Tìm và enable: `Google+ API`

3. **Tạo OAuth Credentials:**
   - Vào `APIs & Services > Credentials`
   - Click `Create Credentials > OAuth 2.0 Client ID`
   - Application type: `Web application`
   - Name: `ClassZone`
   - Authorized redirect URIs:
     ```
     http://localhost:5000/api/auth/google/callback
     ```
   - Click "Create"
   - Copy `Client ID` và `Client Secret`

4. **Cấu hình .env:**
   ```env
   GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
   ```

### **Facebook OAuth (FREE)**

1. **Tạo App:**
   - Truy cập: https://developers.facebook.com
   - Click `My Apps > Create App`
   - Type: `Consumer`
   - App name: `ClassZone`

2. **Add Facebook Login:**
   - Dashboard > Add Product > Facebook Login
   - Settings > Valid OAuth Redirect URIs:
     ```
     http://localhost:5000/api/auth/facebook/callback
     ```

3. **Copy Credentials:**
   - Settings > Basic
   - Copy `App ID` và `App Secret`

4. **Cấu hình .env:**
   ```env
   FACEBOOK_APP_ID=your-app-id
   FACEBOOK_APP_SECRET=your-app-secret
   ```

---

## 🚀 Deployment (FREE)

### **Frontend: Vercel (FREE)**

#### Tính năng miễn phí:
- ✅ Unlimited websites
- ✅ 100GB bandwidth/month
- ✅ Automatic SSL
- ✅ CDN global

#### Setup:

1. Push code lên GitHub
2. Vào https://vercel.com
3. Sign up with GitHub (FREE)
4. Import repository `CNTTK23M`
5. Framework: `Vite`
6. Build command: `npm run build`
7. Output directory: `dist`
8. Environment variables:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```
9. Deploy!

### **Backend: Railway (FREE $5/month credit)**

#### Tính năng miễn phí:
- ✅ $5 credit/month (đủ dùng!)
- ✅ 512MB RAM
- ✅ 1GB disk
- ✅ Custom domains

#### Setup:

1. Vào https://railway.app
2. Sign up with GitHub (FREE)
3. New Project > Deploy from GitHub repo
4. Select `CNTTK23M` repository
5. Root directory: `/server`
6. Add Environment Variables (copy từ .env)
7. Deploy!

**Lưu ý:** Nếu hết credit, dùng **Render (FREE tier)**:
- https://render.com
- Free tier: 750 hours/month
- Auto-sleep sau 15 phút không dùng

---

## 💾 Redis Cache (Optional - FREE)

### **Upstash Redis (FREE)**

#### Tính năng miễn phí:
- ✅ 10,000 commands/day
- ✅ 256MB storage
- ✅ Global regions

#### Setup:

1. Vào https://upstash.com
2. Sign up (FREE)
3. Create Database
4. Copy `UPSTASH_REDIS_REST_URL`
5. Paste vào `.env`:
   ```env
   REDIS_URL=https://xxxxx.upstash.io
   ```

---

## 📊 Monitoring (Optional - FREE)

### **Better Stack (FREE)**

- ✅ Uptime monitoring
- ✅ 3 monitors
- ✅ Email alerts

1. Vào https://betterstack.com
2. Sign up (FREE)
3. Add monitor: `https://your-app.vercel.app`

---

## ✅ CHECKLIST HOÀN CHỈNH (Tất cả FREE!)

- [ ] Supabase account + database
- [ ] Supabase Storage bucket
- [ ] Gmail App Password HOẶC Resend API key
- [ ] Google OAuth credentials
- [ ] Facebook OAuth credentials (optional)
- [ ] Vercel account (frontend deployment)
- [ ] Railway account (backend deployment)
- [ ] Upstash Redis (optional)

---

## 💰 TỔNG CHI PHÍ

**0 VNĐ / tháng** 🎉

Tất cả đều FREE tier, không cần thẻ tín dụng!

---

## 🆘 Support

Nếu gặp khó khăn khi setup bất kỳ service nào, hãy hỏi tôi! 😊
