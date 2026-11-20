// frontend/src/App.jsx
// Purpose: Master ERP Controller managing authentication, routing, student state, courses,
// institution profile settings, and layout.
// Shows Login panel for unauthenticated users, and full ERP Dashboard after admin login.

import React, { useState, useEffect } from 'react';
import './App.css';

// Components
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardHome from './components/DashboardHome';
import StudentForm from './components/StudentForm';
import StudentTable from './components/StudentTable';
import AttendancePage from './components/AttendancePage';
import CoursesPage from './components/CoursesPage';
import AcademicPage from './components/AcademicPage';
import ExaminationsPage from './components/ExaminationsPage';
import ReportsPage from './components/ReportsPage';
import SettingsPage from './components/SettingsPage';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import FeedbackModal from './components/FeedbackModal';
import AlertBanner from './components/AlertBanner';

// API Service functions
import {
  checkAuthAPI,
  logoutAPI,
  fetchStudentsAPI,
  fetchStatsAPI,
  createStudentAPI,
  updateStudentAPI,
  deleteStudentAPI,
  fetchCoursesAPI,
  fetchSettingsAPI,
} from './api';

function App() {
  // Authentication State
  const [adminUser, setAdminUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Institution Profile State
  const [institutionSettings, setInstitutionSettings] = useState(null);

  // Navigation & Layout States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Student Data States
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ totalStudents: 0, totalCourses: 0, courses: [] });
  const [availableCourses, setAvailableCourses] = useState([]);

  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // Form & Modal States
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);

  // Loading & Feedback States
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alert, setAlert] = useState(null);

  // Auto-dismiss alert notification after 4 seconds
  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert(null);
    }, 4500);
  };

  // 1. Fetch Students from Backend API
  const loadStudents = async (query = '') => {
    try {
      setIsLoading(true);
      const studentList = await fetchStudentsAPI(query);
      setStudents(studentList);
    } catch (error) {
      if (error.message.includes('denied') || error.message.includes('log in') || error.message.includes('Unauthorized')) {
        setAdminUser(null);
      } else {
        showAlert(error.message, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Fetch Dashboard Statistics
  const loadStats = async () => {
    try {
      const statsData = await fetchStatsAPI();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error.message);
    }
  };

  // 3. Fetch Courses for dropdowns
  const loadCourses = async () => {
    try {
      const courseList = await fetchCoursesAPI();
      setAvailableCourses(courseList.map((c) => c.name || c.code));
    } catch (error) {
      console.error('Failed to load course list:', error.message);
    }
  };

  // 4. Fetch Institution Settings
  const loadSettings = async () => {
    try {
      const settingsData = await fetchSettingsAPI();
      setInstitutionSettings(settingsData);
    } catch (error) {
      console.error('Failed to load settings:', error.message);
    }
  };

  // Check existing session when browser refreshes
  useEffect(() => {
    const verifySession = async () => {
      try {
        setIsCheckingAuth(true);
        const admin = await checkAuthAPI();
        setAdminUser(admin);
        // Load initial data
        await Promise.all([
          loadStudents(),
          loadStats(),
          loadCourses(),
          loadSettings(),
        ]);
      } catch (err) {
        setAdminUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    verifySession();
  }, []);

  // Debounced search when user types in Student Management table
  useEffect(() => {
    if (adminUser && activeTab === 'students') {
      const timer = setTimeout(() => {
        loadStudents(searchTerm);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, activeTab, adminUser]);

  // Handle Login Success
  const handleLoginSuccess = async (admin) => {
    setAdminUser(admin);
    showAlert(`Welcome back, ${admin.name}!`, 'success');
    await Promise.all([
      loadStudents(),
      loadStats(),
      loadCourses(),
      loadSettings(),
    ]);
  };

  // Handle Admin Logout
  const handleLogout = async () => {
    try {
      await logoutAPI();
    } catch (err) {
      console.error('Logout error:', err.message);
    } finally {
      setAdminUser(null);
      setStudents([]);
      setStats({ totalStudents: 0, totalCourses: 0, courses: [] });
      setActiveTab('dashboard');
      showAlert('You have been signed out.', 'success');
    }
  };

  // Handle Add OR Update Student
  const handleSaveStudent = async (formData) => {
    try {
      setIsSubmitting(true);

      if (editingStudent) {
        await updateStudentAPI(editingStudent._id, formData);
        showAlert(`Student "${formData.name}" record updated successfully!`, 'success');
        setEditingStudent(null);
      } else {
        await createStudentAPI(formData);
        showAlert(`Student "${formData.name}" registered successfully!`, 'success');
      }

      await loadStudents(searchTerm);
      await loadStats();
    } catch (error) {
      showAlert(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit button click
  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setActiveTab('students');
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  // Handle Cancel Edit
  const handleCancelEdit = () => {
    setEditingStudent(null);
  };

  // Delete Modal Handlers
  const handleOpenDeleteModal = (student) => {
    setDeletingStudent(student);
  };

  const handleCloseDeleteModal = () => {
    setDeletingStudent(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingStudent) return;

    try {
      setIsDeleting(true);
      await deleteStudentAPI(deletingStudent._id);
      showAlert(`Student "${deletingStudent.name}" deleted successfully.`, 'success');
      handleCloseDeleteModal();

      if (editingStudent && editingStudent._id === deletingStudent._id) {
        setEditingStudent(null);
      }

      await loadStudents(searchTerm);
      await loadStats();
    } catch (error) {
      showAlert(error.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Feedback Submission
  const handleSubmitFeedback = (data) => {
    showAlert(`Thank you! Your feedback for "${data.feedbackType}" was recorded.`, 'success');
  };

  // =========================================================================
  // VIEW 1: Initial Session Checking Splash
  // =========================================================================
  if (isCheckingAuth) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#202124',
          color: '#FFFFFF',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          gap: '1rem',
        }}
      >
        <div style={{ fontSize: '2.5rem', animation: 'spin 1s infinite linear', color: '#F97316' }}>⏳</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Students Info ERP</h2>
        <p style={{ color: '#A8A29E', fontSize: '0.85rem' }}>Verifying Administrator Session...</p>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: Login Page for Unauthenticated Users (Private Admin Only)
  // =========================================================================
  if (!adminUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // =========================================================================
  // VIEW 3: Protected Admin ERP Dashboard
  // =========================================================================
  return (
    <div className="erp-layout">
      {/* 1. Collapsible Dark Navy/Purple Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        studentCount={stats.totalStudents}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        adminUser={adminUser}
        onLogout={handleLogout}
        institutionSettings={institutionSettings}
      />

      {/* 2. Main Content Area */}
      <div className="erp-main-area">
        {/* Top Navigation Bar */}
        <Header
          activeTab={activeTab}
          onOpenFeedback={() => setIsFeedbackOpen(true)}
          adminUser={adminUser}
          onLogout={handleLogout}
          institutionSettings={institutionSettings}
        />

        {/* Dynamic Page Container */}
        <main className="erp-content-container">
          {/* Notification Alert Banner */}
          <AlertBanner alert={alert} onClose={() => setAlert(null)} />

          {/* PAGE 1: Dashboard Home */}
          {activeTab === 'dashboard' && (
            <DashboardHome
              stats={stats}
              students={students}
              onNavigateToStudents={() => setActiveTab('students')}
              institutionSettings={institutionSettings}
            />
          )}

          {/* PAGE 2: Student Management (Full CRUD + Optional Attributes) */}
          {activeTab === 'students' && (
            <div className="student-mgmt-grid">
              <StudentForm
                onSaveStudent={handleSaveStudent}
                editingStudent={editingStudent}
                onCancelEdit={handleCancelEdit}
                isSubmitting={isSubmitting}
                availableCourses={availableCourses}
              />
              <StudentTable
                students={students}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onEditStudent={handleEditStudent}
                onOpenDeleteModal={handleOpenDeleteModal}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* PAGE 3: Attendance Page (100% Database-Driven) */}
          {activeTab === 'attendance' && (
            <AttendancePage
              students={students}
              onShowAlert={showAlert}
            />
          )}

          {/* PAGE 4: Courses Page (100% Database-Driven CRUD + Safety Guards) */}
          {activeTab === 'courses' && (
            <CoursesPage
              students={students}
              onShowAlert={showAlert}
              onCoursesUpdated={() => {
                loadCourses();
                loadStats();
              }}
            />
          )}

          {/* PAGE 5: Academic Calendar & Events (Dynamic Status) */}
          {activeTab === 'academic' && (
            <AcademicPage
              onShowAlert={showAlert}
            />
          )}

          {/* PAGE 6: Examinations & Grade Cards */}
          {activeTab === 'examinations' && (
            <ExaminationsPage
              students={students}
              onShowAlert={showAlert}
              availableCourses={availableCourses}
            />
          )}

          {/* PAGE 7: Reports Page (100% Database Analytics & Master Roster) */}
          {activeTab === 'reports' && (
            <ReportsPage
              students={students}
              stats={stats}
              institutionSettings={institutionSettings}
            />
          )}

          {/* PAGE 8: Settings Page (Institution Profile & Admin Security) */}
          {activeTab === 'settings' && (
            <SettingsPage
              stats={stats}
              adminUser={adminUser}
              onShowAlert={showAlert}
              institutionSettings={institutionSettings}
              onSettingsUpdated={(updated) => {
                setInstitutionSettings(updated);
              }}
            />
          )}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        student={deletingStudent}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteModal}
        isDeleting={isDeleting}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        onSubmitFeedback={handleSubmitFeedback}
      />
    </div>
  );
}

export default App;
