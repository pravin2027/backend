import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Load environment variables
dotenv.config();

const app = express();

// Add startup status variables
let isMongoConnected = false;
let isServerListening = false;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Allow both localhost and IP
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb+srv://pravin:pravin@assignment-tracker.dgzq2.mongodb.net/Test")
  .then(() => {
    console.log("✅ MongoDB Atlas Connected");
    isMongoConnected = true;
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Routes
app.use("/api/users", userRoutes);
app.use("/api/assignments", assignmentRoutes);

// Base route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Add near your other routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mongodb: isMongoConnected ? 'connected' : 'disconnected',
    server: isServerListening ? 'listening' : 'starting',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 5001;

const startServer = () => {
  try {
    app.listen(PORT, () => {
      isServerListening = true;
      console.log(`
🚀 Server Status:
   - Server running on port: ${PORT}
   - API URL: http://localhost:${PORT}
   - MongoDB Connected: ${isMongoConnected ? '✅' : '❌'}
   - Environment: ${process.env.NODE_ENV || 'development'}
    `);
    });
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Trying ${PORT + 1}...`);
      PORT = PORT + 1;
      startServer();
    } else {
      console.error('❌ Server error:', error);
      process.exit(1);
    }
  }
};

startServer();

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection:", err);
  process.exit(1);
});
