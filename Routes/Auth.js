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





