require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const pool = require('./database');

const app = express();

// Username validation helper
const isValidUsername = (username) => {
  const regex = /^[a-zA-Z0-9_]{3,30}$/;
  return regex.test(username);
};

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Registration Route
app.post('/register', async (req, res) => {
    const { email, password, username } = req.body;

    // Validate username
    if (!username || !isValidUsername(username)) {
      return res.status(400).json({ 
        message: 'Username must be 3-30 characters and contain only letters, numbers, and underscores' 
      });
    }

    try {
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ 
              message: existingUser.rows[0].email === email ? 'Email already in use' : 'Username already taken' 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            'INSERT INTO users (email, password, username, karma, created_at) VALUES ($1, $2, $3, 0, NOW()) RETURNING id, email, username',
            [email, hashedPassword, username]
        );

        res.json(newUser.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await pool.query('SELECT id, email, username, password FROM users WHERE email = $1', [email]);

        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Account not found' });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const userData = { 
            id: user.rows[0].id, 
            email: user.rows[0].email,
            username: user.rows[0].username
        };
        const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 9600000
        });

        res.json({ user: userData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Logout Route
app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

// Check Logged-In User
app.get('/current_user', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        res.json({ user });
    });
});

// Voting endpoint
app.post('/api/vote', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const userData = jwt.verify(token, process.env.JWT_SECRET);
    const { contentId, contentType, value } = req.body;
    
    // Validate value
    if (![1, 0, -1].includes(value)) {
      return res.status(400).json({ message: 'Invalid vote value' });
    }
    
    // Get models
    const { addVote } = require('./models/Vote');
    const { updateKarma } = require('./models/User');
    
    // Add the vote and get karma change
    const karmaChange = await addVote(userData.id, contentId, contentType, value);
    
    // Get content owner to update their karma
    let contentOwner;
    if (contentType === 'post') {
      const postResult = await pool.query(
        'SELECT u.username FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = $1',
        [contentId]
      );
      contentOwner = postResult.rows[0]?.username;
    } else if (contentType === 'comment') {
      const commentResult = await pool.query(
        'SELECT u.username FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = $1',
        [contentId]
      );
      contentOwner = commentResult.rows[0]?.username;
    }
    
    if (contentOwner) {
      // Update content owner's karma
      const newKarma = await updateKarma(contentOwner, karmaChange);
      res.json({ success: true, message: 'Vote recorded', newKarma });
    } else {
      res.status(404).json({ message: 'Content not found' });
    }
  } catch (err) {
    console.error('Error processing vote:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Get content karma endpoint
app.get('/api/:contentType/:contentId/karma', async (req, res) => {
  try {
    const { contentType, contentId } = req.params;
    const { getKarmaForContent } = require('./models/Vote');
    
    // Validate content exists
    let contentExists = false;
    if (contentType === 'post') {
      const result = await pool.query('SELECT 1 FROM posts WHERE id = $1', [contentId]);
      contentExists = result.rows.length > 0;
    } else if (contentType === 'comment') {
      const result = await pool.query('SELECT 1 FROM comments WHERE id = $1', [contentId]);
      contentExists = result.rows.length > 0;
    }
    
    if (!contentExists) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    const karma = await getKarmaForContent(contentId, contentType);
    res.json({ karma });
  } catch (err) {
    console.error('Error getting content karma:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's vote on content endpoint
app.get('/api/:contentType/:contentId/vote', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const userData = jwt.verify(token, process.env.JWT_SECRET);
    const { contentType, contentId } = req.params;
    const { getUserVote } = require('./models/Vote');
    
    const vote = await getUserVote(userData.id, contentId, contentType);
    res.json({ vote });
  } catch (err) {
    console.error('Error getting user vote:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// User profile endpoint
app.get('/api/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { findUserByUsername } = require('./models/User');
    
    const user = await findUserByUsername(username);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return public user data
    res.json({
      username: user.username,
      karma: user.karma,
      created_at: user.created_at
    });
  } catch (err) {
    console.error('Error getting user profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});