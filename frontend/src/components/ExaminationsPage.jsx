// frontend/src/components/ExaminationsPage.jsx
// Purpose: Full database-backed Examinations & Marks / Results Management.
// Connects to MongoDB Atlas via Examination & Result APIs, enabling examination scheduling,
// grade calculation, and publishing semester marks cards.

import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchExamsAPI,
  createExamAPI,
  updateExamAPI,
  deleteExamAPI,
  fetchExamResultsAPI,
  publishExamResultAPI,
} from '../api';

const EMPTY_EXAM_FORM = {
  examName: '',
  course: 'BCA',
  semester: 5,
  subject: '',
  examDate: new Date().toISOString().split('T')[0],
  startTime: '10:00 AM',
  endTime: '01:00 PM',
  maxMarks: 100,
  status: 'Scheduled',
};

// Calculate letter grade based on percentage
const calculateGrade = (marks, maxMarks) => {
  if (marks === null || marks === undefined || isNaN(marks)) return '—';
  const pct = (Number(marks) / Number(maxMarks)) * 100;
  if (pct >= 90) return 'O (Outstanding)';
  if (pct >= 80) return 'A+ (Excellent)';
  if (pct >= 70) return 'A (Very Good)';
  if (pct >= 60) return 'B+ (Good)';
  if (pct >= 50) return 'B (Above Average)';
  if (pct >= 40) return 'C (Average)';
  if (pct >= 33) return 'P (Pass)';
  return 'F (Fail)';
};

