// frontend/src/components/StudentForm.jsx
// Purpose: Form card for registering new students or updating existing student details.
// Supports required core fields and optional academic/personal fields.

import React, { useState, useEffect } from 'react';

const INITIAL_STATE = {
  name: '',
  rollNumber: '',
  email: '',
  course: 'BCA',
  phone: '',
  dateOfBirth: '',
  gender: 'Not Specified',
  address: '',
  section: '',
  semester: '',
  academicSession: '2024-2025',
  universityRegNumber: '',
};

function StudentForm({ onSaveStudent, editingStudent, onCancelEdit, isSubmitting, availableCourses = [] }) {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [validationError, setValidationError] = useState('');

  // When editingStudent changes, populate or reset form
  useEffect(() => {
    if (editingStudent) {
      setFormData({
        name: editingStudent.name || '',
        rollNumber: editingStudent.rollNumber || '',
        email: editingStudent.email || '',
        course: editingStudent.course || 'BCA',
        phone: editingStudent.phone || '',
        dateOfBirth: editingStudent.dateOfBirth
          ? new Date(editingStudent.dateOfBirth).toISOString().split('T')[0]
          : '',
        gender: editingStudent.gender || 'Not Specified',
        address: editingStudent.address || '',
        section: editingStudent.section || '',
        semester: editingStudent.semester !== undefined && editingStudent.semester !== null ? String(editingStudent.semester) : '',
        academicSession: editingStudent.academicSession || '2024-2025',
        universityRegNumber: editingStudent.universityRegNumber || '',
      });
      setShowOptionalFields(Boolean(
        editingStudent.phone ||
        editingStudent.dateOfBirth ||
        (editingStudent.gender && editingStudent.gender !== 'Not Specified') ||
        editingStudent.address ||
        editingStudent.section ||
        editingStudent.semester ||
        editingStudent.universityRegNumber
      ));
      setValidationError('');
    } else {
      setFormData(INITIAL_STATE);
      setShowOptionalFields(false);
      setValidationError('');
    }
  }, [editingStudent]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationError) setValidationError('');
  };

  // Client-side validation
  const handleSubmit = (e) => {
    e.preventDefault();

    const { name, rollNumber, email, course } = formData;

    if (!name.trim() || !rollNumber.trim() || !email.trim() || !course.trim()) {
      setValidationError('Please fill in all the required fields (Name, Roll Number, Email, Course).');
      return;
    }

    const emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailPattern.test(email.trim())) {
      setValidationError('Please enter a valid email address (e.g. rahul@example.com).');
      return;
    }

    // Payload with optional fields
    const payload = {
      name: name.trim(),
      rollNumber: rollNumber.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      course: course.trim(),
      phone: formData.phone.trim(),
      dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth : undefined,
      gender: formData.gender,
      address: formData.address.trim(),
      section: formData.section.trim(),
      semester: formData.semester ? Number(formData.semester) : undefined,
      academicSession: formData.academicSession.trim(),
      universityRegNumber: formData.universityRegNumber.trim(),
    };

    onSaveStudent(payload);
  };

  // Course options
  const defaultCourses = ['BCA', 'B.Tech CS', 'B.Tech IT', 'MCA', 'B.Sc CS', 'BBA'];
  const courseOptions = availableCourses.length > 0
    ? [...new Set([...availableCourses.map((c) => (typeof c === 'string' ? c : c.name || c.code)), ...defaultCourses])]
    : defaultCourses;

  return (
    <div className="erp-card">
      <div className="erp-card-header">
        <div>
          <h3>{editingStudent ? '✏️ Edit Student Information' : '➕ Student Registration Form'}</h3>
          <p>{editingStudent ? 'Update details in MongoDB Atlas' : 'Register a new student in the College Database'}</p>
        </div>
      </div>

      <div className="erp-card-body">
        {/* Local Validation Error Banner */}
        {validationError && (
          <div className="erp-alert-box error" style={{ marginBottom: '1rem', padding: '0.65rem 1rem' }}>
            <span>⚠️ {validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Section 1: Required Core Details */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Student Full Name <span className="req">*</span>
            </label>
            <input
              id="name"
              type="text"
              name="name"
              className="form-input"
              placeholder="e.g. Rahul Sharma"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="rollNumber">
              Roll Number <span className="req">*</span>
            </label>
            <input
              id="rollNumber"
              type="text"
              name="rollNumber"
              className="form-input"
              placeholder="e.g. BCA2024-101"
              value={formData.rollNumber}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address <span className="req">*</span>
            </label>
            <input
              id="email"
              type="email"
              name="email"
              className="form-input"
              placeholder="e.g. rahul.sharma@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="course">
              Enrolled Course / Degree <span className="req">*</span>
            </label>
            <select
              id="course"
              name="course"
              className="form-select"
              value={formData.course}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            >
              {courseOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Toggle Button for Optional Details */}
          <div style={{ margin: '1rem 0' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: '0.85rem', padding: '0.45rem 0.75rem', justifyContent: 'center' }}
              onClick={() => setShowOptionalFields(!showOptionalFields)}
            >
              <span>{showOptionalFields ? '▲ Hide' : '▼ Add'} Additional Academic & Personal Details (Optional)</span>
            </button>
          </div>

          {/* Section 2: Optional Details */}
          {showOptionalFields && (
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    className="form-input"
                    placeholder="e.g. +91 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    className="form-select"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  >
                    <option value="Not Specified">Not Specified</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="dateOfBirth">Date of Birth</label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    name="dateOfBirth"
                    className="form-input"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="semester">Semester (1-8)</label>
                  <input
                    id="semester"
                    type="number"
                    min="1"
                    max="10"
                    name="semester"
                    className="form-input"
                    placeholder="e.g. 5"
                    value={formData.semester}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="section">Section</label>
                  <input
                    id="section"
                    type="text"
                    name="section"
                    className="form-input"
                    placeholder="e.g. A, B, CS-1"
                    value={formData.section}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="academicSession">Academic Session</label>
                  <input
                    id="academicSession"
                    type="text"
                    name="academicSession"
                    className="form-input"
                    placeholder="e.g. 2024-2025"
                    value={formData.academicSession}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="universityRegNumber">University Registration / Enrolment No.</label>
                <input
                  id="universityRegNumber"
                  type="text"
                  name="universityRegNumber"
                  className="form-input"
                  placeholder="e.g. REG-2024-88412"
                  value={formData.universityRegNumber}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="address">Residential Address</label>
                <textarea
                  id="address"
                  name="address"
                  className="form-input"
                  rows="2"
                  placeholder="e.g. Hostels / City address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          {/* Form Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Processing...'
                : editingStudent
                ? 'Save Changes'
                : 'Register Student'}
            </button>

            {editingStudent && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancelEdit}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default StudentForm;
