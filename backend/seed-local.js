const db = require('./config/local-db');

const libraryData = [
  // MEDICINAL PLANTS
  {
    category: 'plants',
    title: 'Lagundi',
    scientific: 'Vitex negundo',
    icon: '🌿',
    description: 'One of the DOH-approved herbal medicines. Primarily used for coughs, colds, fever, and asthma.',
    fullDescription: 'Lagundi is a shrub that grows throughout the Philippines. It has been scientifically proven to be effective in treating respiratory conditions.',
    uses: ['Cough relief', 'Asthma treatment', 'Fever reduction', 'Cold symptoms'],
    tags: ['DOH Approved', 'Respiratory', 'Anti-inflammatory'],
    region: 'Nationwide',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    category: 'plants',
    title: 'Sambong',
    scientific: 'Blumea balsamifera',
    icon: '🍃',
    description: 'A natural diuretic used primarily for kidney stones and urinary problems.',
    fullDescription: 'Sambong is a medicinal plant endemic to the Philippines. Clinical studies have shown its effectiveness in treating kidney problems.',
    uses: ['Kidney stones', 'Diuretic', 'Urinary tract infection', 'Hypertension'],
    tags: ['DOH Approved', 'Urinary', 'Diuretic'],
    region: 'Nationwide',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    category: 'plants',
    title: 'Yerba Buena',
    scientific: 'Clinopodium douglasii',
    icon: '🌱',
    description: 'A popular analgesic herb used for pain relief including headaches, toothaches, and muscle pain.',
    fullDescription: 'Yerba Buena, also known as Peppermint, is widely used in the Philippines as a natural pain reliever.',
    uses: ['Headache relief', 'Toothache', 'Muscle pain', 'Arthritis'],
    tags: ['DOH Approved', 'Analgesic', 'Pain Relief'],
    region: 'Nationwide',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    category: 'plants',
    title: 'Ampalaya',
    scientific: 'Momordica charantia',
    icon: '🥒',
    description: 'Used for managing diabetes by helping to lower blood sugar levels.',
    fullDescription: 'Bitter melon is a staple in Filipino cuisine and medicine. Clinical studies have demonstrated its effectiveness in managing Type 2 diabetes.',
    uses: ['Diabetes management', 'Blood sugar control', 'Insulin sensitivity', 'Metabolism'],
    tags: ['DOH Approved', 'Diabetes', 'Blood Sugar'],
    region: 'Nationwide',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    category: 'marine',
    title: 'Sea Cucumber',
    scientific: 'Holothuroidea',
    icon: '🥒',
    description: 'Known locally as "balat," used for wound healing and believed to have potent anti-inflammatory properties.',
    fullDescription: 'Sea cucumbers have been used in traditional medicine throughout Asia for wound healing and tissue regeneration.',
    uses: ['Wound healing', 'Joint pain', 'Anti-inflammatory', 'Tissue repair'],
    tags: ['Traditional', 'Wound Healing', 'Marine'],
    region: 'Visayas, Mindanao',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const articlesData = [
  {
    title: 'The Science Behind Traditional Filipino Herbal Medicine',
    excerpt: 'Exploring how modern research validates centuries-old healing practices in the Philippines.',
    content: 'Filipino traditional medicine has been practiced for centuries, passing knowledge from generation to generation...',
    author: 'Dr. Maria Santos',
    category: 'Research',
    tags: ['Science', 'Traditional Medicine', 'Research'],
    isPublished: true,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Marine Biodiversity: The Ocean\'s Healing Power',
    excerpt: 'Discover the therapeutic benefits of Philippine marine resources in traditional healing.',
    content: 'The Philippines, with over 7,000 islands, is home to some of the world\'s most biodiverse marine ecosystems...',
    author: 'Prof. Juan dela Cruz',
    category: 'Marine Life',
    tags: ['Marine Biology', 'Healing', 'Biodiversity'],
    isPublished: true,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedDatabase() {
  console.log('\n🌱 Seeding Local Database\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await db.libraryItems.remove({}, { multi: true });
    await db.articles.remove({}, { multi: true });

    // Seed library items
    console.log('📚 Seeding library items...');
    const libraryPromises = libraryData.map(item => db.libraryItems.insert(item));
    await Promise.all(libraryPromises);
    console.log(`   ✅ ${libraryData.length} library items created`);

    // Seed articles
    console.log('📰 Seeding articles...');
    const articlePromises = articlesData.map(article => db.articles.insert(article));
    await Promise.all(articlePromises);
    console.log(`   ✅ ${articlesData.length} articles created`);

    // Get statistics
    const totalLibrary = await db.libraryItems.count({});
    const totalArticles = await db.articles.count({});

    console.log('\n📊 Database Statistics:');
    console.log(`   📚 Library Items: ${totalLibrary}`);
    console.log(`   📰 Articles: ${totalArticles}`);
    console.log(`   📁 Total: ${totalLibrary + totalArticles}`);

    console.log('\n✅ Local database seeded successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
