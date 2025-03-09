import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import './Home.css';

const Home = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('trending');
  const [posts, setPosts] = useState([]);

  // Dummy data for demonstration
  useEffect(() => {
    // In a real app, you would fetch this data from your API
    setPosts([
      {
        id: 1,
        title: 'Welcome to the Reddit-like App',
        author: 'admin',
        upvotes: 42,
        comments: 13,
        content: 'This is a sample post to demonstrate the new UI design.',
        timestamp: '2 hours ago'
      },
      {
        id: 2,
        title: 'How to get started with React',
        author: 'reactfan',
        upvotes: 28,
        comments: 5,
        content: 'React is a popular JavaScript library for building user interfaces.',
        timestamp: '4 hours ago'
      },
      {
        id: 3,
        title: 'Best practices for CSS organization',
        author: 'cssmaster',
        upvotes: 17,
        comments: 8,
        content: 'Organizing your CSS can greatly improve maintainability.',
        timestamp: '6 hours ago'
      }
    ]);
  }, []);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="home-page-container">
      <div className="home-content">
        <div className="home-header">
          <h1>Welcome to Bytely</h1>
          {user && <p className="welcome-message">Hello, {user.email}</p>}
        </div>

        <div className="home-tabs">
          <button 
            className={`tab-button ${activeTab === 'trending' ? 'active' : ''}`}
            onClick={() => handleTabChange('trending')}
          >
            Trending
          </button>
          <button 
            className={`tab-button ${activeTab === 'latest' ? 'active' : ''}`}
            onClick={() => handleTabChange('latest')}
          >
            Latest
          </button>
          <button 
            className={`tab-button ${activeTab === 'popular' ? 'active' : ''}`}
            onClick={() => handleTabChange('popular')}
          >
            Popular
          </button>
        </div>

        <div className="home-main-content">
          <div className="posts-container">
            {posts.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-votes">
                  <button className="vote-button up">▲</button>
                  <span className="vote-count">{post.upvotes}</span>
                  <button className="vote-button down">▼</button>
                </div>
                <div className="post-content">
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-meta">Posted by {post.author} • {post.timestamp}</p>
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
                    <button className="post-action-button">
                      <span className="action-icon">⭐</span> 
                      Save
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="home-sidebar">
            <div className="sidebar-card">
              <h3>About Community</h3>
              <p>Welcome to Bytely! Share and discuss content with others.</p>
              <div className="sidebar-stats">
                <div className="stat">
                  <span className="stat-value">3.5k</span>
                  <span className="stat-label">Members</span>
                </div>
                <div className="stat">
                  <span className="stat-value">120</span>
                  <span className="stat-label">Online</span>
                </div>
              </div>
              <button className="create-post-button">Create Post</button>
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
    </div>
  );
};

export default Home;