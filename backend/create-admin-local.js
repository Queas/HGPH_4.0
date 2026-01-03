const Datastore = require('nedb-promises');
const bcrypt = require('bcryptjs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Initialize users database
const db = Datastore.create({
  filename: path.join(__dirname, 'data', 'users.db'),
  autoload: true
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  console.log('\n🔐 Create Admin Account\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const username = await question('Enter admin username: ');
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');

    // Check if user already exists
    const existingUser = await db.findOne({ email });
    if (existingUser) {
      console.log('\n❌ User with this email already exists!');
      
      // Ask if they want to promote existing user to admin
      const promote = await question('\nDo you want to promote this user to admin? (yes/no): ');
      if (promote.toLowerCase() === 'yes' || promote.toLowerCase() === 'y') {
        await db.update({ email }, { $set: { role: 'admin' } });
        console.log('\n✅ User promoted to admin successfully!');
        console.log(`\n👤 Admin Details:`);
        console.log(`   Username: ${existingUser.username}`);
        console.log(`   Email: ${existingUser.email}`);
        console.log(`   Role: admin\n`);
      } else {
        console.log('\n❌ Admin creation cancelled.\n');
      }
      rl.close();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await db.insert({
      username,
      email,
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('\n✅ Admin account created successfully!');
    console.log(`\n👤 Admin Details:`);
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${email}`);
    console.log(`   Role: admin`);
    console.log(`\n📁 Database: ${path.join(__dirname, 'data', 'users.db')}\n`);

  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
  }

  rl.close();
}

createAdmin();
