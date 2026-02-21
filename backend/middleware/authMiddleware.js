// const jwt = require('jsonwebtoken');
// const asyncHandler = require('express-async-handler');
// const User = require('../models/User');

// const protect = asyncHandler(async (req, res, next) => {
//   let token;

//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//     token = req.headers.authorization.split(' ')[1];
//   }

//   if (!token) {
//     res.status(401);
//     throw new Error('Not authorized, no token');
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.id).select('-password');
//     if (!req.user) {
//       res.status(401);
//       throw new Error('User not found');
//     }
//     next();
//   } catch (error) {
//     res.status(401);
//     throw new Error('Not authorized, token failed');
//   }
// });

// const instructorOnly = (req, res, next) => {
//   if (req.user && req.user.role === 'instructor') {
//     next();
//   } else {
//     res.status(403);
//     throw new Error('Access denied: Instructors only');
//   }
// };

// const studentOnly = (req, res, next) => {
//   if (req.user && req.user.role === 'student') {
//     next();
//   } else {
//     res.status(403);
//     throw new Error('Access denied: Students only');
//   }
// };

// module.exports = { protect, instructorOnly, studentOnly };


const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database directly
    const User = mongoose.model('User');
    const user = await User.collection.findOne({
      _id: new mongoose.Types.ObjectId(decoded.id)
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove password from user object
    delete user.password;
    req.user = user;
    next();

  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed'
    });
  }
};

const instructorOnly = (req, res, next) => {
  if (req.user && req.user.role === 'instructor') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied: Instructors only'
  });
};

const studentOnly = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied: Students only'
  });
};

module.exports = { protect, instructorOnly, studentOnly };