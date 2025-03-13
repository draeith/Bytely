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
    
    // Add creator as owner (mod_level 3)
    await pool.query(
      'INSERT INTO community_members (community_id, user_id, mod_level, joined_at) VALUES ($1, $2, 3, NOW())',
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

// Get user's membership status in a community
const getUserMembership = async (communityId, userId) => {
  try {
    const result = await pool.query(
      'SELECT mod_level FROM community_members WHERE community_id = $1 AND user_id = $2',
      [communityId, userId]
    );
    
    if (result.rows.length === 0) {
      return { isMember: false, modLevel: 0 };
    }
    
    const modLevel = result.rows[0].mod_level;
    return {
      isMember: true,
      modLevel: modLevel,
      isOwner: modLevel === 3,
      isHeadMod: modLevel === 2,
      isHelperMod: modLevel === 1,
      isModerator: modLevel > 0
    };
  } catch (error) {
    console.error('Error getting user membership:', error);
    throw error;
  }
};

// Join a community
const joinCommunity = async (communityId, userId) => {
  try {
    await pool.query(
      'INSERT INTO community_members (community_id, user_id, mod_level, joined_at) VALUES ($1, $2, 0, NOW()) ON CONFLICT (community_id, user_id) DO NOTHING',
      [communityId, userId]
    );
    return true;
  } catch (error) {
    console.error('Error joining community:', error);
    throw error;
  }
};

// Leave a community
const leaveCommunity = async (communityId, userId) => {
  try {
    // Check if user is the owner
    const membership = await getUserMembership(communityId, userId);
    if (membership.isOwner) {
      throw new Error('Community owner cannot leave. Transfer ownership first.');
    }
    
    await pool.query(
      'DELETE FROM community_members WHERE community_id = $1 AND user_id = $2',
      [communityId, userId]
    );
    return true;
  } catch (error) {
    console.error('Error leaving community:', error);
    throw error;
  }
};

// Update a user's mod level
const updateModLevel = async (communityId, targetUserId, newModLevel, requestingUserId) => {
  try {
    // Get requesting user's membership
    const requestingMember = await getUserMembership(communityId, requestingUserId);
    
    // Get target user's membership
    const targetMember = await getUserMembership(communityId, targetUserId);
    
    // Validate mod hierarchy permissions
    if (!requestingMember.isMember || requestingMember.modLevel <= targetMember.modLevel) {
      throw new Error('Insufficient permissions');
    }
    
    // Only owner can promote to head mod
    if (newModLevel === 2 && requestingMember.modLevel < 3) {
      throw new Error('Only owners can promote users to head mod');
    }
    
    // Nobody can promote to owner
    if (newModLevel === 3) {
      throw new Error('Cannot promote to owner level. Use transferOwnership instead.');
    }
    
    // Perform the update
    await pool.query(
      'UPDATE community_members SET mod_level = $1 WHERE community_id = $2 AND user_id = $3',
      [newModLevel, communityId, targetUserId]
    );
    
    return true;
  } catch (error) {
    console.error('Error updating mod level:', error);
    throw error;
  }
};

// Transfer ownership of a community
const transferOwnership = async (communityId, newOwnerId, currentOwnerId) => {
  try {
    // Start a transaction
    await pool.query('BEGIN');
    
    // Verify current user is the owner
    const currentOwner = await getUserMembership(communityId, currentOwnerId);
    if (!currentOwner.isOwner) {
      await pool.query('ROLLBACK');
      throw new Error('Only the current owner can transfer ownership');
    }
    
    // Verify new owner is a member
    const newOwner = await getUserMembership(communityId, newOwnerId);
    if (!newOwner.isMember) {
      await pool.query('ROLLBACK');
      throw new Error('New owner must be a member of the community');
    }
    
    // Downgrade current owner to head mod
    await pool.query(
      'UPDATE community_members SET mod_level = 2 WHERE community_id = $1 AND user_id = $2',
      [communityId, currentOwnerId]
    );
    
    // Upgrade new user to owner
    await pool.query(
      'UPDATE community_members SET mod_level = 3 WHERE community_id = $1 AND user_id = $2',
      [communityId, newOwnerId]
    );
    
    // Update the communities table
    await pool.query(
      'UPDATE communities SET creator_id = $1 WHERE id = $2',
      [newOwnerId, communityId]
    );
    
    // Commit the transaction
    await pool.query('COMMIT');
    
    return true;
  } catch (error) {
    // Rollback in case of error
    await pool.query('ROLLBACK');
    console.error('Error transferring ownership:', error);
    throw error;
  }
};

// Remove a user from a community
const removeUser = async (communityId, targetUserId, requestingUserId) => {
  try {
    // Get requesting user's membership
    const requestingMember = await getUserMembership(communityId, requestingUserId);
    
    // Get target user's membership
    const targetMember = await getUserMembership(communityId, targetUserId);
    
    // Validate permissions based on mod hierarchy
    if (!requestingMember.isMember || requestingMember.modLevel <= targetMember.modLevel) {
      throw new Error('Insufficient permissions to remove this user');
    }
    
    // Helper mods can only remove regular members
    if (requestingMember.modLevel === 1 && targetMember.modLevel > 0) {
      throw new Error('Helper mods can only remove regular members');
    }
    
    // Delete the membership
    await pool.query(
      'DELETE FROM community_members WHERE community_id = $1 AND user_id = $2',
      [communityId, targetUserId]
    );
    
    return true;
  } catch (error) {
    console.error('Error removing user:', error);
    throw error;
  }
};

// Get communities a user is a member of
const getUserCommunities = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT c.*, cm.mod_level FROM communities c
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
      `SELECT c.*, cm.mod_level FROM communities c
       JOIN community_visits cv ON c.id = cv.community_id
       LEFT JOIN community_members cm ON c.id = cm.community_id AND cm.user_id = $1
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
    // Use UPSERT pattern to update visit timestamp
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

// Get moderators of a community
const getCommunityModerators = async (communityId) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, cm.mod_level 
       FROM community_members cm
       JOIN users u ON cm.user_id = u.id
       WHERE cm.community_id = $1 AND cm.mod_level > 0
       ORDER BY cm.mod_level DESC, u.username`,
      [communityId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting community moderators:', error);
    throw error;
  }
};

module.exports = {
  createCommunity,
  getCommunityByName,
  getUserMembership,
  joinCommunity,
  leaveCommunity,
  updateModLevel,
  transferOwnership,
  removeUser,
  getUserCommunities,
  getRecentCommunities,
  recordCommunityVisit,
  getCommunityModerators
};