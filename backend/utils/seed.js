const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Assignment = require('../models/Assignment');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await User.deleteMany({});
    await Assignment.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Hash password manually - bypass pre-save hook
    const hashedPassword = await bcrypt.hash('Demo@1234', 12);

    const instructorResult = await User.collection.insertOne({
      name: 'Dr. Smith',
      email: 'instructor@demo.com',
      password: hashedPassword,
      role: 'instructor',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('👨‍🏫 Instructor created');

    await User.collection.insertOne({
      name: 'Alice Johnson',
      email: 'student@demo.com',
      password: hashedPassword,
      role: 'student',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('👨‍🎓 Student created');

    const instructorId = instructorResult.insertedId;

    await Assignment.collection.insertMany([
      {
        title: 'Introduction to Machine Learning',
        description: 'Write a 500-word essay explaining the fundamentals of machine learning including supervised and unsupervised learning.',
        subject: 'Computer Science',
        maxScore: 100,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        instructor: instructorId,
        keywords: ['machine learning', 'supervised', 'unsupervised', 'neural network', 'algorithm'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Data Structures and Algorithms',
        description: 'Explain time complexity using Big O notation with real-world examples.',
        subject: 'Computer Science',
        maxScore: 100,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        instructor: instructorId,
        keywords: ['big o', 'complexity', 'sorting', 'searching', 'optimization'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Web Development Basics',
        description: 'Describe the difference between frontend and backend development with examples.',
        subject: 'Web Technology',
        maxScore: 100,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        instructor: instructorId,
        keywords: ['frontend', 'backend', 'html', 'css', 'javascript', 'api'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    console.log('📝 Assignments created');

    console.log('\n✅ Seed completed successfully!');
    console.log('─────────────────────────────────────');
    console.log('👨‍🏫 Instructor: instructor@demo.com / Demo@1234');
    console.log('👨‍🎓 Student:    student@demo.com / Demo@1234');
    console.log('─────────────────────────────────────');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seed error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seed();