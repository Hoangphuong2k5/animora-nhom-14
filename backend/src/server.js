import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/environment.js';
import { corsOptions } from './config/cors.js';
import { APIs_V1 } from './routes/v1/index.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { traceMiddleware } from './utils/traceContext.js';
import { AppDataSource } from './config/data-source.js';
import { startLowStockJob } from './jobs/low-stock.job.js';
import { startReminderJob } from './jobs/reminder.job.js';
import { startBookingExpiryJob } from './jobs/booking-expiry.job.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// 1. CẤU HÌNH EXPRESS APP
// ==========================================
const app = express();

// 1.1. Distributed tracing (traceId)
app.use(traceMiddleware);

// 1.2. Bảo mật HTTP headers
app.use(helmet());

// 1.3. CORS Whitelist Origin (cấu hình allowlist tại config/cors.js)
app.use(cors(corsOptions));

// 1.4. Parse Cookie từ trình duyệt gửi lên (Phục vụ 100% HttpOnly Cookie JWT)
app.use(cookieParser());

// 1.5. Parse request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1.6. Morgan logger ở dev
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 1.7. Static files cho uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 1.8. API Routes prefix: /api/v1
app.use('/api/v1', APIs_V1);

// 1.9. Global Error Handler tập trung (Luôn đặt CUỐI CÙNG)
app.use(errorMiddleware);

// ==========================================
// 2. KHỞI TẠO HTTP SERVER & DATABASE
// ==========================================
const server = http.createServer(app);
const scheduledJobs = [];

/**
 * Khởi động cron jobs (INV-04 cảnh báo tồn kho thấp, NTF-01 nhắc lịch).
 */
const startBackgroundJobs = () => {
  if (!env.JOBS_ENABLED) return;
  scheduledJobs.push(startLowStockJob(), startReminderJob(), startBookingExpiryJob());
};

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Connected to SQL Server Database successfully!');

    server.listen(env.PORT, () => {
      console.log(`Server is running at http://localhost:${env.PORT}`);
    });
    startBackgroundJobs();
  } catch (error) {
    console.error('Failed to connect to Database:', error.message || error);
    // Vẫn khởi động HTTP Server ở chế độ degraded để có thể truy cập /health xem trạng thái
    server.listen(env.PORT, () => {
      console.log(`Server is running at http://localhost:${env.PORT} (DB Disconnected)`);
    });
  }
};

// Giải phóng tài nguyên khi tắt tiến trình (Ctrl+C hoặc kill)
const shutdown = async () => {
  scheduledJobs.forEach((job) => job.stop());
  server.close();
  if (AppDataSource.isInitialized) await AppDataSource.destroy();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Chỉ kết nối DB và mở cổng khi KHÔNG PHẢI môi trường test (Jest/Supertest)
if (env.NODE_ENV !== 'test') {
  startServer();
}

export { app, server };
export default app;
