// backend/scripts/createAdmin.js
// Purpose: Secure seed script to create the initial Admin account without duplicate creation.
// Usage: node backend/scripts/createAdmin.js

const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Admin = require('../models/Admin');
const connectDB = require('../config/db');

const createInitialAdmin = async () => {
  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    await connectDB();

    const name = process.env.ADMIN_NAME || 'College Administrator';
    const email = (process.env.ADMIN_EMAIL || 'admin@studentsinfo.com').trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'Admin@12345';

    console.log(`🔍 Checking if admin account already exists for: ${email}`);
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log(`\nℹ️  Admin account already exists!`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role:  ${existingAdmin.role}`);
      console.log(`   ID:    ${existingAdmin._id}`);
      console.log(`👉 No duplicate account was created.\n`);
    } else {
      console.log(`🚀 Creating initial Admin account...`);
      // Note: Pre-save hook in Admin model automatically hashes the password with bcrypt
      const newAdmin = await Admin.create({
        name,
        email,
        password,
        role: 'admin',
      });

      console.log(`\n✅ Admin account created successfully!`);
      console.log(`   Name:  ${newAdmin.name}`);
      console.log(`   Email: ${newAdmin.email}`);
      console.log(`   Role:  ${newAdmin.role}`);
      console.log(`👉 Password securely hashed with bcrypt in MongoDB.\n`);
    }
  } catch (error) {
    console.error('❌ Failed to create admin account:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed.');
    process.exit(0);
  }
};

createInitialAdmin();
