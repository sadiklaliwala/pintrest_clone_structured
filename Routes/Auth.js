const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../Models/UserSchema');
const router = express.Router();

const createTokenandSetCookies = (res, user) => {
    const token = jwt.sign({
        id: user._id,//mogoose id 
        email: user.email || null,
        role: user.role
    },
        process.env.JWT_SECRET,
        {
            expiresIn: '7d'
        }
    );
    res.cookie('token', token, { maxAge: 900000, httpOnly: true, secure: false });
}

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}


router.get('/register', (req, res) => {
    return res.send("registe get method");
})

//Working 
router.post('/register', async (req, res) => {
    if (!req.body.email && !req.body.password) {
        return res.status(400).json({ msg: 'Email and password required' });
    }
    if (!isValidEmail(req.body.email)) {
        return res.status(400).json({ msg: 'Email must be Format of abc@gmail.com' });
    }
    const { name, email, password } = req.body;
    let existing = await User.findOne({ email: email });
    if (existing) return res.status(400).json({ msg: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 6);
    console.log(hashed);
    const user = await User.create({ name: name, email: email, password: hashed });

    createTokenandSetCookies(res, user);
    user.save();
    return res.status(200).json({ msg: 'Registered And Logged In' });
    // return res.render('register', { msg: "Registered And Logged In " })

});

//check remaining 
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email && !password) {
            return res.status(400).json({ err: 'Email and password required' });
            // return res.render('login', { err: 'Email and password required' });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ err: 'Email must be Format of abc@gmail.com' });
            // return res.render('login', { err: 'Email must be Format of abc@gmail.com' });
        }
        const user = await User.findOne({ email });
        if (!user ) {
            return res.status(400).json({ err: "User Not Found In Data base" });
            // return res.render('login', { err: "Password Is Wrong " });
        }
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            return res.status(400).json({err:"Password Is Wrong "});
            // return res.render('/login', { err: "Password Is Wrong " });
        }

        createTokenandSetCookies(res, user);
        return res.status(400).json({msg:'SuccessFull Login'});
        // return res.render('login', { msg: 'SuccessFull Login' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ err: err.message });
    }
})

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    // res.status(500).json({ msg: 'Server error' });
    res.json({ msg: 'Logged out' });
});

// --- Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        createTokenandSetCookies(res, req.user);
        res.redirect('/dashboard'); // or return JSON for SPA
    }
);

// --- GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        createTokenandSetCookies(res, req.user);
        res.redirect('/dashboard');
    }
);

module.exports = router;




