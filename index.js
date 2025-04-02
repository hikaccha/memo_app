require('dotenv').config();
const express = require('express');
const app = express();
const userRoutes = require('./routes/user');
const noteRoutes = require('./routes/note');
const path = require('path');
const cors = require('cors');
const port = 3000;

require('./db/connection');

app.use(cors());

app.use(express.json()); //JSONリクエストボディの解析ってなんだ？（あとで詳しく調べる）

app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((errorToJSON, req, res, next) => {
    console.error(error.stack);
    res.status(500).json({ message: 'Something broke!'});
});

app.use('/users', userRoutes);
app.use('/notes', noteRoutes);

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});