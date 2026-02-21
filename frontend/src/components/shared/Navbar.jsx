import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const styles = {
  nav: {
    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    boxShadow: '0 2px 8px rgba(79,70,229,0.3)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: { color: '#fff', fontSize: 20, fontWeight: 700, textDecoration: 'none' },
  right: { display: 'flex', alignItems: 'center', gap: 16 },
  userName: { color: 'rgba(255,255,255,0.9)', fontSize: 14 },
  badge: {
    background: 'rgba(255,255,255,0.2)',
    color: '#fff',
    padding: '2px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'capitalize',
  },
  btn: {
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.3)',
    padding: '6px 16px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    transition: 'background 0.2s',
  },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to={user?.role === 'instructor' ? '/instructor' : '/student'} style={styles.logo}>
        🎓 EduEval Platform
      </Link>
      {user && (
        <div style={styles.right}>
          <span style={styles.userName}>👋 {user.name}</span>
          <span style={styles.badge}>{user.role}</span>
          <button style={styles.btn} onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
}