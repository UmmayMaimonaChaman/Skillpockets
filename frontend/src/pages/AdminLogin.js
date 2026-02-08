import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const adminLoginStyles = {
  container: {
    minHeight: '100vh',
    width: '100vw',
            background: "url(/login_bg.jpg) center center/cover no-repeat",
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.7)',
    zIndex: 1,
  },
  form: {
    position: 'relative',
    zIndex: 2,
    background: 'transparent',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.5)',
    width: '100%',
    maxWidth: '350px',
    color: '#fff',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    margin: '0.5rem 0',
    borderRadius: '4px',
    border: '1px solid #444',
    background: '#181818',
    color: '#fff',
    fontSize: '1rem',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    background: '#0d6efd',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold',
    fontSize: '1rem',
    marginTop: '1rem',
    cursor: 'pointer',
  },
  error: {
    color: '#ff4d4f',
    marginBottom: '1rem',
    textAlign: 'center',
  },
};

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/admin-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      // Store token and admin role information
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', 'admin');
      localStorage.setItem('userEmail', data.user?.email || email);
      localStorage.setItem('userName', data.user?.name || 'Admin');
      
      // Dispatch custom event to update navbar
      window.dispatchEvent(new Event('authChange'));
      
      // Redirect to All Skills page
      navigate('/skills');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={adminLoginStyles.container}>
      <div style={adminLoginStyles.overlay}></div>
      <form style={adminLoginStyles.form} onSubmit={handleAdminLogin}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Admin Login</h2>
        {error && <div style={adminLoginStyles.error}>{error}</div>}
        <input
          style={adminLoginStyles.input}
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          style={adminLoginStyles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button style={adminLoginStyles.button} type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login as Admin'}
        </button>
      </form>
    </div>
  );
}

export default AdminLogin; 
