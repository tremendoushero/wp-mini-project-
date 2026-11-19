// backend/models/Result.js
// Purpose: Stores student examination results, marks obtained, and calculated letter grades.
// Includes compound index on { examination, student } to prevent duplicate result submissions.

const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    examination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Examination',
      required: [true, 'Examination reference is required'],
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
    marksObtained: {
      type: Number,
      required: [true, 'Marks obtained is required'],
      min: [0, 'Marks cannot be negative'],
    },
    grade: {
      type: String,
      default: 'P',
    },
    status: {
      type: String,
      enum: ['Pass', 'Fail', 'Absent'],
      default: 'Pass',
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index: each student can only have 1 published result per examination
resultSchema.index({ examination: 1, student: 1 }, { unique: true });

// Helper function to calculate letter grade based on marks and max marks
resultSchema.statics.calculateGrade = function (marks, maxMarks = 100) {
  const percentage = (marks / maxMarks) * 100;
  if (percentage >= 90) return 'O';   // Outstanding
  if (percentage >= 80) return 'A+';  // Excellent
  if (percentage >= 70) return 'A';   // Very Good
  if (percentage >= 60) return 'B+';  // Good
  if (percentage >= 50) return 'B';   // Above Average
  if (percentage >= 40) return 'C';   // Pass
  return 'F';                         // Fail
};

const Result = mongoose.models.Result || mongoose.model('Result', resultSchema);

module.exports = Result;
