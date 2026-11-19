// backend/controllers/authController.js
// Purpose: Handles Admin Login, Profile Verification (Me), Logout, and Secure Password Updates.

const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Helper to sign JWT token
const generateToken = (adminId) => {
  const jwtSecret = process.env.JWT_SECRET || 'super_secret_students_info_erp_jwt_key_2024_bca';
  return jwt.sign({ id: adminId }, jwtSecret, {
    expiresIn: '1d', // Token valid for 24 hours
  });
};

// Helper cookie options
const getCookieOptions = () => ({
  httpOnly: true, // Prevents client-side JavaScript from reading the cookie (protects against XSS)
  secure: process.env.NODE_ENV === 'production', // true in production (HTTPS)
  sameSite: 'lax', // Allows cookie transmission on top-level navigation from React localhost:5173
  maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
});

// ========================================================
// 1. ADMIN LOGIN (POST /api/auth/login)
// Validates credentials, issues JWT HttpOnly cookie
// ========================================================
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both admin email and password.',
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Role check: Ensure only admin accounts can log in
    if (admin.role !== 'admin' && admin.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access restricted to administrators only.',
      });
    }

    // Check if password matches hashed password in database
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate JWT token
    const token = generateToken(admin._id);

    // Send JWT token in a secure HttpOnly cookie
    res.cookie('token', token, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: 'Admin authentication successful.',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Login Controller Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login.',
      error: error.message,
    });
  }
};

// ========================================================
// 2. GET CURRENT ADMIN PROFILE (GET /api/auth/me)
// Used when browser refreshes to verify if admin is already logged in
// ========================================================
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      admin: {
        id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email,
        role: req.admin.role,
      },
    });
  } catch (error) {
    console.error('GetMe Controller Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving admin profile.',
      error: error.message,
    });
  }
};

// ========================================================
// 3. ADMIN LOGOUT (POST /api/auth/logout)
// Clears the HttpOnly authentication cookie
// ========================================================
const logoutAdmin = async (req, res) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return res.status(200).json({
      success: true,
      message: 'Admin logged out successfully.',
    });
  } catch (error) {
    console.error('Logout Controller Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during logout.',
      error: error.message,
    });
  }
};

// ========================================================
// 4. UPDATE ADMIN PASSWORD (PUT /api/auth/update-password)
// Allows the logged-in administrator to securely update their password
// ========================================================
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your current password and a new password.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    // Find the admin record in MongoDB
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Administrator account not found.',
      });
    }

    // Verify that the current password matches
    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    // Update password (triggers pre-save bcrypt hash hook in Admin model)
    admin.password = newPassword;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: 'Admin password updated successfully. Please use your new password next time you log in.',
    });
  } catch (error) {
    console.error('Update Password Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error updating admin password.',
      error: error.message,
    });
  }
};

module.exports = {
  loginAdmin,
  getMe,
  logoutAdmin,
  updatePassword,
};
