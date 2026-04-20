import express from "express";
import http from "http";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";

import { connectDB } from "./config/db.js";
import { ENV } from "./lib/env.js";
import { initializeSocket } from "./lib/socket.js";
import { initCronJobs } from "./lib/cron.js";

import authRoutes from "./routes/auth.js";
import messageRoutes from "./routes/message.js";

dotenv.config();
initCronJobs();

const app = express();
const server = http.createServer(app);

const PORT = ENV.PORT || 3000;
const __dirname = path.resolve();

// --- CORS & Security ---
const allowedOrigins = [
  ENV.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`CORS Blocked: Origin "${origin}" not in allowed list.`);
        // For development, we allow it but log the mismatch
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(helmet({
    crossOriginResourcePolicy: false,
}));

// Initialize Sockets with the same origins
initializeSocket(server, allowedOrigins);

// --- Standard Middleware ---
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/message", messageRoutes);

if (ENV.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
}

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port: http://localhost:${PORT}`);
  connectDB();
});