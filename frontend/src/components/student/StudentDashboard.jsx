import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { toast } from 'react-toastify';
import Navbar from '../shared/Navbar';
import API from '../../api/axiosConfig';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const S = {
  page: { background: '#F8FAFC', minHeight: '100vh' },
  container: { maxWidth: 1100, margin: '0 auto', padding: '32px 20px' },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 700, color: '#1a1a2e', margin: 0 },
  subtitle: { color: '#64748b', marginTop: 8 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 20, marginBottom: 32 },
  statCard: {
    background: '#fff', borderRadius: 16, padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0',
  },
  statNum: { fontSize: 36, fontWeight: 700, color: '#4F46E5' },
  statLabel: { color: '#64748b', marginTop: 4, fontSize: 14 },
  section: { background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 20, marginTop: 0 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px 16px', background: '#F8FAFC', color: '#374151', fontSize: 13, fontWeight: 600, borderBottom: '2px solid #e2e8f0' },
  td: { padding: '14px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 14, color: '#374151' },
  badge: (color) => ({
    background: color + '1a', color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
  }),
  submitBtn: {
    background: '#4F46E5', color: '#fff', border: 'none', padding: '7px 16px',
    borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
  },
};

const statusColor = { evaluated: '#22c55e', pending: '#f59e0b', evaluating: '#3b82f6', failed: '#ef4444' };

export default function StudentDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aRes, sRes] = await Promise.all([
          API.get('/assignments'),
          API.get('/submissions')
        ]);
        setAssignments(aRes.data.data);
        setSubmissions(sRes.data.data);
      } catch {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const submittedIds = new Set(submissions.map(s => s.assignment?._id));
  const evaluatedSubs = submissions.filter(s => s.status === 'evaluated');
  const avgScore = evaluatedSubs.length
    ? Math.round(evaluatedSubs.reduce((sum, s) => sum + (s.evaluation?.score || 0), 0) / evaluatedSubs.length)
    : 0;

  const chartData = {
    labels: evaluatedSubs.map(s => s.assignment?.title?.substring(0, 20) + '...'),
    datasets: [{
      label: 'Score',
      data: evaluatedSubs.map(s => s.evaluation?.score || 0),
      backgroundColor: 'rgba(79, 70, 229, 0.8)',
      borderRadius: 8,
    }]
  };

  if (loading) return <div style={S.page}><Navbar /><div style={{ textAlign: 'center', padding: 60, color: '#4F46E5', fontSize: 18 }}>Loading your dashboard...</div></div>;

  return (
    <div style={S.page}>
      <Navbar />
      <div style={S.container}>
        <div style={S.header}>
          <h1 style={S.title}>Student Dashboard</h1>
          <p style={S.subtitle}>Track your assignments and performance</p>
        </div>

        <div style={S.grid}>
          {[
            { num: assignments.length, label: 'Total Assignments' },
            { num: submissions.length, label: 'My Submissions' },
            { num: evaluatedSubs.length, label: 'Evaluated' },
            { num: `${avgScore}%`, label: 'Average Score' },
          ].map((stat, i) => (
            <div key={i} style={S.statCard}>
              <div style={S.statNum}>{stat.num}</div>
              <div style={S.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        {evaluatedSubs.length > 0 && (
          <div style={S.section}>
            <h2 style={S.sectionTitle}>📊 My Score History</h2>
            <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>
        )}

        <div style={S.section}>
          <h2 style={S.sectionTitle}>📋 Available Assignments</h2>
          {assignments.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: 20 }}>No assignments available.</p>
          ) : (
            <table style={S.table}>
              <thead>
                <tr>
                  {['Title', 'Subject', 'Due Date', 'Action'].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assignments.map(a => (
                  <tr key={a._id}>
                    <td style={S.td}><strong>{a.title}</strong></td>
                    <td style={S.td}><span style={S.badge('#7C3AED')}>{a.subject}</span></td>
                    <td style={S.td}>{new Date(a.dueDate).toLocaleDateString()}</td>
                    <td style={S.td}>
                      {submittedIds.has(a._id) ? (
                        <span style={S.badge('#22c55e')}>Submitted ✓</span>
                      ) : (
                        <button style={S.submitBtn} onClick={() => navigate(`/student/submit/${a._id}`)}>
                          Submit →
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={S.section}>
          <h2 style={S.sectionTitle}>📨 My Submissions</h2>
          {submissions.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: 20 }}>No submissions yet.</p>
          ) : (
            <table style={S.table}>
              <thead>
                <tr>
                  {['Assignment', 'Status', 'Score', 'Plagiarism Risk', 'Feedback'].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map(s => (
                  <tr key={s._id}>
                    <td style={S.td}>{s.assignment?.title || 'N/A'}</td>
                    <td style={S.td}><span style={S.badge(statusColor[s.status] || '#64748b')}>{s.status}</span></td>
                    <td style={S.td}>{s.evaluation?.score != null ? `${s.evaluation.score}/${s.assignment?.maxScore || 100}` : '—'}</td>
                    <td style={S.td}>
                      {s.evaluation?.plagiarismRisk != null ? (
                        <span style={S.badge(s.evaluation.plagiarismRisk > 50 ? '#ef4444' : s.evaluation.plagiarismRisk > 20 ? '#f59e0b' : '#22c55e')}>
                          {s.evaluation.plagiarismRisk}%
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ ...S.td, maxWidth: 300, fontSize: 13, color: '#64748b' }}>
                      {s.evaluation?.feedbackSummary || '—'}
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