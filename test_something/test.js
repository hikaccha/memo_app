// //プール枯渇を起こすためのファイル
// require('dotenv').config();
// const { Pool } = require('pg');

// const pool = new Pool ({
//     user: process.env.DB_USER || 'your_username',
//     host: process.env.DB_HOST || 'localhost',
//     database: process.env.DB_NAME || 'memo_app',
//     password: process.env.DB_PASSWORD || 'your_password',
//     port: process.env.DB_PORT || 5432,
//     max: 2, // Set a low max connections for testing
// });

// const simulatePoolDepletion = async () => {
//     const promises = [];

//     for (let i = 0; i < 5; i++) { // Attempt to acquire more connections than allowed
//         promises.push(pool.connect().then(client => {
//             console.log(`Connection ${i + 1} acquired`);
//             // Simulate some work
//             return new Promise(resolve => setTimeout(() => {
//                 client.release();
//                 console.log(`Connection ${i + 1} released`);
//                 resolve();
//             }, 1000)); // Hold the connection for 1 second
//         }).catch(err => {
//             console.error(`Error acquiring connection ${i + 1}:`, err);
//         }));
//     }

//     await Promise.all(promises);
// };

// simulatePoolDepletion();

// pool.connect((err, client, release) => {
//     if (err) {
//         console.error('Error connecting to the database:', err);
//     } else {
//         console.log('Successfully connected to database');
//     }
// });

// module.exports = pool;