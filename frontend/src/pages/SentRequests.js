import React, { useEffect, useState } from 'react';
import '../styles/GlobalStyles.css';

function SentRequests() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [processing, setProcessing] = useState({});
  const [requestErrors, setRequestErrors] = useState({});
  const token = localStorage.getItem('token');

  const fetchRequests = async () => {
    setIsLoading(true);
    setErrorMessage('');
    if (!token) {
      setErrorMessage('You must be logged in to view sent requests.');
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch('http://localhost:5001/api/skill-requests/sent', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch sent requests');
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleCancel = async (requestId) => {
    setProcessing(prev => ({ ...prev, [requestId]: true }));
    setRequestErrors(prev => ({ ...prev, [requestId]: '' }));

    try {
      const res = await fetch(`http://localhost:5001/api/skill-requests/${requestId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (!res.ok) throw new Error('Failed to cancel request');

      // Optimistic update
      setRequests(prev => prev.map(r => r._id === requestId ? { ...r, status: 'cancelled' } : r));
    } catch (err) {
      setRequestErrors(prev => ({ ...prev, [requestId]: err.message }));
    } finally {
      setProcessing(prev => ({ ...prev, [requestId]: false }));
    }
  };

  return (
    <div className="black-bg-page">
      <div className="particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>
      <div className="page-content">
        <div className="black-card">
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#fff' }}>Sent Skill Requests</h2>
          {isLoading && <div style={{ textAlign: 'center', color: '#fff' }}>Loading...</div>}
          {errorMessage && <div style={{ color: '#ff4d4f', textAlign: 'center' }}>{errorMessage}</div>}
          {requests.map(req => (
            <div key={req._id} className="black-card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#fff' }}>
                Skill: {req.skill?.title}
              </div>
              <div style={{ color: '#aaa', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                To: {req.owner?.name} ({req.owner?.email})<br />
                Message: {req.message}<br />
                Preferred Schedule: {req.preferredSchedule}
              </div>
              <div style={{ fontWeight: 'bold', marginTop: '0.5rem', color: '#0d6efd' }}>
                Status: {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
              </div>
              {req.status === 'pending' && (
                <div style={{ marginTop: '1rem' }}>
                  <button
                    className="black-btn"
                    onClick={() => handleCancel(req._id)}
                    disabled={processing[req._id]}
                    style={{ background: '#dc3545' }}
                  >
                    {processing[req._id] ? 'Cancelling...' : 'Cancel'}
                  </button>
                </div>
              )}
              {requestErrors[req._id] && <div style={{ color: '#ff4d4f', marginTop: '0.5rem' }}>{requestErrors[req._id]}</div>}
            </div>
          ))}
          {!isLoading && requests.length === 0 && !errorMessage && (
            <div style={{ textAlign: 'center', color: '#aaa' }}>No sent requests.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SentRequests;
