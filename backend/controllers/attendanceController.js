// backend/controllers/attendanceController.js
// Purpose: Handles real database-driven Attendance operations with upsert and duplicate prevention.

const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// 1. GET ATTENDANCE FOR A DATE (GET /api/attendance?date=YYYY-MM-DD)
const getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid date parameter (YYYY-MM-DD).',
      });
    }

    const records = await Attendance.find({ date }).populate('student', 'name rollNumber course email');

    // Also calculate summary for this date
    const totalRecords = records.length;
    const presentCount = records.filter((r) => r.status === 'Present').length;
    const absentCount = records.filter((r) => r.status === 'Absent').length;
    const percentage = totalRecords > 0 ? Number(((presentCount / totalRecords) * 100).toFixed(1)) : 0;

    return res.status(200).json({
      success: true,
      date,
      count: totalRecords,
      summary: {
        totalRecords,
        presentCount,
        absentCount,
        percentage,
      },
      data: records,
    });
  } catch (error) {
    console.error('Error fetching attendance by date:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving attendance records.',
      error: error.message,
    });
  }
};

// 2. SAVE OR UPDATE DAILY ATTENDANCE (POST /api/attendance)
// Upserts attendance records to prevent duplicates and allow authorized corrections
const saveAttendance = async (req, res) => {
  try {
    const { date, records } = req.body;

    if (!date || !records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid date and an array of student attendance records.',
      });
    }

    // Prepare bulk upsert operations to prevent duplicate entries
    const bulkOps = records.map((record) => ({
      updateOne: {
        filter: { student: record.studentId, date: date.trim() },
        update: {
          $set: {
            student: record.studentId,
            date: date.trim(),
            status: record.status || 'Present',
            remarks: record.remarks ? record.remarks.trim() : '',
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(bulkOps);

    return res.status(200).json({
      success: true,
      message: `Successfully saved attendance for ${records.length} students on ${date}.`,
    });
  } catch (error) {
    console.error('Error saving attendance:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error saving attendance records.',
      error: error.message,
    });
  }
};

// 3. GET ATTENDANCE HISTORY FOR A SPECIFIC STUDENT (GET /api/attendance/student/:studentId)
const getStudentAttendanceHistory = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.',
      });
    }

    const records = await Attendance.find({ student: studentId }).sort({ date: -1 });
    const totalSessions = records.length;
    const presentSessions = records.filter((r) => r.status === 'Present').length;
    const percentage = totalSessions > 0 ? Number(((presentSessions / totalSessions) * 100).toFixed(1)) : null;

    return res.status(200).json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        course: student.course,
      },
      stats: {
        totalSessions,
        presentSessions,
        absentSessions: totalSessions - presentSessions,
        percentage,
      },
      history: records,
    });
  } catch (error) {
    console.error('Error fetching student attendance history:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving student attendance history.',
      error: error.message,
    });
  }
};

// 4. GET OVERALL ATTENDANCE STATS & MONTHLY BREAKDOWN (GET /api/attendance/stats)
const getAttendanceStats = async (req, res) => {
  try {
    const totalRecords = await Attendance.countDocuments();
    const presentRecords = await Attendance.countDocuments({ status: 'Present' });
    const overallRate = totalRecords > 0 ? Number(((presentRecords / totalRecords) * 100).toFixed(1)) : null;

    // Aggregate real monthly stats from MongoDB
    const monthlyAggregation = await Attendance.aggregate([
      {
        $group: {
          _id: { $substr: ['$date', 0, 7] }, // YYYY-MM
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthlyStats = monthlyAggregation.map((m) => ({
      month: m._id,
      total: m.total,
      present: m.present,
      percentage: Number(((m.present / m.total) * 100).toFixed(1)),
    }));

    return res.status(200).json({
      success: true,
      data: {
        totalRecords,
        presentRecords,
        overallRate,
        monthlyStats,
      },
    });
  } catch (error) {
    console.error('Error fetching attendance stats:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error calculating attendance statistics.',
      error: error.message,
    });
  }
};

module.exports = {
  getAttendanceByDate,
  saveAttendance,
  getStudentAttendanceHistory,
  getAttendanceStats,
};
