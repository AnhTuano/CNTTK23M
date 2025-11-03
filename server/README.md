# ClassZone Backend Server

Backend API server cho ClassZone - Nền tảng quản lý lớp học trực tuyến.

## 🚀 Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT + OAuth (Google, Facebook)
- **Real-time:** Socket.IO
- **File Upload:** Cloudinary
- **Email:** Nodemailer

## 📋 Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm hoặc yarn

## ⚙️ Installation

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Setup Environment Variables

Sao chép file `.env.example` thành `.env`:

```bash
copy .env.example .env
```

Cập nhật các biến môi trường trong `.env`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/classzone"

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 3. Setup Database

Chạy migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Seed dữ liệu mẫu (optional):

```bash
npm run prisma:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:5000`

## 📁 Project Structure

```
server/
├── src/
│   ├── controllers/       # Request handlers
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── lib/               # Utilities (prisma, jwt, email...)
│   ├── socket/            # Socket.IO handlers
│   └── index.ts           # Entry point
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── .env                   # Environment variables
└── package.json
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `POST /api/auth/change-password` - Đổi mật khẩu
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password/:token` - Reset mật khẩu
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/facebook` - Facebook OAuth

### Users
- `GET /api/users` - Lấy danh sách users
- `GET /api/users/:id` - Lấy thông tin user
- `PUT /api/users/:id` - Cập nhật user
- `DELETE /api/users/:id` - Xóa user
- `POST /api/users/:id/badges` - Gán badge cho user
- `POST /api/users/:id/lock` - Khóa/mở khóa user

### Posts
- `GET /api/posts` - Lấy danh sách bài đăng
- `GET /api/posts/:id` - Lấy chi tiết bài đăng
- `POST /api/posts` - Tạo bài đăng mới
- `PUT /api/posts/:id` - Cập nhật bài đăng
- `DELETE /api/posts/:id` - Xóa bài đăng
- `POST /api/posts/:id/vote` - Vote (upvote/downvote)
- `POST /api/posts/:id/pin` - Ghim/bỏ ghim bài đăng
- `POST /api/posts/:id/comments` - Thêm comment
- `DELETE /api/posts/:id/comments/:commentId` - Xóa comment

### Documents
- `GET /api/documents` - Lấy danh sách tài liệu
- `POST /api/documents` - Upload tài liệu
- `PUT /api/documents/:id` - Cập nhật tài liệu
- `DELETE /api/documents/:id` - Xóa tài liệu
- `POST /api/documents/:id/approve` - Duyệt tài liệu

### Memories
- `GET /api/memories` - Lấy danh sách kỷ niệm
- `POST /api/memories` - Upload ảnh kỷ niệm
- `DELETE /api/memories/:id` - Xóa ảnh
- `POST /api/memories/:id/react` - React vào ảnh
- `POST /api/memories/:id/approve` - Duyệt ảnh

### Chat
- `GET /api/chat/rooms` - Lấy danh sách phòng chat
- `GET /api/chat/rooms/:id/messages` - Lấy tin nhắn trong phòng
- Socket events: `join:room`, `leave:room`, `message:send`, `typing:start`, `typing:stop`

### Events
- `GET /api/events` - Lấy danh sách sự kiện
- `POST /api/events` - Tạo sự kiện mới
- `PUT /api/events/:id` - Cập nhật sự kiện
- `DELETE /api/events/:id` - Xóa sự kiện
- `POST /api/events/:id/participate` - Tham gia sự kiện

### Attendance
- `GET /api/attendance` - Lấy danh sách điểm danh
- `POST /api/attendance/check-in` - Check-in điểm danh
- `GET /api/attendance/report` - Báo cáo điểm danh

### Grades
- `GET /api/grades` - Lấy danh sách điểm
- `POST /api/grades` - Thêm điểm
- `PUT /api/grades/:id` - Cập nhật điểm
- `DELETE /api/grades/:id` - Xóa điểm
- `POST /api/grades/import` - Import điểm từ Excel
- `GET /api/grades/export` - Export điểm ra Excel

### Configuration
- `GET /api/config` - Lấy cấu hình website
- `PUT /api/config` - Cập nhật cấu hình (Admin only)

## 🔌 Socket.IO Events

### Client → Server
- `join:room` - Tham gia phòng chat
- `leave:room` - Rời phòng chat
- `message:send` - Gửi tin nhắn
- `typing:start` - Bắt đầu typing
- `typing:stop` - Dừng typing
- `status:online` - Đánh dấu online

### Server → Client
- `joined:room` - Đã tham gia phòng
- `left:room` - Đã rời phòng
- `message:new` - Tin nhắn mới
- `user:typing` - User đang typing
- `user:stopped-typing` - User dừng typing
- `user:online` - User online
- `user:offline` - User offline
- `notification:new` - Thông báo mới

## 🛠️ Scripts

```bash
npm run dev          # Start development server
npm run build        # Build production
npm run start        # Start production server
npm run prisma:generate    # Generate Prisma Client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open Prisma Studio
npm run prisma:seed        # Seed database
```

## 🔒 Security

- Helmet.js cho security headers
- Rate limiting
- JWT authentication
- Password hashing với bcrypt
- CORS protection
- Input validation với express-validator

## 📝 Notes

- Access token: 1 hour
- Refresh token: 7 days
- File upload limit: 10MB
- Rate limit: 100 requests/15 minutes

## 🐛 Troubleshooting

### Database connection error
- Kiểm tra PostgreSQL đang chạy
- Kiểm tra DATABASE_URL trong .env
- Chạy: `npm run prisma:migrate`

### Cloudinary upload error
- Kiểm tra Cloudinary credentials trong .env
- Verify cloud name, API key và API secret

### Email not sending
- Kiểm tra EMAIL_USER và EMAIL_PASSWORD
- Nếu dùng Gmail, bật 2FA và tạo App Password

## 📄 License

MIT
