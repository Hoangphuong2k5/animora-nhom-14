require("dotenv").config();

module.exports = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 5000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  db: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT, 10) || 1433,
    username: process.env.DB_USERNAME || "sa",
    password: process.env.DB_PASSWORD || "Animora@2026StrongPass!",
    database: process.env.DB_NAME || "Animora",
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERT !== "false",
  },
  jwt: {
    accessSecret:
      process.env.JWT_ACCESS_SECRET || "animora_access_secret_key_group14",
    refreshSecret:
      process.env.JWT_REFRESH_SECRET || "animora_refresh_secret_key_group14",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "1d",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
};
