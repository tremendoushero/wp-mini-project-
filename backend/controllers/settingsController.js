// backend/controllers/settingsController.js
// Purpose: Configurable Institution Profile and academic session settings in MongoDB Atlas.

const InstitutionSettings = require('../models/InstitutionSettings');

// 1. GET INSTITUTION PROFILE SETTINGS (GET /api/settings)
const getSettings = async (req, res) => {
  try {
    let settings = await InstitutionSettings.findOne({});

    // If no settings document exists yet, initialize with default institution values
    if (!settings) {
      settings = await InstitutionSettings.create({
        institutionName: 'Students Info College of Technology',
        tagline: 'STUDENT MANAGEMENT PORTAL',
        address: 'Campus Knowledge Park, Tech Education Hub',
        contactEmail: 'admin@studentsinfo.com',
        phone: '+91 9876543210',
        website: 'https://studentsinfo.edu',
        academicSession: '2025-2026',
      });
    }

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error fetching settings:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving institution settings.',
      error: error.message,
    });
  }
};

// 2. UPDATE INSTITUTION PROFILE SETTINGS (PUT /api/settings)
const updateSettings = async (req, res) => {
  try {
    const { institutionName, tagline, address, contactEmail, phone, website, academicSession } = req.body;

    let settings = await InstitutionSettings.findOne({});
    if (!settings) {
      settings = new InstitutionSettings();
    }

    if (institutionName) settings.institutionName = institutionName.trim();
    if (tagline !== undefined) settings.tagline = tagline.trim();
    if (address !== undefined) settings.address = address.trim();
    if (contactEmail !== undefined) settings.contactEmail = contactEmail.trim().toLowerCase();
    if (phone !== undefined) settings.phone = phone.trim();
    if (website !== undefined) settings.website = website.trim();
    if (academicSession !== undefined) settings.academicSession = academicSession.trim();

    const updated = await settings.save();

    return res.status(200).json({
      success: true,
      message: 'Institution profile updated successfully!',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating settings:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error updating institution profile.',
      error: error.message,
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
