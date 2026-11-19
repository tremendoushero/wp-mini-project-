// backend/models/Examination.js
// Purpose: Examination schedule and subject assessments in MongoDB Atlas.

const mongoose = require('mongoose');

const examinationSchema = new mongoose.Schema(
  {
    examName: {
      type: String,
      required: [true, 'Examination name is required'],
      trim: true,
    },
    course: {
      type: String,
      required: [true, 'Course is required'],
      trim: true,
    },
    semester: {
      type: String,
      required: [true, 'Semester is required'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    examDate: {
      type: String, // Format: YYYY-MM-DD
      required: [true, 'Examination date is required'],
    },
    startTime: {
      type: String,
      default: '10:00 AM',
      trim: true,
    },
    endTime: {
      type: String,
      default: '01:00 PM',
      trim: true,
    },
    maxMarks: {
      type: Number,
      default: 100,
      min: [1, 'Max marks must be greater than 0'],
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
  },
  {
    timestamps: true,
  }
);

const Examination = mongoose.models.Examination || mongoose.model('Examination', examinationSchema);

module.exports = Examination;
