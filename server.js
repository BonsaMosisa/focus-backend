// Load environment variables
import "dotenv/config";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// Initialize app
const app = express();

// --------------------
// Middleware
// --------------------
app.use(cors());
app.use(express.json()); // Parse JSON requests
// Using multer via `src/middleware/upload.js` for multipart/form-data handling.
// Do not use `express-fileupload` here to avoid parser conflicts.

// --------------------
// Database Connection
// --------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  });

// --------------------
// Routes (Admin-only system)
// --------------------
import adminRoutes from "./src/routes/adminRoutes.js";
import announcementRoutes from "./src/routes/announcementRoutes.js";
import galleryRoutes from "./src/routes/galleryRoutes.js";
import teachingRoutes from "./src/routes/teachingRoutes.js";
import teamRoutes from "./src/routes/teamRoutes.js";

// Serve uploaded files
import path from "path";
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/admin", adminRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/teachings", teachingRoutes);
app.use("/api/teams", teamRoutes);

// --------------------
// Health Check Route
// --------------------
app.get("/", (req, res) => {
  res.status(200).json({
    message: "FOCUS KITTO JIMMA Backend API is running",
  });
});

// --------------------
// Global Error Handler
// --------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// --------------------
// Start Server
// --------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
