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
  const [errorMessage, setErrorMessage] = useState(''); // State to store the error message

  // Check for authentication status on page load
  useEffect(() => {
    axios
      .get('http://localhost:5000/current_user', { withCredentials: true }) // Send cookies
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
        { withCredentials: true } // Send cookies
      );

      // If login is successful, set user and clear any previous error message
      setUser(response.data.user);
      setErrorMessage(''); // Clear error message if login is successful
    } catch (err) {
      // Handle errors based on the response from the backend
      console.error('Login error:', err);

      // If error response exists, set the error message from the backend
      if (err.response && err.response.data && err.response.data.message) {
        setErrorMessage(err.response.data.message); // Set the backend error message
      } else {
        setErrorMessage('Something went wrong'); // Generic fallback message
      }
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/logout', {}, { withCredentials: true });
      setUser(null);  // Clear the user state after logging out
      setErrorMessage(''); // Clear any error message after logout
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, errorMessage }}>
      {children}
    </AuthContext.Provider>
  );
};
