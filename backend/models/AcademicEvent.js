// backend/models/AcademicEvent.js
// Purpose: Academic calendar events, examination dates, and milestone notices in MongoDB Atlas.

const mongoose = require('mongoose');

const academicEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    startDate: {
      type: String, // Format: YYYY-MM-DD
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: String, // Optional format: YYYY-MM-DD
      default: '',
    },
    category: {
      type: String,
      enum: ['Academic', 'Examination', 'Holiday', 'Cultural', 'Notice'],
      default: 'Academic',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const AcademicEvent = mongoose.models.AcademicEvent || mongoose.model('AcademicEvent', academicEventSchema);

module.exports = AcademicEvent;
