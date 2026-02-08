import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserDashboard.css';

const UserDashboard = () => {
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
      const response = await axios.get('http://localhost:5001/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      setFormData({
        name: response.data.name,
        email: response.data.email,
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

      await axios.put('http://localhost:5001/api/user/profile', updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEditing(false);
      fetchUserProfile();
      alert('Profile updated successfully');
    } catch (error) {
      alert('Error updating profile: ' + error.response?.data?.message);
    }
  };

  if (loading) {
    return <div className="user-dashboard">Loading...</div>;
  }

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h1>User Dashboard</h1>
        <button 
          className="edit-profile-btn"
          onClick={() => setEditing(!editing)}
        >
          {editing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      <div className="profile-section">
        <h2>Profile Information</h2>
        
        {!editing ? (
          <div className="profile-info">
            <div className="info-item">
              <label>Name:</label>
              <span>{user?.name}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{user?.email}</span>
            </div>
            <div className="info-item">
              <label>Role:</label>
              <span className={`role-badge ${user?.role}`}>
                {user?.role}
              </span>
            </div>
            <div className="info-item">
              <label>Member Since:</label>
              <span>{new Date(user?.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <label>Status:</label>
              <span className={user?.isBanned ? 'status-banned' : 'status-active'}>
                {user?.isBanned ? 'Banned' : 'Active'}
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile} className="edit-form">
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            <div className="password-section">
              <h3>Change Password (Optional)</h3>
              
              <div className="form-group">
                <label>Current Password:</label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>New Password:</label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Confirm New Password:</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </div>

            <div className="form-buttons">
              <button type="submit" className="save-btn">
                Save Changes
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <div className="action-card">
            <h3>My Skills</h3>
            <p>View and manage your skill listings</p>
            <button onClick={() => navigate('/skills/mine')}>
              View Skills
            </button>
          </div>
          
          <div className="action-card">
            <h3>Create Skill</h3>
            <p>Add a new skill to your profile</p>
            <button onClick={() => navigate('/skills/create')}>
              Create Skill
            </button>
          </div>
          
          <div className="action-card">
            <h3>Requests</h3>
            <p>Manage skill exchange requests</p>
            <button onClick={() => navigate('/requests/received')}>
              View Requests
            </button>
          </div>
          
          <div className="action-card">
            <h3>Sessions</h3>
            <p>Track your learning sessions</p>
            <button onClick={() => navigate('/sessions')}>
              View Sessions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
