const pool = require('../database');

// Add or update a vote
const addVote = async (userId, contentId, contentType, value) => {
  try {
    // Check if vote already exists
    const existingVote = await pool.query(
      'SELECT value FROM votes WHERE user_id = $1 AND content_id = $2 AND content_type = $3',
      [userId, contentId, contentType]
    );
    
    let karmaChange = 0;
    
    if (existingVote.rows.length > 0) {
      // Update existing vote
      const oldValue = existingVote.rows[0].value;
      
      if (value === 0) {
        // Remove vote if value is 0
        await pool.query(
          'DELETE FROM votes WHERE user_id = $1 AND content_id = $2 AND content_type = $3',
          [userId, contentId, contentType]
        );
      } else {
        // Update vote
        await pool.query(
          'UPDATE votes SET value = $1 WHERE user_id = $2 AND content_id = $3 AND content_type = $4',
          [value, userId, contentId, contentType]
        );
      }
      
      karmaChange = value - oldValue;
    } else if (value !== 0) {
      // Insert new vote
      await pool.query(
        'INSERT INTO votes (user_id, content_id, content_type, value, created_at) VALUES ($1, $2, $3, $4, NOW())',
        [userId, contentId, contentType, value]
      );
      
      karmaChange = value;
    }
    
    return karmaChange;
  } catch (error) {
    console.error('Error adding vote:', error);
    throw error;
  }
};

// Get all votes for a piece of content
const getVotesForContent = async (contentId, contentType) => {
  try {
    const result = await pool.query(
      'SELECT * FROM votes WHERE content_id = $1 AND content_type = $2',
      [contentId, contentType]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting votes for content:', error);
    throw error;
  }
};

// Calculate karma for a piece of content
const getKarmaForContent = async (contentId, contentType) => {
  try {
    const result = await pool.query(
      'SELECT SUM(value) as karma FROM votes WHERE content_id = $1 AND content_type = $2',
      [contentId, contentType]
    );
    return parseInt(result.rows[0]?.karma || 0);
  } catch (error) {
    console.error('Error calculating karma:', error);
    throw error;
  }
};

// Get a user's vote on a specific content
const getUserVote = async (userId, contentId, contentType) => {
  try {
    const result = await pool.query(
      'SELECT value FROM votes WHERE user_id = $1 AND content_id = $2 AND content_type = $3',
      [userId, contentId, contentType]
    );
    return result.rows[0]?.value || 0;
  } catch (error) {
    console.error('Error getting user vote:', error);
    throw error;
  }
};

module.exports = { addVote, getVotesForContent, getKarmaForContent, getUserVote };