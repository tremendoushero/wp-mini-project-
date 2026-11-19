// frontend/src/components/Sidebar.jsx
// Purpose: Collapsible, dark navy/purple vertical sidebar (#1C1A3D)
// Includes Admin profile, menu search field, 8 ERP navigation links, and logout.

import React, { useState } from 'react';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'students', label: 'Students', icon: '👨‍🎓' },
  { id: 'attendance', label: 'Attendance', icon: '📅' },
  { id: 'courses', label: 'Courses', icon: '📚' },
  { id: 'academic', label: 'Academic', icon: '🏛️' },
  { id: 'examinations', label: 'Examinations', icon: '📝' },
  { id: 'reports', label: 'Reports', icon: '📈' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

function Sidebar({
  activeTab,
  setActiveTab,
  studentCount,
  isCollapsed,
  setIsCollapsed,
  adminUser,
  onLogout,
  institutionSettings,
}) {
  const [menuSearch, setMenuSearch] = useState('');

  // Filter menu items by user search
  const filteredMenuItems = MENU_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(menuSearch.toLowerCase().trim())
  );

  return (
    <aside className={`erp-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* 1. College ERP Brand & Toggle */}
      <div className="sidebar-brand-box">
        <div className="sidebar-brand">
          <div className="sidebar-logo-shield">🎓</div>
          {!isCollapsed && (
            <div className="sidebar-brand-text">
              <h2>Students Info</h2>
              <span>{institutionSettings?.subtitle || 'STUDENT MANAGEMENT'}</span>
            </div>
          )}
        </div>
        <button
          className="sidebar-toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle sidebar collapse"
        >
          {isCollapsed ? '❯' : '❮'}
        </button>
      </div>

      {/* 2. Admin Profile in Sidebar */}
      <div className="sidebar-profile-card">
        <div className="sidebar-avatar">
          {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
        </div>
        {!isCollapsed && (
          <div className="sidebar-profile-info">
            <div className="sidebar-profile-name" title={adminUser?.name || 'Administrator'}>
              {adminUser?.name || 'Administrator'}
            </div>
            <div className="sidebar-profile-role">
              <span className="status-dot"></span>
              <span>{adminUser?.email || 'admin@studentsinfo.com'}</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Search Menu Field */}
      <div className="sidebar-search-box">
        <div className="sidebar-search-wrapper">
          <span className="sidebar-search-icon">🔍</span>
          <input
            type="text"
            className="sidebar-search-input"
            placeholder="Search menu..."
            value={menuSearch}
            onChange={(e) => setMenuSearch(e.target.value)}
          />
        </div>
      </div>

      {/* 4. ERP Navigation Links */}
      <div className="sidebar-nav-list">
        {!isCollapsed && <div className="nav-section-title">Main Navigation</div>}

        {filteredMenuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-nav-btn ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
            title={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            {!isCollapsed && (
              <span className="nav-label">
                {item.label}
                {item.id === 'students' && (
                  <span className="nav-counter-pill">{studentCount}</span>
                )}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 5. Footer Logout Button */}
      <div className="sidebar-footer">
        <button
          className="sidebar-logout-btn"
          onClick={onLogout}
          title="Sign out of Admin Session"
        >
          <span className="nav-icon">🚪</span>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
