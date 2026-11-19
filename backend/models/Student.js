// backend/models/Student.js
// Purpose: Mongoose Schema & Model for Student records in MongoDB Atlas.
// Includes core required fields + optional academic and personal profile details.

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    // Required Core Fields
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    course: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },

    // Optional Academic & Profile Fields (Requirement: Part 3)
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    dateOfBirth: {
      type: String,
      trim: true,
      default: '',
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Not Specified'],
      default: 'Not Specified',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    section: {
      type: String,
      trim: true,
      default: '',
    },
    semester: {
      type: String,
      trim: true,
      default: '',
    },
    academicSession: {
      type: String,
      trim: true,
      default: '',
    },
    universityRegNumber: {
      type: String,
      trim: true,
      default: '',
    },
    profilePhoto: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);

module.exports = Student;
