// backend/scripts/changePassword.js
// Purpose: Secure CLI tool to change or reset the Admin password directly from the terminal.
// Usage: node backend/scripts/changePassword.js "YourNewPassword123"

const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Admin = require('../models/Admin');
const connectDB = require('../config/db');

const changePassword = async () => {
  const newPassword = process.argv[2];

  if (!newPassword || newPassword.trim().length < 6) {
    console.error('\n❌ ERROR: Please provide a new password of at least 6 characters.');
    console.error('👉 Example: node backend/scripts/changePassword.js "MyNewSecurePass@2025"\n');
    process.exit(1);
  }

  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    await connectDB();

    const email = (process.env.ADMIN_EMAIL || 'admin@studentsinfo.com').trim().toLowerCase();
    const admin = await Admin.findOne({ email });

    if (!admin) {
      console.error(`\n❌ ERROR: No admin account found with email: ${email}`);
      console.error('👉 Run "npm run seed:admin" first to create the initial admin account.\n');
      process.exit(1);
    }

    // Set new password (triggers pre-save bcrypt hash hook)
    admin.password = newPassword.trim();
    await admin.save();

    console.log(`\n✅ Password updated successfully for: ${admin.email}`);
    console.log(`👉 Password has been salted and hashed with bcrypt in MongoDB.`);
    console.log(`👉 You can now log in at http://localhost:5173 using your new password.\n`);
  } catch (error) {
    console.error('❌ Failed to update password:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed.');
    process.exit(0);
  }
};

changePassword();
