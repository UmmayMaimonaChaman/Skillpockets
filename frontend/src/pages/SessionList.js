import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/GlobalStyles.css';

function SessionList() {
  const [sessionList, setSessionList] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [rescheduleId, setRescheduleId] = useState(null);
  const [newTime, setNewTime] = useState('');
  const [meetLinkId, setMeetLinkId] = useState(null);
  const [meetLink, setMeetLink] = useState('');
  const [reviewedSessionIds, setReviewedSessionIds] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [createSessionData, setCreateSessionData] = useState({
    skillName: '',
    learnerName: '',
    teacherName: '',
    date: '',
    comment: ''
  });

  const token = localStorage.getItem('token');
  const userId = token ? JSON.parse(atob(token.split('.')[1])).userId : null;

  const fetchSessions = async () => {
    setIsLoading(true);
    setErrorMessage('');
    if (!token) {
      setErrorMessage('You must be logged in to view sessions.');
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch('http://localhost:5001/api/sessions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch sessions');
      const data = await response.json();
      setSessionList(data);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAcceptedRequests = async () => {
    if (!token) return;
    try {
      const response = await fetch('http://localhost:5001/api/skill-requests/received', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const accepted = data.filter(request => request.status === 'accepted');
        setAcceptedRequests(accepted);
      }
    } catch (err) {
      console.error('Error fetching accepted requests:', err);
    }
  };

  const fetchMyReviews = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch('http://localhost:5001/api/reviews/mine', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      const data = await response.json();
      setReviewedSessionIds(data.map((r) => r.session));
    } catch {}
  };

  useEffect(() => {
    fetchSessions();
    fetchAcceptedRequests();
    fetchMyReviews();
  }, []);

  const handleUpdateSession = async (sessionId, update) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('You must be logged in to update sessions.');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5001/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(update),
      });
      if (!response.ok) throw new Error('Failed to update session');
      
      // Update the session in the local state instead of refetching
      setSessionList(prevSessions => 
        prevSessions.map(session => 
          session._id === sessionId 
            ? { ...session, ...update }
            : session
        )
      );
      
      setRescheduleId(null);
      setNewTime('');
      setMeetLinkId(null);
      setMeetLink('');
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!token) {
      setErrorMessage('You must be logged in to create sessions.');
      return;
    }

    try {
      // Find the accepted request that matches the skill
      const request = acceptedRequests.find(req => 
        req.skill.title === createSessionData.skillName
      );

      if (!request) {
        setErrorMessage('No accepted request found for this skill.');
        return;
      }

      const sessionData = {
        skill: request.skill._id,
        requester: request.requester._id,
        owner: userId,
        scheduledTime: createSessionData.date,
        request: request._id,
        comment: createSessionData.comment
      };

      const response = await fetch('http://localhost:5001/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create session');
      }

      setCreateSessionData({
        skillName: '',
        learnerName: '',
        teacherName: '',
        date: '',
        comment: ''
      });
      setShowCreateSession(false);
      fetchSessions();
      fetchAcceptedRequests();
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleReviewSubmit = async (session) => {
    setReviewError('');
    setReviewSuccess('');
    const token = localStorage.getItem('token');
    if (!token) {
      setReviewError('You must be logged in to leave a review.');
      return;
    }
    const userId = JSON.parse(atob(token.split('.')[1])).userId;
    const reviewee = session.owner._id === userId ? session.requester._id : session.owner._id;
    try {
      const response = await fetch('http://localhost:5001/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reviewee, session: session._id, rating: reviewRating, comment: reviewComment }),
      });
      if (!response.ok) {
        const data = await response.json();
        setReviewError(data.message || 'Failed to submit review');
        return;
      }
      setReviewSuccess('Review submitted!');
      setReviewedSessionIds([...reviewedSessionIds, session._id]);
      setReviewRating(5);
      setReviewComment('');
    } catch {
      setReviewError('Failed to submit review');
    }
  };

  const handleMarkAsDone = async (sessionId) => {
    try {
      await handleUpdateSession(sessionId, { status: 'completed' });
    } catch (err) {
      setErrorMessage('Failed to mark session as done');
    }
  };

  const isLearner = (session) => {
    return session.requester._id === userId;
  };

  const isTeacher = (session) => {
    return session.owner._id === userId;
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
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#fff' }}>Sessions</h2>
          
          {/* Create Session Section */}
          {acceptedRequests.length > 0 && (
            <div className="black-card" style={{ marginBottom: '2rem', background: 'rgba(255, 255, 255, 0.05)' }}>
              <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Create New Session</h3>
              <p style={{ color: '#aaa', marginBottom: '1rem' }}>
                You have {acceptedRequests.length} accepted request(s). You can create a session for any of these.
              </p>
              <button 
                className="black-btn"
                onClick={() => setShowCreateSession(true)}
                style={{ background: '#28a745' }}
              >
                Create Session
              </button>
            </div>
          )}

          {acceptedRequests.length === 0 && (
            <div className="black-card" style={{ marginBottom: '2rem', background: 'rgba(255, 255, 255, 0.05)' }}>
              <p style={{ color: '#aaa', textAlign: 'center' }}>
                Please request to the skill owner to create a session.
              </p>
            </div>
          )}

          {isLoading && <div style={{ textAlign: 'center', color: '#fff' }}>Loading...</div>}
          {errorMessage && <div style={{ color: '#ff4d4f', textAlign: 'center' }}>{errorMessage}</div>}
          
          {sessionList.map((session) => (
            <div key={session._id} className="black-card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#fff' }}>
                Skill: {session.skill?.title}
              </div>
              <div style={{ color: '#aaa', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                Teacher: {session.owner?.name}
                <br />
                Learner: {session.requester?.name}
                <br />
                Scheduled Time: {new Date(session.scheduledTime).toLocaleString()}
                <br />
                Status: <span style={{ fontWeight: 'bold', color: '#0d6efd' }}>{session.status}</span>
                {session.meetLink && (
                  <>
                    <br />
                    Meet Link: <span style={{ color: '#28a745' }}>{session.meetLink}</span>
                  </>
                )}
                {session.comment && (
                  <>
                    <br />
                    Comment: <span style={{ color: '#ffc107' }}>{session.comment}</span>
                  </>
                )}
              </div>

              {rescheduleId === session._id ? (
                <>
                  <input
                    className="black-input"
                    type="datetime-local"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    style={{ marginTop: '0.5rem' }}
                  />
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      className="black-btn"
                      onClick={() => handleUpdateSession(session._id, { scheduledTime: newTime, status: 'rescheduled' })}
                    >
                      Save
                    </button>
                    <button 
                      className="black-btn" 
                      onClick={() => setRescheduleId(null)} 
                      style={{ background: '#dc3545' }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : meetLinkId === session._id ? (
                <>
                  <input
                    className="black-input"
                    type="text"
                    placeholder="Enter meet link or meeting details..."
                    value={meetLink}
                    onChange={(e) => setMeetLink(e.target.value)}
                    style={{ marginTop: '0.5rem' }}
                  />
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      className="black-btn"
                      onClick={() => handleUpdateSession(session._id, { meetLink })}
                    >
                      Save
                    </button>
                    <button 
                      className="black-btn" 
                      onClick={() => {
                        setMeetLinkId(null);
                        setMeetLink('');
                      }} 
                      style={{ background: '#dc3545' }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {session.status !== 'completed' && session.status !== 'cancelled' && (
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {isTeacher(session) && (
                        <>
                          <button 
                            className="black-btn" 
                            onClick={() => setRescheduleId(session._id)}
                            style={{ background: '#ffc107', color: '#000' }}
                          >
                            Reschedule
                          </button>
                          <button 
                            className="black-btn" 
                            onClick={() => setMeetLinkId(session._id)}
                            style={{ background: '#17a2b8' }}
                          >
                            {session.meetLink ? 'Update Meet Link' : 'Add Meet Link'}
                          </button>
                        </>
                      )}
                      <button 
                        className="black-btn" 
                        onClick={() => handleUpdateSession(session._id, { status: 'cancelled' })}
                        style={{ background: '#dc3545' }}
                      >
                        Cancel
                      </button>
                      {isLearner(session) && (
                        <button 
                          className="black-btn" 
                          onClick={() => handleMarkAsDone(session._id)}
                          style={{ background: '#28a745' }}
                        >
                          Done
                        </button>
                      )}
                    </div>
                  )}
                  {session.status === 'completed' && !reviewedSessionIds.includes(session._id) && (
                    <div style={{ marginTop: '1rem', background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '8px' }}>
                      {reviewError && <div style={{ color: '#ff4d4f' }}>{reviewError}</div>}
                      {reviewSuccess && <div style={{ color: '#52c41a' }}>{reviewSuccess}</div>}
                      <div style={{ marginBottom: '0.5rem' }}>
                        <label style={{ color: '#fff' }}>Rating: </label>
                        <select 
                          className="black-input" 
                          value={reviewRating} 
                          onChange={(e) => setReviewRating(Number(e.target.value))}
                          style={{ width: 'auto', marginLeft: '0.5rem' }}
                        >
                          {[5, 4, 3, 2, 1].map((val) => (
                            <option key={val} value={val}>{val}</option>
                          ))}
                        </select>
                      </div>
                      <textarea
                        className="black-input"
                        placeholder="Write your review..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={3}
                      />
                      <button 
                        className="black-btn" 
                        onClick={() => handleReviewSubmit(session)}
                        style={{ marginTop: '0.5rem' }}
                      >
                        Submit Review
                      </button>
                    </div>
                  )}
                  {session.status === 'completed' && reviewedSessionIds.includes(session._id) && (
                    <div style={{ marginTop: '1rem', color: '#52c41a' }}>Reviewed ✅</div>
                  )}
                </>
              )}
            </div>
          ))}
          {!isLoading && sessionList.length === 0 && !errorMessage && (
            <div style={{ textAlign: 'center', color: '#aaa' }}>No sessions found.</div>
          )}
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateSession && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create New Session</h2>
            <form onSubmit={handleCreateSession}>
              <select
                className="black-input"
                value={createSessionData.skillName}
                onChange={(e) => setCreateSessionData({...createSessionData, skillName: e.target.value})}
                required
              >
                <option value="">Select Skill</option>
                {acceptedRequests.map(request => (
                  <option key={request._id} value={request.skill.title}>
                    {request.skill.title} (Requested by: {request.requester.name})
                  </option>
                ))}
              </select>
              <input
                className="black-input"
                type="datetime-local"
                value={createSessionData.date}
                onChange={(e) => setCreateSessionData({...createSessionData, date: e.target.value})}
                required
              />
              <textarea
                className="black-input"
                placeholder="Session details or instructions..."
                value={createSessionData.comment}
                onChange={(e) => setCreateSessionData({...createSessionData, comment: e.target.value})}
                rows={3}
              />
              <div className="modal-buttons">
                <button type="submit" className="black-btn">Create Session</button>
                <button 
                  type="button" 
                  className="black-btn" 
                  onClick={() => setShowCreateSession(false)}
                  style={{ background: '#dc3545' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionList;
