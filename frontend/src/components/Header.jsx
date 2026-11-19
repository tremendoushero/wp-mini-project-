// frontend/src/components/Header.jsx
// Purpose: White top navigation bar with project title, configurable institution tag, notifications, admin profile, and logout.

import React from 'react';

const PAGE_TITLES = {
  dashboard: { title: 'Dashboard', sub: 'Academic Performance & Attendance Overview' },
  students: { title: 'Student Management', sub: 'Register, View, Update & Search Student Records' },
  attendance: { title: 'Attendance Management', sub: 'Track and Monitor Daily Classroom Attendance' },
  courses: { title: 'Course Curriculum', sub: 'Degree Programs, Course Codes & Syllabus' },
  academic: { title: 'Academic Information', sub: 'Semester Schedule, Notices & Faculty Directory' },
  examinations: { title: 'Examinations & Grades', sub: 'Internal Assessments, Datesheets & Evaluations' },
  reports: { title: 'Analytics & Reports', sub: 'Student Summary Reports & Course Breakdown' },
  settings: { title: 'Portal Settings', sub: 'ERP Preferences & Academic Session Configuration' },
};

function Header({ activeTab, onOpenFeedback, adminUser, onLogout, institutionSettings }) {
  const pageInfo = PAGE_TITLES[activeTab] || { title: 'Students Info', sub: 'Student Management Portal' };
  const subTitleText = institutionSettings?.subtitle || 'STUDENT MANAGEMENT PORTAL';

  return (
    <header className="erp-topbar">
      {/* Left: Page Title & Breadcrumb */}
      <div className="topbar-left">
        <div className="topbar-page-info">
          <h1>{pageInfo.title}</h1>
          <div className="topbar-breadcrumb">
            <span style={{ fontWeight: 600, color: '#5549E8' }}>Students Info</span>
            <span>/</span>
            <span>{pageInfo.title}</span>
          </div>
        </div>

        {/* Official Subtitle Tag */}
        <div className="topbar-college-tag">
          <span className="badge-dot"></span>
          <span className="college-name">{subTitleText}</span>
        </div>
      </div>

      {/* Right: Actions, Notifications, Admin Profile & Logout */}
      <div className="topbar-right">
        {/* Feedback Button */}
        <button
          type="button"
          className="topbar-action-btn"
          onClick={onOpenFeedback}
          title="Submit feedback or report an issue"
        >
          <span>💬</span>
          <span>Feedback</span>
        </button>

        {/* Notifications Icon with Badge */}
        <button
          type="button"
          className="topbar-action-btn notification-bell-btn"
          title="Notifications: Database verified"
          onClick={() => alert('System Notifications:\n1. MongoDB Atlas cluster synchronized.\n2. Private Admin Mode active (Public registration disabled).')}
        >
          <span>🔔</span>
          <span className="notification-badge">●</span>
        </button>

        {/* Admin Profile Pill */}
        <div className="topbar-user-pill" title={`Logged in as ${adminUser?.email || 'Admin'}`}>
          <div className="topbar-user-avatar">
            {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="topbar-user-meta">
            <span className="topbar-user-name">{adminUser?.name || 'Administrator'}</span>
            <span className="topbar-user-sub" style={{ color: '#5549E8', fontWeight: 600 }}>
              🛡️ Admin
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          className="topbar-action-btn"
          onClick={onLogout}
          style={{
            borderColor: '#FECACA',
            backgroundColor: '#FEF2F2',
            color: '#DC2626',
            fontWeight: 600,
          }}
          title="Sign out of Admin Portal"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
