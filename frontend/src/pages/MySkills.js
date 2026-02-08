import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/GlobalStyles.css';

function MySkills() {
  const [mySkillList, setMySkillList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const fetchMySkillListings = async () => {
    setIsLoading(true);
    setErrorMessage('');
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('You must be logged in to view your skills.');
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch('http://localhost:5001/api/skills/mine', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch your skill listings');
      const data = await response.json();
      setMySkillList(data);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    fetchMySkillListings();
    // eslint-disable-next-line
  }, []);

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) {
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('You must be logged in to delete a skill.');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5001/api/skills/${skillId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete skill');
      setMySkillList(prevSkills => prevSkills.filter(skill => skill._id !== skillId));
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
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#fff' }}>My Skill Listings</h2>
          {isLoading && <div style={{ textAlign: 'center', color: '#fff' }}>Loading...</div>}
          {errorMessage && <div style={{ color: '#ff4d4f', textAlign: 'center' }}>{errorMessage}</div>}
          {mySkillList.map(skill => (
            <div key={skill._id} className="black-card" style={{ marginBottom: '1.5rem', position: 'relative' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#fff' }}>{skill.title}</div>
              <div style={{ color: '#aaa', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                Category: {skill.category} | Type: {skill.type.charAt(0).toUpperCase() + skill.type.slice(1)}
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
              </div>
            </div>
          ))}
          {!isLoading && mySkillList.length === 0 && !errorMessage && (
            <div style={{ textAlign: 'center', color: '#aaa' }}>
              You haven't created any skill listings yet.
              <br />
              <button
                className="black-btn"
                onClick={() => navigate('/skills/create')}
                style={{ marginTop: '1rem' }}
              >
                Create Your First Skill
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MySkills; 
