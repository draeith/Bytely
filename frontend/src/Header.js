import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';  // Importing the AuthContext to get the logout function
import './Header.css';  // Import the styles

const Header = () => {
  const { user, logout } = useAuth();  // Accessing the user and logout function from context
  const navigate = useNavigate();  // Hook to programmatically navigate after logout

  const handleLogout = () => {
    logout();  // Call the logout function from context
    navigate('/login');  // Redirect to the login page after logout
  };

  return (
    <div>
      <nav>
        <Link to="/home">Home</Link>
        {user ? (
          <>
            <Link to="/profile">Profile</Link>  {/* Only show the Profile link if the user is logged in */}
            <button onClick={handleLogout}>Logout</button>  {/* Logout button */}
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>  {/* Show login link if user is not logged in */}
            <Link to="/register">Register</Link>  {/* Register link */}
          </>
        )}
      </nav>
    </div>
  );
};

export default Header;
