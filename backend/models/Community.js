import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './Community.css';

const Community = () => {
  const { communityName } = useParams();
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/communities/${communityName}`);
        setCommunity(response.data);
        
        // Fetch community posts
        // This will need to be implemented in the backend
        // For now, we'll use placeholder data
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
      } catch (error) {
        console.error('Error fetching community:', error);
        setError('Community not found or error loading data');
        setLoading(false);
      }
    };
    
    fetchCommunity();
  }, [communityName]);

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
          <button className="join-button">Join</button>
        </div>
      </div>
      
      <div className="community-content">
        <div className="post-list">
          <div className="post-actions">
            <button className="create-post">Create Post</button>
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