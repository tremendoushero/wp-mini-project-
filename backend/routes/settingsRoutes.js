// backend/routes/settingsRoutes.js
// Purpose: API endpoints for Institution Settings & Profile. Protected by Admin authentication.

const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getSettings)
  .put(updateSettings);

module.exports = router;
