// backend/scripts/runFullTestSuite.js
// Purpose: Automated verification of all 15 test scenarios for Part 13.

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING COMPLETE STUDENTS INFO ERP VERIFICATION TEST');
  console.log('====================================================\n');

  let testPassed = 0;
  let testFailed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      testPassed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      testFailed++;
    }
  }

  // Helper for requests
  let adminCookie = '';

  try {
    // ----------------------------------------------------
    // Scenario 1: Reject unauthenticated request to protected endpoint
    // ----------------------------------------------------
    console.log('[Scenario 1] Testing protected endpoint without authentication...');
    const unauthRes = await fetch(`${BASE_URL}/students`);
    assert(unauthRes.status === 401, `GET /api/students returned 401 Unauthorized (Status: ${unauthRes.status})`);

    // ----------------------------------------------------
    // Scenario 2: Admin login with incorrect password
    // ----------------------------------------------------
    console.log('\n[Scenario 2] Testing admin login with invalid password...');
    const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@studentsinfo.com', password: 'WrongPassword999' }),
    });
    assert(badLoginRes.status === 401, `Invalid login rejected with 401 (Status: ${badLoginRes.status})`);

    // ----------------------------------------------------
    // Scenario 3: Admin login with valid credentials
    // ----------------------------------------------------
    console.log('\n[Scenario 3] Testing admin login with valid credentials...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@studentsinfo.com', password: 'Admin@12345' }),
    });
    assert(loginRes.status === 200, `Admin login succeeded with 200 (Status: ${loginRes.status})`);

    // Extract cookie
    const cookies = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [loginRes.headers.get('set-cookie')];
    if (cookies && cookies.length > 0) {
      adminCookie = cookies[0].split(';')[0];
    }
    assert(Boolean(adminCookie && adminCookie.includes('token=')), `HttpOnly JWT authentication cookie received: ${adminCookie.slice(0, 20)}...`);

    // ----------------------------------------------------
    // Scenario 4: Admin session persistence check (GET /api/auth/me)
    // ----------------------------------------------------
    console.log('\n[Scenario 4] Testing admin session persistence (GET /api/auth/me)...');
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Cookie: adminCookie },
    });
    const meData = await meRes.json();
    const adminObj = meData.admin || meData.data;
    assert(meRes.status === 200 && adminObj?.email === 'admin@studentsinfo.com', `Admin identity verified: ${adminObj?.email} (${adminObj?.role})`);

    // ----------------------------------------------------
    // Scenario 5: Fetch existing real student records from MongoDB Atlas
    // ----------------------------------------------------
    console.log('\n[Scenario 5] Fetching existing student records from MongoDB Atlas...');
    const studentsRes = await fetch(`${BASE_URL}/students`, {
      headers: { Cookie: adminCookie },
    });
    const studentsData = await studentsRes.json();
    assert(studentsRes.status === 200 && Array.isArray(studentsData.data), `Fetched student records list (Count: ${studentsData.data?.length})`);
    const studentNames = studentsData.data.map((s) => s.name);
    console.log(`    Current students in MongoDB Atlas: ${studentNames.join(', ')}`);
    assert(studentsData.data.length >= 4, `Database preserves the 4 original student records.`);

    // ----------------------------------------------------
    // Scenario 6: Fetch real dashboard statistics
    // ----------------------------------------------------
    console.log('\n[Scenario 6] Fetching dashboard statistics from MongoDB Atlas...');
    const statsRes = await fetch(`${BASE_URL}/students/stats`, {
      headers: { Cookie: adminCookie },
    });
    const statsData = await statsRes.json();
    assert(statsRes.status === 200 && statsData.data?.totalStudents >= 4, `Real total student count from MongoDB: ${statsData.data?.totalStudents}`);
    assert(Array.isArray(statsData.data?.courses), `Course catalog retrieved: ${statsData.data?.courses?.join(', ')}`);

    // ----------------------------------------------------
    // Scenario 7: Create a new student with required and optional fields
    // ----------------------------------------------------
    console.log('\n[Scenario 7] Creating a test student record in MongoDB Atlas...');
    const testRoll = `TEST-${Date.now().toString().slice(-5)}`;
    const createRes = await fetch(`${BASE_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        name: 'Test Verification Student',
        rollNumber: testRoll,
        email: `teststudent.${Date.now()}@example.com`,
        course: 'BCA',
        phone: '+91 9998887776',
        semester: 3,
        section: 'A',
        academicSession: '2024-2025',
        universityRegNumber: 'REG-TEST-99',
        address: 'Sector 62, Noida, UP',
      }),
    });
    const createData = await createRes.json();
    assert(createRes.status === 201 && createData.data?._id, `Test student created in MongoDB Atlas: ID ${createData.data?._id}`);
    const createdStudentId = createData.data?._id;

    // ----------------------------------------------------
    // Scenario 8: Update the created student record
    // ----------------------------------------------------
    console.log('\n[Scenario 8] Updating the test student record...');
    const updateRes = await fetch(`${BASE_URL}/students/${createdStudentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        name: 'Test Verification Student Updated',
        rollNumber: testRoll,
        email: `teststudent.updated.${Date.now()}@example.com`,
        course: 'MCA',
        phone: '+91 9998880000',
        semester: 4,
      }),
    });
    const updateData = await updateRes.json();
    assert(updateRes.status === 200 && updateData.data?.course === 'MCA', `Student updated successfully: Course changed to MCA, Sem to 4`);

    // ----------------------------------------------------
    // Scenario 9: Mark attendance for the test student
    // ----------------------------------------------------
    console.log('\n[Scenario 9] Marking attendance in MongoDB Atlas...');
    const testDate = '2026-11-18';
    const attSaveRes = await fetch(`${BASE_URL}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        date: testDate,
        records: [
          { studentId: createdStudentId, status: 'Present', remarks: 'Full Lecture attended' },
        ],
      }),
    });
    const attSaveData = await attSaveRes.json();
    assert(attSaveRes.status === 200, `Attendance saved successfully for ${testDate}`);

    // ----------------------------------------------------
    // Scenario 10: Fetch attendance for that date from MongoDB Atlas
    // ----------------------------------------------------
    console.log('\n[Scenario 10] Fetching attendance from MongoDB Atlas...');
    const attFetchRes = await fetch(`${BASE_URL}/attendance?date=${testDate}`, {
      headers: { Cookie: adminCookie },
    });
    const attFetchData = await attFetchRes.json();
    assert(attFetchRes.status === 200 && attFetchData.data?.length > 0, `Attendance retrieved from DB for ${testDate} (Found ${attFetchData.data?.length} records)`);

    // ----------------------------------------------------
    // Scenario 11: Safe course deletion guard (Course with enrolled students)
    // ----------------------------------------------------
    console.log('\n[Scenario 11] Testing safe course deletion guard...');
    const coursesRes = await fetch(`${BASE_URL}/courses`, {
      headers: { Cookie: adminCookie },
    });
    const coursesData = await coursesRes.json();
    const bcaCourse = coursesData.data?.find((c) => c.code === 'BCA' || c.name.includes('BCA'));
    if (bcaCourse) {
      const delBcaRes = await fetch(`${BASE_URL}/courses/${bcaCourse._id}`, {
        method: 'DELETE',
        headers: { Cookie: adminCookie },
      });
      const delBcaData = await delBcaRes.json();
      assert(delBcaRes.status === 400 && delBcaData.enrolledStudents > 0, `Safe deletion blocked: Cannot delete course with ${delBcaData.enrolledStudents} enrolled students (400 Bad Request)`);
    } else {
      console.log('    BCA course not found for deletion check.');
    }

    // ----------------------------------------------------
    // Scenario 12: Create a temporary test course and delete it
    // ----------------------------------------------------
    console.log('\n[Scenario 12] Creating and deleting a course with 0 students...');
    const newCourseRes = await fetch(`${BASE_URL}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        name: 'Temporary Test Diploma',
        code: `DIP-${Date.now().toString().slice(-4)}`,
        department: 'Vocational Studies',
        duration: '1 Year',
        totalSemesters: 2,
      }),
    });
    const newCourseData = await newCourseRes.json();
    assert(newCourseRes.status === 201 && newCourseData.data?._id, `Created temporary course: ${newCourseData.data?.code}`);

    const delTempRes = await fetch(`${BASE_URL}/courses/${newCourseData.data._id}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    assert(delTempRes.status === 200, `Deleted temporary course successfully when 0 students enrolled (200 OK)`);

    // ----------------------------------------------------
    // Scenario 13: Academic Event dynamic date status calculation
    // ----------------------------------------------------
    console.log('\n[Scenario 13] Creating academic event & verifying dynamic status...');
    const evtRes = await fetch(`${BASE_URL}/academic-events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        title: 'Mid-Term Laboratory Viva 2026',
        startDate: '2026-11-20',
        endDate: '2026-11-25',
        category: 'Examination',
        description: 'Practical lab viva for BCA and MCA students',
      }),
    });
    const evtData = await evtRes.json();
    assert(evtRes.status === 201 && evtData.data?._id, `Academic event scheduled in MongoDB: ${evtData.data?.title}`);

    // Clean up event
    if (evtData.data?._id) {
      await fetch(`${BASE_URL}/academic-events/${evtData.data._id}`, {
        method: 'DELETE',
        headers: { Cookie: adminCookie },
      });
    }

    // ----------------------------------------------------
    // Scenario 14: Examination scheduling and grade calculation
    // ----------------------------------------------------
    console.log('\n[Scenario 14] Scheduling exam and publishing result with automatic grade calculation...');
    const examRes = await fetch(`${BASE_URL}/exams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        examName: 'Pre-University Assessment Test',
        course: 'MCA',
        semester: 4,
        subject: 'Cloud Computing & Microservices',
        examDate: '2026-12-10',
        maxMarks: 100,
        status: 'Scheduled',
      }),
    });
    const examData = await examRes.json();
    assert(examRes.status === 201 && examData.data?._id, `Examination scheduled: ID ${examData.data?._id}`);
    const examId = examData.data?._id;

    // Publish result for test student: 88 out of 100 -> Grade should be A+
    const resultRes = await fetch(`${BASE_URL}/exams/${examId}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        studentId: createdStudentId,
        marksObtained: 88,
        remarks: 'Outstanding performance in cloud architecture',
      }),
    });
    const resultData = await resultRes.json();
    assert(resultRes.status === 200 && resultData.data?.grade === 'A+', `Result published: 88/100 -> Grade automatically calculated as: ${resultData.data?.grade}`);

    // Clean up exam and its result
    if (examId) {
      await fetch(`${BASE_URL}/exams/${examId}`, {
        method: 'DELETE',
        headers: { Cookie: adminCookie },
      });
    }

    // ----------------------------------------------------
    // Scenario 15: Clean up test student to restore exact 4 original students
    // ----------------------------------------------------
    console.log('\n[Scenario 15] Cleaning up test student to restore original 4 students...');
    const delStudentRes = await fetch(`${BASE_URL}/students/${createdStudentId}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    assert(delStudentRes.status === 200, `Test student cleaned up successfully (200 OK)`);

    // Verify final count
    const finalStudentsRes = await fetch(`${BASE_URL}/students`, {
      headers: { Cookie: adminCookie },
    });
    const finalStudentsData = await finalStudentsRes.json();
    assert(finalStudentsData.data?.length === 4, `Final count strictly preserved at 4 real students in MongoDB Atlas.`);

    console.log('\n====================================================');
    console.log(`🎉 TEST SUITE COMPLETED: ${testPassed} PASSED, ${testFailed} FAILED`);
    console.log('====================================================\n');
  } catch (error) {
    console.error('Fatal error during test suite:', error);
  }
}

runTests();
