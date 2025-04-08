require('dotenv').config();
const express = require('express');
const app = express();
const userRoutes = require('./routes/user');
const noteRoutes = require('./routes/note');
const categoryRoutes = require('./routes/category');
const path = require('path');
const cors = require('cors');
const port = 3000;

require('./db/connection');

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/users', userRoutes);
app.use('/notes', noteRoutes);
app.use('/categories', categoryRoutes);

app.use((error, req, res, next) => {
    console.error('Server error:', error.stack);
    res.status(500).json({ 
        message: 'Something broke!',
        error: process.env.NODE_ENV === 'production' ? null : error.message
    });
});

const server = app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

process.on('SIGINT', () => {
    console.log('Shutting down server gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});