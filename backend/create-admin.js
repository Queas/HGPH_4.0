require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./models');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const createAdminUser = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Existing admin found. Updating credentials...');
      
      // Update existing admin
      existingAdmin.username = 'hgph_admin';
      existingAdmin.email = 'admin@halamanggaling.ph';
      existingAdmin.password = 'HGPh2026@Admin!Secure';
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      
      console.log('✅ Admin user updated successfully!');
      console.log('==========================================');
      console.log('Username: hgph_admin');
      console.log('Email: admin@halamanggaling.ph');
      console.log('Password: HGPh2026@Admin!Secure');
      console.log('Role: admin');
      console.log('==========================================');
      console.log('⚠️  Please change the password after first login!');
      process.exit(0);
    }

    // Create admin user with secure credentials
    const adminUser = new User({
      username: 'hgph_admin',
      email: 'admin@halamanggaling.ph',
      password: 'HGPh2026@Admin!Secure',
      role: 'admin'
    });

    await adminUser.save();

    console.log('✅ Admin user created successfully!');
    console.log('==========================================');
    console.log('Username: hgph_admin');
    console.log('Email: admin@halamanggaling.ph');
    console.log('Password: HGPh2026@Admin!Secure');
    console.log('Role: admin');
    console.log('==========================================');
    console.log('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();