import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './theme.css'; // Import the theme CSS
import App from './App';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext'; // Import ThemeProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider> {/* Wrap with ThemeProvider */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);