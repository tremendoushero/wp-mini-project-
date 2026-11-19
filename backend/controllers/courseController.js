// backend/controllers/courseController.js
// Purpose: Full CRUD for academic courses with safe deletion and real enrolled student counts.

const Course = require('../models/Course');
const Student = require('../models/Student');

// 1. GET ALL COURSES WITH REAL ENROLLED STUDENT COUNTS (GET /api/courses)
const getAllCourses = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query = {
        $or: [
          { name: searchRegex },
          { code: searchRegex },
          { department: searchRegex },
        ],
      };
    }

    const courses = await Course.find(query).sort({ code: 1 });

    // Aggregate enrolled student count for each course from Student collection
    const coursesWithCounts = await Promise.all(
      courses.map(async (course) => {
        // Match either by course name or course code
        const enrolledStudents = await Student.countDocuments({
          $or: [{ course: course.name }, { course: course.code }],
        });

        return {
          ...course.toObject(),
          enrolledStudents,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: coursesWithCounts.length,
      data: coursesWithCounts,
    });
  } catch (error) {
    console.error('Error fetching courses:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving course curriculum.',
      error: error.message,
    });
  }
};

// 2. ADD A NEW COURSE (POST /api/courses)
const addCourse = async (req, res) => {
  try {
    const { name, code, department, duration, totalSemesters, description, status } = req.body;

    if (!name || !code || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide required fields: Course Name, Course Code, and Department.',
      });
    }

    // Check for duplicate course name or code
    const existing = await Course.findOne({
      $or: [
        { name: name.trim() },
        { code: code.trim().toUpperCase() },
      ],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A course with name "${name}" or code "${code.toUpperCase()}" already exists.`,
      });
    }

    const newCourse = await Course.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      department: department.trim(),
      duration: duration ? duration.trim() : '3 Years',
      totalSemesters: totalSemesters ? Number(totalSemesters) : 6,
      description: description ? description.trim() : '',
      status: status || 'Active',
    });

    return res.status(201).json({
      success: true,
      message: 'Course created successfully!',
      data: newCourse,
    });
  } catch (error) {
    console.error('Error adding course:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating course.',
      error: error.message,
    });
  }
};

// 3. UPDATE COURSE (PUT /api/courses/:id)
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, department, duration, totalSemesters, description, status } = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course record not found.',
      });
    }

    // Check duplicate code if changed
    if (code && code.trim().toUpperCase() !== course.code) {
      const duplicate = await Course.findOne({
        code: code.trim().toUpperCase(),
        _id: { $ne: id },
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Course code "${code.toUpperCase()}" is already assigned to another program.`,
        });
      }
      course.code = code.trim().toUpperCase();
    }

    if (name) course.name = name.trim();
    if (department) course.department = department.trim();
    if (duration) course.duration = duration.trim();
    if (totalSemesters !== undefined) course.totalSemesters = Number(totalSemesters);
    if (description !== undefined) course.description = description.trim();
    if (status) course.status = status;

    const updated = await course.save();

    return res.status(200).json({
      success: true,
      message: 'Course updated successfully!',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating course:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating course.',
      error: error.message,
    });
  }
};

// 4. SAFE DELETE COURSE (DELETE /api/courses/:id)
// Requirement: Prevent deleting courses that are still assigned to students
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or already deleted.',
      });
    }

    // Check if any student in MongoDB is enrolled in this course
    const enrolledStudentsCount = await Student.countDocuments({
      $or: [{ course: course.name }, { course: course.code }],
    });

    if (enrolledStudentsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete course "${course.name}" because ${enrolledStudentsCount} student(s) are currently enrolled. Reassign them first.`,
        enrolledStudents: enrolledStudentsCount,
      });
    }

    await Course.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `Course "${course.name}" deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting course:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting course.',
      error: error.message,
    });
  }
};

module.exports = {
  getAllCourses,
  addCourse,
  updateCourse,
  deleteCourse,
};
