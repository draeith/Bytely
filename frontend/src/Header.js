import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="logo-section">
          <Link to="/" className="logo-link">
            <img src="/logo192.png" alt="Logo" className="site-logo" />
            Bytely
          </Link>
        </div>
        
        <div className="search-section">
          <div className="search-container">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search posts, topics, or users..."
            />
            <button className="search-button">🔍</button>
          </div>
        </div>
        
        <nav className="navigation-section">
          {user ? (
            <>
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/profile" className="nav-link">Profile</Link>
              <div className="user-menu">
                <div className="user-avatar">
                  {(user?.username?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                </div>
                <div className="dropdown-content">
                  <Link to="/profile" className="dropdown-item">My Profile</Link>
                  <Link to="/settings" className="dropdown-item">Settings</Link>
                  <button onClick={handleLogout} className="dropdown-item logout">Logout</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link login-button">Login</Link>
              <Link to="/register" className="nav-link register-button">Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;