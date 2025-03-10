import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [newName, setNewName] = useState(user?.name || '');
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Handle profile update
  const handleUpdateProfile = () => {
    console.log('Updating profile:', newName, newEmail);
    setEditing(false);
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="profile-page-container">
      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-avatar">
            {/* Placeholder for profile image */}
            {user?.profilePic ? (
              <img src={user.profilePic} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">
                {(user?.name || 'User').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h2 className="profile-username">{user?.username || 'Anonymous Bytely User'}</h2>
        </div>

        <div className="profile-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabChange('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => handleTabChange('posts')}
          >
            Posts
          </button>
          <button 
            className={`tab-button ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => handleTabChange('comments')}
          >
            Comments
          </button>
          <button 
            className={`tab-button ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => handleTabChange('saved')}
          >
            Saved
          </button>
          <button 
            className={`tab-button ${activeTab === 'upvoted' ? 'active' : ''}`}
            onClick={() => handleTabChange('upvoted')}
          >
            Upvoted
          </button>
          <button 
            className={`tab-button ${activeTab === 'downvoted' ? 'active' : ''}`}
            onClick={() => handleTabChange('downvoted')}
          >
            Downvoted
          </button>
        </div>

        <div className="profile-tab-content">
          {activeTab === 'overview' && (
            <div className="profile-info-section">
              <h3>Profile Information</h3>
              <div className="profile-info-card">
                <div className="profile-item">
                  <strong>Name:</strong>
                  {editing ? (
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="profile-input"
                    />
                  ) : (
                    <p>{user?.name || 'No name available'}</p>
                  )}
                </div>
                <div className="profile-item">
                  <strong>Email:</strong>
                  {editing ? (
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="profile-input"
                    />
                  ) : (
                    <p>{user?.email || 'No email available'}</p>
                  )}
                </div>

                <div className="profile-actions">
                  {editing ? (
                    <button className="action-button save" onClick={handleUpdateProfile}>Save Changes</button>
                  ) : (
                    <button className="action-button edit" onClick={() => setEditing(true)}>Edit Profile</button>
                  )}

                  <button className="action-button logout" onClick={handleLogout}>Logout</button>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'posts' && <div className="placeholder-content">Your posts will appear here</div>}
          {activeTab === 'comments' && <div className="placeholder-content">Your comments will appear here</div>}
          {activeTab === 'saved' && <div className="placeholder-content">Your saved content will appear here</div>}
          {activeTab === 'upvoted' && <div className="placeholder-content">Your upvoted content will appear here</div>}
          {activeTab === 'downvoted' && <div className="placeholder-content">Your downvoted content will appear here</div>}
        </div>
      </div>
    </div>
  );
};

export default Profile;
