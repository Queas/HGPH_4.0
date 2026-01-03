require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { LibraryItem, Article } = require('./models');

const libraryData = [
  // MEDICINAL PLANTS
  {
    category: 'plants',
    title: 'Lagundi',
    scientific: 'Vitex negundo',
    icon: '🌿',
    description: 'One of the DOH-approved herbal medicines. Primarily used for coughs, colds, fever, and asthma. The leaves contain compounds with anti-inflammatory and bronchodilator properties.',
    fullDescription: 'Lagundi is a shrub that grows throughout the Philippines. It has been scientifically proven to be effective in treating respiratory conditions. The Department of Health has approved Lagundi as an herbal medicine for cough and asthma relief.',
    uses: ['Cough relief', 'Asthma treatment', 'Fever reduction', 'Cold symptoms'],
    tags: ['DOH Approved', 'Respiratory', 'Anti-inflammatory'],
    region: 'Nationwide'
  },
  {
    category: 'plants',
    title: 'Sambong',
    scientific: 'Blumea balsamifera',
    icon: '🍃',
    description: 'A natural diuretic used primarily for kidney stones and urinary problems. Also known for its anti-urolithiatic properties that help dissolve kidney stones.',
    fullDescription: 'Sambong is a medicinal plant endemic to the Philippines. Clinical studies have shown its effectiveness in treating kidney problems and as a natural diuretic. It is one of the ten herbal medicines endorsed by the DOH.',
    uses: ['Kidney stones', 'Diuretic', 'Urinary tract infection', 'Hypertension'],
    tags: ['DOH Approved', 'Urinary', 'Diuretic'],
    region: 'Nationwide'
  },
  {
    category: 'plants',
    title: 'Yerba Buena',
    scientific: 'Clinopodium douglasii',
    icon: '🌱',
    description: 'A popular analgesic herb used for pain relief including headaches, toothaches, and muscle pain. Contains menthol which provides cooling and numbing effects.',
    fullDescription: 'Yerba Buena, also known as Peppermint, is widely used in the Philippines as a natural pain reliever. The leaves can be made into tea or applied as a poultice for topical relief.',
    uses: ['Headache relief', 'Toothache', 'Muscle pain', 'Arthritis'],
    tags: ['DOH Approved', 'Analgesic', 'Pain Relief'],
    region: 'Nationwide'
  },
  {
    category: 'plants',
    title: 'Tsaang Gubat',
    scientific: 'Carmona retusa',
    icon: '🍵',
    description: 'Used for stomach problems including diarrhea and stomach aches. Also effective as a mouth wash for dental hygiene and treating mouth sores.',
    fullDescription: 'Tsaang Gubat or Wild Tea is a small tree native to the Philippines. Its leaves are brewed as tea to treat various digestive problems. It has antibacterial properties that make it effective for oral health.',
    uses: ['Diarrhea', 'Stomach ache', 'Mouth wash', 'Dysentery'],
    tags: ['DOH Approved', 'Digestive', 'Antibacterial'],
    region: 'Nationwide'
  },
  {
    category: 'plants',
    title: 'Niyog-niyogan',
    scientific: 'Quisqualis indica',
    icon: '🌺',
    description: 'An effective anti-helminthic used to expel intestinal worms, particularly roundworms and pinworms. Seeds are consumed for deworming.',
    fullDescription: 'Niyog-niyogan is a vine known for its beautiful flowers and medicinal properties. The dried seeds are traditionally used as a deworming treatment, especially for children.',
    uses: ['Roundworms', 'Pinworms', 'Intestinal parasites', 'Deworming'],
    tags: ['DOH Approved', 'Anti-parasitic', 'Deworming'],
    region: 'Nationwide'
  },
  {
    category: 'plants',
    title: 'Bayabas',
    scientific: 'Psidium guajava',
    icon: '🍐',
    description: 'Used as an antiseptic for washing wounds and treating skin infections. The leaves have antimicrobial properties effective against various bacteria.',
    fullDescription: 'Guava leaves have been used in traditional Filipino medicine for centuries. Rich in antioxidants and antimicrobial compounds, they are effective for wound care and skin conditions.',
    uses: ['Wound cleaning', 'Skin infections', 'Antiseptic wash', 'Toothache'],
    tags: ['DOH Approved', 'Antiseptic', 'Antimicrobial'],
    region: 'Nationwide'
  },
  {
    category: 'plants',
    title: 'Akapulko',
    scientific: 'Senna alata',
    icon: '🌻',
    description: 'Effective treatment for skin diseases including ringworm, eczema, scabies, and other fungal infections. Applied topically as a poultice.',
    fullDescription: 'Akapulko is known as the "ringworm bush" due to its effectiveness against fungal skin infections. The leaves are crushed and applied directly to affected areas.',
    uses: ['Ringworm', 'Eczema', 'Scabies', 'Fungal infections'],
    tags: ['DOH Approved', 'Antifungal', 'Skin'],
    region: 'Nationwide'
  },
  {
    category: 'plants',
    title: 'Ulasimang Bato',
    scientific: 'Peperomia pellucida',
    icon: '🥬',
    description: 'Used to lower uric acid levels and treat gout and arthritis. Also known for its anti-inflammatory and analgesic properties.',
    fullDescription: 'Ulasimang Bato or Pansit-pansitan is a small herb that grows in shaded, moist areas. Research has shown its effectiveness in managing gout and rheumatism.',
    uses: ['Gout', 'Arthritis', 'Uric acid', 'Rheumatism'],
    tags: ['DOH Approved', 'Anti-inflammatory', 'Gout'],
    region: 'Nationwide'
  },
  {
    category: 'plants',
    title: 'Bawang',
    scientific: 'Allium sativum',
    icon: '🧄',
    description: 'Helps reduce cholesterol levels and lower blood pressure. Known for its cardiovascular benefits and antimicrobial properties.',
    fullDescription: 'Garlic has been used medicinally for thousands of years. Modern research confirms its benefits for heart health, including lowering blood pressure and cholesterol levels.',
    uses: ['High cholesterol', 'Hypertension', 'Heart health', 'Antimicrobial'],
    tags: ['DOH Approved', 'Cardiovascular', 'Heart Health'],
    region: 'Nationwide'
  },
  {
    category: 'plants',
    title: 'Ampalaya',
    scientific: 'Momordica charantia',
    icon: '🥒',
    description: 'Used for managing diabetes by helping to lower blood sugar levels. Contains compounds that mimic insulin and improve glucose tolerance.',
    fullDescription: 'Bitter melon is a staple in Filipino cuisine and medicine. Clinical studies have demonstrated its effectiveness in managing Type 2 diabetes by improving insulin sensitivity.',
    uses: ['Diabetes management', 'Blood sugar control', 'Insulin sensitivity', 'Metabolism'],
    tags: ['DOH Approved', 'Diabetes', 'Blood Sugar'],
    region: 'Nationwide'
  },

  // MARINE ANIMALS
  {
    category: 'marine',
    title: 'Sea Cucumber',
    scientific: 'Holothuroidea',
    icon: '🥒',
    description: 'Known locally as "balat," used for wound healing and believed to have potent anti-inflammatory and regenerative properties.',
    fullDescription: 'Sea cucumbers have been used in traditional medicine throughout Asia. They contain compounds that promote tissue regeneration and wound healing.',
    uses: ['Wound healing', 'Joint pain', 'Anti-inflammatory', 'Tissue repair'],
    tags: ['Traditional', 'Wound Healing', 'Marine'],
    region: 'Visayas, Mindanao'
  },
  {
    category: 'marine',
    title: 'Sea Horse',
    scientific: 'Hippocampus',
    icon: '🐴',
    description: 'Traditionally used in various remedies, believed to increase vitality and treat respiratory issues and kidney problems.',
    fullDescription: 'Seahorses have been used in traditional Chinese and Filipino medicine for centuries. They are believed to possess properties that enhance vitality and treat various ailments.',
    uses: ['Vitality', 'Respiratory issues', 'Kidney problems', 'Traditional remedies'],
    tags: ['Traditional', 'Vitality', 'Marine'],
    region: 'Coastal Areas'
  },
  {
    category: 'marine',
    title: 'Sea Urchin',
    scientific: 'Echinoidea',
    icon: '🦔',
    description: 'Roe is consumed for nutritional benefits and believed to boost the immune system. Rich in omega-3 fatty acids and antioxidants.',
    fullDescription: 'Sea urchin roe, known as uni, is prized for both its flavor and nutritional value. It is rich in protein, vitamins, and minerals that support overall health.',
    uses: ['Nutrition', 'Immune boost', 'Omega-3 source', 'Antioxidants'],
    tags: ['Nutritional', 'Immune System', 'Marine'],
    region: 'Coastal Areas'
  },
  {
    category: 'marine',
    title: 'Oyster',
    scientific: 'Ostreidae',
    icon: '🦪',
    description: 'Rich in zinc and minerals, traditionally used to improve vitality and immune function. Known as a natural aphrodisiac.',
    fullDescription: 'Oysters are one of the most nutrient-dense foods available. They are exceptionally high in zinc, which supports immune function and overall health.',
    uses: ['Zinc source', 'Immune function', 'Vitality', 'Mineral nutrition'],
    tags: ['Nutritional', 'Minerals', 'Marine'],
    region: 'Coastal Areas'
  },
  {
    category: 'marine',
    title: 'Abalone',
    scientific: 'Haliotis',
    icon: '🐚',
    description: 'Shell powder used in traditional remedies for eye health and calming purposes. The meat is prized for its nutritional value.',
    fullDescription: 'Abalone has been used in traditional medicine, particularly for eye health and as a calming agent. The shell is ground into powder for medicinal use.',
    uses: ['Eye health', 'Calming', 'Liver health', 'Detoxification'],
    tags: ['Traditional', 'Eye Health', 'Marine'],
    region: 'Coastal Areas'
  },
  {
    category: 'marine',
    title: 'Jellyfish',
    scientific: 'Medusozoa',
    icon: '🎐',
    description: 'Some species used in traditional medicine for treating arthritis and high blood pressure. Low in calories, high in collagen.',
    fullDescription: 'Certain jellyfish species have been consumed for their potential health benefits, including joint health support and collagen content.',
    uses: ['Arthritis', 'Blood pressure', 'Collagen', 'Joint health'],
    tags: ['Traditional', 'Arthritis', 'Marine'],
    region: 'Coastal Areas'
  },

  // HEALING PRACTICES
  {
    category: 'practices',
    title: 'Hilot',
    scientific: 'Traditional Massage',
    icon: '🙌',
    description: 'Traditional Filipino massage technique used for healing muscle pain, improving circulation, treating sprains, and promoting relaxation.',
    fullDescription: 'Hilot is an ancient Filipino healing art that combines massage, bone-setting, and energy healing. Practitioners use coconut oil and apply specific pressure techniques passed down through generations.',
    uses: ['Muscle pain', 'Sprains', 'Circulation', 'Relaxation'],
    tags: ['Physical Therapy', 'Traditional', 'Massage'],
    region: 'Nationwide'
  },
  {
    category: 'practices',
    title: 'Tawas',
    scientific: 'Divination Ritual',
    icon: '🔮',
    description: 'A diagnostic ritual using alum crystals melted and dropped in water to determine the cause of illness, often revealing supernatural causes.',
    fullDescription: 'Tawas is a traditional diagnostic method where alum (potassium aluminum sulfate) is melted over a candle and dropped into water. The resulting shapes are interpreted to identify the source of illness.',
    uses: ['Diagnosis', 'Spiritual cleansing', 'Identifying illness', 'Traditional divination'],
    tags: ['Diagnostic', 'Spiritual', 'Ritual'],
    region: 'Nationwide'
  },
  {
    category: 'practices',
    title: 'Bentusa',
    scientific: 'Cupping Therapy',
    icon: '🫙',
    description: 'Traditional cupping method using heated glasses placed on the skin to improve blood flow and remove "bad air" or toxins from the body.',
    fullDescription: 'Bentusa is the Filipino version of cupping therapy. Glass cups are heated and placed on the skin, creating suction that is believed to draw out toxins and improve circulation.',
    uses: ['Blood circulation', 'Detoxification', 'Pain relief', 'Muscle tension'],
    tags: ['Physical Therapy', 'Detox', 'Traditional'],
    region: 'Nationwide'
  },
  {
    category: 'practices',
    title: 'Suob',
    scientific: 'Steam Therapy',
    icon: '♨️',
    description: 'Herbal steam inhalation therapy used for respiratory ailments, colds, and to cleanse the body through sweating.',
    fullDescription: 'Suob involves boiling medicinal plants and inhaling the steam, sometimes while covered with a blanket. This practice is used to treat respiratory conditions and for post-partum recovery.',
    uses: ['Respiratory relief', 'Cold treatment', 'Post-partum care', 'Body cleansing'],
    tags: ['Respiratory', 'Steam Therapy', 'Traditional'],
    region: 'Nationwide'
  },
  {
    category: 'practices',
    title: 'Pahid',
    scientific: 'Topical Application',
    icon: '🧴',
    description: 'Application of herbal preparations directly on the skin for treating skin conditions, wounds, and localized pain.',
    fullDescription: 'Pahid involves applying crushed herbs, oils, or specially prepared ointments directly to the affected area. This method is used for various skin conditions and localized treatments.',
    uses: ['Skin conditions', 'Wound care', 'Pain relief', 'Inflammation'],
    tags: ['Topical', 'Skin Care', 'Traditional'],
    region: 'Nationwide'
  },
  {
    category: 'practices',
    title: 'Orasyon',
    scientific: 'Prayer Healing',
    icon: '🙏',
    description: 'Healing through prayers and incantations, often combined with herbal treatments. Practitioners invoke spiritual aid for healing.',
    fullDescription: 'Orasyon is a spiritual healing practice that combines Catholic prayers with indigenous beliefs. Healers recite specific prayers believed to have healing powers.',
    uses: ['Spiritual healing', 'Protection', 'Blessing', 'Combined therapy'],
    tags: ['Spiritual', 'Faith Healing', 'Prayer'],
    region: 'Nationwide'
  },

  // TRADITIONAL HEALERS
  {
    category: 'healers',
    title: 'Albularyo',
    scientific: 'Folk Healer',
    icon: '👨‍⚕️',
    description: 'The most common type of traditional healer in the Philippines, using a combination of medicinal plants, prayers, and rituals.',
    fullDescription: 'Albularyos are the backbone of traditional Filipino medicine. They combine knowledge of herbal remedies with spiritual practices to diagnose and treat various ailments. Their knowledge is typically passed down through generations.',
    uses: ['General healing', 'Herbal medicine', 'Spiritual cleansing', 'Diagnosis'],
    tags: ['Folk Healer', 'Herbalist', 'Spiritual'],
    region: 'Nationwide'
  },
  {
    category: 'healers',
    title: 'Manghihilot',
    scientific: 'Massage Therapist',
    icon: '💆',
    description: 'Specialists in traditional massage therapy (hilot). They treat muscle pains, sprains, and assist with childbirth and bone setting.',
    fullDescription: 'Manghihilots are skilled practitioners of hilot, the traditional Filipino massage. They have extensive knowledge of the body and can treat various physical ailments through manipulation and massage.',
    uses: ['Massage therapy', 'Bone setting', 'Midwifery', 'Physical therapy'],
    tags: ['Massage', 'Physical Healer', 'Midwife'],
    region: 'Nationwide'
  },
  {
    category: 'healers',
    title: 'Herbolario',
    scientific: 'Herbalist',
    icon: '🌿',
    description: 'Experts in medicinal plants and herbal preparations. They create remedies from local flora with extensive knowledge of plant properties.',
    fullDescription: 'Herbolarios specialize in plant-based medicine. They know which plants to use, how to prepare them, and the correct dosages for various conditions. Their knowledge is often encyclopedic.',
    uses: ['Herbal remedies', 'Plant medicine', 'Natural treatments', 'Remedy preparation'],
    tags: ['Herbalist', 'Plant Medicine', 'Natural'],
    region: 'Nationwide'
  },
  {
    category: 'healers',
    title: 'Babaylan',
    scientific: 'Spiritual Healer',
    icon: '🔮',
    description: 'Pre-colonial spiritual leaders and healers, primarily women. They serve as intermediaries between the physical and spiritual worlds.',
    fullDescription: 'Babaylans were the spiritual leaders in pre-colonial Philippines. They performed rituals, healed the sick, and communicated with spirits. Though suppressed during colonization, their traditions persist in some communities.',
    uses: ['Spiritual healing', 'Rituals', 'Spirit communication', 'Community guidance'],
    tags: ['Spiritual', 'Ritual', 'Female Healer'],
    region: 'Visayas'
  },
  {
    category: 'healers',
    title: 'Mumbaki',
    scientific: 'Ritual Priest',
    icon: '🪶',
    description: 'Traditional priests of the Ifugao people who perform rituals and healing ceremonies with knowledge of customary laws.',
    fullDescription: 'Mumbakis are the ritual specialists of the Ifugao people in the Cordillera region. They perform elaborate ceremonies for healing, harvest, and other important occasions. They are keepers of oral traditions and customary laws.',
    uses: ['Healing ceremonies', 'Rituals', 'Traditional law', 'Community leadership'],
    tags: ['Ritual Healer', 'Indigenous', 'Ifugao'],
    region: 'Cordillera'
  },
  {
    category: 'healers',
    title: 'Mananambal',
    scientific: 'Visayan Healer',
    icon: '⚕️',
    description: 'Cebuano term for traditional healers who use herbs, prayers, and sometimes supernatural beliefs to treat patients.',
    fullDescription: 'Mananambal is the Visayan term for traditional healers. They combine herbal knowledge with spiritual practices unique to the Visayan region. Some specialize in specific conditions or healing methods.',
    uses: ['Herbal healing', 'Spiritual practices', 'Traditional medicine', 'Local remedies'],
    tags: ['Visayan', 'Traditional', 'Healer'],
    region: 'Visayas'
  }
];

