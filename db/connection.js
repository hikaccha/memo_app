require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'your_username',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'memo_app',
    password: process.env.DB_PASSWORD || 'your_password',
    port: process.env.DB_PORT || 5432,
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to the dateabase:', err);
    } else {
        console.log('Successfully connected to database');
        release();
    }
});

module.exports = pool;