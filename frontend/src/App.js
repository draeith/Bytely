import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Home from './Home';
import Profile from './Profile';
import UserProfile from './UserProfile';
import Settings from './Settings';
import Community from './Community'; // Import the Community component
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from './AuthContext';
import Header from './Header';
import Sidebar from './Sidebar'; // Import the Sidebar component
import './App.css'; // Make sure to update this

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="app-container">
        <Header />
        <div className="main-content">
          <Sidebar />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              
              {/* Public user profile route */}
              <Route path="/user/:username" element={<UserProfile />} />
              
              {/* Community route */}
              <Route path="/b/:communityName" element={<Community />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;