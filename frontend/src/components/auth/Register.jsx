import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const S = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: 20,
  },
  card: {
    background: '#fff', borderRadius: 20, padding: 40,
    width: '100%', maxWidth: 420,
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  title: {
    fontSize: 28, fontWeight: 700,
    color: '#1a1a2e', marginBottom: 8, textAlign: 'center'
  },
  subtitle: {
    color: '#666', textAlign: 'center', marginBottom: 32
  },
  label: {
    display: 'block', fontSize: 14,
    fontWeight: 600, color: '#374151', marginBottom: 6
  },
  input: {
    width: '100%', padding: '12px 16px',
    border: '2px solid #e5e7eb', borderRadius: 10,
    fontSize: 15, outline: 'none',
    boxSizing: 'border-box', marginBottom: 20,
    fontFamily: 'Inter, sans-serif'
  },
  select: {
    width: '100%', padding: '12px 16px',
    border: '2px solid #e5e7eb', borderRadius: 10,
    fontSize: 15, outline: 'none',
    boxSizing: 'border-box', marginBottom: 20,
    background: '#fff', cursor: 'pointer',
    fontFamily: 'Inter, sans-serif'
  },
  btn: {
    width: '100%', padding: '13px',
    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
    color: '#fff', border: 'none', borderRadius: 10,
    fontSize: 16, fontWeight: 600,
    cursor: 'pointer', marginTop: 4,
  },
  footer: {
    textAlign: 'center', marginTop: 24,
    fontSize: 14, color: '#666'
  },
  link: {
    color: '#4F46E5', fontWeight: 600, textDecoration: 'none'
  },
};

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.name.trim()) {
      return toast.error('Please enter your name');
    }
    if (!form.email.trim()) {
      return toast.error('Please enter your email');
    }
    if (!form.password.trim()) {
      return toast.error('Please enter your password');
    }
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);

    try {
      const user = await register(
        form.name,
        form.email,
        form.password,
        form.role
      );
      toast.success(`Welcome, ${user.name}! Account created successfully.`);
      if (user.role === 'instructor') {
        navigate('/instructor');
      } else {
        navigate('/student');
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <h1 style={S.title}>Create Account</h1>
        <p style={S.subtitle}>Join EduEval Platform today</p>

        <form onSubmit={handleSubmit}>
          <label style={S.label}>Full Name</label>
          <input
            style={S.input}
            type="text"
            name="name"
            placeholder="John Doe"
            value={form.name}
            onChange={handleChange}
            disabled={loading}
          />

          <label style={S.label}>Email Address</label>
          <input
            style={S.input}
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            disabled={loading}
          />

          <label style={S.label}>Password</label>
          <input
            style={S.input}
            type="password"
            name="password"
            placeholder="Minimum 6 characters"
            value={form.password}
            onChange={handleChange}
            disabled={loading}
          />

          <label style={S.label}>I am a...</label>
          <select
            style={S.select}
            name="role"
            value={form.role}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
          </select>

          <button
            type="submit"
            style={{
              ...S.btn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account →'}
          </button>
        </form>

        <p style={S.footer}>
          Already have an account?{' '}
          <Link to="/login" style={S.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}