function ExaminationsPage({ students = [], onShowAlert, availableCourses = [] }) {
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Exam modal
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [examForm, setExamForm] = useState(EMPTY_EXAM_FORM);
  const [isSubmittingExam, setIsSubmittingExam] = useState(false);

  // Results Management Modal
  const [activeResultsExam, setActiveResultsExam] = useState(null);
  const [examResults, setExamResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [savingResultId, setSavingResultId] = useState(null);
  const [marksInputMap, setMarksInputMap] = useState({});
  const [remarksInputMap, setRemarksInputMap] = useState({});

  // Load exams from MongoDB Atlas
  const loadExams = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchExamsAPI();
      setExams(data);
    } catch (err) {
      if (onShowAlert) onShowAlert(err.message || 'Failed to fetch examination schedule.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [onShowAlert]);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  // Open Exam Add
  const handleOpenAddExam = () => {
    setEditingExam(null);
    setExamForm(EMPTY_EXAM_FORM);
    setIsExamModalOpen(true);
  };

  // Open Exam Edit
  const handleOpenEditExam = (exam) => {
    setEditingExam(exam);
    setExamForm({
      examName: exam.examName,
      course: exam.course,
      semester: exam.semester || 1,
      subject: exam.subject,
      examDate: exam.examDate ? new Date(exam.examDate).toISOString().split('T')[0] : '',
      startTime: exam.startTime || '10:00 AM',
      endTime: exam.endTime || '01:00 PM',
      maxMarks: exam.maxMarks || 100,
      status: exam.status || 'Scheduled',
    });
    setIsExamModalOpen(true);
  };

  // Submit Exam Add / Edit
  const handleSubmitExam = async (e) => {
    e.preventDefault();
    if (!examForm.examName.trim() || !examForm.subject.trim() || !examForm.examDate) {
      if (onShowAlert) onShowAlert('Exam Name, Subject and Date are required.', 'error');
      return;
    }

    try {
      setIsSubmittingExam(true);
      if (editingExam) {
        await updateExamAPI(editingExam._id, examForm);
        if (onShowAlert) onShowAlert(`Exam "${examForm.examName}" updated successfully!`, 'success');
      } else {
        await createExamAPI(examForm);
        if (onShowAlert) onShowAlert(`Exam "${examForm.examName}" scheduled in MongoDB Atlas!`, 'success');
      }
      setIsExamModalOpen(false);
      await loadExams();
    } catch (err) {
      if (onShowAlert) onShowAlert(err.message || 'Failed to save examination.', 'error');
    } finally {
      setIsSubmittingExam(false);
    }
  };

  // Delete Exam
  const handleDeleteExam = async (exam) => {
    if (!window.confirm(`Delete examination "${exam.examName} - ${exam.subject}" and its published marks?`)) {
      return;
    }

    try {
      await deleteExamAPI(exam._id);
      if (onShowAlert) onShowAlert(`Exam "${exam.examName}" deleted.`, 'success');
      await loadExams();
    } catch (err) {
      if (onShowAlert) onShowAlert(err.message || 'Failed to delete exam.', 'error');
    }
  };

  // Open Results Modal for Exam
  const handleOpenResults = async (exam) => {
    setActiveResultsExam(exam);
    try {
      setLoadingResults(true);
      const res = await fetchExamResultsAPI(exam._id);
      const resultsList = res.results || [];
      setExamResults(resultsList);

      const mInput = {};
      const rInput = {};
      resultsList.forEach((r) => {
        const sId = typeof r.student === 'object' && r.student ? r.student._id : r.student;
        if (sId) {
          mInput[sId] = r.marksObtained;
          rInput[sId] = r.remarks || '';
        }
      });
      setMarksInputMap(mInput);
      setRemarksInputMap(rInput);
    } catch (err) {
      if (onShowAlert) onShowAlert(err.message || 'Failed to fetch exam results.', 'error');
    } finally {
      setLoadingResults(false);
    }
  };

  // Save / Publish single student result
  const handleSaveResult = async (student) => {
    if (!activeResultsExam) return;
    const marks = marksInputMap[student._id];
    if (marks === undefined || marks === '' || isNaN(marks)) {
      if (onShowAlert) onShowAlert('Please enter valid numeric marks.', 'error');
      return;
    }

    if (Number(marks) < 0 || Number(marks) > activeResultsExam.maxMarks) {
      if (onShowAlert) onShowAlert(`Marks must be between 0 and ${activeResultsExam.maxMarks}.`, 'error');
      return;
    }

    try {
      setSavingResultId(student._id);
      const res = await publishExamResultAPI(activeResultsExam._id, {
        studentId: student._id,
        marksObtained: Number(marks),
        remarks: remarksInputMap[student._id] || '',
      });

      if (onShowAlert) onShowAlert(`Result published for ${student.name}: ${res.data.grade}`, 'success');

      // Refresh results list
      const refreshed = await fetchExamResultsAPI(activeResultsExam._id);
      setExamResults(refreshed.results || []);
    } catch (err) {
      if (onShowAlert) onShowAlert(err.message || 'Failed to publish result.', 'error');
    } finally {
      setSavingResultId(null);
    }
  };

  // Filter students eligible for this exam (by course)
  const eligibleStudents = activeResultsExam
    ? students.filter((s) => s.course === activeResultsExam.course || !activeResultsExam.course)
    : [];

  const defaultCourses = ['BCA', 'B.Tech CS', 'B.Tech IT', 'MCA', 'B.Sc CS', 'BBA'];
  const courseOptions = availableCourses.length > 0
    ? [...new Set([...availableCourses.map((c) => (typeof c === 'string' ? c : c.name || c.code)), ...defaultCourses])]
    : defaultCourses;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Examination Schedule Card */}
      <div className="erp-card">
        <div className="erp-card-header">
          <div>
            <h3>📝 End-Semester Examination Schedule & Grading</h3>
            <p>Official assessment datesheets and results stored in MongoDB Atlas</p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenAddExam}
            style={{ whiteSpace: 'nowrap' }}
          >
            ➕ Schedule Examination
          </button>
        </div>

        <div className="erp-card-body">
          {isLoading ? (
            <div className="honest-empty-state">
              <div className="honest-empty-icon">⏳</div>
              <h4>Loading examinations from MongoDB...</h4>
            </div>
          ) : exams.length === 0 ? (
            <div className="honest-empty-state">
              <div className="honest-empty-icon">📝</div>
              <h4>No Examinations Scheduled</h4>
              <p>No exams currently configured. Click "Schedule Examination" to add one.</p>
            </div>
          ) : (
            <div className="erp-table-responsive">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Exam & Subject</th>
                    <th>Course & Sem</th>
                    <th>Exam Date</th>
                    <th>Timing</th>
                    <th style={{ textAlign: 'center' }}>Max Marks</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Results / Grades</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam) => (
                    <tr key={exam._id}>
                      <td>
                        <strong style={{ color: '#1E293B' }}>{exam.subject}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>
                          {exam.examName}
                        </span>
                      </td>
                      <td>
                        <span className="badge-course">{exam.course}</span>
                        {exam.semester && (
                          <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>
                            Sem {exam.semester}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="badge-roll">
                          {new Date(exam.examDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {exam.startTime} - {exam.endTime}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <strong>{exam.maxMarks}</strong>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor:
                              exam.status === 'Completed'
                                ? '#E6FBF2'
                                : exam.status === 'Ongoing'
                                ? '#EFF6FF'
                                : '#FEF6E7',
                            color:
                              exam.status === 'Completed'
                                ? '#065F46'
                                : exam.status === 'Ongoing'
                                ? '#1D4ED8'
                                : '#92400E',
                          }}
                        >
                          {exam.status || 'Scheduled'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() => handleOpenResults(exam)}
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                        >
                          📊 Manage Results
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-sm btn-edit"
                            onClick={() => handleOpenEditExam(exam)}
                            title="Edit Exam"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-delete"
                            onClick={() => handleDeleteExam(exam)}
                            title="Delete Exam"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 2. Schedule Exam Modal */}
      {isExamModalOpen && (
        <div className="modal-backdrop">
          <div className="erp-modal-box" style={{ maxWidth: '540px', width: '92%' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1E293B' }}>
                {editingExam ? '✏️ Edit Examination' : '➕ Schedule New Examination'}
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsExamModalOpen(false)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitExam}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Examination Name <span className="req">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. End-Semester University Examination Dec 2024"
                    value={examForm.examName}
                    onChange={(e) => setExamForm({ ...examForm, examName: e.target.value })}
                    required
                    disabled={isSubmittingExam}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Subject Title <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Web Development & MERN Stack"
                      value={examForm.subject}
                      onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}
                      required
                      disabled={isSubmittingExam}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Course / Degree <span className="req">*</span></label>
                    <select
                      className="form-select"
                      value={examForm.course}
                      onChange={(e) => setExamForm({ ...examForm, course: e.target.value })}
                      disabled={isSubmittingExam}
                      required
                    >
                      {courseOptions.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Semester</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="form-input"
                      value={examForm.semester}
                      onChange={(e) => setExamForm({ ...examForm, semester: Number(e.target.value) })}
                      disabled={isSubmittingExam}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Maximum Marks</label>
                    <input
                      type="number"
                      min="10"
                      max="500"
                      className="form-input"
                      value={examForm.maxMarks}
                      onChange={(e) => setExamForm({ ...examForm, maxMarks: Number(e.target.value) })}
                      disabled={isSubmittingExam}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Exam Date <span className="req">*</span></label>
                    <input
                      type="date"
                      className="form-input"
                      value={examForm.examDate}
                      onChange={(e) => setExamForm({ ...examForm, examDate: e.target.value })}
                      required
                      disabled={isSubmittingExam}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Start Time</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="10:00 AM"
                      value={examForm.startTime}
                      onChange={(e) => setExamForm({ ...examForm, startTime: e.target.value })}
                      disabled={isSubmittingExam}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">End Time</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="01:00 PM"
                      value={examForm.endTime}
                      onChange={(e) => setExamForm({ ...examForm, endTime: e.target.value })}
                      disabled={isSubmittingExam}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={examForm.status}
                    onChange={(e) => setExamForm({ ...examForm, status: e.target.value })}
                    disabled={isSubmittingExam}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsExamModalOpen(false)}
                  disabled={isSubmittingExam}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmittingExam}
                >
                  {isSubmittingExam ? 'Saving...' : editingExam ? 'Save Changes' : 'Schedule Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Results Management Modal */}
      {activeResultsExam && (
        <div className="modal-backdrop">
          <div className="erp-modal-box" style={{ maxWidth: '780px', width: '95%' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#1E293B' }}>
                  📊 Marks Evaluation & Results: {activeResultsExam.subject}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Course: {activeResultsExam.course} • Max Marks: {activeResultsExam.maxMarks} • Exam: {activeResultsExam.examName}
                </span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setActiveResultsExam(null)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
              {loadingResults ? (
                <div className="honest-empty-state">
                  <div className="honest-empty-icon">⏳</div>
                  <h4>Loading marks records from database...</h4>
                </div>
              ) : eligibleStudents.length === 0 ? (
                <div className="honest-empty-state">
                  <div className="honest-empty-icon">👥</div>
                  <h4>No Students Found for {activeResultsExam.course}</h4>
                  <p>Register students under the course "{activeResultsExam.course}" in Student Management to publish their marks.</p>
                </div>
              ) : (
                <div className="erp-table-responsive">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>Roll Number</th>
                        <th>Student Name</th>
                        <th>Marks Obtained (Max: {activeResultsExam.maxMarks})</th>
                        <th>Grade</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eligibleStudents.map((student) => {
                        const existingResult = examResults.find((r) => {
                          const sId = typeof r.student === 'object' && r.student ? r.student._id : r.student;
                          return sId === student._id;
                        });

                        const currentMarks = marksInputMap[student._id] !== undefined
                          ? marksInputMap[student._id]
                          : (existingResult ? existingResult.marksObtained : '');

                        const grade = calculateGrade(currentMarks, activeResultsExam.maxMarks);

                        return (
                          <tr key={student._id}>
                            <td>
                              <span className="badge-roll">{student.rollNumber}</span>
                            </td>
                            <td>
                              <strong style={{ color: '#1E293B' }}>{student.name}</strong>
                            </td>
                            <td style={{ width: '150px' }}>
                              <input
                                type="number"
                                min="0"
                                max={activeResultsExam.maxMarks}
                                className="form-input"
                                placeholder={`0-${activeResultsExam.maxMarks}`}
                                value={currentMarks}
                                onChange={(e) =>
                                  setMarksInputMap({
                                    ...marksInputMap,
                                    [student._id]: e.target.value,
                                  })
                                }
                                style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                              />
                            </td>
                            <td>
                              <span style={{
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                color: grade.includes('F') ? '#DC2626' : '#EA580C',
                              }}>
                                {grade}
                              </span>
                            </td>
                            <td>
                              {existingResult ? (
                                <span style={{
                                  fontSize: '0.75rem',
                                  color: '#10B981',
                                  fontWeight: 600,
                                  backgroundColor: '#E6FBF2',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '9999px',
                                }}>
                                  Published
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Pending</span>
                              )}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                onClick={() => handleSaveResult(student)}
                                disabled={savingResultId === student._id}
                                style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                              >
                                {savingResultId === student._id ? 'Saving...' : existingResult ? 'Update' : 'Publish'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActiveResultsExam(null)}
              >
                Close Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExaminationsPage;
