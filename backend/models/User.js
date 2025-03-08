const bcrypt = require('bcryptjs');

// Placeholder user "database" (in-memory)
let users = [];

// Function to create a new user
const createUser = (email, password) => {
    const hashedPassword = bcrypt.hashSync(password, 10); // Hash the password before saving
    const newUser = { email, password: hashedPassword };
    users.push(newUser);
    return newUser;
};

// Function to find a user by email
const findUserByEmail = (email) => {
    return users.find(user => user.email === email);
};

module.exports = { createUser, findUserByEmail };
