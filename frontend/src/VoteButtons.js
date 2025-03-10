import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const VoteButtons = ({ contentId, contentType, initialKarma = 0 }) => {
  const [karma, setKarma] = useState(initialKarma);
  const [userVote, setUserVote] = useState(0); // 0=no vote, 1=upvote, -1=downvote
  const { user } = useAuth();
  
  useEffect(() => {
    // If user is logged in, get their vote status for this content
    if (user) {
      axios.get(`http://localhost:5000/api/${contentType}/${contentId}/vote`, {
        withCredentials: true
      })
        .then(response => {
          setUserVote(response.data.vote);
        })
        .catch(error => {
          console.error('Error fetching vote status:', error);
        });
    }
    
    // Get the current karma count for this content
    axios.get(`http://localhost:5000/api/${contentType}/${contentId}/karma`)
      .then(response => {
        setKarma(response.data.karma);
      })
      .catch(error => {
        console.error('Error fetching karma:', error);
      });
  }, [contentId, contentType, user]);
  
  const handleVote = async (value) => {
    if (!user) {
      // Redirect to login or show login prompt
      alert('Please log in to vote');
      return;
    }
    
    // If clicking the same vote button again, toggle it off (value=0)
    const newValue = value === userVote ? 0 : value;
    
    try {
      await axios.post('http://localhost:5000/api/vote', {
        contentId,
        contentType,
        value: newValue
      }, { withCredentials: true });
      
      // Update local state with optimistic UI update
      const karmaChange = newValue - userVote;
      setKarma(prevKarma => prevKarma + karmaChange);
      setUserVote(newValue);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };
  
  return (
    <div className="post-votes">
      <button 
        className={`vote-button up ${userVote === 1 ? 'active' : ''}`}
        onClick={() => handleVote(1)}
      >
        ▲
      </button>
      <span className="vote-count">{karma}</span>
      <button 
        className={`vote-button down ${userVote === -1 ? 'active' : ''}`}
        onClick={() => handleVote(-1)}
      >
        ▼
      </button>
    </div>
  );
};

export default VoteButtons;