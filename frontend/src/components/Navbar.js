import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token) {
      setIsLoggedIn(true);
      setIsAdmin(role === 'admin');
    } else {
      setIsLoggedIn(false);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
    
    // Listen for storage changes (when login/logout happens)
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'role') {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events that might be triggered during login/logout
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

const getNavLinks = () => {
  if (isAdmin) {
    return [
      { to: '/admin/dashboard', label: 'Admin Dashboard' },
      { to: '/skills', label: 'All Skills' },
      { to: '/skills/create', label: 'Create Skill' },
      { to: '/skills/mine', label: 'My Skills' },
      { to: '/requests/received', label: 'Received Requests' },
      { to: '/requests/sent', label: 'Sent Requests' },
      { to: '/sessions', label: 'Sessions' },
      { to: '/reviews', label: 'Reviews' },
      { to: '/profile', label: 'Profile' },
      { to: '/logout', label: 'Logout' },
    ];
  } else if (isLoggedIn) {
    return [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/skills', label: 'All Skills' },
      { to: '/skills/create', label: 'Create Skill' },
      { to: '/skills/mine', label: 'My Skills' },
      { to: '/requests/received', label: 'Received Requests' },
      { to: '/requests/sent', label: 'Sent Requests' },
      { to: '/sessions', label: 'Sessions' },
      { to: '/reviews', label: 'Reviews' },
      { to: '/profile', label: 'Profile' },
      { to: '/logout', label: 'Logout' },
    ];
  } else {
    return [
      { to: '/login', label: 'Login' },
      { to: '/register', label: 'Register' },
    ];
  }
};

  return (
    <>
      <style>{`
        @media (max-width: 900px) {
          .custom-navbar-links {
            display: none !important;
          }
          .custom-navbar-links.open {
            display: flex !important;
            flex-direction: column;
            position: absolute;
            top: 60px;
            right: 2rem;
            background: rgba(0,0,0,0.85);
            border-radius: 8px;
            padding: 1rem;
            gap: 1rem;
            z-index: 120;
            min-width: 160px;
          }
          .custom-navbar-hamburger {
            display: flex !important;
          }
        }
      `}</style>
      <nav style={styles.navbar}>
        <div style={styles.brand} onClick={() => navigate('/skills')}>SkillPocket</div>
        <button
          className="custom-navbar-hamburger"
          style={styles.hamburger}
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
        >
          <span style={styles.bar}></span>
          <span style={styles.bar}></span>
          <span style={styles.bar}></span>
        </button>
        <ul
          className={`custom-navbar-links${open ? ' open' : ''}`}
          style={{ ...styles.navLinks, ...(open ? styles.show : {}) }}
        >
          {getNavLinks().map(link => (
            <li key={link.to} style={styles.navItem}>
              <Link to={link.to} style={styles.link} onClick={() => setOpen(false)}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

const styles = {
  navbar: {
    width: '100%',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.5rem 2rem',
    background: 'transparent',
    boxSizing: 'border-box',
    boxShadow: 'none',
  },
  brand: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '1.5rem',
    cursor: 'pointer',
    letterSpacing: '1px',
    userSelect: 'none',
  },
  hamburger: {
    display: 'none',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '32px',
    height: '32px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    zIndex: 110,
  },
  bar: {
    width: '24px',
    height: '3px',
    background: '#fff',
    margin: '3px 0',
    borderRadius: '2px',
    display: 'block',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    transition: 'all 0.3s',
    position: 'relative',
    zIndex: 105,
  },
  navItem: {},
  link: {
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    transition: 'color 0.2s',
    whiteSpace: 'nowrap',
  },
  show: {},
};

export default Navbar; 
