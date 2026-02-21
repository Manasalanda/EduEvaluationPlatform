import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../shared/Navbar';
import API from '../../api/axiosConfig';

const S = {
  page: { background: '#F8FAFC', minHeight: '100vh' },
  container: { maxWidth: 720, margin: '0 auto', padding: '32px 20px' },
  card: { background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  title: { fontSize: 24, fontWeight: 700, color: '#1a1a2e', marginBottom: 24 },
  label: { display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 },
  input: {
    width: '100%', padding: '12px 14px', border: '2px solid #e5e7eb', borderRadius: 10,
    fontSize: 15, outline: 'none', boxSizing: 'border-box', marginBottom: 20,
  },
  textarea: {
    width: '100%', minHeight: 120, padding: '12px 14px', border: '2px solid #e5e7eb',
    borderRadius: 10, fontSize: 15, resize: 'vertical', outline: 'none',
    boxSizing: 'border-box', marginBottom: 20, fontFamily: 'Inter, sans-serif',
  },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  btn: {
    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: '#fff',
    border: 'none', padding: '13px 32px', borderRadius: 10, fontSize: 16,
    fontWeight: 600, cursor: 'pointer', marginTop: 8,
  },
  backBtn: {
    background: 'transparent', color: '#4F46E5', border: '2px solid #4F46E5',
    padding: '11px 24px', borderRadius: 10, fontSize: 15, fontWeight: 600,
    cursor: 'pointer', marginRight: 12,
  },
};

export default function CreateAssignment() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', subject: '', maxScore: 100, dueDate: '', keywords: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.subject || !form.dueDate) {
      return toast.error('Please fill in all required fields');
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
        maxScore: Number(form.maxScore)
      };
      await API.post('/assignments', payload);
      toast.success('Assignment created successfully!');
      navigate('/instructor');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <Navbar />
      <div style={S.container}>
        <div style={S.card}>
          <h1 style={S.title}>Create New Assignment</h1>
          <form onSubmit={handleSubmit}>
            <label style={S.label}>Title *</label>
            <input style={S.input} name="title" placeholder="e.g., Introduction to Machine Learning" value={form.title} onChange={handleChange} />

            <label style={S.label}>Description *</label>
            <textarea style={S.textarea} name="description" placeholder="Describe the assignment requirements..." value={form.description} onChange={handleChange} />

            <div style={S.row}>
              <div>
                <label style={S.label}>Subject *</label>
                <input style={S.input} name="subject" placeholder="Computer Science" value={form.subject} onChange={handleChange} />
              </div>
              <div>
                <label style={S.label}>Max Score</label>
                <input style={S.input} type="number" name="maxScore" min="1" max="1000" value={form.maxScore} onChange={handleChange} />
              </div>
            </div>

            <label style={S.label}>Due Date *</label>
            <input style={S.input} type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />

            <label style={S.label}>Keywords (comma-separated)</label>
            <input style={S.input} name="keywords" placeholder="machine learning, neural network, algorithm" value={form.keywords} onChange={handleChange} />
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: -16, marginBottom: 20 }}>
              Keywords help the AI evaluate whether students covered the required topics.
            </p>

            <div>
              <button type="button" style={S.backBtn} onClick={() => navigate('/instructor')}>← Back</button>
              <button type="submit" style={{ ...S.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                {loading ? 'Creating...' : 'Create Assignment →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}