// backend/server.js
// Purpose: Main entry point of the backend application.
// Configures Express, CORS with credentials, Cookie-Parser, Auth & Student routes.
// Supports both persistent local Node.js server and Vercel serverless execution.

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Load environment variables from backend/.env file (for local dev)
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config(); // Also check current working directory / root .env

// Initialize the Express application
const app = express();

// ========================
// Trust Proxy (Essential for Vercel & HTTPS Cookies)
// ========================
// Express behind reverse proxies (like Vercel / Cloudflare) needs trust proxy enabled
// so req.secure, client IP, and secure cookies work correctly.
app.set('trust proxy', 1);

// ========================
// Middlewares
// ========================

// 1. Dynamic CORS Configuration supporting localhost, Vercel preview/production domains, and custom domains
const defaultOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

const envOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []),
]
  .filter(Boolean)
  .map((o) => o.trim().replace(/\/+$/, ''));

const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman, server-to-server, or same-origin)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/+$/, '');

    // Check exact match in configured allowed origins
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    // Automatically allow any Vercel preview or production deployment (*.vercel.app)
    if (/^https:\/\/.*\.vercel\.app$/.test(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS policy`), false);
  },
  credentials: true, // Allow HttpOnly cookies across origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Set-Cookie'],
};

app.use(cors(corsOptions));

// Handle preflight OPTIONS explicitly for all routes
app.options('*', cors(corsOptions));

// 2. Parse cookies from incoming requests (reads HttpOnly JWT token)
app.use(cookieParser());

// 3. Parse incoming JSON request bodies
app.use(express.json());

// ========================
// Database Connection Middleware for Serverless & Local
// ========================
const readyStateLabels = ['disconnected', 'connected', 'connecting', 'disconnecting'];

app.use(async (req, res, next) => {
  // Allow health check routes even if DB is still connecting
  if (req.path === '/' || req.path === '/api' || req.path === '/api/health') {
    return next();
  }

  // Ensure DB connection is active (especially critical on serverless cold starts)
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (err) {
      console.error('Database connection error in request middleware:', err.message);
      const currentState = readyStateLabels[mongoose.connection.readyState] || 'unknown';
      return res.status(503).json({
        success: false,
        message: (err.message.includes('bad auth') || err.message.includes('authentication failed'))
          ? 'MongoDB Atlas authentication failed. The database user password in backend/.env is invalid or was updated in Atlas.'
          : `Database connection failed (State: ${currentState}). Please verify MONGO_URI and MongoDB Atlas Network Access (0.0.0.0/0).`,
        readyState: mongoose.connection.readyState,
        state: currentState,
        error: err.message,
      });
    }
  }

  next();
});

// ========================
// Health Check / Test Route
// ========================
const healthHandler = (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'success',
    project: 'Students Info - Student Management Portal',
    environment: process.env.NODE_ENV || 'development',
    serverless: Boolean(process.env.VERCEL),
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
    cors: {
      allowedOriginsCount: allowedOrigins.length,
      vercelAllowed: true,
    },
  });
};

app.get('/', healthHandler);
app.get('/api', healthHandler);
app.get('/api/health', healthHandler);

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

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/academic-events', academicRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/settings', settingsRoutes);

// ========================
// Start Server Function (for Local Development)
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
    if (error.message.includes('bad auth') || error.message.includes('authentication failed')) {
      console.error('👉 Cause: MongoDB Atlas rejected the database username or password in backend/.env (MONGO_URI).');
      console.error('👉 Fix: Go to MongoDB Atlas (cloud.mongodb.com) -> Security -> Database Access -> Edit Password, then update MONGO_URI in backend/.env.');
    }
    console.error('⚠️  Express will start in offline/diagnostic mode to serve health-check status.');

    app.listen(PORT, () => {
      console.log(`🚀 Diagnostic Server listening on port ${PORT}`);
      console.log(`👉 Visit http://localhost:${PORT} to inspect database connection state.\n`);
    });
  }
};

// Only call app.listen() if this file is executed directly (local development)
// In Vercel serverless functions, the file is imported and app is exported
if (require.main === module) {
  startServer();
}

module.exports = app;
