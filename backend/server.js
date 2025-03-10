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
            'INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING id, email, username',
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

        console.log('User Query Result:', user.rows);

        if (user.rows.length === 0) {
            console.log('Account not found');
            return res.status(400).json({ message: 'Account not found' });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) {
            console.log('Invalid credentials');
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});