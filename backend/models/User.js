const bcrypt = require('bcryptjs');
const pool = require('../database');

// Function to create a new user
const createUser = async (email, password, username) => {
    try {
        const hashedPassword = bcrypt.hashSync(password, 10); // Hash the password before saving
        
        const result = await pool.query(
            'INSERT INTO users (email, password, username, karma, created_at) VALUES ($1, $2, $3, 0, NOW()) RETURNING *',
            [email, hashedPassword, username]
        );
        
        return result.rows[0];
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

// Function to find a user by email
const findUserByEmail = async (email) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error finding user by email:', error);
        throw error;
    }
};

// Function to find a user by username
const findUserByUsername = async (username) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error finding user by username:', error);
        throw error;
    }
};

// Function to update user karma
const updateKarma = async (username, amount) => {
    try {
        const result = await pool.query(
            'UPDATE users SET karma = karma + $1 WHERE username = $2 RETURNING karma',
            [amount, username]
        );
        return result.rows[0]?.karma || null;
    } catch (error) {
        console.error('Error updating karma:', error);
        throw error;
    }
};

module.exports = { createUser, findUserByEmail, findUserByUsername, updateKarma };