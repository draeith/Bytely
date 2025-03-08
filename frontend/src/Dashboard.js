import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // Fetch user data from backend after login
    if (user) {
      axios
        .get('http://localhost:5000/current_user', { withCredentials: true })
        .then((response) => {
          setUserInfo(response.data.user);
        })
        .catch((err) => {
          console.error('Error fetching user data:', err);
        });
    }
  }, [user]);

  return (
    <div>
      {userInfo ? (
        <div>
          <h2>Welcome, {userInfo.email}</h2>
          <p>User ID: {userInfo.id}</p>
          {/* Display other user info here */}
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <p>Loading user info...</p>
      )}
    </div>
  );
};

export default Dashboard;
