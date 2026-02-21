import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../shared/Navbar';
import API from '../../api/axiosConfig';

const S = {
  page: { background: '#F8FAFC', minHeight: '100vh' },
  container: { maxWidth: 800, margin: '0 auto', padding: '32px 20px' },
  card: { background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 },
  meta: { color: '#64748b', fontSize: 14, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' },
  value: { fontSize: 15, color: '#1a1a2e', lineHeight: 1.6, marginBottom: 20 },
  scoreBox: { display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' },
  metricCard: { flex: 1, minWidth: 120, textAlign: 'center', background: '#F8FAFC', borderRadius: 12, padding: '16px 8px' },
  metricNum: { fontSize: 32, fontWeight: 700 },
  metricLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
  feedbackPoint: { padding: '8px 12px', borderRadius: 8, marginBottom: 8, fontSize: 14 },
  backBtn: {
    background: '#4F46E5', color: '#fff', border: 'none', padding: '10px 24px',
    borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  evalBtn: {
    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: '#fff',
    border: 'none', padding: '10px 24px', borderRadius: 10, fontSize: 14,
    fontWeight: 600, cursor: 'pointer', marginLeft: 12,
  },
};

export default function ReviewSubmission() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  const fetchSubmission = async () => {
    try {
      const { data } = await API.get(`/submissions/${submissionId}`);
      setSubmission(data.data);
    } catch {
      toast.error('Failed to load submission');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubmission(); }, [submissionId]);

  const handleEvaluate = async () => {
    setEvaluating(true);
    try {
      const { data } = await API.post(`/evaluate/${submissionId}`);
      setSubmission(data.data);
      toast.success('Evaluation complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Evaluation failed');
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) return <div style={S.page}><Navbar /></div>;
  if (!submission) return <div style={S.page}><Navbar /><div style={{ padding: 40, textAlign: 'center' }}>Submission not found.</div></div>;

  const { evaluation } = submission;
  const plagRisk = evaluation?.plagiarismRisk;
  const plagColor = plagRisk > 50 ? '#ef4444' : plagRisk > 20 ? '#f59e0b' : '#22c55e';

  return (
    <div style={S.page}>
      <Navbar />
      <div style={S.container}>

        <div style={S.card}>
          <h1 style={S.title}>{submission.assignment?.title}</h1>
          <p style={S.meta}>
            Student: <strong>{submission.student?.name}</strong> ({submission.student?.email}) •
            Submitted: {new Date(submission.submittedAt).toLocaleString()}
          </p>

          <label style={S.label}>Subject</label>
          <div style={S.value}>{submission.assignment?.subject}</div>

          {submission.textContent && (
            <>
              <label style={S.label}>Submission Text</label>
              <div style={{ ...S.value, background: '#F8FAFC', padding: 16, borderRadius: 10, maxHeight: 300, overflowY: 'auto', whiteSpace: 'pre-wrap', fontSize: 14 }}>
                {submission.textContent}
              </div>
            </>
          )}

          {submission.fileUrl && (
            <div>
              <label style={S.label}>Uploaded File</label>
              <a href={`${process.env.REACT_APP_API_URL?.replace('/api', '')}${submission.fileUrl}`}
                target="_blank" rel="noreferrer"
                style={{ color: '#4F46E5', fontWeight: 600 }}>
                📄 {submission.fileName}
              </a>
            </div>
          )}

          <div style={{ marginTop: 24 }}>
            <button style={S.backBtn} onClick={() => navigate('/instructor')}>← Back</button>
            {submission.status !== 'evaluated' && (
              <button style={{ ...S.evalBtn, opacity: evaluating ? 0.7 : 1 }} onClick={handleEvaluate} disabled={evaluating}>
                {evaluating ? '🤖 Evaluating...' : '🤖 Run AI Evaluation'}
              </button>
            )}
          </div>
        </div>

        {evaluation && submission.status === 'evaluated' && (
          <div style={S.card}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>🤖 AI Evaluation Results</h2>

            <div style={S.scoreBox}>
              <div style={S.metricCard}>
                <div style={{ ...S.metricNum, color: '#4F46E5' }}>{evaluation.score}</div>
                <div style={S.metricLabel}>Score / {submission.assignment?.maxScore || 100}</div>
              </div>
              <div style={S.metricCard}>
                <div style={{ ...S.metricNum, color: plagColor }}>{plagRisk}%</div>
                <div style={S.metricLabel}>Plagiarism Risk</div>
              </div>
              {evaluation.details?.feedback?.grade && (
                <div style={S.metricCard}>
                  <div style={{ ...S.metricNum, fontSize: 22, color: '#7C3AED' }}>{evaluation.details.feedback.grade}</div>
                  <div style={S.metricLabel}>Grade</div>
                </div>
              )}
            </div>

            <label style={S.label}>Feedback Summary</label>
            <div style={{ ...S.value, background: '#f0fdf4', padding: 14, borderRadius: 10, color: '#166534' }}>
              {evaluation.feedbackSummary}
            </div>

            {evaluation.details?.feedback?.feedback_points?.length > 0 && (
              <>
                <label style={S.label}>Detailed Feedback</label>
                {evaluation.details.feedback.feedback_points.map((point, i) => (
                  <div key={i} style={{
                    ...S.feedbackPoint,
                    background: point.startsWith('✓') ? '#f0fdf4' : point.startsWith('✗') ? '#fef2f2' : '#fefce8',
                    color: point.startsWith('✓') ? '#166534' : point.startsWith('✗') ? '#991b1b' : '#713f12'
                  }}>
                    {point}
                  </div>
                ))}
              </>
            )}

            {evaluation.details?.plagiarism?.details?.interpretation && (
              <div style={{ marginTop: 16, padding: 12, background: plagRisk > 20 ? '#fef2f2' : '#f0fdf4', borderRadius: 10, fontSize: 14 }}>
                <strong>Plagiarism Assessment: </strong>
                {evaluation.details.plagiarism.details.interpretation} •
                Compared against {evaluation.details.plagiarism.compared_against || 0} submissions
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}