import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';
import './Community.css';

const Community = () => {
  const { communityName } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isModerator, setIsModerator] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, fetch from API
        const response = await axios.get(`http://localhost:5000/api/communities/${communityName}`);
        setCommunity(response.data);
        
        // Check if user is a member or moderator
        if (user) {
          const membershipResponse = await axios.get(
            `http://localhost:5000/api/communities/${communityName}/membership`,
            { withCredentials: true }
          );
          
          setIsMember(membershipResponse.data.isMember);
          setIsModerator(membershipResponse.data.isModerator);
          setIsOwner(membershipResponse.data.isOwner);
        }
        
        // Fetch posts for this community
        const postsResponse = await axios.get(`http://localhost:5000/api/communities/${communityName}/posts`);
        setPosts(postsResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching community:', error);
        
        // For demo purposes, create mock data if API fails
        setCommunity({
          name: communityName,
          description: `Welcome to b/${communityName}`,
          created_at: new Date().toISOString()
        });
        
        // Mock data for development
        if (user) {
          setIsMember(true);
          setIsModerator(user.username === 'admin');
          setIsOwner(user.username === 'admin');
        }
        
        setPosts([
          {
            id: 1,
            title: `Welcome to b/${communityName}`,
            content: 'This is the first post in this community.',
            author: 'admin',
            upvotes: 15,
            comments: 5,
            timestamp: '1 day ago'
          },
          {
            id: 2,
            title: 'Community guidelines',
            content: 'Please follow these guidelines when posting.',
            author: 'moderator',
            upvotes: 10,
            comments: 3,
            timestamp: '2 days ago'
          }
        ]);
        
        setLoading(false);
      }
    };
    
    fetchCommunity();
  }, [communityName, user]);

  const handleJoinCommunity = async () => {
    if (!user) {
      // Prompt user to login
      alert('Please log in to join this community');
      return;
    }
    
    try {
      await axios.post(
        `http://localhost:5000/api/communities/${communityName}/join`,
        {},
        { withCredentials: true }
      );
      
      setIsMember(true);
    } catch (error) {
      console.error('Error joining community:', error);
    }
  };

  const handleLeaveCommunity = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/communities/${communityName}/leave`,
        {},
        { withCredentials: true }
      );
      
      setIsMember(false);
    } catch (error) {
      console.error('Error leaving community:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading community...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="community-page">
      <div className="community-header">
        <div className="community-banner">
          <h1>b/{community.name}</h1>
        </div>
        <div className="community-info">
          <p className="community-description">
            {community.description || 'No description available.'}
          </p>
          <div className="community-stats">
            <div className="stat">
              <span className="stat-value">{posts.length}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat">
              <span className="stat-value">1</span>
              <span className="stat-label">Online</span>
            </div>
            <div className="stat">
              <span className="stat-value">10</span>
              <span className="stat-label">Members</span>
            </div>
          </div>
          {user ? (
            isMember ? (
              <button onClick={handleLeaveCommunity} className="join-button leave">
                Leave
              </button>
            ) : (
              <button onClick={handleJoinCommunity} className="join-button">
                Join
              </button>
            )
          ) : (
            <button onClick={() => alert('Please log in to join')} className="join-button">
              Join
            </button>
          )}
        </div>
      </div>
      
      <div className="community-content">
        <div className="post-list">
          <div className="post-actions">
            <div className="action-buttons">
              <button className="create-post">Create Post</button>
              {(isModerator || isOwner) && (
                <button 
                  className="mod-tools" 
                  onClick={() => navigate(`/b/${communityName}/mod`)}
                >
                  Mod Tools
                </button>
              )}
            </div>
            <div className="post-sort">
              <select>
                <option value="hot">Hot</option>
                <option value="new">New</option>
                <option value="top">Top</option>
              </select>
            </div>
          </div>
          
          {posts.length > 0 ? (
            posts.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-votes">
                  <button className="vote-button up">▲</button>
                  <span className="vote-count">{post.upvotes}</span>
                  <button className="vote-button down">▼</button>
                </div>
                <div className="post-content">
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-meta">Posted by u/{post.author} • {post.timestamp}</p>
                  <p className="post-excerpt">{post.content}</p>
                  <div className="post-actions">
                    <button className="post-action-button">
                      <span className="action-icon">💬</span> 
                      {post.comments} Comments
                    </button>
                    <button className="post-action-button">
                      <span className="action-icon">⤴️</span> 
                      Share
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-posts">
              <p>No posts yet in this community</p>
              <button className="create-post">Create the first post</button>
            </div>
          )}
        </div>
        
        <div className="community-sidebar">
          <div className="sidebar-card">
            <h3>About b/{community.name}</h3>
            <p>{community.description || 'No description available.'}</p>
            <div className="community-created">
              <span className="label">Created:</span>
              <span className="value">{new Date(community.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="sidebar-card">
            <h3>Community Rules</h3>
            <ul className="rules-list">
              <li>Be respectful to others</li>
              <li>No spam or self-promotion</li>
              <li>Use appropriate tags</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;