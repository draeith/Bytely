const { Pool } = require('pg');

// Set up a connection pool
const pool = new Pool({
    user: 'postgres', // Your PostgreSQL username
    host: 'localhost', // Where your database is hosted (localhost for local)
    database: 'my_database', // Name of your database
    password: 'Cosmos!7', // Your PostgreSQL password
    port: 5432, // Default PostgreSQL port
});

module.exports = pool;

// Example query to get all users
const getUsers = async () => {
    try {
        const res = await pool.query('SELECT * FROM users');
        console.log(res.rows);
    } catch (err) {
        console.error(err);
    }
};


