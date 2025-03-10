// ---- Update to models/User.js to include karma ----

const bcrypt = require('bcryptjs');

// Placeholder user "database" (in-memory)
// In real implementation, this would be in PostgreSQL
let users = [];

// Function to create a new user
const createUser = (email, password, username) => {
    const hashedPassword = bcrypt.hashSync(password, 10); // Hash the password before saving
    const now = new Date();
    
    const newUser = { 
        email, 
        username,
        password: hashedPassword,
        karma: 0,  // Start with 0 karma
        created_at: now.toISOString() // Add registration date
    };
    
    users.push(newUser);
    return newUser;
};

// Function to find a user by email
const findUserByEmail = (email) => {
    return users.find(user => user.email === email);
};

// Function to find a user by username
const findUserByUsername = (username) => {
    return users.find(user => user.username === username);
};

// Function to update user karma
const updateKarma = (username, amount) => {
    const user = findUserByUsername(username);
    if (user) {
        user.karma += amount;
        return user.karma;
    }
    return null;
};

module.exports = { createUser, findUserByEmail, findUserByUsername, updateKarma };


// ---- Add new file models/Vote.js ----

// In-memory database for votes
let votes = [];

// Function to add or update a vote
const addVote = (userId, contentId, contentType, value) => {
    // contentType could be 'post' or 'comment'
    // value is 1 for upvote, -1 for downvote, 0 for removing vote
    
    // Check for existing vote
    const existingVoteIndex = votes.findIndex(
        v => v.userId === userId && v.contentId === contentId && v.contentType === contentType
    );
    
    if (existingVoteIndex !== -1) {
        // Update existing vote
        const oldValue = votes[existingVoteIndex].value;
        votes[existingVoteIndex].value = value;
        
        // Return the net change in karma
        return value - oldValue;
    } else if (value !== 0) {
        // Add new vote if it's not a removal
        votes.push({
            userId,
            contentId,
            contentType,
            value,
            created_at: new Date().toISOString()
        });
        
        // Return the karma change
        return value;
    }
    
    return 0;
};

// Function to get votes for a piece of content
const getVotesForContent = (contentId, contentType) => {
    return votes.filter(v => v.contentId === contentId && v.contentType === contentType);
};

// Function to calculate karma for a piece of content
const getKarmaForContent = (contentId, contentType) => {
    const contentVotes = getVotesForContent(contentId, contentType);
    return contentVotes.reduce((total, vote) => total + vote.value, 0);
};

// Function to get a user's vote on a piece of content
const getUserVote = (userId, contentId, contentType) => {
    const vote = votes.find(
        v => v.userId === userId && v.contentId === contentId && v.contentType === contentType
    );
    
    return vote ? vote.value : 0;
};

module.exports = { addVote, getVotesForContent, getKarmaForContent, getUserVote };


// ---- Updates to server.js to add voting endpoints ----

// Add these endpoints to your server.js file

// Vote on a post or comment
app.post('/api/vote', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    jwt.verify(token, process.env.JWT_SECRET, (err, userData) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        
        const { contentId, contentType, value } = req.body;
        
        // Ensure value is valid (-1, 0, or 1)
        if (![1, 0, -1].includes(value)) {
            return res.status(400).json({ message: 'Invalid vote value' });
        }
        
        // Get Vote and User models
        const { addVote } = require('./models/Vote');
        const { updateKarma, findUserByUsername } = require('./models/User');
        
        // Add the vote
        const karmaChange = addVote(userData.id, contentId, contentType, value);
        
        // Update the content creator's karma
        // In a real app, you'd query the database to find the content owner first
        const contentOwner = "someUsername"; // Get this from your database
        const newKarma = updateKarma(contentOwner, karmaChange);
        
        res.json({ 
            success: true, 
            message: 'Vote recorded', 
            newKarma 
        });
    });
});

// Get a user's karma
app.get('/api/users/:username/karma', (req, res) => {
    const { username } = req.params;
    const { findUserByUsername } = require('./models/User');
    
    const user = findUserByUsername(username);
    
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ karma: user.karma });
});

// Get post/comment karma
app.get('/api/:contentType/:contentId/karma', (req, res) => {
    const { contentType, contentId } = req.params;
    const { getKarmaForContent } = require('./models/Vote');
    
    const karma = getKarmaForContent(contentId, contentType);
    
    res.json({ karma });
});

// Get current user's vote on a piece of content
app.get('/api/:contentType/:contentId/vote', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    jwt.verify(token, process.env.JWT_SECRET, (err, userData) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        
        const { contentType, contentId } = req.params;
        const { getUserVote } = require('./models/Vote');
        
        const vote = getUserVote(userData.id, contentId, contentType);
        
        res.json({ vote });
    });
});

// Get user profile with karma and registration date
app.get('/api/users/:username', (req, res) => {
    const { username } = req.params;
    const { findUserByUsername } = require('./models/User');
    
    const user = findUserByUsername(username);
    
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    
    // Return public user data (exclude password)
    res.json({
        username: user.username,
        karma: user.karma,
        created_at: user.created_at
    });
});