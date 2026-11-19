// backend/controllers/studentController.js
// Purpose: Full CRUD operations for Student records and real MongoDB Atlas dashboard analytics.

const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Course = require('../models/Course');

// ========================================================
// 1. ADD STUDENT (POST /api/students)
// Creates a new student record in MongoDB Atlas
// ========================================================
const addStudent = async (req, res) => {
  try {
    const {
      name,
      rollNumber,
      email,
      course,
      phone,
      dateOfBirth,
      gender,
      address,
      section,
      semester,
      academicSession,
      universityRegNumber,
      profilePhoto,
    } = req.body;

    // Required fields validation
    if (!name || !rollNumber || !email || !course) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields (name, roll number, email, and course).',
      });
    }

    // Email format validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    // Check if roll number already exists
    const existingStudent = await Student.findOne({
      rollNumber: rollNumber.trim().toUpperCase(),
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: `Student with roll number "${rollNumber.toUpperCase()}" already exists.`,
      });
    }

    // Create and save new student document
    const newStudent = await Student.create({
      name: String(name).trim(),
      rollNumber: String(rollNumber).trim().toUpperCase(),
      email: String(email).trim().toLowerCase(),
      course: String(course).trim(),
      phone: phone !== undefined && phone !== null ? String(phone).trim() : '',
      dateOfBirth: dateOfBirth !== undefined && dateOfBirth !== null ? String(dateOfBirth).trim() : '',
      gender: gender || 'Not Specified',
      address: address !== undefined && address !== null ? String(address).trim() : '',
      section: section !== undefined && section !== null ? String(section).trim() : '',
      semester: semester !== undefined && semester !== null ? String(semester).trim() : '',
      academicSession: academicSession !== undefined && academicSession !== null ? String(academicSession).trim() : '',
      universityRegNumber: universityRegNumber !== undefined && universityRegNumber !== null ? String(universityRegNumber).trim() : '',
      profilePhoto: profilePhoto !== undefined && profilePhoto !== null ? String(profilePhoto).trim() : '',
    });

    return res.status(201).json({
      success: true,
      message: 'Student registered successfully!',
      data: newStudent,
    });
  } catch (error) {
    console.error('Error adding student:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while adding student.',
      error: error.message,
    });
  }
};

// ========================================================
// 2. GET ALL STUDENTS & SEARCH (GET /api/students)
// ========================================================
const getAllStudents = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query = {
        $or: [
          { name: searchRegex },
          { rollNumber: searchRegex },
          { course: searchRegex },
          { email: searchRegex },
          { section: searchRegex },
          { semester: searchRegex },
        ],
      };
    }

    const students = await Student.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error('Error fetching students:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching students.',
      error: error.message,
    });
  }
};

// ========================================================
// 3. GET DASHBOARD STATISTICS (GET /api/students/stats)
// Database-driven metrics from Student, Course, and Attendance collections
// ========================================================
const getStudentStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();

    // Distinct enrolled courses from students
    const distinctStudentCourses = await Student.distinct('course');

    // Total defined course programs in MongoDB
    const totalDefinedCourses = await Course.countDocuments({ status: 'Active' });
    const totalCourses = totalDefinedCourses > 0 ? totalDefinedCourses : distinctStudentCourses.length;

    // Real Attendance Calculation from Attendance collection in MongoDB Atlas
    const totalAttendanceRecords = await Attendance.countDocuments();
    const presentRecords = await Attendance.countDocuments({ status: 'Present' });
    const attendanceRate = totalAttendanceRecords > 0
      ? Number(((presentRecords / totalAttendanceRecords) * 100).toFixed(1))
      : null;

    return res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalCourses,
        courses: distinctStudentCourses,
        attendanceRate,
        totalAttendanceRecords,
        presentRecords,
      },
    });
  } catch (error) {
    console.error('Error fetching statistics:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics.',
      error: error.message,
    });
  }
};

// ========================================================
// 4. GET SINGLE STUDENT (GET /api/students/:id)
// ========================================================
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found with the provided ID.',
      });
    }

    return res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error('Error fetching student by ID:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error or invalid student ID format.',
      error: error.message,
    });
  }
};

// ========================================================
// 5. UPDATE STUDENT (PUT /api/students/:id)
// ========================================================
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      rollNumber,
      email,
      course,
      phone,
      dateOfBirth,
      gender,
      address,
      section,
      semester,
      academicSession,
      universityRegNumber,
      profilePhoto,
    } = req.body;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.',
      });
    }

    // Uniqueness check if roll number is changed
    if (rollNumber && rollNumber.trim().toUpperCase() !== student.rollNumber) {
      const duplicate = await Student.findOne({
        rollNumber: rollNumber.trim().toUpperCase(),
        _id: { $ne: id },
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Roll number "${rollNumber.toUpperCase()}" is already assigned to another student.`,
        });
      }
    }

    // Update fields
    if (name !== undefined) student.name = String(name).trim();
    if (rollNumber !== undefined) student.rollNumber = String(rollNumber).trim().toUpperCase();
    if (email !== undefined) student.email = String(email).trim().toLowerCase();
    if (course !== undefined) student.course = String(course).trim();
    if (phone !== undefined) student.phone = String(phone).trim();
    if (dateOfBirth !== undefined) student.dateOfBirth = String(dateOfBirth).trim();
    if (gender !== undefined) student.gender = gender;
    if (address !== undefined) student.address = String(address).trim();
    if (section !== undefined) student.section = String(section).trim();
    if (semester !== undefined) student.semester = String(semester).trim();
    if (academicSession !== undefined) student.academicSession = String(academicSession).trim();
    if (universityRegNumber !== undefined) student.universityRegNumber = String(universityRegNumber).trim();
    if (profilePhoto !== undefined) student.profilePhoto = String(profilePhoto).trim();

    const updatedStudent = await student.save();

    return res.status(200).json({
      success: true,
      message: 'Student record updated successfully!',
      data: updatedStudent,
    });
  } catch (error) {
    console.error('Error updating student:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating student.',
      error: error.message,
    });
  }
};

// ========================================================
// 6. DELETE STUDENT (DELETE /api/students/:id)
// ========================================================
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedStudent = await Student.findByIdAndDelete(id);

    if (!deletedStudent) {
      return res.status(404).json({
        success: false,
        message: 'Student not found or already deleted.',
      });
    }

    // Also clean up any associated attendance and exam results for this student
    await Attendance.deleteMany({ student: id });

    return res.status(200).json({
      success: true,
      message: `Student "${deletedStudent.name}" deleted successfully.`,
      data: deletedStudent,
    });
  } catch (error) {
    console.error('Error deleting student:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting student.',
      error: error.message,
    });
  }
};

module.exports = {
  addStudent,
  getAllStudents,
  getStudentStats,
  getStudentById,
  updateStudent,
  deleteStudent,
};
