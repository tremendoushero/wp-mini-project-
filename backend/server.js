// backend/server.js
// Purpose: Main entry point of the backend application.
// Configures Express, CORS with credentials, Cookie-Parser, Auth & Student routes.

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Load environment variables from backend/.env file
dotenv.config({ path: path.join(__dirname, '.env') });

// Initialize the Express application
const app = express();

// ========================
// Middlewares
// ========================

// Enable Cross-Origin Resource Sharing (CORS) with credentials for HttpOnly cookies
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true, // Allow cookies to be sent and received
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parse cookies from incoming requests (reads HttpOnly JWT token)
app.use(cookieParser());

// Parse incoming JSON request bodies
app.use(express.json());

// ========================
// Database Connection Guard Middleware (Prevents 10000ms Buffering Timeout)
// ========================
const readyStateLabels = ['disconnected', 'connected', 'connecting', 'disconnecting'];

app.use((req, res, next) => {
  // Allow health check and auth check/login routes even if DB status is diagnostic
  if (req.path === '/' || req.path === '/api/health') {
    return next();
  }

  // If client makes an API request but MongoDB is not connected, fail fast
  if (req.path.startsWith('/api/') && mongoose.connection.readyState !== 1) {
    const currentState = readyStateLabels[mongoose.connection.readyState] || 'unknown';
    return res.status(503).json({
      success: false,
      message: `Database is currently not connected (State: ${currentState}). Check your MongoDB Atlas IP Whitelist (0.0.0.0/0).`,
      readyState: mongoose.connection.readyState,
      state: currentState,
    });
  }

  next();
});

// ========================
// Health Check / Test Route
// ========================
app.get('/', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'success',
    project: 'Students Info - Student Management Portal',
    database: {
      connected: isDbConnected,
      state: readyStateLabels[mongoose.connection.readyState] || 'unknown',
      host: mongoose.connection.host || 'none',
      name: mongoose.connection.name || 'none',
    },
    auth: {
      type: 'JWT HttpOnly Cookie',
      loginEndpoint: '/api/auth/login',
      statusEndpoint: '/api/auth/me',
      logoutEndpoint: '/api/auth/logout',
    },
  });
});

// ========================
// API Routes
// ========================
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const courseRoutes = require('./routes/courseRoutes');
const academicRoutes = require('./routes/academicRoutes');
const examRoutes = require('./routes/examRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

// Authentication routes (Login, Me, Logout, Password Update)
app.use('/api/auth', authRoutes);

// Protected Core ERP Modules
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/academic-events', academicRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/settings', settingsRoutes);

// ========================
// Start Server Function
// ========================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Await database connection first
    await connectDB();

    // 2. Start Express listener only after MongoDB is connected
    app.listen(PORT, () => {
      console.log(`\n🚀 Server is running on port ${PORT}`);
      console.log(`🌐 Health check URL: http://localhost:${PORT}`);
      console.log(`🔐 Auth Endpoint:     http://localhost:${PORT}/api/auth/login`);
      console.log(`📚 Student Endpoint:  http://localhost:${PORT}/api/students\n`);
    });
  } catch (error) {
    console.error(`\n❌ Failed to connect to MongoDB Atlas during startup: ${error.message}`);
    console.error('⚠️  Express will start in offline/diagnostic mode to serve health-check status.');

    app.listen(PORT, () => {
      console.log(`🚀 Diagnostic Server listening on port ${PORT}`);
      console.log(`👉 Visit http://localhost:${PORT} to inspect database connection state.\n`);
    });
  }
};

startServer();
