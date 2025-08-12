const mongoose = require('mongoose');


const mongoURI = process.env.MONGO_DB_URI ;  // or your Atlas URI

mongoose.connect(mongoURI);

const db = mongoose.connection;

db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

db.once('open', () => {
    console.log('Connected to MongoDB with Mongoose');
});



