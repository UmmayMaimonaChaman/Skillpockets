import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './styles/GlobalStyles.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Logout from './pages/Logout';
import Profile from './pages/Profile';
import CreateSkill from './pages/CreateSkill';
import AllSkills from './pages/AllSkills';
import MySkills from './pages/MySkills';
import EditSkill from './pages/EditSkill';
import ReceivedRequests from './pages/ReceivedRequests';
import SentRequests from './pages/SentRequests';
import SessionList from './pages/SessionList';
import Reviews from './pages/Reviews';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Navbar from './components/Navbar';

function App() {
  const isLoggedIn = !!localStorage.getItem('token');
  
  return (
    <Router>
      <Navbar />
      <div>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/skills" element={<AllSkills />} />
          <Route path="/skills/create" element={<CreateSkill />} />
          <Route path="/skills/edit/:id" element={<EditSkill />} />
          <Route path="/skills/mine" element={<MySkills />} />
          <Route path="/requests/received" element={<ReceivedRequests />} />
          <Route path="/requests/sent" element={<SentRequests />} />
          <Route path="/sessions" element={<SessionList />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/logout" element={<Logout />} />
          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
          <Route path="*" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 

