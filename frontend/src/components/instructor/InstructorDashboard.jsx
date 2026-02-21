import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { toast } from 'react-toastify';
import Navbar from '../shared/Navbar';
import API from '../../api/axiosConfig';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const S = {
  page: { background: '#F8FAFC', minHeight: '100vh' },
  container: { maxWidth: 1200, margin: '0 auto', padding: '32px 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 },
  title: { fontSize: 28, fontWeight: 700, color: '#1a1a2e', margin: 0 },
  createBtn: {
    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: '#fff',
    border: 'none', padding: '12px 24px', borderRadius: 10, fontSize: 15,
    fontWeight: 600, cursor: 'pointer',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 20, marginBottom: 32 },
  statCard: { background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  statNum: { fontSize: 36, fontWeight: 700 },
  chartsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 },
  section: { background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 20, marginTop: 0 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px 16px', background: '#F8FAFC', color: '#374151', fontSize: 13, fontWeight: 600, borderBottom: '2px solid #e2e8f0' },
  td: { padding: '14px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 14, color: '#374151' },
  badge: (c) => ({ background: c + '1a', color: c, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }),
  actionBtn: (c) => ({
    background: c, color: '#fff', border: 'none', padding: '6px 14px',
    borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600, marginLeft: 6,
  }),
};

export default function InstructorDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluatingId, setEvaluatingId] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [aRes, sRes] = await Promise.all([API.get('/assignments'), API.get('/submissions')]);
      setAssignments(aRes.data.data);
      setSubmissions(sRes.data.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEvaluate = async (submissionId) => {
    setEvaluatingId(submissionId);
    try {
      await API.post(`/evaluate/${submissionId}`);
      toast.success('Evaluation complete!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Evaluation failed');
    } finally {
      setEvaluatingId(null);
    }
  };

  const evaluated = submissions.filter(s => s.status === 'evaluated');
  const pending = submissions.filter(s => s.status === 'pending');
  const avgScore = evaluated.length
    ? Math.round(evaluated.reduce((s, sub) => s + (sub.evaluation?.score || 0), 0) / evaluated.length)
    : 0;

  const statusData = {
    labels: ['Evaluated', 'Pending', 'Evaluating', 'Failed'],
    datasets: [{
      data: [
        evaluated.length,
        pending.length,
        submissions.filter(s => s.status === 'evaluating').length,
        submissions.filter(s => s.status === 'failed').length,
      ],
      backgroundColor: ['#22c55e', '#f59e0b', '#3b82f6', '#ef4444'],
    }]
  };

  const scoreData = {
    labels: evaluated.map(s => s.student?.name?.split(' ')[0] || 'Student'),
    datasets: [{
      label: 'Score',
      data: evaluated.map(s => s.evaluation?.score || 0),
      backgroundColor: 'rgba(79,70,229,0.8)',
      borderRadius: 6,
    }]
  };

  if (loading) return <div style={S.page}><Navbar /><div style={{ textAlign: 'center', padding: 60, color: '#4F46E5' }}>Loading...</div></div>;

  return (
    <div style={S.page}>
      <Navbar />
      <div style={S.container}>
        <div style={S.header}>
          <div>
            <h1 style={S.title}>Instructor Dashboard</h1>
            <p style={{ color: '#64748b', margin: '8px 0 0' }}>Manage assignments and review student submissions</p>
          </div>
          <button style={S.createBtn} onClick={() => navigate('/instructor/create')}>+ Create Assignment</button>
        </div>

        <div style={S.grid}>
          {[
            { num: assignments.length, label: 'Assignments', color: '#4F46E5' },
            { num: submissions.length, label: 'Submissions', color: '#7C3AED' },
            { num: pending.length, label: 'Pending Review', color: '#f59e0b' },
            { num: `${avgScore}`, label: 'Avg Score', color: '#22c55e' },
          ].map((s, i) => (
            <div key={i} style={S.statCard}>
              <div style={{ ...S.statNum, color: s.color }}>{s.num}</div>
              <div style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {submissions.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <div style={S.section}>
              <h2 style={S.sectionTitle}>Submission Status</h2>
              <Doughnut data={statusData} options={{ responsive: true }} />
            </div>
            {evaluated.length > 0 && (
              <div style={S.section}>
                <h2 style={S.sectionTitle}>Score Distribution</h2>
                <Bar data={scoreData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
            )}
          </div>
        )}

        <div style={S.section}>
          <h2 style={S.sectionTitle}>📨 All Submissions</h2>
          {submissions.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: 20 }}>No submissions yet.</p>
          ) : (
            <table style={S.table}>
              <thead>
                <tr>
                  {['Student', 'Assignment', 'Status', 'Score', 'Plagiarism Risk', 'Actions'].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map(s => (
                  <tr key={s._id}>
                    <td style={S.td}>{s.student?.name || 'N/A'}</td>
                    <td style={S.td}>{s.assignment?.title?.substring(0, 30) || 'N/A'}</td>
                    <td style={S.td}>
                      <span style={S.badge(
                        s.status === 'evaluated' ? '#22c55e' :
                        s.status === 'pending' ? '#f59e0b' :
                        s.status === 'evaluating' ? '#3b82f6' : '#ef4444'
                      )}>{s.status}</span>
                    </td>
                    <td style={S.td}>{s.evaluation?.score ?? '—'}</td>
                    <td style={S.td}>
                      {s.evaluation?.plagiarismRisk != null ? (
                        <span style={S.badge(s.evaluation.plagiarismRisk > 50 ? '#ef4444' : '#22c55e')}>
                          {s.evaluation.plagiarismRisk}%
                        </span>
                      ) : '—'}
                    </td>
                    <td style={S.td}>
                      {s.status === 'pending' && (
                        <button
                          style={S.actionBtn('#4F46E5')}
                          onClick={() => handleEvaluate(s._id)}
                          disabled={evaluatingId === s._id}
                        >
                          {evaluatingId === s._id ? '...' : '🤖 Evaluate'}
                        </button>
                      )}
                      <button style={S.actionBtn('#64748b')} onClick={() => navigate(`/instructor/review/${s._id}`)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}