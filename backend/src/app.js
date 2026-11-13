const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const config = require("./config/env.config");
const routes = require("./routes");
const { errorHandler } = require("./middlewares/error.middleware");

const app = express();

// Security & Parsing Middlewares
app.use(helmet());
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (config.env === "development") {
  app.use(morgan("dev"));
}

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API Routes prefix: /api/v1
app.use("/api/v1", routes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
