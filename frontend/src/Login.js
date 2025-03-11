import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Navigate, Link } from 'react-router-dom';
import './AuthStyles.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, errorMessage } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    await login(email, password);
    
    setIsLoading(false);
  };

  if (user) {
    return <Navigate to="/home" />;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-decoration decoration-1"></div>
        <div className="auth-decoration decoration-2"></div>
        
        <div className="auth-header">
          <img src="/logo192.png" alt="Bytely Logo" className="auth-logo" />
          <h1 className="auth-title">Welcome to Bytely</h1>
          <p className="auth-subtitle">Sign in to continue to your account</p>
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
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
          
          <div className="auth-switch">
            Don't have an account?
            <Link to="/register" className="auth-switch-link">Sign Up</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;