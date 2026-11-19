// backend/routes/examRoutes.js
// Purpose: API endpoints for Examination schedules and Results publishing. Protected by Admin auth.

const express = require('express');
const router = express.Router();
const {
  getAllExams,
  addExam,
  updateExam,
  deleteExam,
  getExamResults,
  publishExamResult,
  getStudentResults,
} = require('../controllers/examController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getAllExams)
  .post(addExam);

router.route('/:id')
  .put(updateExam)
  .delete(deleteExam);

router.route('/:id/results')
  .get(getExamResults)
  .post(publishExamResult);

router.get('/student/:studentId/results', getStudentResults);

module.exports = router;
