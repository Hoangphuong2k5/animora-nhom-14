const http = require("http");
const app = require("./app");
const config = require("./config/env.config");
const { AppDataSource } = require("./config/data-source");

const server = http.createServer(app);

const startServer = async () => {
  try {
    // 1. Kết nối TypeORM với SQL Server
    console.log("🔄 Connecting to SQL Server Database...");
    await AppDataSource.initialize();
    console.log("✅ TypeORM DataSource connected to SQL Server successfully.");

    // 2. Khởi động HTTP Server
    server.listen(config.port, () => {
      console.log(
        `🚀 Animora Backend running on port ${config.port} in ${config.env} mode`,
      );
      console.log(
        `📡 Health Check URL: http://localhost:${config.port}/api/v1/health`,
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message || error);
    // Vẫn khởi động HTTP Server ở chế độ degraded để có thể truy cập /health xem lỗi DB
    server.listen(config.port, () => {
      console.log(
        `⚠️ Animora Backend running with DB DISCONNECTED on port ${config.port}`,
      );
      console.log(
        `📡 Health Check URL: http://localhost:${config.port}/api/v1/health`,
      );
    });
  }
};

startServer();
