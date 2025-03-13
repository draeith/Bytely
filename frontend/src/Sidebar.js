import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';
import './Sidebar.css';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Get state from localStorage or default to false
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [communityName, setCommunityName] = useState('');
  const [communityDescription, setCommunityDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  
  // State for communities
  const [userCommunities, setUserCommunities] = useState([]);
  const [recentCommunities, setRecentCommunities] = useState([]);

  // Fetch user communities when user is logged in
  useEffect(() => {
    if (user) {
      fetchUserCommunities();
      fetchRecentCommunities();
    }
  }, [user]);

  // Record community visit when path changes
  useEffect(() => {
    if (user && location.pathname.startsWith('/b/')) {
      const communityName = location.pathname.split('/')[2];
      recordCommunityVisit(communityName);
    }
  }, [location.pathname, user]);

  const fetchUserCommunities = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/my-communities', {
        withCredentials: true
      });
      setUserCommunities(response.data);
    } catch (error) {
      console.error('Error fetching user communities:', error);
    }
  };

  const fetchRecentCommunities = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/recent-communities', {
        withCredentials: true
      });
      setRecentCommunities(response.data);
    } catch (error) {
      console.error('Error fetching recent communities:', error);
    }
  };

  const recordCommunityVisit = async (communityName) => {
    try {
      // First get community ID from name
      const communityResponse = await axios.get(`http://localhost:5000/api/communities/${communityName}`);
      const communityId = communityResponse.data.id;
      
      // Then record the visit
      await axios.post(`http://localhost:5000/api/community-visit/${communityId}`, {}, {
        withCredentials: true
      });
      
      // Refresh recent communities
      fetchRecentCommunities();
    } catch (error) {
      console.error('Error recording community visit:', error);
    }
  };

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState.toString());
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    
    if (!communityName.trim()) {
      setErrorMessage('Community name cannot be empty');
      setIsLoading(false);
      return;
    }
    
    if (!/^[a-zA-Z0-9_]{3,21}$/.test(communityName)) {
      setErrorMessage('Community name must be 3-21 characters and only contain letters, numbers and underscores');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:5000/api/communities', {
        name: communityName,
        description: communityDescription
      }, { withCredentials: true });
      
      // Refresh communities lists
      fetchUserCommunities();
      fetchRecentCommunities();
      
      // Reset form
      setCommunityName('');
      setCommunityDescription('');
      setShowCreateCommunity(false);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Failed to create community');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button className="collapse-button" onClick={toggleSidebar}>
        {isCollapsed ? '→' : '←'}
      </button>
      
      {!isCollapsed && (
        <div className="sidebar-content">
          <nav className="sidebar-navigation">
            <div className="nav-section">
              <Link to="/" className="nav-item">
                <span className="nav-icon">🏠</span>
                <span className="nav-text">Home</span>
              </Link>
              <Link to="/popular" className="nav-item">
                <span className="nav-icon">🔥</span>
                <span className="nav-text">Popular</span>
              </Link>
              <Link to="/all" className="nav-item">
                <span className="nav-icon">🌐</span>
                <span className="nav-text">All</span>
              </Link>
            </div>
            
            {user && (
              <>
                <div className="nav-section-header">
                  <h3>YOUR COMMUNITIES</h3>
                </div>
                <div className="nav-section">
                  <button 
                    className="create-button"
                    onClick={() => setShowCreateCommunity(!showCreateCommunity)}
                  >
                    <span className="nav-icon">+</span>
                    <span className="nav-text">Create a community</span>
                  </button>
                  
                  {showCreateCommunity && (
                    <div className="create-community-form">
                      <form onSubmit={handleCreateCommunity}>
                        <input
                          type="text"
                          value={communityName}
                          onChange={(e) => setCommunityName(e.target.value)}
                          placeholder="Community name"
                          maxLength={21}
                        />
                        <textarea
                          value={communityDescription}
                          onChange={(e) => setCommunityDescription(e.target.value)}
                          placeholder="Description (optional)"
                          rows={3}
                        />
                        {errorMessage && <p className="error">{errorMessage}</p>}
                        <div className="form-actions">
                          <button 
                            type="submit" 
                            disabled={isLoading}
                          >
                            {isLoading ? 'Creating...' : 'Create'}
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setShowCreateCommunity(false)}
                            disabled={isLoading}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                  
                  {userCommunities.length > 0 ? (
                    userCommunities.map(community => (
                      <Link 
                        key={community.id} 
                        to={`/b/${community.name}`} 
                        className="nav-item"
                      >
                        <span className="nav-icon">b/</span>
                        <span className="nav-text">{community.name}</span>
                      </Link>
                    ))
                  ) : (
                    <div className="empty-state">
                      <p>You haven't joined any communities yet</p>
                    </div>
                  )}
                </div>
                
                {recentCommunities.length > 0 && (
                  <>
                    <div className="nav-section-header">
                      <h3>RECENT</h3>
                    </div>
                    <div className="nav-section">
                      {recentCommunities.map(community => (
                        <Link 
                          key={community.id} 
                          to={`/b/${community.name}`} 
                          className="nav-item"
                        >
                          <span className="nav-icon">b/</span>
                          <span className="nav-text">{community.name}</span>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
};

export default Sidebar;