const articlesData = [
  {
    title: 'The Science Behind Lagundi: Clinical Studies and Modern Applications',
    excerpt: 'Discover the scientific studies that validate the effectiveness of Lagundi for respiratory conditions. From traditional use to modern clinical trials.',
    content: 'Full article content here...',
    category: 'Research',
    icon: '🔬',
    readTime: '8 min read'
  },
  {
    title: "Sambong: Nature's Diuretic and Its Role in Kidney Health",
    excerpt: 'Learn how Sambong has been used traditionally and its modern medical applications in treating kidney stones and urinary problems.',
    content: 'Full article content here...',
    category: 'Health',
    icon: '💊',
    readTime: '6 min read'
  },
  {
    title: 'Preserving Traditional Knowledge: Why Documentation Matters',
    excerpt: 'The importance of documenting and preserving traditional healing practices for future generations in the digital age.',
    content: 'Full article content here...',
    category: 'Culture',
    icon: '📚',
    readTime: '5 min read'
  },
  {
    title: 'Marine Resources in Filipino Medicine: An Untapped Potential',
    excerpt: 'Exploring the role of marine animals and plants in traditional Philippine healthcare and their potential for modern medicine.',
    content: 'Full article content here...',
    category: 'Research',
    icon: '🌊',
    readTime: '7 min read'
  },
  {
    title: 'The Albularyo Tradition: Keepers of Ancient Wisdom',
    excerpt: 'A deep dive into the world of traditional Filipino healers and their invaluable role in community healthcare.',
    content: 'Full article content here...',
    category: 'Culture',
    icon: '🧓',
    readTime: '10 min read'
  },
  {
    title: 'Integrating Traditional and Modern Medicine: A Path Forward',
    excerpt: 'How the Philippines is working to bridge traditional healing practices with evidence-based modern medicine.',
    content: 'Full article content here...',
    category: 'Health',
    icon: '🤝',
    readTime: '8 min read'
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('🗑️  Clearing existing data...');
    await LibraryItem.deleteMany({});
    await Article.deleteMany({});
    
    console.log('🌱 Seeding library items...');
    const libraryItems = await LibraryItem.insertMany(libraryData);
    console.log(`   ✅ ${libraryItems.length} library items created`);
    
    console.log('📰 Seeding articles...');
    const articles = await Article.insertMany(articlesData);
    console.log(`   ✅ ${articles.length} articles created`);
    
    // Print stats
    const stats = {
      plants: libraryItems.filter(i => i.category === 'plants').length,
      marine: libraryItems.filter(i => i.category === 'marine').length,
      practices: libraryItems.filter(i => i.category === 'practices').length,
      healers: libraryItems.filter(i => i.category === 'healers').length
    };
    
    console.log('\n📊 Database Statistics:');
    console.log(`   🌿 Medicinal Plants: ${stats.plants}`);
    console.log(`   🐚 Marine Animals: ${stats.marine}`);
    console.log(`   🙌 Healing Practices: ${stats.practices}`);
    console.log(`   👨‍⚕️ Traditional Healers: ${stats.healers}`);
    console.log(`   📰 Articles: ${articles.length}`);
    console.log(`   📚 Total Items: ${libraryItems.length + articles.length}`);
    
    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
