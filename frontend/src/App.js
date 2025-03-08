import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Home from './Home';
import Profile from './Profile'; // Import Profile component
import ProtectedRoute from './ProtectedRoute'; // Import ProtectedRoute component
import { useAuth } from './AuthContext';  // Access the current user
import Header from './Header';  // Import the Header component

function App() {
  const { user } = useAuth();  // Get the current user from context

  return (
    <Router>
      {/* Add Header here so it shows up on every page */}
      <Header /> 

      <Routes>
        <Route path="/" element={<Home />} />  {/* Home page, no protection needed */}
        <Route path="/login" element={<Login />} />  {/* Login page */}
        <Route path="/register" element={<Register />} />  {/* Register page */}

        {/* Protected route for the user profile/dashboard */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />  {/* Profile page accessible only by authenticated users */}
            </ProtectedRoute>
          }
        />

        {/* Optionally, you can have the /home route as a protected page or for logged-in users */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
