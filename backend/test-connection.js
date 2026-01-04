require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 Testing MongoDB Connection...\n');
console.log('MONGO_URL:', process.env.MONGO_URL ? 'Configured ✓' : 'Not configured ✗');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Configured ✓' : 'Not configured ✗');

const connectDB = async () => {
  try {
    console.log('\n⏳ Connecting to MongoDB Atlas...');
    
    const conn = await mongoose.connect(process.env.MONGO_URL);
    
    console.log('\n✅ MongoDB Connection Successful!');
    console.log('📍 Host:', conn.connection.host);
    console.log('📊 Database:', conn.connection.name);
    console.log('🔌 Connection State:', conn.connection.readyState === 1 ? 'Connected' : 'Disconnected');
    
    console.log('\n✅ MongoDB is ready to use!');
    console.log('📝 Note: Some database operations may require additional permissions.');
    console.log('🚀 You can now run: node seed-tkdl.js to populate the database');
    
    await mongoose.connection.close();
    console.log('\n🔒 Connection closed.');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ MongoDB Connection Failed!');
    console.error('Error:', error.message);
    
    if (error.message.includes('authentication')) {
      console.error('\n💡 Tip: Check your username and password in MONGO_URL');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('\n💡 Tip: Check your MongoDB Atlas connection string');
    } else if (error.message.includes('timeout')) {
      console.error('\n💡 Tip: Check your network connection and MongoDB Atlas IP whitelist');
    }
    
    process.exit(1);
  }
};

connectDB();
