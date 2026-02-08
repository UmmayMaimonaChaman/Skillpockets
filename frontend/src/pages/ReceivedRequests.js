import React, { useEffect, useState } from 'react';
import '../styles/GlobalStyles.css';

function ReceivedRequests() {
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchReceivedRequests = async () => {
    setIsLoading(true);
    setErrorMessage('');
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('You must be logged in to view received requests.');
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch('http://localhost:5001/api/skill-requests/received', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch received requests');
      const data = await response.json();
      setReceivedRequests(data);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceivedRequests();
    // eslint-disable-next-line
  }, []);

  const handleUpdateStatus = async (requestId, newStatus) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('You must be logged in to update requests.');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5001/api/skill-requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update request status');
      
      // Update the request in the local state instead of refetching
      setReceivedRequests(prevRequests => 
        prevRequests.map(request => 
          request._id === requestId 
            ? { ...request, status: newStatus }
            : request
        )
      );
    } catch (err) {
      setErrorMessage(err.message);
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
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#fff' }}>Received Skill Requests</h2>
          {isLoading && <div style={{ textAlign: 'center', color: '#fff' }}>Loading...</div>}
          {errorMessage && <div style={{ color: '#ff4d4f', textAlign: 'center' }}>{errorMessage}</div>}
          {receivedRequests.map(request => (
            <div key={request._id} className="black-card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#fff' }}>
                Skill: {request.skill?.title}
              </div>
              <div style={{ color: '#aaa', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                From: {request.requester?.name} ({request.requester?.email})<br />
                Message: {request.message}<br />
                Preferred Schedule: {request.preferredSchedule}
              </div>
              <div style={{ fontWeight: 'bold', marginTop: '0.5rem', color: '#0d6efd' }}>
                Status: {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </div>
              {request.status === 'pending' && (
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    className="black-btn"
                    onClick={() => handleUpdateStatus(request._id, 'accepted')}
                    style={{ background: '#28a745' }}
                  >
                    Accept
                  </button>
                  <button
                    className="black-btn"
                    onClick={() => handleUpdateStatus(request._id, 'rejected')}
                    style={{ background: '#dc3545' }}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
          {!isLoading && receivedRequests.length === 0 && !errorMessage && (
            <div style={{ textAlign: 'center', color: '#aaa' }}>No received requests.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReceivedRequests; 
