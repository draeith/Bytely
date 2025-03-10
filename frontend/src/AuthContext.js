import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Create the context
const AuthContext = createContext();

// Custom hook to access the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Check for authentication status on page load
  useEffect(() => {
    axios
      .get('http://localhost:5000/current_user', { withCredentials: true })
      .then((response) => {
        setUser(response.data.user);
      })
      .catch(() => {
        setUser(null); // User not logged in
      });
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/login',
        { email, password },
        { withCredentials: true }
      );

      // If login is successful, set user and clear any previous error message
      setUser(response.data.user);
      setErrorMessage('');
    } catch (err) {
      console.error('Login error:', err);

      // If error response exists, set the error message from the backend
      if (err.response && err.response.data && err.response.data.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Something went wrong');
      }
    }
  };

  // Register function with username support
  const register = async (email, password, username) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/register',
        { email, password, username },
        { withCredentials: true }
      );
      
      // Set user after successful registration
      setUser(response.data);
      setErrorMessage('');
    } catch (err) {
      console.error('Register error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Error creating account');
      }
    }
  };

  // Update username function
  const updateUsername = async (username) => {
    try {
      const response = await axios.put(
        'http://localhost:5000/update_username',
        { username },
        { withCredentials: true }
      );
      
      // Update the user state with the new username
      setUser(prev => ({ ...prev, username }));
      return true;
    } catch (err) {
      console.error('Username update error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Failed to update username');
      }
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/logout', {}, { withCredentials: true });
      setUser(null);
      setErrorMessage('');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register, 
      updateUsername,
      errorMessage 
    }}>
      {children}
    </AuthContext.Provider>
  );
};