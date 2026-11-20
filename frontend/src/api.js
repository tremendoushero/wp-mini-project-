// frontend/src/api.js
// Purpose: Native Fetch API service layer connecting to Express backend with HttpOnly cookie credentials.

// Determine backend base URL:
// 1. If VITE_API_URL environment variable is provided (e.g. 'https://my-backend.vercel.app'), use it.
// 2. If VITE_API_URL is '' (same-origin / monorepo deployment on Vercel), use '' so routes call relative '/api/...'.
// 3. Fallback to 'http://localhost:5000' for local development when not defined.
const BACKEND_URL =
  import.meta.env.VITE_API_URL !== undefined
    ? import.meta.env.VITE_API_URL.replace(/\/+$/, '')
    : import.meta.env.PROD
      ? ''
      : 'http://localhost:5000';
const AUTH_URL = `${BACKEND_URL}/api/auth`;
const STUDENTS_URL = `${BACKEND_URL}/api/students`;
const ATTENDANCE_URL = `${BACKEND_URL}/api/attendance`;
const COURSES_URL = `${BACKEND_URL}/api/courses`;
const ACADEMIC_URL = `${BACKEND_URL}/api/academic-events`;
const EXAMS_URL = `${BACKEND_URL}/api/exams`;
const SETTINGS_URL = `${BACKEND_URL}/api/settings`;

// =========================================================================
// 1. AUTHENTICATION APIS (JWT via HttpOnly Cookies)
// =========================================================================

export const loginAPI = async (email, password) => {
  const response = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Login failed.');
  }
  return data;
};

export const checkAuthAPI = async () => {
  const response = await fetch(`${AUTH_URL}/me`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Not authenticated.');
  }
  return data.admin;
};

export const logoutAPI = async () => {
  const response = await fetch(`${AUTH_URL}/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Logout failed.');
  }
  return data;
};

export const updatePasswordAPI = async (currentPassword, newPassword) => {
  const response = await fetch(`${AUTH_URL}/update-password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update password.');
  }
  return data;
};

// =========================================================================
// 2. STUDENT MANAGEMENT APIS
// =========================================================================

export const fetchStudentsAPI = async (searchTerm = '') => {
  const url = searchTerm.trim()
    ? `${STUDENTS_URL}?search=${encodeURIComponent(searchTerm.trim())}`
    : STUDENTS_URL;

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch student records.');
  }
  return data.data;
};

export const fetchStatsAPI = async () => {
  const response = await fetch(`${STUDENTS_URL}/stats`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch statistics.');
  }
  return data.data;
};

export const createStudentAPI = async (studentData) => {
  const response = await fetch(STUDENTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(studentData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to add student.');
  }
  return data;
};

export const updateStudentAPI = async (id, studentData) => {
  const response = await fetch(`${STUDENTS_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(studentData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update student.');
  }
  return data;
};

export const deleteStudentAPI = async (id) => {
  const response = await fetch(`${STUDENTS_URL}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete student.');
  }
  return data;
};

// =========================================================================
// 3. ATTENDANCE APIS
// =========================================================================

export const fetchAttendanceByDateAPI = async (date) => {
  const response = await fetch(`${ATTENDANCE_URL}?date=${encodeURIComponent(date)}`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch attendance for date.');
  }
  return data;
};

export const saveAttendanceAPI = async (date, records) => {
  const response = await fetch(ATTENDANCE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ date, records }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to save attendance.');
  }
  return data;
};

export const fetchStudentAttendanceHistoryAPI = async (studentId) => {
  const response = await fetch(`${ATTENDANCE_URL}/student/${studentId}`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch attendance history.');
  }
  return data;
};

export const fetchAttendanceStatsAPI = async () => {
  const response = await fetch(`${ATTENDANCE_URL}/stats`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch attendance statistics.');
  }
  return data.data;
};

// =========================================================================
// 4. COURSE MANAGEMENT APIS
// =========================================================================

export const fetchCoursesAPI = async (searchTerm = '') => {
  const url = searchTerm.trim()
    ? `${COURSES_URL}?search=${encodeURIComponent(searchTerm.trim())}`
    : COURSES_URL;

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch courses.');
  }
  return data.data;
};

export const createCourseAPI = async (courseData) => {
  const response = await fetch(COURSES_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(courseData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to add course.');
  }
  return data;
};

export const updateCourseAPI = async (id, courseData) => {
  const response = await fetch(`${COURSES_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(courseData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update course.');
  }
  return data;
};

export const deleteCourseAPI = async (id) => {
  const response = await fetch(`${COURSES_URL}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete course.');
  }
  return data;
};

// =========================================================================
// 5. ACADEMIC EVENTS APIS
// =========================================================================

export const fetchAcademicEventsAPI = async () => {
  const response = await fetch(ACADEMIC_URL, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch academic calendar.');
  }
  return data.data;
};

export const createAcademicEventAPI = async (eventData) => {
  const response = await fetch(ACADEMIC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(eventData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create academic event.');
  }
  return data;
};

export const updateAcademicEventAPI = async (id, eventData) => {
  const response = await fetch(`${ACADEMIC_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(eventData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update academic event.');
  }
  return data;
};

export const deleteAcademicEventAPI = async (id) => {
  const response = await fetch(`${ACADEMIC_URL}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete academic event.');
  }
  return data;
};

// =========================================================================
// 6. EXAMINATIONS & RESULTS APIS
// =========================================================================

export const fetchExamsAPI = async () => {
  const response = await fetch(EXAMS_URL, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch examination schedule.');
  }
  return data.data;
};

export const createExamAPI = async (examData) => {
  const response = await fetch(EXAMS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(examData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to schedule examination.');
  }
  return data;
};

export const updateExamAPI = async (id, examData) => {
  const response = await fetch(`${EXAMS_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(examData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update examination.');
  }
  return data;
};

export const deleteExamAPI = async (id) => {
  const response = await fetch(`${EXAMS_URL}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete examination.');
  }
  return data;
};

export const fetchExamResultsAPI = async (examId) => {
  const response = await fetch(`${EXAMS_URL}/${examId}/results`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch exam results.');
  }
  return data;
};

export const publishExamResultAPI = async (examId, resultData) => {
  const response = await fetch(`${EXAMS_URL}/${examId}/results`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(resultData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to publish result.');
  }
  return data;
};

export const fetchStudentResultsAPI = async (studentId) => {
  const response = await fetch(`${EXAMS_URL}/student/${studentId}/results`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch student results.');
  }
  return data;
};

// =========================================================================
// 7. INSTITUTION PROFILE SETTINGS APIS
// =========================================================================

export const fetchSettingsAPI = async () => {
  const response = await fetch(SETTINGS_URL, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch settings.');
  }
  return data.data;
};

export const updateSettingsAPI = async (settingsData) => {
  const response = await fetch(SETTINGS_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(settingsData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update settings.');
  }
  return data;
};
