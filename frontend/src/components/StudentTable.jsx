// frontend/src/components/StudentTable.jsx
// Purpose: Displays student records in a structured, styled ERP table with live search,
// detailed student profile view modal, edit and delete action buttons.

import React, { useState } from 'react';

function StudentTable({
  students,
  searchTerm,
  onSearchChange,
  onEditStudent,
  onOpenDeleteModal,
  isLoading,
}) {
  const [profileStudent, setProfileStudent] = useState(null);

  return (
    <div className="erp-card">
      {/* Header & Live Search Bar */}
      <div className="table-toolbar-box">
        <div>
          <h3>👨‍🎓 Registered Students ({students.length})</h3>
          <p>Official student enrolment directory from MongoDB Atlas</p>
        </div>

        <div className="erp-search-field">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, roll number, course..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="erp-table-responsive">
        {isLoading ? (
          <div className="honest-empty-state">
            <div className="honest-empty-icon">⏳</div>
            <h4>Loading student records...</h4>
            <p>Fetching the latest student directory from the Express backend API.</p>
          </div>
        ) : students.length === 0 ? (
          <div className="honest-empty-state">
            <div className="honest-empty-icon">📭</div>
            <h4>No students found</h4>
            <p>
              {searchTerm
                ? `No student matching "${searchTerm}". Try a different keyword.`
                : 'No student records in the database. Use the registration form on the left to add one!'}
            </p>
          </div>
        ) : (
          <table className="erp-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll Number</th>
                <th>Email Address</th>
                <th>Course</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const initials = student.name
                  ? student.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                  : 'S';

                return (
                  <tr key={student._id}>
                    {/* Student Avatar + Name */}
                    <td>
                      <div className="table-student-cell">
                        <div className="table-student-avatar">{initials}</div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#1E293B' }}>{student.name}</div>
                          {student.semester && (
                            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                              Sem {student.semester} {student.section ? `• Sec ${student.section}` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Roll Number Badge */}
                    <td>
                      <span className="badge-roll">{student.rollNumber}</span>
                    </td>

                    {/* Email */}
                    <td style={{ color: '#475569' }}>{student.email}</td>

                    {/* Course Badge */}
                    <td>
                      <span className="badge-course">{student.course}</span>
                    </td>

                    {/* Actions: View Profile, Edit, Delete */}
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={() => setProfileStudent(student)}
                          title="View Full Profile"
                          style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                        >
                          👁️ View
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-edit"
                          onClick={() => onEditStudent(student)}
                          title="Edit Student Information"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-delete"
                          onClick={() => onOpenDeleteModal(student)}
                          title="Delete Student Record"
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
        )}
      </div>

      {/* Detailed Student Profile View Modal */}
      {profileStudent && (
        <div className="modal-backdrop">
          <div className="erp-modal-box" style={{ maxWidth: '580px', width: '92%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="table-student-avatar" style={{ width: '42px', height: '42px', fontSize: '1rem' }}>
                  {profileStudent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1E293B' }}>{profileStudent.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    Roll: {profileStudent.rollNumber} • {profileStudent.course}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setProfileStudent(null)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <table className="info-details-table" style={{ width: '100%' }}>
                <tbody>
                  <tr>
                    <td className="label-col">Full Name</td>
                    <td className="value-col" style={{ fontWeight: 700, color: '#1E293B' }}>{profileStudent.name}</td>
                  </tr>
                  <tr>
                    <td className="label-col">Roll Number</td>
                    <td className="value-col"><span className="badge-roll">{profileStudent.rollNumber}</span></td>
                  </tr>
                  <tr>
                    <td className="label-col">Email Address</td>
                    <td className="value-col">{profileStudent.email}</td>
                  </tr>
                  <tr>
                    <td className="label-col">Enrolled Course</td>
                    <td className="value-col"><span className="badge-course">{profileStudent.course}</span></td>
                  </tr>
                  <tr>
                    <td className="label-col">Phone Number</td>
                    <td className="value-col">
                      {profileStudent.phone ? profileStudent.phone : <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Not Provided</span>}
                    </td>
                  </tr>
                  <tr>
                    <td className="label-col">Gender</td>
                    <td className="value-col">
                      {profileStudent.gender && profileStudent.gender !== 'Not Specified'
                        ? profileStudent.gender
                        : <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Not Provided</span>}
                    </td>
                  </tr>
                  <tr>
                    <td className="label-col">Date of Birth</td>
                    <td className="value-col">
                      {profileStudent.dateOfBirth
                        ? new Date(profileStudent.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                        : <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Not Provided</span>}
                    </td>
                  </tr>
                  <tr>
                    <td className="label-col">Semester</td>
                    <td className="value-col">
                      {profileStudent.semester !== undefined && profileStudent.semester !== null
                        ? `Semester ${profileStudent.semester}`
                        : <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Not Provided</span>}
                    </td>
                  </tr>
                  <tr>
                    <td className="label-col">Section</td>
                    <td className="value-col">
                      {profileStudent.section
                        ? profileStudent.section
                        : <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Not Provided</span>}
                    </td>
                  </tr>
                  <tr>
                    <td className="label-col">Academic Session</td>
                    <td className="value-col">
                      {profileStudent.academicSession
                        ? profileStudent.academicSession
                        : <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Not Provided</span>}
                    </td>
                  </tr>
                  <tr>
                    <td className="label-col">University Reg. No.</td>
                    <td className="value-col">
                      {profileStudent.universityRegNumber
                        ? profileStudent.universityRegNumber
                        : <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Not Provided</span>}
                    </td>
                  </tr>
                  <tr>
                    <td className="label-col">Residential Address</td>
                    <td className="value-col">
                      {profileStudent.address
                        ? profileStudent.address
                        : <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Not Provided</span>}
                    </td>
                  </tr>
                  <tr>
                    <td className="label-col">Database Record ID</td>
                    <td className="value-col" style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#64748B' }}>
                      {profileStudent._id}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setProfileStudent(null)}
              >
                Close Profile
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const s = profileStudent;
                  setProfileStudent(null);
                  onEditStudent(s);
                }}
              >
                ✏️ Edit Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentTable;
