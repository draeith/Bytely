import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Home from './Home';
import Profile from './Profile';
import UserProfile from './UserProfile';
import Settings from './Settings';
import Community from './Community';
import ModTools from './ModTools'; // Add this import
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from './AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import './App.css';

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
              
              {/* Community routes */}
              <Route path="/b/:communityName" element={<Community />} />
              <Route
                path="/b/:communityName/mod"
                element={
                  <ProtectedRoute>
                    <ModTools />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;