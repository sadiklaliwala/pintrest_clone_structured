const jwt = require('jsonwebtoken');
const User = require('../Models/UserSchema');

module.exports = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ msg: 'No token' });

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.id);
        if (!user) return res.status(401).json({ msg: 'Invalid token' });
        req.user = user; // attach user to request
        next();
    } catch (err) {
        console.error(err);
        return res.status(401).json({ msg: 'Authentication failed' });
    }
};
