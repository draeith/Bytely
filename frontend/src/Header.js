import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
              <button className="create-post-button nav-link">Create</button>
              <Link to="/" className="nav-link">Home</Link>
              {/* Quick theme toggle button */}
              <button 
                className="theme-toggle nav-link" 
                onClick={toggleTheme}
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <div className="user-menu">
                <div className="user-avatar">
                  {(user?.username?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                </div>
                <div className="dropdown-content">
                  <Link to={`/user/${user.username || 'user'}`} className="dropdown-item">Public Profile</Link>
                  <Link to="/settings" className="dropdown-item">Account Settings</Link>
                  <button onClick={handleLogout} className="dropdown-item logout">Logout</button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Theme toggle even when not logged in */}
              <button 
                className="theme-toggle nav-link" 
                onClick={toggleTheme}
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
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