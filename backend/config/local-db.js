const Datastore = require('nedb-promises');
const path = require('path');
const fs = require('fs');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize datastores
const db = {
  users: Datastore.create({
    filename: path.join(dataDir, 'users.db'),
    autoload: true
  }),
  libraryItems: Datastore.create({
    filename: path.join(dataDir, 'library-items.db'),
    autoload: true
  }),
  articles: Datastore.create({
    filename: path.join(dataDir, 'articles.db'),
    autoload: true
  }),
  contacts: Datastore.create({
    filename: path.join(dataDir, 'contacts.db'),
    autoload: true
  })
};

// Ensure unique email index for users
db.users.ensureIndex({ fieldName: 'email', unique: true });

console.log('✅ Local file database initialized');
console.log(`📁 Data stored in: ${dataDir}`);

module.exports = db;
