import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/GlobalStyles.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setUser(data);
      setFormData({
        name: data.name,
        email: data.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    try {
      const updateData = {
        name: formData.name,
        email: formData.email
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await fetch('http://localhost:5001/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      setEditing(false);
      fetchUserProfile();
      alert('Profile updated successfully');
    } catch (error) {
      alert('Error updating profile: ' + error.message);
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ color: '#fff', margin: 0 }}>Profile</h1>
            <button 
              className="black-btn"
              onClick={() => setEditing(!editing)}
            >
              {editing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Profile Information</h2>
            
            {!editing ? (
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', borderLeft: '4px solid #667eea' }}>
                  <label style={{ fontWeight: '600', color: '#fff', minWidth: '120px', marginRight: '1rem' }}>Name:</label>
                  <span style={{ color: '#ccc' }}>{user?.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', borderLeft: '4px solid #667eea' }}>
                  <label style={{ fontWeight: '600', color: '#fff', minWidth: '120px', marginRight: '1rem' }}>Email:</label>
                  <span style={{ color: '#ccc' }}>{user?.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', borderLeft: '4px solid #667eea' }}>
                  <label style={{ fontWeight: '600', color: '#fff', minWidth: '120px', marginRight: '1rem' }}>Role:</label>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', background: user?.role === 'admin' ? '#ff6b6b' : '#4ecdc4', color: 'white' }}>
                    {user?.role}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', borderLeft: '4px solid #667eea' }}>
                  <label style={{ fontWeight: '600', color: '#fff', minWidth: '120px', marginRight: '1rem' }}>Member Since:</label>
                  <span style={{ color: '#ccc' }}>{new Date(user?.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', borderLeft: '4px solid #667eea' }}>
                  <label style={{ fontWeight: '600', color: '#fff', minWidth: '120px', marginRight: '1rem' }}>Status:</label>
                  <span style={{ color: user?.isBanned ? '#ff6b6b' : '#51cf66', fontWeight: '600' }}>
                    {user?.isBanned ? 'Banned' : 'Active'}
                  </span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: '600', color: '#fff' }}>Name:</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="black-input"
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: '600', color: '#fff' }}>Email:</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="black-input"
                  />
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#fff', fontSize: '1.1rem', fontWeight: '600' }}>Change Password (Optional)</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    <label style={{ fontWeight: '600', color: '#fff' }}>Current Password:</label>
                    <input
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                      className="black-input"
                    />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    <label style={{ fontWeight: '600', color: '#fff' }}>New Password:</label>
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                      className="black-input"
                    />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: '600', color: '#fff' }}>Confirm New Password:</label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="black-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="submit" className="black-btn">
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    className="black-btn"
                    onClick={() => setEditing(false)}
                    style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: '2px solid rgba(255, 255, 255, 0.3)' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <button 
                className="black-btn"
                onClick={() => navigate('/sessions')}
                style={{ background: '#28a745' }}
              >
                View Sessions
              </button>
              <button 
                className="black-btn"
                onClick={() => navigate('/skills/mine')}
                style={{ background: '#17a2b8' }}
              >
                My Skills
              </button>
              <button 
                className="black-btn"
                onClick={() => navigate('/requests/received')}
                style={{ background: '#ffc107', color: '#000' }}
              >
                Received Requests
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 
