import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../shared/Navbar';
import API from '../../api/axiosConfig';

const S = {
  page: { background: '#F8FAFC', minHeight: '100vh' },
  container: { maxWidth: 720, margin: '0 auto', padding: '32px 20px' },
  card: { background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  title: { fontSize: 24, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 },
  desc: { color: '#64748b', fontSize: 15, marginBottom: 24, lineHeight: 1.6 },
  label: { display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 },
  textarea: {
    width: '100%', minHeight: 280, padding: '14px', border: '2px solid #e5e7eb',
    borderRadius: 10, fontSize: 15, lineHeight: 1.6, resize: 'vertical',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif',
  },
  fileInput: { marginTop: 8, display: 'block' },
  divider: { textAlign: 'center', color: '#94a3b8', margin: '20px 0', fontSize: 14 },
  btn: {
    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
    color: '#fff', border: 'none', padding: '13px 32px',
    borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: 'pointer', marginTop: 24,
  },
  backBtn: {
    background: 'transparent', color: '#4F46E5', border: '2px solid #4F46E5',
    padding: '11px 24px', borderRadius: 10, fontSize: 15, fontWeight: 600,
    cursor: 'pointer', marginRight: 12,
  },
  wordCount: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
};

export default function SubmitAssignment() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get(`/assignments/${assignmentId}`)
      .then(res => setAssignment(res.data.data))
      .catch(() => toast.error('Assignment not found'));
  }, [assignmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text && !file) return toast.error('Please provide text content or upload a file');
    setLoading(true);

    const formData = new FormData();
    formData.append('assignmentId', assignmentId);
    if (text) formData.append('textContent', text);
    if (file) formData.append('file', file);

    try {
      await API.post('/submissions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Assignment submitted successfully!');
      navigate('/student');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (!assignment) return <div style={S.page}><Navbar /></div>;

  return (
    <div style={S.page}>
      <Navbar />
      <div style={S.container}>
        <div style={S.card}>
          <h1 style={S.title}>Submit: {assignment.title}</h1>
          <p style={S.desc}>{assignment.description}</p>

          {assignment.keywords?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <strong style={{ fontSize: 13, color: '#374151' }}>Key topics to cover:</strong>
              <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {assignment.keywords.map(kw => (
                  <span key={kw} style={{ background: '#EEF2FF', color: '#4F46E5', padding: '3px 12px', borderRadius: 20, fontSize: 13 }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label style={S.label}>Your Response (Text)</label>
            <textarea
              style={S.textarea}
              placeholder="Write your assignment response here..."
              value={text}
              onChange={e => setText(e.target.value)}
            />
            <div style={S.wordCount}>{text.split(/\s+/).filter(Boolean).length} words</div>

            <div style={S.divider}>— OR upload a file —</div>

            <label style={S.label}>Upload PDF / DOC / TXT (optional)</label>
            <input
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              style={S.fileInput}
              onChange={e => setFile(e.target.files[0])}
            />

            <div style={{ marginTop: 24 }}>
              <button type="button" style={S.backBtn} onClick={() => navigate('/student')}>← Back</button>
              <button type="submit" style={{ ...S.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Assignment →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}