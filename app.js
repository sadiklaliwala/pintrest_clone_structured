require('dotenv').config();
require('./Config/DBConnect');
const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const AuthRoutes = require('./Routes/Auth')
const passport = require('passport');
const authMiddleware = require('./MiddleWare/Auth');

// For URL-encoded form data (e.g., from <form method="POST"> without enctype="multipart/form-data")
app.use(express.urlencoded({ extended: true }));
// For JSON data (e.g., from API requests with Content-Type: application/json)
app.use(express.json());
//for Passport Configuration
require('./Config/Passport')(passport);
app.use(passport.initialize());


app.use(cookieParser());
app.get('/', (re1, res) => {
  res.send("this is Home page")
})

// Routes
app.use('/auth', AuthRoutes);

// Protected route example
app.get('/dashboard', authMiddleware, (req, res) => {
  res.json({ message: `Welcome ${req.user.name || req.user.email}`, user: { id: req.user._id, email: req.user.email } });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`Server is Running At http://localhost:${port}`);
})
