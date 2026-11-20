// backend/config/db.js
// Purpose: Handles the connection between our Express server and MongoDB Atlas using Mongoose.
// Supports both persistent Node.js servers and serverless connection pooling on Vercel.

const mongoose = require('mongoose');

// Configure Mongoose global behavior
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds if cluster is unreachable
  socketTimeoutMS: 45000,         // Close sockets after 45 seconds of inactivity
};

// Global cached connection for serverless function re-use across warm invocations
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Connection event listeners (attach once)
if (!global.mongooseListenersAttached) {
  global.mongooseListenersAttached = true;

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
}

// =========================================================================
// Connect Function (Awaited by server.js / serverless requests)
// =========================================================================
const connectDB = async () => {
  // If connection is already established and active, return it immediately
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri || mongoUri.includes('example.mongodb.net')) {
      const errorMsg = 'MongoDB Atlas URI is not configured in environment (MONGO_URI)!';
      console.warn(`\n⚠️  WARNING: ${errorMsg}`);
      console.warn('👉 Please set MONGO_URI in your environment or Vercel Environment Variables.\n');
      throw new Error(errorMsg);
    }

    console.log('⏳ Connecting to MongoDB Atlas...');
    cached.promise = mongoose.connect(mongoUri, mongooseOptions).then((mongooseInstance) => {
      cached.conn = mongooseInstance;
      return cached.conn;
    }).catch((err) => {
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;
