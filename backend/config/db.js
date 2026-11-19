// backend/config/db.js
// Purpose: Handles the connection between our Express server and MongoDB Atlas using Mongoose.
// Includes detailed connection state listeners, timeout settings, and diagnostic logging.

const mongoose = require('mongoose');

// Configure Mongoose global behavior
// Set shorter server selection timeout (5000ms) to fail fast instead of hanging indefinitely
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds if cluster is unreachable
  socketTimeoutMS: 45000,         // Close sockets after 45 seconds of inactivity
};

// =========================================================================
// Real-time Mongoose Connection Event Listeners (Requirement 7 & 8)
// =========================================================================
mongoose.connection.on('connected', () => {
  console.log(`✅ [MongoDB Event] Successfully connected to database: "${mongoose.connection.name}"`);
  console.log(`📡 [MongoDB Event] Host: ${mongoose.connection.host}`);
});

mongoose.connection.on('error', (err) => {
  console.error(`🚨 [MongoDB Event] Connection error: ${err.message}`);
  if (err.message.includes('SSL') || err.message.includes('whitelist') || err.message.includes('ServerSelectionError')) {
    console.error('👉 Cause: Your current IP address is likely not whitelisted in MongoDB Atlas.');
    console.error('👉 Fix: Go to MongoDB Atlas -> Network Access -> Add IP Address -> Select "Allow Access From Anywhere" (0.0.0.0/0).');
  }
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ [MongoDB Event] Lost connection to MongoDB Atlas (disconnected).');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 [MongoDB Event] Reconnected to MongoDB Atlas successfully.');
});

// =========================================================================
// Connect Function (Awaited by server.js)
// =========================================================================
const connectDB = async () => {
  if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('example.mongodb.net')) {
    const errorMsg = 'MongoDB Atlas URI is not configured in backend/.env!';
    console.warn(`\n⚠️  WARNING: ${errorMsg}`);
    console.warn('👉 Please update MONGO_URI in backend/.env with your real MongoDB Atlas connection string.\n');
    throw new Error(errorMsg);
  }

  console.log('⏳ Connecting to MongoDB Atlas...');
  const conn = await mongoose.connect(process.env.MONGO_URI, mongooseOptions);
  return conn;
};

module.exports = connectDB;
