require('dotenv').config({ path: '../.env' });
const pool = require('./database');
const fs = require('fs');
const path = require('path');

async function initDb() {
  try {
    console.log('Initializing database...');
    
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '..', 'db_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into separate statements
    const statements = schema
      .split(';')
      .filter(statement => statement.trim() !== '');
    
    // Execute each statement
    for (const statement of statements) {
      await pool.query(statement + ';');
    }
    
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

initDb();