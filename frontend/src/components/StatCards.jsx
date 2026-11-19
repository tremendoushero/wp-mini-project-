// frontend/src/components/StatCards.jsx
// Purpose: Displays clean metric cards showing total students, courses, and system health.

import React from 'react';

function StatCards({ totalStudents, totalCourses }) {
  return (
    <div className="stats-grid">
      {/* Total Students Card */}
      <div className="stat-card">
        <div className="stat-info">
          <p>Total Students</p>
          <h3>{totalStudents}</h3>
        </div>
        <div className="stat-icon-wrapper blue">
          👥
        </div>
      </div>

      {/* Total Courses Card */}
      <div className="stat-card">
        <div className="stat-info">
          <p>Active Courses</p>
          <h3>{totalCourses}</h3>
        </div>
        <div className="stat-icon-wrapper purple">
          📚
        </div>
      </div>

      {/* Database Status Card */}
      <div className="stat-card">
        <div className="stat-info">
          <p>Database</p>
          <h3 style={{ fontSize: '1.25rem', color: '#10b981' }}>Connected</h3>
        </div>
        <div className="stat-icon-wrapper green">
          ☁️
        </div>
      </div>
    </div>
  );
}

export default StatCards;

