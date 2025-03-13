import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';
import './ModTools.css';

const ModTools = () => {
  const { communityName } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [moderators, setModerators] = useState([]);
  const [userModLevel, setUserModLevel] = useState(0);
  const [selectedTab, setSelectedTab] = useState('members');
  const [newOwner, setNewOwner] = useState('');
  
  // Mod level labels
  const modLevelLabels = {
    0: 'Member',
    1: 'Helper Mod',
    2: 'Head Mod',
    3: 'Owner'
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get community details
        const communityResponse = await axios.get(
          `http://localhost:5000/api/communities/${communityName}`
        );
        setCommunity(communityResponse.data);
        
        // Get user's mod level
        const membershipResponse = await axios.get(
          `http://localhost:5000/api/communities/${communityName}/membership`,
          { withCredentials: true }
        );
        
        setUserModLevel(membershipResponse.data.modLevel);
        
        // Only proceed if user is a moderator
        if (membershipResponse.data.modLevel < 1) {
          navigate(`/b/${communityName}`);
          return;
        }
        
        // Fetch members
        const membersResponse = await axios.get(
          `http://localhost:5000/api/communities/${communityName}/users`,
          { withCredentials: true }
        );
        setMembers(membersResponse.data);
        
        // Fetch moderators
        const moderatorsResponse = await axios.get(
          `http://localhost:5000/api/communities/${communityName}/moderators`
        );
        setModerators(moderatorsResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching mod data:', error);
        setError('Failed to load moderator tools');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [communityName, navigate, user]);
  
  const handleUpdateModLevel = async (userId, newLevel) => {
    try {
      await axios.post(
        `http://localhost:5000/api/communities/${communityName}/mod/${userId}`,
        { modLevel: newLevel },
        { withCredentials: true }
      );
      
      // Refetch members and moderators
      const membersResponse = await axios.get(
        `http://localhost:5000/api/communities/${communityName}/users`,
        { withCredentials: true }
      );
      setMembers(membersResponse.data);
      
      const moderatorsResponse = await axios.get(
        `http://localhost:5000/api/communities/${communityName}/moderators`
      );
      setModerators(moderatorsResponse.data);
    } catch (error) {
      console.error('Error updating mod level:', error);
      alert(error.response?.data?.message || 'Failed to update mod level');
    }
  };
  
  const handleRemoveUser = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this user?')) {
      return;
    }
    
    try {
      await axios.delete(
        `http://localhost:5000/api/communities/${communityName}/users/${userId}`,
        { withCredentials: true }
      );
      
      // Refetch members
      const membersResponse = await axios.get(
        `http://localhost:5000/api/communities/${communityName}/users`,
        { withCredentials: true }
      );
      setMembers(membersResponse.data);
      
      // Refetch moderators if needed
      if (moderators.some(mod => mod.id === userId)) {
        const moderatorsResponse = await axios.get(
          `http://localhost:5000/api/communities/${communityName}/moderators`
        );
        setModerators(moderatorsResponse.data);
      }
    } catch (error) {
      console.error('Error removing user:', error);
      alert(error.response?.data?.message || 'Failed to remove user');
    }
  };
  
  const handleTransferOwnership = async (e) => {
    e.preventDefault();
    
    if (!newOwner.trim()) {
      alert('Please enter a username');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to transfer ownership to ${newOwner}?`)) {
      return;
    }
    
    try {
      // Find user ID from username
      const userResponse = await axios.get(`http://localhost:5000/api/users/by-username/${newOwner}`);
      
      if (!userResponse.data) {
        alert('User not found');
        return;
      }
      
      await axios.post(
        `http://localhost:5000/api/communities/${communityName}/transfer-ownership/${userResponse.data.id}`,
        {},
        { withCredentials: true }
      );
      
      alert('Ownership transferred successfully');
      
      // Redirect to community page
      navigate(`/b/${communityName}`);
    } catch (error) {
      console.error('Error transferring ownership:', error);
      alert(error.response?.data?.message || 'Failed to transfer ownership');
    }
  };
  
  if (loading) {
    return <div className="loading">Loading moderator tools...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  return (
    <div className="mod-tools-container">
      <div className="mod-tools-header">
        <h1>Moderator Tools: b/{communityName}</h1>
        <p>You are a {modLevelLabels[userModLevel]}</p>
      </div>
      
      <div className="mod-tools-tabs">
        <button 
          className={`tab-button ${selectedTab === 'members' ? 'active' : ''}`}
          onClick={() => setSelectedTab('members')}
        >
          Members
        </button>
        <button 
          className={`tab-button ${selectedTab === 'moderators' ? 'active' : ''}`}
          onClick={() => setSelectedTab('moderators')}
        >
          Moderators
        </button>
        {userModLevel === 3 && (
          <button 
            className={`tab-button ${selectedTab === 'ownership' ? 'active' : ''}`}
            onClick={() => setSelectedTab('ownership')}
          >
            Ownership
          </button>
        )}
      </div>
      
      <div className="mod-tools-content">
        {selectedTab === 'members' && (
          <div className="members-tab">
            <h2>Community Members</h2>
            <div className="members-list">
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(member => (
                    <tr key={member.id}>
                      <td>{member.username}</td>
                      <td>{modLevelLabels[member.mod_level]}</td>
                      <td className="member-actions">
                        {/* Show promote/demote options based on user's mod level */}
                        {userModLevel > member.mod_level && member.id !== user.id && (
                          <>
                            {/* Helper Mod option */}
                            {userModLevel >= 2 && member.mod_level !== 1 && (
                              <button 
                                onClick={() => handleUpdateModLevel(member.id, 1)}
                                className={member.mod_level > 1 ? 'demote' : 'promote'}
                              >
                                {member.mod_level > 1 ? 'Demote to Helper Mod' : 'Promote to Helper Mod'}
                              </button>
                            )}
                            
                            {/* Head Mod option (owner only) */}
                            {userModLevel === 3 && member.mod_level !== 2 && (
                              <button 
                                onClick={() => handleUpdateModLevel(member.id, 2)}
                                className={member.mod_level > 2 ? 'demote' : 'promote'}
                              >
                                {member.mod_level > 2 ? 'Demote to Head Mod' : 'Promote to Head Mod'}
                              </button>
                            )}
                            
                            {/* Regular member option */}
                            {member.mod_level > 0 && (
                              <button 
                                onClick={() => handleUpdateModLevel(member.id, 0)}
                                className="demote"
                              >
                                Remove Mod Status
                              </button>
                            )}
                            
                            {/* Remove from community button */}
                            <button 
                              onClick={() => handleRemoveUser(member.id)}
                              className="remove"
                            >
                              Remove from Community
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {selectedTab === 'moderators' && (
          <div className="moderators-tab">
            <h2>Community Moderators</h2>
            <div className="moderators-list">
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {moderators.map(mod => (
                    <tr key={mod.id}>
                      <td>{mod.username}</td>
                      <td>{modLevelLabels[mod.mod_level]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {selectedTab === 'ownership' && userModLevel === 3 && (
          <div className="ownership-tab">
            <h2>Transfer Ownership</h2>
            <p className="warning">
              ⚠️ Warning: This action is irreversible. You will be demoted to Head Mod after transfer.
            </p>
            <form onSubmit={handleTransferOwnership} className="transfer-form">
              <div className="form-group">
                <label htmlFor="newOwner">New Owner Username:</label>
                <input
                  type="text"
                  id="newOwner"
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>
              <button type="submit" className="transfer-button">Transfer Ownership</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModTools;