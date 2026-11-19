// backend/scripts/seedCourses.js
// Purpose: Seeds standard degree programs/courses into MongoDB Atlas if they do not exist.

const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Course = require('../models/Course');
const connectDB = require('../config/db');

const initialCourses = [
  {
    name: 'BCA (Bachelor of Computer Applications)',
    code: 'BCA',
    department: 'Department of Computer Applications',
    duration: '3 Years',
    totalSemesters: 6,
    description: 'Undergraduate program in computer applications and software engineering.',
    status: 'Active',
  },
  {
    name: 'B.Tech - Computer Science & Engineering',
    code: 'B.Tech CS',
    department: 'Department of Computer Science',
    duration: '4 Years',
    totalSemesters: 8,
    description: 'Engineering program covering computer architecture, algorithms, and AI.',
    status: 'Active',
  },
  {
    name: 'B.Tech - Information Technology',
    code: 'B.Tech IT',
    department: 'Department of Information Technology',
    duration: '4 Years',
    totalSemesters: 8,
    description: 'Technical program focusing on network architecture, cloud, and security.',
    status: 'Active',
  },
  {
    name: 'MCA (Master of Computer Applications)',
    code: 'MCA',
    department: 'Department of Computer Applications',
    duration: '2 Years',
    totalSemesters: 4,
    description: 'Postgraduate advanced degree in software development and computing.',
    status: 'Active',
  },
  {
    name: 'B.Sc - Computer Science',
    code: 'B.Sc CS',
    department: 'Department of Science',
    duration: '3 Years',
    totalSemesters: 6,
    description: 'Bachelor of Science program in computational mathematics and programming.',
    status: 'Active',
  },
  {
    name: 'Bachelor of Business Administration (BBA)',
    code: 'BBA',
    department: 'Department of Management',
    duration: '3 Years',
    totalSemesters: 6,
    description: 'Undergraduate business management and enterprise administration program.',
    status: 'Active',
  },
];

const seedCourses = async () => {
  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    await connectDB();

    for (const c of initialCourses) {
      const existing = await Course.findOne({
        $or: [{ code: c.code }, { name: c.name }],
      });

      if (!existing) {
        await Course.create(c);
        console.log(`✅ Seeded Course: ${c.name} (${c.code})`);
      } else {
        console.log(`ℹ️  Course already exists: ${c.code}`);
      }
    }

    console.log('🎉 Course seeding complete!');
  } catch (err) {
    console.error('Error seeding courses:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedCourses();
