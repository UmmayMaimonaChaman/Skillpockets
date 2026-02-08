import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
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
  radioGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    marginBottom: '1rem',
  },
  radioLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
};

function Login({ onLogin }) {
  const [loginType, setLoginType] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (loginType === 'admin') {
      // Redirect to admin login page
      navigate('/admin/login');
      return;
    }
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      // Store token and user data including role
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userName', data.user.name);
      
      // Dispatch custom event to update navbar
      window.dispatchEvent(new Event('authChange'));
      
      if (onLogin) onLogin(data.user);
      
      // Redirect to All Skills page after successful login
      navigate('/skills');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Login</h2>
        <div style={styles.radioGroup}>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="loginType"
              value="user"
              checked={loginType === 'user'}
              onChange={() => setLoginType('user')}
              style={{ marginRight: '0.5rem' }}
            />
            User
          </label>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="loginType"
              value="admin"
              checked={loginType === 'admin'}
              onChange={() => setLoginType('admin')}
              style={{ marginRight: '0.5rem' }}
            />
            Admin
          </label>
        </div>
        {error && <div style={styles.error}>{error}</div>}
        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button style={styles.button} type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default Login; 
