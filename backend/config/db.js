const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    
    if (!mongoUrl) {
      console.error('❌ MONGO_URL environment variable is not defined!');
      console.error('Please set MONGO_URL in your .env file or Render environment variables');
      process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB...');
    console.log('📍 URL:', mongoUrl.substring(0, 20) + '...' + mongoUrl.substring(mongoUrl.length - 20));
    
    const conn = await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 Tip: Trying to connect to localhost. Set MONGO_URL environment variable!');
    }
    process.exit(1);
  }
};

module.exports = connectDB;
