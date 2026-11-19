// backend/routes/studentRoutes.js
// Purpose: Maps incoming HTTP requests to student controllers. All routes are protected by JWT authentication.

const express = require('express');
const router = express.Router();
const {
  addStudent,
  getAllStudents,
  getStudentStats,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

// Protect all student routes: unauthenticated users cannot view or modify student data
router.use(protect);

// Route for getting dashboard stats
// GET /api/students/stats (Protected)
router.get('/stats', getStudentStats);

// Route for getting all students (with search) & adding a new student
// GET  /api/students (Protected)
// POST /api/students (Protected)
router.route('/')
  .get(getAllStudents)
  .post(addStudent);

// Routes for single student operations by ID
// GET    /api/students/:id  -> Get single student (Protected)
// PUT    /api/students/:id  -> Update student (Protected)
// DELETE /api/students/:id  -> Delete student (Protected)
router.route('/:id')
  .get(getStudentById)
  .put(updateStudent)
  .delete(deleteStudent);

module.exports = router;
