const pool = require('../database');

// Create a new community
const createCommunity = async (name, description, creatorId) => {
  try {
    // Start a transaction
    await pool.query('BEGIN');
    
    // Create the community
    const result = await pool.query(
      'INSERT INTO communities (name, description, creator_id, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [name, description, creatorId]
    );
    
    // Add creator as moderator and member
    await pool.query(
      'INSERT INTO community_members (community_id, user_id, is_moderator, joined_at) VALUES ($1, $2, TRUE, NOW())',
      [result.rows[0].id, creatorId]
    );
    
    // Commit the transaction
    await pool.query('COMMIT');
    
    return result.rows[0];
  } catch (error) {
    // Rollback in case of error
    await pool.query('ROLLBACK');
    console.error('Error creating community:', error);
    throw error;
  }
};

// Get a community by name
const getCommunityByName = async (name) => {
  try {
    const result = await pool.query(
      'SELECT * FROM communities WHERE name = $1',
      [name]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting community:', error);
    throw error;
  }
};

// Get communities a user is a member of
const getUserCommunities = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT c.* FROM communities c
       JOIN community_members cm ON c.id = cm.community_id
       WHERE cm.user_id = $1
       ORDER BY c.name`,
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting user communities:', error);
    throw error;
  }
};

// Get recent communities a user has visited
const getRecentCommunities = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT c.* FROM communities c
       JOIN community_visits cv ON c.id = cv.community_id
       WHERE cv.user_id = $1
       ORDER BY cv.visited_at DESC
       LIMIT 5`,
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting recent communities:', error);
    throw error;
  }
};

// Record a community visit
const recordCommunityVisit = async (communityId, userId) => {
  try {
    // Use UPSERT pattern (INSERT ... ON CONFLICT) to update visit timestamp
    await pool.query(
      `INSERT INTO community_visits (community_id, user_id, visited_at) 
       VALUES ($1, $2, NOW())
       ON CONFLICT (community_id, user_id) 
       DO UPDATE SET visited_at = NOW()`,
      [communityId, userId]
    );
    return true;
  } catch (error) {
    console.error('Error recording community visit:', error);
    throw error;
  }
};

module.exports = {
  createCommunity,
  getCommunityByName,
  getUserCommunities,
  getRecentCommunities,
  recordCommunityVisit
};