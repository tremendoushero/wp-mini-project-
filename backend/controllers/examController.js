// backend/controllers/examController.js
// Purpose: Handles Examination schedules and published student Results/Grades.

const Examination = require('../models/Examination');
const Result = require('../models/Result');
const Student = require('../models/Student');

// 1. GET ALL EXAMINATIONS (GET /api/exams)
const getAllExams = async (req, res) => {
  try {
    const exams = await Examination.find({}).sort({ examDate: 1 });

    // Also attach result submission count to each exam
    const examsWithResultCounts = await Promise.all(
      exams.map(async (exam) => {
        const publishedResultsCount = await Result.countDocuments({ examination: exam._id });
        return {
          ...exam.toObject(),
          publishedResultsCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: examsWithResultCounts.length,
      data: examsWithResultCounts,
    });
  } catch (error) {
    console.error('Error fetching exams:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving examination schedules.',
      error: error.message,
    });
  }
};

// 2. ADD EXAMINATION (POST /api/exams)
const addExam = async (req, res) => {
  try {
    const { examName, course, semester, subject, examDate, startTime, endTime, maxMarks, status } = req.body;

    if (!examName || !course || !semester || !subject || !examDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide exam name, course, semester, subject, and exam date.',
      });
    }

    const newExam = await Examination.create({
      examName: String(examName).trim(),
      course: String(course).trim(),
      semester: String(semester).trim(),
      subject: String(subject).trim(),
      examDate: String(examDate).trim(),
      startTime: startTime ? String(startTime).trim() : '10:00 AM',
      endTime: endTime ? String(endTime).trim() : '01:00 PM',
      maxMarks: maxMarks ? Number(maxMarks) : 100,
      status: status || 'Scheduled',
    });

    return res.status(201).json({
      success: true,
      message: 'Examination scheduled successfully!',
      data: newExam,
    });
  } catch (error) {
    console.error('Error adding examination:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while scheduling examination.',
      error: error.message,
    });
  }
};

// 3. UPDATE EXAMINATION (PUT /api/exams/:id)
const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { examName, course, semester, subject, examDate, startTime, endTime, maxMarks, status } = req.body;

    const exam = await Examination.findById(id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Examination not found.',
      });
    }

    if (examName) exam.examName = String(examName).trim();
    if (course) exam.course = String(course).trim();
    if (semester) exam.semester = String(semester).trim();
    if (subject) exam.subject = String(subject).trim();
    if (examDate) exam.examDate = String(examDate).trim();
    if (startTime) exam.startTime = String(startTime).trim();
    if (endTime) exam.endTime = String(endTime).trim();
    if (maxMarks) exam.maxMarks = Number(maxMarks);
    if (status) exam.status = status;

    const updated = await exam.save();

    return res.status(200).json({
      success: true,
      message: 'Examination updated successfully!',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating examination:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating examination.',
      error: error.message,
    });
  }
};

// 4. DELETE EXAMINATION (DELETE /api/exams/:id)
const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Examination.findByIdAndDelete(id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Examination not found or already deleted.',
      });
    }

    // Also delete any published results for this exam
    await Result.deleteMany({ examination: id });

    return res.status(200).json({
      success: true,
      message: `Examination "${exam.subject}" deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting examination:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting examination.',
      error: error.message,
    });
  }
};

// 5. GET RESULTS FOR AN EXAMINATION (GET /api/exams/:id/results)
const getExamResults = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Examination.findById(id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Examination not found.',
      });
    }

    const results = await Result.find({ examination: id }).populate('student', 'name rollNumber course email');

    return res.status(200).json({
      success: true,
      exam,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error('Error fetching exam results:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving exam results.',
      error: error.message,
    });
  }
};

// 6. PUBLISH / UPSERT EXAM RESULT (POST /api/exams/:id/results)
const publishExamResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, marksObtained, remarks, status } = req.body;

    if (!studentId || marksObtained === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide studentId and marksObtained.',
      });
    }

    const exam = await Examination.findById(id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Examination record not found.',
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.',
      });
    }

    const numericMarks = Number(marksObtained);
    if (numericMarks < 0 || numericMarks > exam.maxMarks) {
      return res.status(400).json({
        success: false,
        message: `Marks must be between 0 and maximum marks (${exam.maxMarks}).`,
      });
    }

    // Auto-calculate grade and pass status
    const grade = Result.calculateGrade(numericMarks, exam.maxMarks);
    const passStatus = status || (grade === 'F' ? 'Fail' : 'Pass');

    // Upsert to prevent duplicate results for the same examination and student
    const result = await Result.findOneAndUpdate(
      { examination: id, student: studentId },
      {
        examination: id,
        student: studentId,
        marksObtained: numericMarks,
        grade,
        status: passStatus,
        remarks: remarks ? remarks.trim() : '',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('student', 'name rollNumber course');

    return res.status(200).json({
      success: true,
      message: `Result published successfully for ${student.name} (Grade: ${grade})`,
      data: result,
    });
  } catch (error) {
    console.error('Error publishing result:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while publishing result.',
      error: error.message,
    });
  }
};

// 7. GET RESULTS FOR A SPECIFIC STUDENT (GET /api/exams/student/:studentId/results)
const getStudentResults = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    const results = await Result.find({ student: studentId })
      .populate('examination', 'examName subject course semester examDate maxMarks')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        course: student.course,
      },
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error('Error fetching student results:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving student results.',
      error: error.message,
    });
  }
};

module.exports = {
  getAllExams,
  addExam,
  updateExam,
  deleteExam,
  getExamResults,
  publishExamResult,
  getStudentResults,
};
