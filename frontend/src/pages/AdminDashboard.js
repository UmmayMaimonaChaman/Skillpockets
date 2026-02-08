import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });

  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    if (!token || userRole !== 'admin') {
      navigate('/login');
      return;
    }
    
    fetchData();
  }, [token, userRole, navigate]);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchUsers(),
        fetchSkills(),
        fetchSessions(),
        fetchReviews(),
        fetchStats()
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Users fetched:', response.data);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error.response?.data || error.message);
    }
  };

  const fetchSkills = async () => {
    try {
      const response = await axios.get('/api/admin/skills', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Skills fetched:', response.data);
      setSkills(response.data);
    } catch (error) {
      console.error('Error fetching skills:', error.response?.data || error.message);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await axios.get('/api/admin/sessions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Sessions fetched:', response.data);
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error.response?.data || error.message);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get('/api/admin/reviews', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Reviews fetched:', response.data);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error.response?.data || error.message);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Stats fetched:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error.response?.data || error.message);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/users', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({ name: '', email: '', password: '', role: 'user' });
      setShowCreateForm(false);
      fetchUsers();
      fetchStats();
    } catch (error) {
      alert('Error creating user: ' + error.response?.data?.message);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/admin/users/${editingUser._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({ name: '', email: '', password: '', role: 'user' });
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      alert('Error updating user: ' + error.response?.data?.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchUsers();
        fetchStats();
      } catch (error) {
        alert('Error deleting user: ' + error.response?.data?.message);
      }
    }
  };

  const handleToggleBan = async (userId) => {
    try {
      await axios.put(`/api/admin/users/${userId}/toggle-ban`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
      fetchStats();
    } catch (error) {
      alert('Error toggling ban: ' + error.response?.data?.message);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      try {
        await axios.delete(`/api/admin/skills/${skillId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchSkills();
        fetchStats();
      } catch (error) {
        alert('Error deleting skill: ' + error.response?.data?.message);
      }
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await axios.delete(`/api/admin/sessions/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchSessions();
        fetchStats();
      } catch (error) {
        alert('Error deleting session: ' + error.response?.data?.message);
      }
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await axios.delete(`/api/admin/reviews/${reviewId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchReviews();
        fetchStats();
      } catch (error) {
        alert('Error deleting review: ' + error.response?.data?.message);
      }
    }
  };

  const openEditForm = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    });
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return <div className="admin-dashboard">Loading...</div>;
  }

  // Check if user is admin
  if (!token || userRole !== 'admin') {
    return <div className="admin-dashboard">Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button 
          className="create-user-btn"
          onClick={() => setShowCreateForm(true)}
        >
          Create New User
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`tab ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          Skills
        </button>
        <button 
          className={`tab ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          Sessions
        </button>
        <button 
          className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p>{stats.totalUsers || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Total Admins</h3>
              <p>{stats.totalAdmins || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Banned Users</h3>
              <p>{stats.bannedUsers || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Total Skills</h3>
              <p>{stats.totalSkills || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Total Sessions</h3>
              <p>{stats.totalSessions || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Total Reviews</h3>
              <p>{stats.totalReviews || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="users-section">
          <h2>All Users</h2>
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} className={user.isBanned ? 'banned-user' : ''}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      {user.isBanned ? (
                        <span className="status-banned">Banned</span>
                      ) : (
                        <span className="status-active">Active</span>
                      )}
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="edit-btn"
                          onClick={() => openEditForm(user)}
                        >
                          Edit
                        </button>
                        <button 
                          className={user.isBanned ? 'unban-btn' : 'ban-btn'}
                          onClick={() => handleToggleBan(user._id)}
                        >
                          {user.isBanned ? 'Unban' : 'Ban'}
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Skills Tab */}
      {activeTab === 'skills' && (
        <div className="skills-section">
          <h2>All Skills</h2>
          <div className="skills-grid">
            {skills.map(skill => (
              <div key={skill._id} className="skill-card">
                <h3>{skill.title}</h3>
                <p><strong>Owner:</strong> {skill.owner?.name}</p>
                <p><strong>Description:</strong> {skill.description}</p>
                <p><strong>Category:</strong> {skill.category}</p>
                <p><strong>Created:</strong> {new Date(skill.createdAt).toLocaleDateString()}</p>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteSkill(skill._id)}
                >
                  Delete Skill
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="sessions-section">
          <h2>All Sessions</h2>
          <div className="sessions-grid">
            {sessions.map(session => (
              <div key={session._id} className="session-card">
                <h3>Session: {session.skill?.title}</h3>
                <p><strong>Teacher:</strong> {session.owner?.name}</p>
                <p><strong>Learner:</strong> {session.requester?.name}</p>
                <p><strong>Date:</strong> {new Date(session.scheduledTime).toLocaleString()}</p>
                <p><strong>Status:</strong> {session.status}</p>
                {session.meetLink && (
                  <p><strong>Meet Link:</strong> {session.meetLink}</p>
                )}
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteSession(session._id)}
                >
                  Delete Session
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="reviews-section">
          <h2>All Reviews</h2>
          <div className="reviews-grid">
            {reviews.map(review => (
              <div key={review._id} className="review-card">
                <div className="review-header">
                  <h3>Review by {review.reviewer?.name}</h3>
                  <div className="rating">{renderStars(review.rating)}</div>
                </div>
                <p><strong>For:</strong> {review.reviewee?.name}</p>
                <p><strong>Session:</strong> {review.session?.skill?.title || 'N/A'}</p>
                <p><strong>Comment:</strong> {review.comment}</p>
                <p><strong>Date:</strong> {new Date(review.createdAt).toLocaleDateString()}</p>
                <div className="review-actions">
                  <button 
                    className="ban-btn"
                    onClick={() => handleToggleBan(review.reviewer._id)}
                  >
                    Ban Reviewer
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteReview(review._id)}
                  >
                    Delete Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create New User</h2>
            <form onSubmit={handleCreateUser}>
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <div className="modal-buttons">
                <button type="submit">Create User</button>
                <button type="button" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit User</h2>
            <form onSubmit={handleUpdateUser}>
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
              <input
                type="password"
                placeholder="New Password (leave blank to keep current)"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <div className="modal-buttons">
                <button type="submit">Update User</button>
                <button type="button" onClick={() => setEditingUser(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 
