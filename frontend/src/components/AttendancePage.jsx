// frontend/src/components/AttendancePage.jsx
// Purpose: Full database-backed Attendance management page.
// Allows marking daily roll-call in MongoDB Atlas, computing daily percentages, and reviewing student attendance logs.

import React, { useState, useEffect, useCallback } from 'react';
import { fetchAttendanceByDateAPI, saveAttendanceAPI, fetchStudentAttendanceHistoryAPI } from '../api';

function AttendancePage({ students, onShowAlert }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { [studentId]: 'Present' | 'Absent' }
  const [remarksMap, setRemarksMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);

  // Student history modal
  const [historyStudent, setHistoryStudent] = useState(null);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historySummary, setHistorySummary] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load attendance records for selectedDate from MongoDB Atlas
  const loadAttendance = useCallback(async (date) => {
    try {
      setIsLoading(true);
      const res = await fetchAttendanceByDateAPI(date);
      const newMap = {};
      const newRemarks = {};

      if (res && res.data) {
        res.data.forEach((rec) => {
          const sId = typeof rec.student === 'object' && rec.student ? rec.student._id : rec.student;
          if (sId) {
            newMap[sId] = rec.status;
            if (rec.remarks) newRemarks[sId] = rec.remarks;
          }
        });
      }

      setAttendanceMap(newMap);
      setRemarksMap(newRemarks);
      setIsDirty(false);
      setLastSavedTime(res?.data?.length > 0 ? new Date() : null);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      if (onShowAlert) onShowAlert(err.message || 'Failed to fetch attendance for date.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [onShowAlert]);

  useEffect(() => {
    loadAttendance(selectedDate);
  }, [selectedDate, loadAttendance]);

  // Mark single student
  const handleMark = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
    setIsDirty(true);
  };

  // Mark all present
  const handleMarkAllPresent = () => {
    const updated = {};
    students.forEach((s) => {
      updated[s._id] = 'Present';
    });
    setAttendanceMap(updated);
    setIsDirty(true);
  };

  // Mark all absent
  const handleMarkAllAbsent = () => {
    const updated = {};
    students.forEach((s) => {
      updated[s._id] = 'Absent';
    });
    setAttendanceMap(updated);
    setIsDirty(true);
  };

  // Save attendance to MongoDB Atlas
  const handleSaveAttendance = async () => {
    try {
      setIsSaving(true);
      const records = students.map((s) => ({
        studentId: s._id,
        status: attendanceMap[s._id] || 'Absent',
        remarks: remarksMap[s._id] || '',
      }));

      await saveAttendanceAPI(selectedDate, records);
      setIsDirty(false);
      setLastSavedTime(new Date());
      if (onShowAlert) onShowAlert(`Attendance for ${selectedDate} saved to MongoDB Atlas!`, 'success');
    } catch (err) {
      if (onShowAlert) onShowAlert(err.message || 'Failed to save attendance.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // View individual student history
  const handleViewHistory = async (student) => {
    setHistoryStudent(student);
    try {
      setLoadingHistory(true);
      const res = await fetchStudentAttendanceHistoryAPI(student._id);
      setHistoryRecords(res.records || []);
      setHistorySummary(res.summary || null);
    } catch (err) {
      if (onShowAlert) onShowAlert(err.message || 'Failed to load attendance history.', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Compute live statistics for current view
  const totalStudentsCount = students.length;
  const presentCount = students.filter((s) => attendanceMap[s._id] === 'Present').length;
  const absentCount = students.filter((s) => attendanceMap[s._id] === 'Absent').length;
  const markedCount = presentCount + absentCount;
  const dailyPct = markedCount > 0 ? ((presentCount / markedCount) * 100).toFixed(1) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Daily Statistics Summary Grid */}
      <div className="erp-summary-grid">
        <div className="erp-metric-card purple">
          <div className="metric-info">
            <p>Session Date</p>
            <h2 style={{ fontSize: '1.4rem' }}>{selectedDate}</h2>
            <span className="metric-sub">{totalStudentsCount} Enrolled Students</span>
          </div>
          <div className="metric-icon-box purple">📅</div>
        </div>

        <div className="erp-metric-card green">
          <div className="metric-info">
            <p>Marked Present</p>
            <h2>{presentCount}</h2>
            <span className="metric-sub">{totalStudentsCount > 0 ? `${((presentCount / totalStudentsCount) * 100).toFixed(0)}% of Class` : '0%'}</span>
          </div>
          <div className="metric-icon-box green">✅</div>
        </div>

        <div className="erp-metric-card red" style={{ borderLeft: '4px solid #EF4444' }}>
          <div className="metric-info">
            <p>Marked Absent</p>
            <h2 style={{ color: '#DC2626' }}>{absentCount}</h2>
            <span className="metric-sub">{totalStudentsCount > 0 ? `${((absentCount / totalStudentsCount) * 100).toFixed(0)}% of Class` : '0%'}</span>
          </div>
          <div className="metric-icon-box" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>❌</div>
        </div>

        <div className="erp-metric-card blue">
          <div className="metric-info">
            <p>Session Attendance</p>
            <h2>{markedCount > 0 ? `${dailyPct}%` : 'Not Logged'}</h2>
            <span className="metric-sub">
              {isDirty ? '⚠️ Unsaved Changes' : lastSavedTime ? '● Synchronized to DB' : 'No DB Record'}
            </span>
          </div>
          <div className="metric-icon-box blue">📊</div>
        </div>
      </div>

      {/* 2. Register Table Card */}
      <div className="erp-card">
        <div className="erp-card-header">
          <div>
            <h3>📅 Daily Attendance Register</h3>
            <p>Session roll-call records stored in MongoDB Atlas</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E293B' }}>Session Date:</label>
            <input
              type="date"
              className="form-input"
              style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleMarkAllPresent}
              title="Mark All Present"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
            >
              ✅ All Present
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleMarkAllAbsent}
              title="Mark All Absent"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
            >
              ❌ All Absent
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveAttendance}
              disabled={isSaving || students.length === 0}
              style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}
            >
              {isSaving ? '💾 Saving...' : '💾 Save to Database'}
            </button>
          </div>
        </div>

        <div className="erp-card-body">
          {/* Status banner */}
          {isDirty && (
            <div className="erp-alert-box" style={{ backgroundColor: '#FEF3C7', color: '#92400E', borderColor: '#FDE68A', marginBottom: '1rem', padding: '0.65rem 1rem' }}>
              <span>⚠️ You have unsaved attendance changes for <strong>{selectedDate}</strong>. Click "Save to Database" to commit them to MongoDB Atlas.</span>
            </div>
          )}

          {isLoading ? (
            <div className="honest-empty-state">
              <div className="honest-empty-icon">⏳</div>
              <h4>Loading attendance from MongoDB Atlas...</h4>
            </div>
          ) : students.length === 0 ? (
            <div className="honest-empty-state">
              <div className="honest-empty-icon">👥</div>
              <h4>No Students Enrolled</h4>
              <p>Please register students in the Student Management section first.</p>
            </div>
          ) : (
            <div className="erp-table-responsive">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Roll Number</th>
                    <th>Student Name</th>
                    <th>Course</th>
                    <th>Status in DB</th>
                    <th style={{ textAlign: 'center' }}>Mark Attendance</th>
                    <th style={{ textAlign: 'center' }}>History</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const status = attendanceMap[student._id] || 'Not Marked';
                    return (
                      <tr key={student._id}>
                        <td>
                          <span className="badge-roll">{student.rollNumber}</span>
                        </td>
                        <td>
                          <strong style={{ color: '#1E293B' }}>{student.name}</strong>
                          {student.semester && (
                            <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>
                              Semester {student.semester}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="badge-course">{student.course}</span>
                        </td>
                        <td>
                          {status === 'Present' && (
                            <span style={{ color: '#10B981', fontWeight: 600, backgroundColor: '#E6FBF2', padding: '0.2rem 0.55rem', borderRadius: '9999px', fontSize: '0.75rem' }}>
                              ✅ Present
                            </span>
                          )}
                          {status === 'Absent' && (
                            <span style={{ color: '#EF4444', fontWeight: 600, backgroundColor: '#FEECEB', padding: '0.2rem 0.55rem', borderRadius: '9999px', fontSize: '0.75rem' }}>
                              ❌ Absent
                            </span>
                          )}
                          {status === 'Not Marked' && (
                            <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>
                              ⏳ Pending
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                            <button
                              type="button"
                              className="btn btn-sm"
                              style={{
                                backgroundColor: status === 'Present' ? '#10B981' : '#F1F5F9',
                                color: status === 'Present' ? '#FFF' : '#334155',
                                fontWeight: status === 'Present' ? 700 : 500,
                              }}
                              onClick={() => handleMark(student._id, 'Present')}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm"
                              style={{
                                backgroundColor: status === 'Absent' ? '#EF4444' : '#F1F5F9',
                                color: status === 'Absent' ? '#FFF' : '#334155',
                                fontWeight: status === 'Absent' ? 700 : 500,
                              }}
                              onClick={() => handleMark(student._id, 'Absent')}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleViewHistory(student)}
                            title="View student overall attendance log"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                          >
                            📜 History
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
      </div>

      {/* 3. Student Attendance History Modal */}
      {historyStudent && (
        <div className="modal-backdrop">
          <div className="erp-modal-box" style={{ maxWidth: '580px', width: '92%' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1E293B' }}>
                  📊 Attendance History: {historyStudent.name}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Roll: {historyStudent.rollNumber} • {historyStudent.course}
                </span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setHistoryStudent(null)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {loadingHistory ? (
                <div className="honest-empty-state">
                  <div className="honest-empty-icon">⏳</div>
                  <h4>Loading history from database...</h4>
                </div>
              ) : (
                <div>
                  {historySummary && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '0.75rem',
                      marginBottom: '1rem',
                      textAlign: 'center'
                    }}>
                      <div style={{ backgroundColor: '#F8FAFC', padding: '0.65rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Total</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1E293B' }}>{historySummary.total}</div>
                      </div>
                      <div style={{ backgroundColor: '#E6FBF2', padding: '0.65rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.75rem', color: '#065F46' }}>Present</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10B981' }}>{historySummary.present}</div>
                      </div>
                      <div style={{ backgroundColor: '#FEECEB', padding: '0.65rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.75rem', color: '#991B1B' }}>Absent</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#EF4444' }}>{historySummary.absent}</div>
                      </div>
                      <div style={{ backgroundColor: '#EEF0FD', padding: '0.65rem', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.75rem', color: '#5549E8' }}>Rate</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#5549E8' }}>{historySummary.percentage}%</div>
                      </div>
                    </div>
                  )}

                  {historyRecords.length === 0 ? (
                    <div className="honest-empty-state" style={{ padding: '1.5rem' }}>
                      <div className="honest-empty-icon">📭</div>
                      <h4>No Records Yet</h4>
                      <p>No attendance entries found for this student in MongoDB.</p>
                    </div>
                  ) : (
                    <table className="erp-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyRecords.map((r) => (
                          <tr key={r._id}>
                            <td>
                              <span className="badge-roll">{r.date}</span>
                            </td>
                            <td>
                              <span style={{
                                color: r.status === 'Present' ? '#10B981' : '#EF4444',
                                fontWeight: 600,
                              }}>
                                {r.status === 'Present' ? '✅ Present' : '❌ Absent'}
                              </span>
                            </td>
                            <td style={{ color: '#64748B', fontSize: '0.85rem' }}>
                              {r.remarks || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setHistoryStudent(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendancePage;
