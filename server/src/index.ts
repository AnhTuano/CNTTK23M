import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import postRoutes from './routes/post.routes';
import documentRoutes from './routes/document.routes';
import memoryRoutes from './routes/memory.routes';
import chatRoutes from './routes/chat.routes';
import notificationRoutes from './routes/notification.routes';
import eventRoutes from './routes/event.routes';
import attendanceRoutes from './routes/attendance.routes';
import gradeRoutes from './routes/grade.routes';
import configRoutes from './routes/config.routes';
import reportRoutes from './routes/report.routes';
import backupRoutes from './routes/backup.routes';
import badgeRoutes from './routes/badge.routes';

// Import socket handlers
import { setupSocketIO } from './socket';

// Import services
import { BadgeAutoAwardService } from './services/badge-auto-award.service';
import { updateAllUserPoints } from './services/points.service';

const app: Express = express();
const httpServer = createServer(app);

// Initialize Socket.IO
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Setup Socket.IO handlers
setupSocketIO(io);

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(morgan('dev')); // Logging
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Higher limit in development
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/config', configRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/badges', badgeRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, async () => {
  // console.log(`🚀 Server running on http://localhost:${PORT}`);
  // console.log(`🔌 Socket.IO ready for connections`);
  // console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  
  // Sync all user points on startup
  // console.log('💯 Syncing all user points...');
  try {
    await updateAllUserPoints();
    // console.log('✅ All user points synced successfully');
  } catch (error) {
    console.error('❌ Failed to sync user points:', error);
  }
  
  // Initial badge check on startup
  // console.log('🎖️  Running initial badge check...');
  BadgeAutoAwardService.checkAndAwardAllUsers().catch(err => 
    console.error('Failed initial badge check:', err)
  );
  
  // Auto-check every 2 minutes for users who meet requirements
  const INTERVAL_MINUTES = 2;
  setInterval(() => {
    // console.log('🔄 Running periodic badge check...');
    BadgeAutoAwardService.checkAndAwardAllUsers().catch(err => 
      console.error('Failed periodic badge check:', err)
    );
  }, INTERVAL_MINUTES * 60 * 1000);
  
  // console.log(`🤖 Badge auto-award: Realtime + every ${INTERVAL_MINUTES} minutes`);
  // console.log(`💯 Points auto-update: Realtime on every activity`);
});

export default app;
