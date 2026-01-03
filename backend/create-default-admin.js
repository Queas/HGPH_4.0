const Datastore = require('nedb-promises');
const bcrypt = require('bcryptjs');
const path = require('path');

// Initialize users database
const db = Datastore.create({
  filename: path.join(__dirname, 'data', 'users.db'),
  autoload: true
});

async function createDefaultAdmin() {
  console.log('\n🔐 Creating Default Admin Account\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Default admin credentials
    const username = 'admin';
    const email = 'admin@halamanggaling.ph';
    const password = 'admin123';

    // Check if user already exists
    const existingUser = await db.findOne({ email });
    if (existingUser) {
      console.log('\n⚠️  Admin user already exists!');
      console.log(`\n👤 Existing Admin Details:`);
      console.log(`   Username: ${existingUser.username}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Role: ${existingUser.role}\n`);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    await db.insert({
      username,
      email,
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Default admin account created successfully!\n');
    console.log('👤 Admin Credentials:');
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Username: ${username}`);
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📝 Note: Please change the password after first login!');
    console.log(`📁 Database: ${path.join(__dirname, 'data', 'users.db')}\n`);

  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
  }
}

createDefaultAdmin().then(() => process.exit(0));
