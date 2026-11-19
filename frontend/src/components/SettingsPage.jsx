// frontend/src/components/SettingsPage.jsx
// Purpose: ERP preferences, institutional configuration editor, and secure Admin Password update form.
// Connects to MongoDB Atlas via Settings and Auth APIs.

import React, { useState, useEffect } from 'react';
import { updatePasswordAPI, fetchSettingsAPI, updateSettingsAPI } from '../api';

function SettingsPage({ stats, adminUser, onShowAlert, institutionSettings, onSettingsUpdated }) {
  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState(null);

  // Institution settings form state
  const [settingsForm, setSettingsForm] = useState({
    institutionName: '',
    subtitle: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    academicSession: '2024-2025',
  });
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  useEffect(() => {
    if (institutionSettings) {
      setSettingsForm({
        institutionName: institutionSettings.institutionName || 'Students Info – College ERP Portal',
        subtitle: institutionSettings.subtitle || 'STUDENT MANAGEMENT PORTAL',
        email: institutionSettings.email || 'admin@studentsinfo.com',
        phone: institutionSettings.phone || '',
        address: institutionSettings.address || '',
        website: institutionSettings.website || '',
        academicSession: institutionSettings.academicSession || '2024-2025',
      });
    }
  }, [institutionSettings]);

  // Handle Admin Password Update
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordStatus({ type: 'error', text: 'Please fill in all password fields.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', text: 'New passwords do not match. Please verify.' });
      return;
    }

    try {
      setIsUpdatingPassword(true);
      const res = await updatePasswordAPI(currentPassword, newPassword);
      setPasswordStatus({ type: 'success', text: res.message || 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (onShowAlert) onShowAlert('Admin password updated successfully!', 'success');
    } catch (err) {
      setPasswordStatus({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Handle Institutional Profile Update
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsUpdatingSettings(true);
      const res = await updateSettingsAPI(settingsForm);
      if (onShowAlert) onShowAlert('Institution settings updated in MongoDB Atlas!', 'success');
      if (onSettingsUpdated) onSettingsUpdated(res.data);
    } catch (err) {
      if (onShowAlert) onShowAlert(err.message || 'Failed to update settings.', 'error');
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Institution Profile Configuration Card */}
      <div className="erp-card">
        <div className="erp-card-header">
          <div>
            <h3>🏛️ Institution & ERP Branding Settings</h3>
            <p>Customize the college title, contact parameters, and academic session in MongoDB Atlas</p>
          </div>
          <span className="badge-roll">Portal Profile</span>
        </div>

        <div className="erp-card-body">
          <form onSubmit={handleSettingsSubmit} style={{ maxWidth: '680px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Institution / Project Name <span className="req">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={settingsForm.institutionName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, institutionName: e.target.value })}
                  required
                  disabled={isUpdatingSettings}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Subtitle / Portal Tagline <span className="req">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={settingsForm.subtitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, subtitle: e.target.value })}
                  required
                  disabled={isUpdatingSettings}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginTop: '0.85rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Official Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={settingsForm.email}
                  onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                  disabled={isUpdatingSettings}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Contact Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+91 120-1234567"
                  value={settingsForm.phone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                  disabled={isUpdatingSettings}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginTop: '0.85rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Website URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://www.studentsinfo.edu"
                  value={settingsForm.website}
                  onChange={(e) => setSettingsForm({ ...settingsForm, website: e.target.value })}
                  disabled={isUpdatingSettings}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Active Academic Session</label>
                <input
                  type="text"
                  className="form-input"
                  value={settingsForm.academicSession}
                  onChange={(e) => setSettingsForm({ ...settingsForm, academicSession: e.target.value })}
                  disabled={isUpdatingSettings}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '0.85rem' }}>
              <label className="form-label">Campus Address</label>
              <textarea
                className="form-input"
                rows="2"
                placeholder="Institutional Campus Address"
                value={settingsForm.address}
                onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                disabled={isUpdatingSettings}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isUpdatingSettings}
            >
              {isUpdatingSettings ? 'Saving Profile...' : 'Save Institution Profile'}
            </button>
          </form>
        </div>
      </div>

      {/* 2. Admin Security & Password Change Card */}
      <div className="erp-card">
        <div className="erp-card-header">
          <div>
            <h3>🔒 Administrator Security & Password Management</h3>
            <p>Update credentials for {adminUser?.email || 'admin@studentsinfo.com'}</p>
          </div>
          <span className="badge-roll">Private Admin Access</span>
        </div>

        <div className="erp-card-body">
          {passwordStatus && (
            <div
              className={`erp-alert-box ${passwordStatus.type === 'error' ? 'error' : 'success'}`}
              style={{ marginBottom: '1.25rem' }}
            >
              <span>{passwordStatus.type === 'error' ? '⚠️ ' : '✅ '} {passwordStatus.text}</span>
              <button
                onClick={() => setPasswordStatus(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
              >
                &times;
              </button>
            </div>
          )}

          <form onSubmit={handlePasswordChange} style={{ maxWidth: '540px' }}>
            <div className="form-group">
              <label className="form-label">Current Password <span className="req">*</span></label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isUpdatingPassword}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password <span className="req">*</span></label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter new password (min. 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isUpdatingPassword}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password <span className="req">*</span></label>
              <input
                type="password"
                className="form-input"
                placeholder="Re-type new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isUpdatingPassword}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isUpdatingPassword}
              style={{ marginTop: '0.75rem' }}
            >
              {isUpdatingPassword ? '🔐 Updating Password...' : 'Update Admin Password'}
            </button>
          </form>
        </div>
      </div>

      {/* 3. System Diagnostic & Technical Architecture */}
      <div className="erp-card">
        <div className="erp-card-header">
          <div>
            <h3>⚙️ Campus ERP Architecture & Diagnostic Overview</h3>
            <p>Full-stack specifications and security implementation</p>
          </div>
          <span className="badge-roll">v2.5.0 (Admin Only)</span>
        </div>

        <div className="erp-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {/* Technical Stack Status */}
            <div style={{ border: '1px solid #EAEFF5', borderRadius: '12px', padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.75rem' }}>
                💻 Security & Authentication Architecture
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '0.5rem' }}>
                <strong>Authentication:</strong> JWT Signed (HS256) in Secure HttpOnly Cookie
              </p>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '0.5rem' }}>
                <strong>Password Encryption:</strong> Bcrypt Salted Hash (10 Rounds)
              </p>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '0.5rem' }}>
                <strong>Authorization Policy:</strong> Strict Admin Role (Zero Public Registrations)
              </p>
              <p style={{ fontSize: '0.85rem', color: '#10B981', fontWeight: 600 }}>
                ● Admin Session: Active & Cryptographically Guarded
              </p>
            </div>

            {/* Database Engine */}
            <div style={{ border: '1px solid #EAEFF5', borderRadius: '12px', padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.75rem' }}>
                🗄️ Database & Cloud Persistence
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '0.5rem' }}>
                <strong>Database Engine:</strong> MongoDB Atlas (AWS Cloud Cluster)
              </p>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '0.5rem' }}>
                <strong>Active Models:</strong> Student, Admin, Attendance, Course, AcademicEvent, Examination, Result, InstitutionSettings
              </p>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '0.5rem' }}>
                <strong>Registered Students:</strong> {stats.totalStudents} Live Records
              </p>
              <p style={{ fontSize: '0.85rem', color: '#10B981', fontWeight: 600 }}>
                ● Database Connection: Active & Synchronized
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
