import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './UserProfile.css';

const UserProfile = () => {
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch user profile data from backend
    const fetchUserProfile = async () => {
      try {
        // This would be your real API call
        // const response = await axios.get(`http://localhost:5000/api/users/${username}`);
        // setProfileData(response.data);
        
        // For now, connect with fake data that mimics your DB structure
        // In production, replace with actual API call
        const mockApiCall = new Promise((resolve) => {
          setTimeout(() => {
            // This mimics fetching from your Postgres database
            resolve({
              username,
              karma: username === 'admin' ? 1337 : Math.floor(Math.random() * 500),
              // Convert ISO string from DB to readable format
              created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
              bio: username === 'admin' ? 'Admin and developer of Bytely' : '',
              posts: []
            });
          }, 300);
        });
        
        const userData = await mockApiCall;
        
        // Format the date for display
        const joinDate = new Date(userData.created_at);
        const formattedDate = joinDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        setProfileData({
          ...userData,
          joinDate: formattedDate
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('User not found');
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [username]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="profile-page-container">
      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-placeholder">
              {profileData.username.charAt(0).toUpperCase()}
            </div>
          </div>
          <h2 className="profile-username">u/{profileData.username}</h2>
          <div className="profile-meta">
            <span>Joined {profileData.joinDate}</span>
            <span>• {profileData.karma} karma</span>
          </div>
          {profileData.bio && <p className="profile-bio">{profileData.bio}</p>}
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
        </div>

        <div className="profile-tab-content">
          {activeTab === 'overview' && (
            <div className="placeholder-content">
              This is u/{profileData.username}'s overview
            </div>
          )}
          {activeTab === 'posts' && (
            <div className="placeholder-content">
              {profileData.username}'s posts will appear here
            </div>
          )}
          {activeTab === 'comments' && (
            <div className="placeholder-content">
              {profileData.username}'s comments will appear here
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;