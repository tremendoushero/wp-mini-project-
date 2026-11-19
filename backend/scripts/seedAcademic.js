// backend/scripts/seedAcademic.js
// Purpose: Seeds dynamic academic events and sample examinations in MongoDB Atlas.

const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const AcademicEvent = require('../models/AcademicEvent');
const Examination = require('../models/Examination');
const connectDB = require('../config/db');

const seedEventsAndExams = async () => {
  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    await connectDB();

    // 1. Seed Academic Events if none exist
    const eventCount = await AcademicEvent.countDocuments();
    if (eventCount === 0) {
      await AcademicEvent.create([
        {
          title: 'Commencement of Academic Session Classes',
          startDate: '2026-08-01',
          endDate: '2026-08-05',
          category: 'Academic',
          description: 'Orientation and class commencement for enrolled degree programs.',
        },
        {
          title: 'Mid-Term Sessional Examination (MST-I)',
          startDate: '2026-10-10',
          endDate: '2026-10-15',
          category: 'Examination',
          description: 'Internal continuous assessment examination.',
        },
        {
          title: 'Annual Technical Symposium & Hackathon',
          startDate: '2026-11-20',
          endDate: '2026-11-21',
          category: 'Cultural',
          description: 'Inter-departmental programming and technical project competition.',
        },
        {
          title: 'University End-Semester Final Examination',
          startDate: '2026-12-10',
          endDate: '2026-12-24',
          category: 'Examination',
          description: 'Final theoretical and laboratory evaluation session.',
        },
      ]);
      console.log('✅ Seeded 4 initial Academic Events!');
    } else {
      console.log(`ℹ️  Academic events already exist (${eventCount}).`);
    }

    // 2. Seed Examinations if none exist
    const examCount = await Examination.countDocuments();
    if (examCount === 0) {
      await Examination.create([
        {
          examName: 'End-Term Examination 2026',
          course: 'BCA',
          semester: '5th Semester',
          subject: 'Web Programming & MERN Stack',
          examDate: '2026-12-12',
          startTime: '10:00 AM',
          endTime: '01:00 PM',
          maxMarks: 100,
          status: 'Scheduled',
        },
        {
          examName: 'End-Term Examination 2026',
          course: 'BCA',
          semester: '5th Semester',
          subject: 'Database Management Systems & NoSQL',
          examDate: '2026-12-15',
          startTime: '10:00 AM',
          endTime: '01:00 PM',
          maxMarks: 100,
          status: 'Scheduled',
        },
      ]);
      console.log('✅ Seeded 2 initial Examinations!');
    } else {
      console.log(`ℹ️  Examinations already exist (${examCount}).`);
    }

    console.log('🎉 Academic & Exam seeding complete!');
  } catch (err) {
    console.error('Error seeding events/exams:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedEventsAndExams();
