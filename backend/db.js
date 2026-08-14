const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Connect to MongoDB using the URI from your .env file
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connection successful!');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1); // Exit the process with failure
  }
};

module.exports = connectDB;
