// backend/middleware/authMiddleware.js
// Purpose: Protects private API routes by verifying JWT in HttpOnly cookies and checking admin role.

const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  try {
    let token = null;

    // 1. Primary source: check HttpOnly cookie named 'token'
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Secondary source (fallback): check Authorization Bearer header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token exists, reject request with 401 Unauthorized (Requirement 8)
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. You must be logged in as an administrator to perform this operation.',
      });
    }

    // Verify token signature and expiration
    const jwtSecret = process.env.JWT_SECRET || 'super_secret_students_info_erp_jwt_key_2024_bca';
    const decoded = jwt.verify(token, jwtSecret);

    // Fetch the admin from MongoDB (excluding password hash)
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Administrator session invalid or account no longer exists.',
      });
    }

    // Role-based Authorization: Ensure only users with admin role are authorized (Requirement 12)
    if (admin.role !== 'admin' && admin.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Administrator privileges required.',
      });
    }

    // Attach verified admin object to request for downstream handlers
    req.admin = admin;
    next();
  } catch (error) {
    console.error('Authentication Middleware Error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Session expired or token invalid. Please log in again.',
      error: error.message,
    });
  }
};

module.exports = { protect };
