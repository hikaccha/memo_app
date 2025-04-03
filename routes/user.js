const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.create(username, password);
        res.status(201).json(user);
    }  catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const {username, password } = req.body;
        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(400).json({ message: 'ユーザーが存在しません'});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res. status(400).json({ message: 'パスワードが違います'});
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token });
    }   catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;