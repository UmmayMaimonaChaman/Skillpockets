import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/GlobalStyles.css';

const editSkillStyles = {
  container: {
    minHeight: '100vh',
    background: '#111',
    color: '#fff',
    padding: '2rem',
  },
  form: {
    background: '#222',
    borderRadius: '8px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.5)',
    padding: '2rem',
    maxWidth: '600px',
    margin: '0 auto',
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
  textarea: {
    width: '100%',
    padding: '0.75rem',
    margin: '0.5rem 0',
    borderRadius: '4px',
    border: '1px solid #444',
    background: '#181818',
    color: '#fff',
    fontSize: '1rem',
    minHeight: '100px',
    resize: 'vertical',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    margin: '0.5rem 0',
    borderRadius: '4px',
    border: '1px solid #444',
    background: 'white',
    color: '#333',
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

function EditSkill() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: 'offer',
    availability: []
  });

  const userRole = localStorage.getItem('role');
  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchSkill = async () => {
      try {
        const response = await fetch(`/api/skills/${id}`);
        if (!response.ok) throw new Error('Skill not found');
        const skillData = await response.json();
        
        // Check if user can edit this skill
        if (userRole !== 'admin' && skillData.owner?.email !== userEmail) {
          setError('You are not authorized to edit this skill');
          setLoading(false);
          return;
        }

        setSkill(skillData);
        setFormData({
          title: skillData.title || '',
          description: skillData.description || '',
          category: skillData.category || '',
          type: skillData.type || 'offer',
          availability: skillData.availability || []
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSkill();
  }, [id, navigate, userRole, userEmail]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvailabilityChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      availability: value.split(',').map(item => item.trim()).filter(item => item)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/skills/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update skill');
      }

      setSuccess('Skill updated successfully!');
      setTimeout(() => {
        navigate('/skills');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="black-bg-page">
        <div className="page-content">
          <div className="black-card">
            <div style={{ textAlign: 'center', color: '#fff' }}>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !skill) {
    return (
      <div className="black-bg-page">
        <div className="page-content">
          <div className="black-card">
            <div style={{ color: '#ff4d4f', textAlign: 'center' }}>{error}</div>
            <button 
              className="black-btn" 
              onClick={() => navigate('/skills')}
              style={{ marginTop: '1rem' }}
            >
              Back to Skills
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#fff' }}>
            Edit Skill
          </h2>
          
          {error && <div style={editSkillStyles.error}>{error}</div>}
          {success && <div style={editSkillStyles.success}>{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div>
              <label style={{ color: '#fff', fontWeight: 'bold' }}>Title:</label>
              <input
                style={editSkillStyles.input}
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <label style={{ color: '#fff', fontWeight: 'bold' }}>Description:</label>
              <textarea
                style={editSkillStyles.textarea}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <label style={{ color: '#fff', fontWeight: 'bold' }}>Category:</label>
              <input
                style={editSkillStyles.input}
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <label style={{ color: '#fff', fontWeight: 'bold' }}>Type:</label>
              <select
                style={editSkillStyles.select}
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="offer">Offer</option>
                <option value="request">Request</option>
              </select>
            </div>
            
            <div>
              <label style={{ color: '#fff', fontWeight: 'bold' }}>
                Availability (comma-separated):
              </label>
              <input
                style={editSkillStyles.input}
                type="text"
                name="availability"
                value={formData.availability.join(', ')}
                onChange={handleAvailabilityChange}
                placeholder="e.g., Monday 2pm, Tuesday 3pm"
              />
            </div>
            
            <button
              style={editSkillStyles.button}
              type="submit"
              disabled={saving}
            >
              {saving ? 'Updating...' : 'Update Skill'}
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

export default EditSkill;
