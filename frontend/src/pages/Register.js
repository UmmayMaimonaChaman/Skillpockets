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
  success: {
    color: '#52c41a',
    marginBottom: '1rem',
    textAlign: 'center',
  },
};

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      
      // Auto-login after successful registration
      const loginRes = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const loginData = await loginRes.json();
      
      if (loginRes.ok) {
        // Store token and user data
        localStorage.setItem('token', loginData.token);
        localStorage.setItem('role', loginData.user.role);
        localStorage.setItem('userEmail', loginData.user.email);
        localStorage.setItem('userName', loginData.user.name);
        
        // Redirect to All Skills page
        navigate('/skills');
      } else {
        setSuccess('Registration successful! Please log in.');
        setName('');
        setEmail('');
        setPassword('');
      }
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
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Register</h2>
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}
        <input
          style={styles.input}
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
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
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}

export default Register; 
