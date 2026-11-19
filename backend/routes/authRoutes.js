// backend/routes/authRoutes.js
// Purpose: Authentication endpoints for Admin login, session check, logout, and password management.
// Explicitly blocks public registration to keep the application private and admin-only.

const express = require('express');
const router = express.Router();
const { loginAdmin, getMe, logoutAdmin, updatePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public route: Admin Login
// POST /api/auth/login
router.post('/login', loginAdmin);

// Block public registration completely (Requirements 2 & 3)
// Any attempt to access /api/auth/register will be rejected with 403 Forbidden
router.all('/register', (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Public registration is disabled. This is a private, admin-only ERP portal.',
  });
});

// Protected route: Check current admin session
// GET /api/auth/me
router.get('/me', protect, getMe);

// Public/Protected route: Admin Logout
// POST /api/auth/logout
router.post('/logout', logoutAdmin);

// Protected route: Secure Admin Password Update
// PUT /api/auth/update-password
router.put('/update-password', protect, updatePassword);

module.exports = router;
