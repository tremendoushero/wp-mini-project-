// backend/routes/academicRoutes.js
// Purpose: API endpoints for Academic events and calendar. Protected by Admin authentication.

const express = require('express');
const router = express.Router();
const {
  getAcademicEvents,
  addAcademicEvent,
  updateAcademicEvent,
  deleteAcademicEvent,
} = require('../controllers/academicController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getAcademicEvents)
  .post(addAcademicEvent);

router.route('/:id')
  .put(updateAcademicEvent)
  .delete(deleteAcademicEvent);

module.exports = router;
