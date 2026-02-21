import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const S = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    background: '#fff',
    borderRadius: 20,
    padding: 40,
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  title: { fontSize: 28, fontWeight: 700, color: '#1a1a2e', marginBottom: 8, textAlign: 'center' },
  subtitle: { color: '#666', textAlign: 'center', marginBottom: 32, fontSize: 15 },
  label: { display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: 10,
    fontSize: 15,
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    marginBottom: 20,
  },
  btn: {
    width: '100%',
    padding: '13px',
    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 4,
    transition: 'opacity 0.2s',
  },
  footer: { textAlign: 'center', marginTop: 24, fontSize: 14, color: '#666' },
  link: { color: '#4F46E5', fontWeight: 600, textDecoration: 'none' },
  demoBox: {
    background: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
    fontSize: 13,
  },
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'instructor' ? '/instructor' : '/student');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <h1 style={S.title}>Welcome Back</h1>
        <p style={S.subtitle}>Sign in to your EduEval account</p>

        <div style={S.demoBox}>
          <strong>🧪 Demo Accounts:</strong><br />
          Instructor: instructor@demo.com / Demo@1234<br />
          Student: student@demo.com / Demo@1234
        </div>

        <form onSubmit={handleSubmit}>
          <label style={S.label}>Email Address</label>
          <input
            style={S.input}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <label style={S.label}>Password</label>
          <input
            style={S.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button style={{ ...S.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>
        <p style={S.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={S.link}>Create one</Link>
        </p>
      </div>
    </div>
  );
}