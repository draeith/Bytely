import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Navigate, Link } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const { register, user, errorMessage } = useAuth();
  const [localErrorMessage, setLocalErrorMessage] = useState('');

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
    if (usernameError) return; // Block submission if username is invalid
    
    try {
      await register(email, password, username);
    } catch (err) {
      setLocalErrorMessage('Error creating account');
    }
  };

  if (user) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="text"
          value={username}
          onChange={handleUsernameChange}
          placeholder="Username"
          required
        />
        {usernameError && <p style={{ color: 'red', fontSize: '0.8rem' }}>{usernameError}</p>}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="current-password"
        />
        <button type="submit">Register</button>
      </form>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      {localErrorMessage && <p style={{ color: 'red' }}>{localErrorMessage}</p>}
      <p>Already have an account? <Link to="/login">Login here</Link></p>
    </div>
  );
};

export default Register;