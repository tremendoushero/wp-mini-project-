// backend/routes/attendanceRoutes.js
// Purpose: API endpoints for Attendance management. Protected by Admin authentication.

const express = require('express');
const router = express.Router();
const {
  getAttendanceByDate,
  saveAttendance,
  getStudentAttendanceHistory,
  getAttendanceStats,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAttendanceByDate);
router.post('/', saveAttendance);
router.get('/stats', getAttendanceStats);
router.get('/student/:studentId', getStudentAttendanceHistory);

module.exports = router;
