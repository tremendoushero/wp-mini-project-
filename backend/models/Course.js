// backend/models/Course.js
// Purpose: Academic course and degree program schema in MongoDB Atlas.

const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Course name is required'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    duration: {
      type: String,
      default: '3 Years',
      trim: true,
    },
    totalSemesters: {
      type: Number,
      default: 6,
      min: [1, 'Must have at least 1 semester'],
      max: [10, 'Cannot exceed 10 semesters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);

module.exports = Course;
