# 🎓 ClassZone - Nền tảng Quản lý Lớp học Trực tuyến

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)

Hệ thống quản lý lớp học toàn diện với các tính năng hiện đại cho sinh viên và giảng viên.

## ✨ Tính năng chính

### 🔐 Authentication & Authorization
- ✅ JWT Authentication (Access + Refresh Tokens)
- ✅ OAuth 2.0 (Google, Facebook)
- ✅ Forgot Password với Email
- ✅ Role-based Access Control (7 vai trò)
- ✅ Force Password Change

### 📰 Quản lý Bài đăng
- ✅ Rich Text Editor (Quill)
- ✅ Upload ảnh & file đính kèm
- ✅ Vote (Upvote/Downvote)
- ✅ Comment system
- ✅ Poll/Khảo sát
- ✅ Pin bài quan trọng
- ✅ Báo cáo vi phạm

### 📚 Quản lý Tài liệu
- ✅ Upload tài liệu (PDF, Word, Excel)
- ✅ Phân loại: Bài giảng, Đề thi, Ghi chú
- ✅ Duyệt tài liệu (Admin)
- ✅ Cloud storage (Cloudinary)

### 💬 Chat Real-time
- ✅ WebSocket (Socket.IO)
- ✅ Multiple chat rooms
- ✅ Role-based rooms
- ✅ Typing indicators
- ✅ Online/Offline status

### 🖼️ Kỷ niệm & Ảnh
- ✅ Upload ảnh hoạt động
- ✅ Phân theo học kỳ
- ✅ Reaction system
- ✅ Lightbox viewer

### 📅 Lịch & Sự kiện
- ✅ FullCalendar integration
- ✅ Tạo & quản lý events
- ✅ RSVP system
- ✅ Notifications

### ✅ Điểm danh
- ✅ QR Code check-in
- ✅ Manual check-in
- ✅ Báo cáo điểm danh
- ✅ Export Excel

### 📊 Quản lý Điểm
- ✅ Import/Export Excel
- ✅ Tính GPA tự động
- ✅ Thống kê điểm
- ✅ Biểu đồ phân tích

### 🏆 Gamification
- ✅ Badge system
- ✅ Leaderboard
- ✅ Point system
- ✅ Achievements

### ⚙️ Admin Dashboard
- ✅ System monitoring (Real-time)
- ✅ User management
- ✅ Content moderation
- ✅ Website configuration
- ✅ Analytics & Reports

## 🏗️ Kiến trúc

### Frontend
- **Framework:** React 19.2 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + Framer Motion
- **State Management:** React Query + Context API
- **Real-time:** Socket.IO Client
- **Forms:** React Hook Form
- **Charts:** Recharts
- **Calendar:** FullCalendar
- **Editor:** React Quill

### Backend
- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT + Passport.js
- **Real-time:** Socket.IO
- **File Upload:** Cloudinary + Multer
- **Email:** Nodemailer
- **Security:** Helmet + Rate Limiting

### DevOps
- **Containerization:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Deployment:** Vercel (Frontend) + Railway (Backend)
- **Testing:** Vitest + Playwright

## 🚀 Quick Start

### Prerequisites
```bash
Node.js >= 18.x
PostgreSQL >= 14.x
npm hoặc yarn
```

### 1. Clone repository
```bash
git clone https://github.com/AnhTuano/CNTTK23M.git
cd CNTTK23M
```

### 2. Setup Backend
```bash
cd server
npm install
cp .env.example .env
# Cập nhật .env với credentials của bạn
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Backend sẽ chạy tại `http://localhost:5000`

### 3. Setup Frontend
```bash
cd ..
npm install
npm run dev
```

Frontend sẽ chạy tại `http://localhost:3000`

### 4. Docker (Optional)
```bash
docker-compose up -d
```

## 📁 Cấu trúc Dự án

```
CNTTK23M/
├── server/                 # Backend API
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── lib/           # Utilities
│   │   ├── socket/        # Socket.IO
│   │   └── index.ts       # Entry point
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   ├── Dockerfile
│   └── package.json
├── components/            # React components
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── pages/                # Page components
├── hooks/                # Custom hooks
├── lib/                  # Utilities & API
├── .github/              # GitHub Actions
│   └── workflows/
│       └── ci-cd.yml
├── docker-compose.yml
└── package.json
```

## 🔧 Cấu hình

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/classzone
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
EMAIL_USER=your-email@gmail.com
GOOGLE_CLIENT_ID=your-google-client-id
FACEBOOK_APP_ID=your-facebook-app-id
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📊 Database Schema

Prisma schema bao gồm:
- Users (với roles & badges)
- Posts (với comments, votes, polls)
- Documents
- Memories (với reactions)
- ChatRooms & ChatMessages
- Events (với participants)
- Attendance
- Grades
- Notifications
- WebsiteConfig

## 🧪 Testing

### Unit Tests (Vitest)
```bash
npm run test
```

### E2E Tests (Playwright)
```bash
npx playwright test
```

## 📦 Deployment

### Frontend (Vercel)
```bash
vercel --prod
```

### Backend (Railway/Render)
1. Push code lên GitHub
2. Connect repository với Railway
3. Add environment variables
4. Deploy!

### Docker
```bash
docker build -t classzone-server ./server
docker push your-registry/classzone-server
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 API Documentation

Chi tiết API endpoints tại `/server/README.md`

Hoặc truy cập Swagger UI (khi server chạy):
```
http://localhost:5000/api-docs
```

## 🛡️ Security

- JWT với refresh token rotation
- Password hashing với bcrypt (10 rounds)
- Rate limiting (100 req/15min)
- CORS protection
- Helmet security headers
- Input validation
- SQL injection prevention (Prisma)
- XSS protection

## 📈 Performance Optimization

- Code splitting (React.lazy)
- Image lazy loading
- Virtual scrolling cho lists dài
- React Query caching
- Gzip compression
- CDN cho static assets
- Database indexing
- Connection pooling

## 🐛 Known Issues

Xem Issues tab trên GitHub

## 📄 License

MIT License - Xem file [LICENSE](LICENSE)

## 👥 Authors

- **Anh Tuấn** - [@AnhTuano](https://github.com/AnhTuano)

## 🙏 Acknowledgments

- React team
- Prisma team
- Tailwind CSS
- Và tất cả open-source contributors!

---

⭐ Nếu project này hữu ích, hãy cho một star nhé!

Made with ❤️ by ClassZone Team
