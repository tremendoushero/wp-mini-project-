// backend/routes/courseRoutes.js
// Purpose: API endpoints for Course management. Protected by Admin authentication.

const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  addCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getAllCourses)
  .post(addCourse);

router.route('/:id')
  .put(updateCourse)
  .delete(deleteCourse);

module.exports = router;
