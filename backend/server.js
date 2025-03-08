require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser'); // Import cookie-parser
const pool = require('./database');

const app = express();

app.use(cors({
    origin: 'http://localhost:3000', // Change if frontend URL is different
    credentials: true // Allow cookies to be sent
}));
app.use(express.json());
app.use(cookieParser()); // Enable cookie parsing

// Registration Route
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Email is already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
            [email, hashedPassword]
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
        // Query the database for the user with the given email
        const user = await pool.query('SELECT id, email, password FROM users WHERE email = $1', [email]);

        console.log('User Query Result:', user.rows); // Debug line

        // If the user is not found, return a 400 error with 'Account not found'
        if (user.rows.length === 0) {
            console.log('Account not found'); // Debug line
            return res.status(400).json({ message: 'Account not found' }); // Send error message to frontend
        }

        // Check if the password matches the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) {
            console.log('Invalid credentials'); // Debug line
            return res.status(400).json({ message: 'Invalid credentials' }); // Send error message if password doesn't match
        }

        // If user is found and password matches, create the JWT
        const userData = { id: user.rows[0].id, email: user.rows[0].email };
        const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Set an HTTP-only cookie with the token for secure authentication
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production only
            sameSite: 'Strict', // To prevent CSRF attacks
            maxAge: 9600000 // Token expires in 1 hour
        });

        // Respond with the user data
        res.json({ user: userData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' }); // General server error
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
