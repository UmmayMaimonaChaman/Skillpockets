import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/GlobalStyles.css';

function AllSkills() {
  const [skillList, setSkillList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Filter/search state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [ownerName, setOwnerName] = useState('');

  // Request modal state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestSkill, setRequestSkill] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestSchedule, setRequestSchedule] = useState('');
  const [requestError, setRequestError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);

  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  const userEmail = localStorage.getItem('userEmail');
  let currentUserId = null;
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      currentUserId = payload.userId;
    }
  } catch {}

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    const fetchSkillListings = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const response = await fetch('http://localhost:5001/api/skills');
        if (!response.ok) throw new Error('Failed to fetch skill listings');
        const data = await response.json();
        setSkillList(data);
      } catch (err) {
        setErrorMessage(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSkillListings();
  }, [isLoggedIn, navigate]);

  // Get unique categories for filter dropdown
  const categoryOptions = Array.from(new Set(skillList.map(skill => skill.category))).filter(Boolean);

  // Filtered skills based on search/filter
  const filteredSkills = skillList.filter(skill => {
    const keywordMatch =
      skill.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchKeyword.toLowerCase());
    const categoryMatch = selectedCategory ? skill.category === selectedCategory : true;
    const typeMatch = selectedType ? skill.type === selectedType : true;
    const ownerMatch = ownerName ? (skill.owner?.name || '').toLowerCase().includes(ownerName.toLowerCase()) : true;
    return keywordMatch && categoryMatch && typeMatch && ownerMatch;
  });

  // Handle open/close request modal
  const openRequestModal = (skill) => {
    setRequestSkill(skill);
    setRequestMessage('');
    setRequestSchedule('');
    setRequestError('');
    setRequestSuccess('');
    setShowRequestModal(true);
  };
  const closeRequestModal = () => {
    setShowRequestModal(false);
    setRequestSkill(null);
  };

  // Handle delete skill
  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) {
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to delete a skill.');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5001/api/skills/${skillId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete skill');
      }
      
      // Remove the skill from the list
      setSkillList(prevSkills => prevSkills.filter(skill => skill._id !== skillId));
      alert('Skill deleted successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle submit skill request
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestError('');
    setRequestSuccess('');
    setRequestLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setRequestError('You must be logged in to send a request.');
      setRequestLoading(false);
      return;
    }
    try {
      const response = await fetch('http://localhost:5001/api/skill-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          skill: requestSkill._id,
          message: requestMessage,
          preferredSchedule: requestSchedule,
        }),
      });
      if (!response.ok) throw new Error('Failed to send request');
      setRequestSuccess('Request sent successfully!');
      setRequestMessage('');
      setRequestSchedule('');
    } catch (err) {
      setRequestError(err.message);
    } finally {
      setRequestLoading(false);
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
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#fff' }}>All Skill Listings</h2>
          {/* Filter/Search Bar */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            marginBottom: '2rem', 
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <input
              className="black-input"
              type="text"
              placeholder="Search keyword..."
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              style={{ flex: '1 1 200px', minWidth: '200px' }}
            />
            <select
              className="black-input"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{ flex: '1 1 150px', minWidth: '150px' }}
            >
              <option value="">All Categories</option>
              {categoryOptions.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              className="black-input"
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              style={{ flex: '1 1 150px', minWidth: '150px' }}
            >
              <option value="">All Types</option>
              <option value="offer">Offer</option>
              <option value="request">Request</option>
            </select>
            <input
              className="black-input"
              type="text"
              placeholder="Owner name..."
              value={ownerName}
              onChange={e => setOwnerName(e.target.value)}
              style={{ flex: '1 1 200px', minWidth: '200px' }}
            />
          </div>
          {isLoading && <div style={{ textAlign: 'center', color: '#fff' }}>Loading...</div>}
          {errorMessage && <div style={{ color: '#ff4d4f', textAlign: 'center' }}>{errorMessage}</div>}
          {filteredSkills.map(skill => (
            <div key={skill._id} className="black-card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#fff' }}>{skill.title}</div>
              <div style={{ color: '#aaa', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                Category: {skill.category} | Type: {skill.type.charAt(0).toUpperCase() + skill.type.slice(1)}<br />
                By: {skill.owner?.name} ({skill.owner?.email})
              </div>
              <div style={{ color: '#fff' }}>{skill.description}</div>
              {skill.availability && skill.availability.length > 0 && (
                <div style={{ fontSize: '0.95rem', marginTop: '0.5rem', color: '#aaa' }}>
                  <strong>Availability:</strong> {skill.availability.join(', ')}
                </div>
              )}
              <div style={{ 
                marginTop: '1rem', 
                display: 'flex', 
                gap: '0.5rem', 
                flexWrap: 'wrap',
                justifyContent: 'flex-start'
              }}>
                {isLoggedIn && skill.owner?._id !== currentUserId && (
                  <button
                    className="black-btn"
                    onClick={() => openRequestModal(skill)}
                  >
                    Request Session
                  </button>
                )}
                {/* Show edit/delete buttons for admin or skill owner */}
                {(userRole === 'admin' || skill.owner?.email === userEmail) && (
                  <>
                    <button
                      className="black-btn"
                      onClick={() => navigate(`/skills/edit/${skill._id}`)}
                      style={{ background: '#28a745' }}
                    >
                      Edit
                    </button>
                    <button
                      className="black-btn"
                      onClick={() => handleDeleteSkill(skill._id)}
                      style={{ background: '#dc3545' }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {!isLoading && filteredSkills.length === 0 && !errorMessage && (
            <div style={{ textAlign: 'center', color: '#aaa' }}>No skill listings found.</div>
          )}
        </div>
      </div>
      {/* Request Modal */}
      {showRequestModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#222',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 16px rgba(0,0,0,0.7)',
            color: '#fff',
            minWidth: '320px',
            maxWidth: '90vw',
            position: 'relative',
          }}>
            <button 
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                color: '#fff',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
              }} 
              onClick={closeRequestModal}
            >
              &times;
            </button>
            <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>Request Session</h3>
            {requestError && <div style={{ color: '#ff4d4f', marginBottom: '1rem', textAlign: 'center' }}>{requestError}</div>}
            {requestSuccess && <div style={{ color: '#52c41a', marginBottom: '1rem', textAlign: 'center' }}>{requestSuccess}</div>}
            <form onSubmit={handleRequestSubmit}>
              <textarea
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  margin: '0.5rem 0',
                  borderRadius: '4px',
                  border: '1px solid #444',
                  background: '#181818',
                  color: '#fff',
                  fontSize: '1rem',
                }}
                placeholder="Message to skill owner"
                value={requestMessage}
                onChange={e => setRequestMessage(e.target.value)}
                required
                rows={3}
              />
              <input
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  margin: '0.5rem 0',
                  borderRadius: '4px',
                  border: '1px solid #444',
                  background: '#181818',
                  color: '#fff',
                  fontSize: '1rem',
                }}
                type="text"
                placeholder="Preferred schedule (e.g. Monday 2pm)"
                value={requestSchedule}
                onChange={e => setRequestSchedule(e.target.value)}
                required
              />
              <button
                style={{
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
                }}
                type="submit"
                disabled={requestLoading}
              >
                {requestLoading ? 'Sending...' : 'Send Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllSkills; 