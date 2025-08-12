const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../Models/UserSchema');
const authMiddleware = require('../MiddleWare/Auth');
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

    res.cookie('token', token, { maxAge: 9000000, httpOnly: true, secure: false });

}

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}


router.get('/register', (req, res) => {
    return res.render("register");

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
    // console.log(hashed);
    const user = await User.create({ name: name, email: email, password: hashed });

    createTokenandSetCookies(res, user);
    user.save();
    // return res.status(200).json({ msg: 'Registered And Logged In' });
    return res.redirect('/feed')

});

router.get('/login', async (req, res) => {
    try {
        return res.render('login', { nav: true })
    }
    catch (err) {
        console.log(err);

    }
});
//check remaining 
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email && !password) {
            // return res.status(400).json({ err: 'Email and password required' });
            return res.render('login', { err: 'Email and password required' });
        }
        if (!isValidEmail(email)) {
            // return res.status(400).json({ err: 'Email must be Format of abc@gmail.com' });
            return res.render('login', { err: 'Email must be Format of abc@gmail.com' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            // return res.status(400).json({ err: "User Not Found In Data base" });
            return res.render('login', { err: "Password Is Wrong " });
        }
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            // return res.status(400).json({ err: "Password Is Wrong " });
            return res.render('login', { err: "Password Is Wrong try Again" });
        }

        createTokenandSetCookies(res, user);
        // return res.status(400).json({ msg: 'SuccessFull Login' });
        return res.redirect('/feed');
    } catch (err) {
        console.error(err);
        res.status(500).json({ err: err.message });
    }
})

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    // res.status(500).json({ msg: 'Server error' });
    // res.json({ msg: 'Logged out' });
    res.redirect('login');
});

// --- Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/auth/login' }),
    (req, res) => {
        createTokenandSetCookies(res, req.user);
        // or return JSON for SPA
        res.redirect('/feed');
    }
);

router.get('/facebook', passport.authenticate('facebook', { scope: [] }));
router.get('/facebook/callback',
    passport.authenticate('facebook', { session: false, failureRedirect: '/auth/login' }),
    (req, res) => {
        createTokenandSetCookies(res, req.user);
        // or return JSON for SPA
        res.redirect('/feed');
    }
);


// --- GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: '/auth/login' }),
    (req, res) => {
        createTokenandSetCookies(res, req.user);
        res.redirect('/feed');
    }
);

router.get('/dashboard', authMiddleware, (req, res) => {
    // This route is protected by the JWT auth middleware
    // res.json({
    //     message: `Welcome ${req.user.name || req.user.email}`,
    //     user: { id: req.user._id, email: req.user.email }
    // });
    res.redirect('/feed');
    
});

module.exports = router;




