// frontend/src/components/CoursesPage.jsx
// Purpose: Full database-backed Course Curriculum and Degree Programs management.
// Connects to MongoDB Atlas via Course APIs, allows adding/editing courses,
// and enforces safe deletion guards preventing course removal when students are enrolled.

import React, { useState, useEffect, useCallback } from 'react';
import { fetchCoursesAPI, createCourseAPI, updateCourseAPI, deleteCourseAPI } from '../api';

const EMPTY_COURSE_FORM = {
  name: '',
  code: '',
  department: '',
  duration: '3 Years (6 Semesters)',
  totalSemesters: 6,
  description: '',
  status: 'Active',
};

function CoursesPage({ students, onShowAlert, onCoursesUpdated }) {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState(EMPTY_COURSE_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete guard modal
  const [deletingCourse, setDeletingCourse] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load courses from MongoDB
  const loadCourses = useCallback(async (query = '') => {
    try {
      setIsLoading(true);
      const data = await fetchCoursesAPI(query);
      setCourses(data);
    } catch (err) {
      if (onShowAlert) onShowAlert(err.message || 'Failed to fetch courses from MongoDB.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [onShowAlert]);

  useEffect(() => {
    loadCourses(searchTerm);
  }, [searchTerm, loadCourses]);

  // Enrolled student count per course
  const getEnrollmentCount = (courseName, courseCode) => {
    return students.filter(
      (s) => s.course === courseName || s.course === courseCode
    ).length;
  };

  // Open modal for add
  const handleOpenAdd = () => {
    setEditingCourse(null);
    setFormData(EMPTY_COURSE_FORM);
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      code: course.code,
      department: course.department,
      duration: course.duration,
      totalSemesters: course.totalSemesters || 6,
      description: course.description || '',
      status: course.status || 'Active',
    });
    setIsModalOpen(true);
  };

  // Submit Add / Edit
  const handleSubmitCourse = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim() || !formData.department.trim()) {
      if (onShowAlert) onShowAlert('Course Name, Code and Department are required.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingCourse) {
        await updateCourseAPI(editingCourse._id, formData);
        if (onShowAlert) onShowAlert(`Course "${formData.name}" updated successfully!`, 'success');
      } else {
        await createCourseAPI(formData);
        if (onShowAlert) onShowAlert(`Course "${formData.name}" created in MongoDB Atlas!`, 'success');
      }
      setIsModalOpen(false);
      await loadCourses(searchTerm);
      if (onCoursesUpdated) onCoursesUpdated();
    } catch (err) {
      if (onShowAlert) onShowAlert(err.message || 'Operation failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm delete with student check
  const handleConfirmDelete = async () => {
    if (!deletingCourse) return;
    const enrolled = getEnrollmentCount(deletingCourse.name, deletingCourse.code);
    if (enrolled > 0) {
      if (onShowAlert) {
        onShowAlert(`Cannot delete "${deletingCourse.name}": ${enrolled} student(s) currently enrolled.`, 'error');
      }
      setDeletingCourse(null);
      return;
    }

    try {
      setIsDeleting(true);
      await deleteCourseAPI(deletingCourse._id);
      if (onShowAlert) onShowAlert(`Course "${deletingCourse.name}" removed from database.`, 'success');
      setDeletingCourse(null);
      await loadCourses(searchTerm);
      if (onCoursesUpdated) onCoursesUpdated();
    } catch (err) {
      if (onShowAlert) onShowAlert(err.message || 'Failed to delete course.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header & Actions Card */}
      <div className="erp-card">
        <div className="erp-card-header">
          <div>
            <h3>📚 Academic Programs & Degree Courses</h3>
            <p>Curriculum records stored in MongoDB Atlas</p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div className="erp-search-field">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleOpenAdd}
              style={{ whiteSpace: 'nowrap' }}
            >
              ➕ Add New Course
            </button>
          </div>
        </div>

        <div className="erp-card-body">
          {isLoading ? (
            <div className="honest-empty-state">
              <div className="honest-empty-icon">⏳</div>
              <h4>Loading courses from MongoDB...</h4>
            </div>
          ) : courses.length === 0 ? (
            <div className="honest-empty-state">
              <div className="honest-empty-icon">📭</div>
              <h4>No Courses Found</h4>
              <p>No academic courses found in MongoDB. Click "Add New Course" to register one.</p>
            </div>
          ) : (
            <div className="erp-table-responsive">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Program Title</th>
                    <th>Department</th>
                    <th>Duration</th>
                    <th>Semesters</th>
                    <th style={{ textAlign: 'center' }}>Enrolled Students</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => {
                    const enrolledCount = getEnrollmentCount(course.name, course.code);
                    return (
                      <tr key={course._id}>
                        <td>
                          <span className="badge-roll">{course.code}</span>
                        </td>
                        <td>
                          <strong style={{ color: '#1E293B' }}>{course.name}</strong>
                          {course.description && (
                            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.2rem 0 0' }}>
                              {course.description}
                            </p>
                          )}
                        </td>
                        <td style={{ color: '#64748B' }}>{course.department}</td>
                        <td>{course.duration}</td>
                        <td>{course.totalSemesters} Semesters</td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              backgroundColor: enrolledCount > 0 ? '#EEF0FD' : '#F1F5F9',
                              color: enrolledCount > 0 ? '#5549E8' : '#64748B',
                              fontWeight: 700,
                              padding: '0.2rem 0.65rem',
                              borderRadius: '9999px',
                              fontSize: '0.8rem',
                            }}
                          >
                            {enrolledCount} {enrolledCount === 1 ? 'Student' : 'Students'}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: course.status === 'Active' ? '#E6FBF2' : '#F1F5F9',
                              color: course.status === 'Active' ? '#065F46' : '#64748B',
                            }}
                          >
                            {course.status || 'Active'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                            <button
                              type="button"
                              className="btn btn-sm btn-edit"
                              onClick={() => handleOpenEdit(course)}
                              title="Edit Course"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-delete"
                              onClick={() => setDeletingCourse(course)}
                              title="Delete Course"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 2. Add / Edit Course Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="erp-modal-box" style={{ maxWidth: '540px', width: '92%' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1E293B' }}>
                {editingCourse ? '✏️ Edit Course' : '➕ Register New Degree Program'}
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitCourse}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Course Title <span className="req">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Bachelor of Computer Applications"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Course Code <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. BCA or CSE-401"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Department <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Computer Science"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Duration</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 3 Years (6 Semesters)"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Total Semesters</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      className="form-input"
                      value={formData.totalSemesters}
                      onChange={(e) => setFormData({ ...formData, totalSemesters: Number(e.target.value) })}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Description / Specialization</label>
                  <textarea
                    className="form-input"
                    rows="2"
                    placeholder="Brief description of the course..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    disabled={isSubmitting}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : editingCourse ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Delete Guard Modal */}
      {deletingCourse && (
        <div className="modal-backdrop">
          <div className="erp-modal-box" style={{ maxWidth: '460px', width: '90%' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, color: '#DC2626' }}>⚠️ Confirm Course Deletion</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setDeletingCourse(null)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#1E293B', marginBottom: '0.5rem' }}>
                Are you sure you want to delete <strong>{deletingCourse.name} ({deletingCourse.code})</strong>?
              </p>
              {getEnrollmentCount(deletingCourse.name, deletingCourse.code) > 0 ? (
                <div className="erp-alert-box error" style={{ padding: '0.65rem 0.85rem' }}>
                  <span>
                    🛑 Deletion Blocked: <strong>{getEnrollmentCount(deletingCourse.name, deletingCourse.code)} student(s)</strong> are currently enrolled in this course. You must reassign or remove them first.
                  </span>
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  No students are enrolled in this course. This action will permanently remove it from MongoDB Atlas.
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeletingCourse(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmDelete}
                disabled={isDeleting || getEnrollmentCount(deletingCourse.name, deletingCourse.code) > 0}
              >
                {isDeleting ? 'Deleting...' : 'Delete Course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoursesPage;
