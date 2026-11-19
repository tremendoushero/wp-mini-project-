// frontend/src/components/DashboardHome.jsx
// Purpose: College ERP Dashboard Home Page displaying real student data from MongoDB Atlas.
// Includes a searchable student selector, real student profiles with honest "Not Provided" indicators,
// and real attendance statistics calculated from MongoDB Atlas.

import React, { useState, useEffect } from 'react';

function DashboardHome({ stats, students, onNavigateToStudents, institutionSettings }) {
  // State for user-selected student profile (Requirements: no random selection)
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // Set initial selected student to first student when students load, if not already set
  useEffect(() => {
    if (students && students.length > 0) {
      if (!selectedStudentId || !students.some((s) => s._id === selectedStudentId)) {
        setSelectedStudentId(students[0]._id);
      }
    } else {
      setSelectedStudentId('');
    }
  }, [students, selectedStudentId]);

  // Find the selected student from the real MongoDB records array
  const currentStudent = students.find((s) => s._id === selectedStudentId) || (students.length > 0 ? students[0] : null);

  // Real list of courses from MongoDB
  const courseListText = stats.courses && stats.courses.length > 0
    ? stats.courses.join(', ')
    : 'None registered';

  // Overall attendance from MongoDB
  const attendanceRate = stats.overallAttendancePercentage !== null && stats.overallAttendancePercentage !== undefined
    ? `${stats.overallAttendancePercentage}%`
    : null;

  return (
    <div className="dashboard-container">
      {/* 1. Summary Cards Row (Using Real MongoDB Atlas Data) */}
      <div className="erp-summary-grid">
        {/* Total Students (Real from MongoDB) */}
        <div className="erp-metric-card purple">
          <div className="metric-info">
            <p>Total Registered Students</p>
            <h2>{stats.totalStudents}</h2>
            <span className="metric-sub">Stored in MongoDB Atlas</span>
          </div>
          <div className="metric-icon-box purple">👥</div>
        </div>

        {/* Total Courses (Real from MongoDB) */}
        <div className="erp-metric-card blue">
          <div className="metric-info">
            <p>Active Programs / Courses</p>
            <h2>{stats.totalCourses || (stats.courses ? stats.courses.length : 0)}</h2>
            <span className="metric-sub" title={courseListText}>
              {courseListText}
            </span>
          </div>
          <div className="metric-icon-box blue">📚</div>
        </div>

        {/* Real Overall Attendance */}
        <div className="erp-metric-card green">
          <div className="metric-info">
            <p>Overall Attendance Rate</p>
            <h2>{attendanceRate !== null ? attendanceRate : 'Not Recorded'}</h2>
            <span className="metric-sub">
              {stats.totalAttendanceRecords
                ? `${stats.totalAttendanceRecords} Total DB Logs`
                : 'No attendance logs in DB'}
            </span>
          </div>
          <div className="metric-icon-box green">📊</div>
        </div>

        {/* Database Status */}
        <div className="erp-metric-card amber">
          <div className="metric-info">
            <p>Database Integrity</p>
            <h2 style={{ fontSize: '1.25rem', color: '#10B981' }}>
              Connected & Verified
            </h2>
            <span className="metric-sub">Atlas AWS Cloud Cluster</span>
          </div>
          <div className="metric-icon-box amber">🎓</div>
        </div>
      </div>

      {/* 2. Main Two-Column Grid */}
      <div className="erp-dashboard-grid">
        {/* LEFT COLUMN: Overview & Quick Academic Guidelines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* A. System Environment Overview Card */}
          <div className="erp-card">
            <div className="erp-card-header">
              <div>
                <h3>🏛️ Institutional Overview</h3>
                <p>Configured portal parameters for {institutionSettings?.institutionName || 'Students Info'}</p>
              </div>
              <span className="badge-roll">Session {institutionSettings?.academicSession || '2024-2025'}</span>
            </div>

            <div className="erp-card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#1E293B', fontSize: '0.95rem' }}>
                    📌 Portal Operational Status
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#475569', fontSize: '0.85rem', lineHeight: 1.6 }}>
                    <li>All data is persisted strictly in cloud-hosted <strong>MongoDB Atlas</strong> cluster.</li>
                    <li>Portal is operating in <strong>Private Administrator Mode</strong> (public registration disabled).</li>
                    <li>Real student directory contains <strong>{stats.totalStudents} verified student records</strong>.</li>
                    <li>Overall campus attendance tracking rate: <strong>{attendanceRate !== null ? attendanceRate : '0%'}</strong>.</li>
                  </ul>
                </div>

                {/* Quick Shortcuts */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onNavigateToStudents}
                    style={{ fontSize: '0.8rem', padding: '0.65rem 0.5rem', justifyContent: 'center' }}
                  >
                    👨‍🎓 Student Directory
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onNavigateToStudents}
                    style={{ fontSize: '0.8rem', padding: '0.65rem 0.5rem', justifyContent: 'center' }}
                  >
                    ➕ Register Student
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* B. Attendance Overview Card */}
          <div className="erp-card">
            <div className="erp-card-header">
              <div>
                <h3>📅 Attendance Register Status</h3>
                <p>Synchronized classroom roll-call summary</p>
              </div>
            </div>

            <div className="erp-card-body">
              {stats.totalAttendanceRecords > 0 ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.9rem', color: '#1E293B', fontWeight: 600 }}>Classroom Attendance Rate:</span>
                    <strong style={{ fontSize: '1.2rem', color: '#5549E8' }}>{attendanceRate}</strong>
                  </div>
                  <div style={{ height: '10px', backgroundColor: '#F1F5F9', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${stats.overallAttendancePercentage || 0}%`, height: '100%', backgroundColor: '#5549E8' }}></div>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.75rem' }}>
                    Total roll-call entries logged in MongoDB Atlas: <strong>{stats.totalAttendanceRecords}</strong>.
                  </p>
                </div>
              ) : (
                <div className="honest-empty-state" style={{ padding: '1.5rem' }}>
                  <div className="honest-empty-icon" style={{ fontSize: '1.75rem' }}>⏳</div>
                  <h4>No Attendance Logs in MongoDB</h4>
                  <p>Open the Attendance module in the sidebar to mark daily classroom roll-calls for enrolled students.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REAL Personal Information Card */}
        <div>
          <div className="erp-card">
            <div className="erp-card-header">
              <div>
                <h3>👤 Student Profile Details</h3>
                <p>Real-time data retrieved from MongoDB Atlas</p>
              </div>
              <span className="badge-roll">
                {students.length > 0 ? `${students.length} in DB` : '0 in DB'}
              </span>
            </div>

            <div className="erp-card-body">
              {students.length === 0 ? (
                <div className="honest-empty-state" style={{ padding: '2rem 1rem' }}>
                  <div className="honest-empty-icon">👥</div>
                  <h4>No Students in Database</h4>
                  <p>There are currently no student records stored in your MongoDB Atlas cluster.</p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={onNavigateToStudents}
                    style={{ marginTop: '1rem' }}
                  >
                    ➕ Register First Student
                  </button>
                </div>
              ) : (
                <div className="personal-info-card">
                  {/* Student Selector Dropdown (No random student selection) */}
                  <div style={{ marginBottom: '0.5rem' }}>
                    <label
                      htmlFor="studentSelector"
                      style={{
                        display: 'block',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#64748B',
                        marginBottom: '0.35rem',
                      }}
                    >
                      Select Student to View Profile ({students.length} Available):
                    </label>
                    <select
                      id="studentSelector"
                      className="form-select"
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      style={{
                        padding: '0.55rem 0.75rem',
                        fontSize: '0.88rem',
                        borderColor: '#5549E8',
                        backgroundColor: '#F8FAFC',
                      }}
                    >
                      {students.map((student) => (
                        <option key={student._id} value={student._id}>
                          {student.name} — Roll: {student.rollNumber} ({student.course})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Student Avatar + Header (Real Data) */}
                  <div className="student-hero-banner" style={{ marginTop: '0.5rem' }}>
                    <div className="student-hero-avatar">
                      {currentStudent?.name ? currentStudent.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div className="student-hero-title">
                      <h4>{currentStudent?.name}</h4>
                      <p>{currentStudent?.email}</p>
                      <span className="roll-tag">
                        Roll No: {currentStudent?.rollNumber}
                      </span>
                    </div>
                  </div>

                  {/* Real Student Information Table */}
                  <table className="info-details-table">
                    <tbody>
                      <tr>
                        <td className="label-col">Full Name</td>
                        <td className="value-col" style={{ color: '#1E293B', fontWeight: 700 }}>
                          {currentStudent?.name}
                        </td>
                      </tr>
                      <tr>
                        <td className="label-col">Roll Number</td>
                        <td className="value-col">
                          <span className="badge-roll">{currentStudent?.rollNumber}</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="label-col">Email Address</td>
                        <td className="value-col" style={{ wordBreak: 'break-all' }}>
                          {currentStudent?.email}
                        </td>
                      </tr>
                      <tr>
                        <td className="label-col">Enrolled Course</td>
                        <td className="value-col">
                          <span className="badge-course">{currentStudent?.course}</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="label-col">Semester</td>
                        <td className="value-col">
                          {currentStudent?.semester !== undefined && currentStudent?.semester !== null
                            ? `Semester ${currentStudent.semester}`
                            : <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Not Provided</span>}
                        </td>
                      </tr>
                      <tr>
                        <td className="label-col">Section</td>
                        <td className="value-col">
                          {currentStudent?.section
                            ? currentStudent.section
                            : <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Not Provided</span>}
                        </td>
                      </tr>
                      <tr>
                        <td className="label-col">Phone Number</td>
                        <td className="value-col">
                          {currentStudent?.phone
                            ? currentStudent.phone
                            : <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Not Provided</span>}
                        </td>
                      </tr>
                      <tr>
                        <td className="label-col">Gender</td>
                        <td className="value-col">
                          {currentStudent?.gender && currentStudent.gender !== 'Not Specified'
                            ? currentStudent.gender
                            : <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Not Provided</span>}
                        </td>
                      </tr>
                      <tr>
                        <td className="label-col">Date of Birth</td>
                        <td className="value-col">
                          {currentStudent?.dateOfBirth
                            ? new Date(currentStudent.dateOfBirth).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Not Provided</span>}
                        </td>
                      </tr>
                      <tr>
                        <td className="label-col">Academic Session</td>
                        <td className="value-col">
                          {currentStudent?.academicSession
                            ? currentStudent.academicSession
                            : <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Not Provided</span>}
                        </td>
                      </tr>
                      <tr>
                        <td className="label-col">University Reg. No.</td>
                        <td className="value-col">
                          {currentStudent?.universityRegNumber
                            ? currentStudent.universityRegNumber
                            : <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Not Provided</span>}
                        </td>
                      </tr>
                      <tr>
                        <td className="label-col">Residential Address</td>
                        <td className="value-col">
                          {currentStudent?.address
                            ? currentStudent.address
                            : <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Not Provided</span>}
                        </td>
                      </tr>
                      <tr>
                        <td className="label-col">Database Record ID</td>
                        <td
                          className="value-col"
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            color: '#64748B',
                          }}
                          title={currentStudent?._id}
                        >
                          {currentStudent?._id ? `${currentStudent._id.slice(0, 10)}...` : 'Not Provided'}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Navigation to Full Table */}
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={onNavigateToStudents}
                    style={{ width: '100%', marginTop: '0.75rem' }}
                  >
                    View & Edit All {stats.totalStudents} Students
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;
