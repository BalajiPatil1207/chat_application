import express from "express";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();

const __dirname = path.resolve();

const PORT = process.env.PORT || 3000;

// =====  Routes  =====
import authRoutes from "./routes/auth.js";
app.use("/api/auth", authRoutes);

import messageRoutes from "./routes/message.js";
app.use("/api/message", messageRoutes);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname,"../frontend/dist")))
}

app.listen(PORT, () =>
  console.log(`Server running on port: http://localhost:${PORT}`),
);
