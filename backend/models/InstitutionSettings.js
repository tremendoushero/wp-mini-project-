// backend/models/InstitutionSettings.js
// Purpose: Stores configurable College/Institution Profile details in MongoDB Atlas.

const mongoose = require('mongoose');

const institutionSettingsSchema = new mongoose.Schema(
  {
    institutionName: {
      type: String,
      default: 'College Institute of Technology',
      trim: true,
    },
    tagline: {
      type: String,
      default: 'STUDENT MANAGEMENT PORTAL',
      trim: true,
    },
    address: {
      type: String,
      default: 'Campus Knowledge Park, Tech Education Hub',
      trim: true,
    },
    contactEmail: {
      type: String,
      default: 'contact@studentsinfo.edu',
      trim: true,
    },
    phone: {
      type: String,
      default: '+91 9876543210',
      trim: true,
    },
    website: {
      type: String,
      default: 'https://studentsinfo.edu',
      trim: true,
    },
    academicSession: {
      type: String,
      default: '2025-2026',
      trim: true,
    },
    institutionLogo: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const InstitutionSettings = mongoose.models.InstitutionSettings || mongoose.model('InstitutionSettings', institutionSettingsSchema);

module.exports = InstitutionSettings;
