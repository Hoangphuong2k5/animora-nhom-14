import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 5000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  CORS_ORIGINS: (process.env.CORS_ORIGINS || process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  // Database SQL Server (TypeORM)
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: Number(process.env.DB_PORT) || 1433,
  DB_USERNAME: process.env.DB_USERNAME || 'sa',
  DB_PASSWORD: process.env.DB_PASSWORD || 'Animora@2026StrongPass!',
  DB_NAME: process.env.DB_NAME || 'AnimoraDB',
  DB_ENCRYPT: process.env.DB_ENCRYPT === 'true',
  DB_TRUST_SERVER_CERT: process.env.DB_TRUST_SERVER_CERT !== 'false',
  DB_CONNECTION_TIMEOUT_MS: Number(process.env.DB_CONNECTION_TIMEOUT_MS) || 3000,
  DB_POOL_MAX: Number(process.env.DB_POOL_MAX) || 10,

  // JWT Tokens
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'animora_access_secret_key_group14',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'animora_refresh_secret_key_group14',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '1d',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Storage / Uploads
  STORAGE_BASE_URL: process.env.STORAGE_BASE_URL || 'http://localhost:5000/uploads',
  STORAGE_PRESIGN_SECRET:
    process.env.STORAGE_PRESIGN_SECRET || 'animora_storage_presign_secret_group14',
  STORAGE_PRESIGN_EXPIRES_SEC: Number(process.env.STORAGE_PRESIGN_EXPIRES_SEC) || 300,

  // Background Jobs
  JOBS_ENABLED: process.env.JOBS_ENABLED !== 'false',

  // VNPAY (Toàn phụ trách)
  VNP_TMN_CODE: process.env.VNP_TMN_CODE || '',
  VNP_HASH_SECRET: process.env.VNP_HASH_SECRET || '',
  VNP_URL: process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  VNP_RETURN_URL: process.env.VNP_RETURN_URL || 'http://localhost:5173/payment-result',

  // Google Gemini AI (Hoàng phụ trách)
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  GEMINI_TIMEOUT_MS: Number(process.env.GEMINI_TIMEOUT_MS) || 8000,
  GEMINI_MAX_RETRIES: Number(process.env.GEMINI_MAX_RETRIES) || 2,

  // SMTP Email (Toàn phụ trách)
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',

  // Google OAuth 2.0 (Login with Google - Toàn phụ trách)
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
};

export default env;
