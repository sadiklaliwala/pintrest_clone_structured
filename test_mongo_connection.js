const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.MONGO_DB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI environment variable is not set.');
  process.exit(1);
}

console.log('🔍 Testing MongoDB connection...');
console.log('URI:', uri);

(async () => {
  try {
    // Step 1: Try to connect
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Fail fast

    });

    console.log('✅ Successfully connected to MongoDB Atlas!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Connection failed.');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
})();
