import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Navigate, Link } from 'react-router-dom'; // Add Link import

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, user, errorMessage } = useAuth();  // Access register function and error message from AuthContext
  const [localErrorMessage, setLocalErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(email, password);
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
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="current-password"
        />
        <button type="submit">Register</button>
      </form>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>} {/* Show error message */}
      <p>Already have an account? <Link to="/login">Login here</Link></p>
    </div>
  );
};
export default Register;
