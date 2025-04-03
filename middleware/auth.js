const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: '認証トークンがありません' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(403).json({ message: 'ユーザーが見つかりません' });
        }
        req.user = user;
        next();
    } catch (err) {
        console.error('認証エラー:', err.message);
        return res.status(403).json({ message: 'トークンが無効です' });
    }
};

module.exports = authenticateToken