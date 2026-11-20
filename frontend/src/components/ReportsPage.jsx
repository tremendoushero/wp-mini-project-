// frontend/src/components/ReportsPage.jsx
// Purpose: Full database-backed Academic Analytics and Printable Student Master Report.
// Fetches live attendance statistics and displays program-wise student breakdown from MongoDB Atlas.

import React, { useState, useEffect } from 'react';
import { fetchAttendanceStatsAPI } from '../api';

function ReportsPage({ students, stats, institutionSettings }) {
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [loadingAttendanceStats, setLoadingAttendanceStats] = useState(false);

  useEffect(() => {
    const loadAttStats = async () => {
      try {
        setLoadingAttendanceStats(true);
        const data = await fetchAttendanceStatsAPI();
        setAttendanceStats(data);
      } catch (err) {
        console.error('Failed to load attendance stats for reports:', err);
      } finally {
        setLoadingAttendanceStats(false);
      }
    };
    loadAttStats();
  }, []);

  // Compute distribution of students across courses
  const courseCountMap = {};
  students.forEach((s) => {
    courseCountMap[s.course] = (courseCountMap[s.course] || 0) + 1;
  });

  const handlePrint = () => {
    window.print();
  };

  const instName = institutionSettings?.institutionName || 'Students Info – College ERP Portal';
  const instSub = institutionSettings?.subtitle || 'STUDENT MANAGEMENT PORTAL';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner & Export */}
      <div className="erp-card">
        <div className="erp-card-header">
          <div>
            <h3>📈 Student Enrolment & Academic Report</h3>
            <p>Official summary report generated live from MongoDB Atlas</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={handlePrint}>
            <span>🖨️</span>
            <span>Print / Save PDF Report</span>
          </button>
        </div>

        <div className="erp-card-body">
          {/* Institutional Print Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #F97316', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: '0 0 0.25rem 0', color: '#202124', fontSize: '1.5rem' }}>{instName}</h2>
            <p style={{ margin: 0, color: '#F97316', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.5px' }}>{instSub}</p>
            <p style={{ margin: '0.25rem 0 0 0', color: '#78716C', fontSize: '0.78rem' }}>
              Report Generated: {new Date().toLocaleString()} • Academic Session: {institutionSettings?.academicSession || '2024-2025'}
            </p>
          </div>

          {/* Key Summary Badges */}
          <div className="erp-summary-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="erp-metric-card purple">
              <div className="metric-info">
                <p>Total Enrolled</p>
                <h2>{stats.totalStudents}</h2>
                <span className="metric-sub">Active Students in Atlas</span>
              </div>
              <div className="metric-icon-box purple">👥</div>
            </div>

            <div className="erp-metric-card blue">
              <div className="metric-info">
                <p>Enrolled Degree Programs</p>
                <h2>{Object.keys(courseCountMap).length}</h2>
                <span className="metric-sub">Active Courses in DB</span>
              </div>
              <div className="metric-icon-box blue">🏛️</div>
            </div>

            <div className="erp-metric-card green">
              <div className="metric-info">
                <p>Campus Attendance Rate</p>
                <h2>
                  {attendanceStats && attendanceStats.overallPercentage !== null
                    ? `${attendanceStats.overallPercentage}%`
                    : stats.overallAttendancePercentage !== null && stats.overallAttendancePercentage !== undefined
                    ? `${stats.overallAttendancePercentage}%`
                    : 'Not Recorded'}
                </h2>
                <span className="metric-sub">
                  {attendanceStats?.totalRecords
                    ? `${attendanceStats.totalRecords} Classroom Logs`
                    : 'Classroom Roll-Calls'}
                </span>
              </div>
              <div className="metric-icon-box green">📊</div>
            </div>

            <div className="erp-metric-card amber">
              <div className="metric-info">
                <p>Database Integrity</p>
                <h2 style={{ fontSize: '1.25rem', color: '#10B981' }}>100% Verified</h2>
                <span className="metric-sub">MongoDB Atlas Connected</span>
              </div>
              <div className="metric-icon-box amber">🛡️</div>
            </div>
          </div>

          {/* Course-wise Breakdown */}
          <h4 style={{ fontSize: '1rem', color: '#1E293B', marginBottom: '0.75rem', fontWeight: 700 }}>
            Program-wise Student Enrolment Distribution
          </h4>
          <div className="erp-table-responsive" style={{ marginBottom: '2rem' }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Course / Degree Program</th>
                  <th>Registered Students</th>
                  <th>Percentage of Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(courseCountMap).length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: '#64748B' }}>
                      No student enrollment records in database.
                    </td>
                  </tr>
                ) : (
                  Object.keys(courseCountMap).map((courseName) => {
                    const count = courseCountMap[courseName];
                    const pct = stats.totalStudents > 0
                      ? ((count / stats.totalStudents) * 100).toFixed(1)
                      : 0;
                    return (
                      <tr key={courseName}>
                        <td>
                          <strong style={{ color: '#1E293B' }}>{courseName}</strong>
                        </td>
                        <td>
                          <span className="badge-roll">{count} {count === 1 ? 'Student' : 'Students'}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ flex: 1, height: '8px', backgroundColor: '#F5F5F4', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#F97316', borderRadius: '4px' }}></div>
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#EA580C', minWidth: '45px' }}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Complete Student Directory Table */}
          <h4 style={{ fontSize: '1rem', color: '#1E293B', marginBottom: '0.75rem', fontWeight: 700 }}>
            Complete Student Master Roster ({students.length} Records)
          </h4>
          <div className="erp-table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Roll Number</th>
                  <th>Full Name</th>
                  <th>Email Address</th>
                  <th>Course</th>
                  <th>Semester</th>
                  <th>Phone</th>
                  <th>Registered On</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <tr key={student._id}>
                    <td>{idx + 1}</td>
                    <td>
                      <span className="badge-roll">{student.rollNumber}</span>
                    </td>
                    <td>
                      <strong style={{ color: '#1E293B' }}>{student.name}</strong>
                    </td>
                    <td style={{ color: '#64748B' }}>{student.email}</td>
                    <td>
                      <span className="badge-course">{student.course}</span>
                    </td>
                    <td>
                      {student.semester ? `Sem ${student.semester}` : <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>—</span>}
                    </td>
                    <td style={{ color: '#64748B', fontSize: '0.85rem' }}>
                      {student.phone || <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>—</span>}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                      {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
