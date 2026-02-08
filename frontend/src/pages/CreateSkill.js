import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/GlobalStyles.css';

function CreateSkill() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('offer');
  const [availability, setAvailability] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleSkillSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('You must be logged in to create a skill listing.');
      setIsSubmitting(false);
      return;
    }
    try {
      const response = await fetch('http://localhost:5001/api/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          category,
          type,
          availability: availability.split(',').map(a => a.trim()).filter(Boolean),
        }),
      });
      if (!response.ok) throw new Error('Failed to create skill listing');
      setSuccessMessage('Skill listing created successfully!');
      setTitle('');
      setDescription('');
      setCategory('');
      setType('offer');
      setAvailability('');
      setTimeout(() => {
        navigate('/skills');
      }, 1500);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
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
        <div className="black-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#fff' }}>Create Skill Listing</h2>
          {errorMessage && <div style={{ color: '#ff4d4f', marginBottom: '1rem', textAlign: 'center' }}>{errorMessage}</div>}
          {successMessage && <div style={{ color: '#52c41a', marginBottom: '1rem', textAlign: 'center' }}>{successMessage}</div>}
          <form onSubmit={handleSkillSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#fff', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Title:</label>
              <input
                className="black-input"
                type="text"
                placeholder="Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#fff', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Description:</label>
              <textarea
                className="black-input"
                placeholder="Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#fff', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Category:</label>
              <input
                className="black-input"
                type="text"
                placeholder="Category (e.g. Music, Tech, Language)"
                value={category}
                onChange={e => setCategory(e.target.value)}
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#fff', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Type:</label>
              <select
                className="black-input"
                value={type}
                onChange={e => setType(e.target.value)}
              >
                <option value="offer">Offer</option>
                <option value="request">Request</option>
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#fff', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Availability:</label>
              <input
                className="black-input"
                type="text"
                placeholder="Availability (comma separated, e.g. Monday 10am-12pm, Friday 2pm-4pm)"
                value={availability}
                onChange={e => setAvailability(e.target.value)}
              />
            </div>
            <button className="black-btn" type="submit" disabled={isSubmitting} style={{ width: '100%' }}>
              {isSubmitting ? 'Creating...' : 'Create Skill'}
            </button>
          </form>
          <button
            className="black-btn"
            onClick={() => navigate('/skills')}
            style={{ 
              marginTop: '1rem', 
              background: '#6c757d',
              width: '100%'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateSkill; 
