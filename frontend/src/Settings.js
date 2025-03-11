import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import './Settings.css';

const Settings = () => {
  const { user } = useAuth();
  const { theme, setThemePreference } = useTheme();
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [newName, setNewName] = useState(user?.name || '');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle profile update
  const handleUpdateProfile = () => {
    // Here you would make an API call to update the user profile
    console.log('Updating profile:', newName, newEmail);
    setSuccessMessage('Profile updated successfully!');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // Handle theme change
  const handleThemeChange = (e) => {
    setThemePreference(e.target.value);
  };

  return (
    <div className="settings-page-container">
      <div className="settings-content">
        <h2>Account Settings</h2>
        
        <div className="settings-section">
          <h3>Profile Information</h3>
          <div className="settings-card">
            <div className="settings-item">
              <label>Display Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="settings-input"
              />
            </div>
            
            <div className="settings-item">
              <label>Email Address</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="settings-input"
              />
            </div>
            
            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}
            
            <button className="settings-button save" onClick={handleUpdateProfile}>
              Save Changes
            </button>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Account Preferences</h3>
          <div className="settings-card">
            <div className="settings-item">
              <label>Theme</label>
              <select 
                className="settings-input"
                value={theme}
                onChange={handleThemeChange}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (follow system)</option>
              </select>
            </div>
            
            <div className="settings-item checkbox">
              <input type="checkbox" id="email-notifications" />
              <label htmlFor="email-notifications">Email notifications</label>
            </div>
            
            <div className="settings-item checkbox">
              <input type="checkbox" id="private-profile" />
              <label htmlFor="private-profile">Private profile</label>
            </div>
          </div>
        </div>
        
        <div className="settings-section danger">
          <h3>Danger Zone</h3>
          <div className="settings-card">
            <div className="settings-item">
              <button className="settings-button danger">Delete Account</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;