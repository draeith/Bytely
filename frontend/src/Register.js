import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Navigate, Link } from 'react-router-dom';
import './AuthStyles.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, user, errorMessage } = useAuth();

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    
    if (value.length < 3 || value.length > 30) {
      setUsernameError('Username must be 3-30 characters');
    } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameError('Only letters, numbers, and underscores allowed');
    } else {
      setUsernameError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (usernameError) return;
    
    setIsLoading(true);
    try {
      await register(email, password, username);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-decoration decoration-1"></div>
        <div className="auth-decoration decoration-2"></div>
        
        <div className="auth-header">
          <img src="/logo192.png" alt="Bytely Logo" className="auth-logo" />
          <h1 className="auth-title">Join Bytely</h1>
          <p className="auth-subtitle">Create an account to get started</p>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          {errorMessage && (
            <div className="auth-error">
              <span className="auth-error-icon">⚠️</span>
              {errorMessage}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={handleUsernameChange}
              className={`form-input ${usernameError ? 'input-error-field' : ''}`}
              placeholder="cooluser123"
              required
            />
            {usernameError && <div className="input-error">{usernameError}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading || usernameError}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
          
          <div className="auth-switch">
            Already have an account?
            <Link to="/login" className="auth-switch-link">Sign In</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;