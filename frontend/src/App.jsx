import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import StudentDashboard from './components/student/StudentDashboard';
import InstructorDashboard from './components/instructor/InstructorDashboard';
import SubmitAssignment from './components/student/SubmitAssignment';
import CreateAssignment from './components/instructor/CreateAssignment';
import ReviewSubmission from './components/instructor/ReviewSubmission';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student routes */}
          <Route path="/student" element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/submit/:assignmentId" element={
            <ProtectedRoute role="student">
              <SubmitAssignment />
            </ProtectedRoute>
          } />

          {/* Instructor routes */}
          <Route path="/instructor" element={
            <ProtectedRoute role="instructor">
              <InstructorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/instructor/create" element={
            <ProtectedRoute role="instructor">
              <CreateAssignment />
            </ProtectedRoute>
          } />
          <Route path="/instructor/review/:submissionId" element={
            <ProtectedRoute role="instructor">
              <ReviewSubmission />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
