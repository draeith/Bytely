import React from 'react';
import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';

const Home = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;  // Redirect to login if no user
  }

  return (
    <div>
      <h2>Welcome, {user.email}</h2>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Home;
