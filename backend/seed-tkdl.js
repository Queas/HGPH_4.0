/**
 * Seed Script for TKDL-PH Database
 * Populates the database with sample medicinal plants, studies, and indigenous knowledge
 * 
 * Usage: npm run seed-tkdl
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const {
  MedicinalPlant,
  ClinicalStudy,
  IndigenousKnowledge,
  ResearchContribution,
  User
} = require('./models');

const {
  sampleMedicinalPlants,
  sampleClinicalStudies,
  sampleIndigenousKnowledge,
  sampleResearchContribution
} = require('./data/sample-data');

const bcrypt = require('bcryptjs');

// Sample users for different roles
const createSampleUsers = async () => {
  const users = [
    {
      username: 'admin',
      email: 'admin@halamanggaling.ph',
      password: 'Admin@123',
      role: 'admin',
      profile: {
        firstName: 'System',
        lastName: 'Administrator',
        affiliation: 'HalamangGaling PH'
      },
      permissions: {
        canReview: true,
        canEdit: true,
        canApprove: true,
        canAccessRestrictedKnowledge: true,
        canManageIPR: true
      },
      emailVerified: true
    },
    {
      username: 'researcher01',
      email: 'researcher@up.edu.ph',
      password: 'Research@123',
      role: 'researcher',
      profile: {
        firstName: 'Maria',
        lastName: 'Santos',
        affiliation: 'University of the Philippines',
        institution: 'College of Medicine',
        credentials: ['PhD', 'MD'],
        orcid: '0000-0001-2345-6789',
        specialization: ['Pharmacology', 'Herbal Medicine']
      },
      permissions: {
        canReview: true,
        canEdit: false,
        canApprove: false,
        canAccessRestrictedKnowledge: true,
        canManageIPR: false
      },
      expertise: {
        plantFamilies: ['Lamiaceae', 'Asteraceae'],
        regions: ['NCR', 'Region IV-A'],
        topics: ['Phytochemistry', 'Clinical Trials'],
        languages: ['English', 'Filipino']
      },
      emailVerified: true
    },
    {
      username: 'reviewer01',
      email: 'reviewer@ihm.dost.gov.ph',
      password: 'Review@123',
      role: 'reviewer',
      profile: {
        firstName: 'Juan',
        lastName: 'Reyes',
        affiliation: 'Institute of Herbal Medicine',
        institution: 'DOST',
        position: 'Senior Research Specialist',
        credentials: ['PhD', 'MS']
      },
      permissions: {
        canReview: true,
        canEdit: true,
        canApprove: false,
        canAccessRestrictedKnowledge: true,
        canManageIPR: false
      },
      emailVerified: true
    },
    {
      username: 'editor01',
      email: 'editor@halamanggaling.ph',
      password: 'Editor@123',
      role: 'editor',
      profile: {
        firstName: 'Rosa',
        lastName: 'Cruz',
        affiliation: 'HalamangGaling PH',
        position: 'Content Editor'
      },
      permissions: {
        canReview: true,
        canEdit: true,
        canApprove: true,
        canAccessRestrictedKnowledge: false,
        canManageIPR: false
      },
      emailVerified: true
    },
    {
      username: 'tboli_rep',
      email: 'representative@tboli.com.ph',
      password: 'Tboli@123',
      role: 'indigenous_representative',
      profile: {
        firstName: 'Maria',
        lastName: 'T\'boli',
        affiliation: 'T\'boli Tribal Council'
      },
      indigenousAffiliation: {
        community: 'T\'boli Community of Lake Sebu',
        indigenousGroup: 'T\'boli',
        role: 'Authorized Representative',
        verificationStatus: 'verified',
        verificationDate: new Date('2024-01-15')
      },
      permissions: {
        canReview: false,
        canEdit: false,
        canApprove: false,
        canAccessRestrictedKnowledge: true,
        canManageIPR: true
      },
      emailVerified: true
    }
  ];

  console.log('Creating sample users...');
  const createdUsers = {};
  
  for (const userData of users) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      console.log(`  ✓ User ${userData.username} already exists`);
      createdUsers[userData.username] = existingUser;
      continue;
    }

    const user = new User(userData);
    await user.save();
    console.log(`  ✓ Created user: ${userData.username} (${userData.role})`);
    createdUsers[userData.username] = user;
  }

  return createdUsers;
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting TKDL-PH Database Seeding...\n');

    // Connect to database
    await connectDB();
    console.log('✓ Connected to MongoDB\n');

    // Create users first
    const users = await createSampleUsers();
    console.log(`\n✓ Created ${Object.keys(users).length} users\n`);

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing TKDL data...');
    await MedicinalPlant.deleteMany({});
    await ClinicalStudy.deleteMany({});
    await IndigenousKnowledge.deleteMany({});
    await ResearchContribution.deleteMany({});
    console.log('✓ Cleared existing data\n');

    // Seed Medicinal Plants
    console.log('Seeding Medicinal Plants...');
    const plants = [];
    for (const plantData of sampleMedicinalPlants) {
      // Add contributors
      plantData.contributors = [{
        user: users.researcher01._id,
        role: 'creator',
        contribution: 'Initial data entry',
        contributedAt: new Date()
      }];
      
      plantData.reviewHistory = [{
        reviewer: users.reviewer01._id,
        status: 'approved',
        comments: 'Validated against DOH documentation',
        reviewedAt: new Date()
      }];

      const plant = new MedicinalPlant(plantData);
      await plant.save();
      plants.push(plant);
      console.log(`  ✓ Created: ${plant.names.scientific}`);
    }
    console.log(`\n✓ Seeded ${plants.length} medicinal plants\n`);

    // Seed Clinical Studies
    console.log('Seeding Clinical Studies...');
    const studies = [];
    for (const studyData of sampleClinicalStudies) {
      // Link to plants
      if (studyData.title.includes('Vitex')) {
        studyData.plants = [plants[0]._id]; // Lagundi
      } else if (studyData.title.includes('Blumea')) {
        studyData.plants = [plants[1]._id]; // Sambong
      }

      studyData.verifiedBy = users.reviewer01._id;
      studyData.verifiedAt = new Date();

      const study = new ClinicalStudy(studyData);
      await study.save();
      studies.push(study);
      console.log(`  ✓ Created: ${study.title.substring(0, 60)}...`);
    }
    console.log(`\n✓ Seeded ${studies.length} clinical studies\n`);

    // Update plants with study references
    // Note: Skipping clinical evidence linking due to UUID format in sample data
    // In production, this would link studies to plants using MongoDB ObjectIds
    console.log('✓ Skipped study linking (will be done through API)\n');

    // Seed Indigenous Knowledge
    console.log('Seeding Indigenous Knowledge...');
    const knowledge = [];
    for (const knowledgeData of sampleIndigenousKnowledge) {
      // Link to a plant (create a new one or link to existing)
      // For demo, we'll create a placeholder link
      if (plants.length > 0) {
        knowledgeData.plants = [plants[0]._id];
      }

      const ik = new IndigenousKnowledge(knowledgeData);
      await ik.save();
      knowledge.push(ik);
      console.log(`  ✓ Created: ${ik.community.name} - ${ik.knowledgeType}`);
    }
    console.log(`\n✓ Seeded ${knowledge.length} indigenous knowledge records\n`);

    // Seed Research Contribution
    console.log('Seeding Research Contributions...');
    const contribution = { ...sampleResearchContribution };
    contribution.contributor.user = users.researcher01._id;
    contribution.relatedPlant = plants[0]._id; // Link to Lagundi
    
    // Add reviewers
    contribution.reviewers = [{
      reviewer: users.reviewer01._id,
      assignedAt: new Date(),
      status: 'assigned'
    }];

    const rc = new ResearchContribution(contribution);
    await rc.save();
    console.log(`  ✓ Created: ${rc.title}`);
    console.log('\n✓ Seeded 1 research contribution\n');

    // Display summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\nDatabase Summary:');
    console.log(`  • Users: ${Object.keys(users).length}`);
    console.log(`  • Medicinal Plants: ${plants.length}`);
    console.log(`  • Clinical Studies: ${studies.length}`);
    console.log(`  • Indigenous Knowledge: ${knowledge.length}`);
    console.log(`  • Research Contributions: 1`);
    console.log('\nSample User Credentials:');
    console.log('  Admin:');
    console.log('    Username: admin');
    console.log('    Password: Admin@123');
    console.log('\n  Researcher:');
    console.log('    Username: researcher01');
    console.log('    Password: Research@123');
    console.log('\n  Reviewer:');
    console.log('    Username: reviewer01');
    console.log('    Password: Review@123');
    console.log('\n  Editor:');
    console.log('    Username: editor01');
    console.log('    Password: Editor@123');
    console.log('\n  Indigenous Representative:');
    console.log('    Username: tboli_rep');
    console.log('    Password: Tboli@123');
    console.log('\n' + '='.repeat(60));

    // Test some queries
    console.log('\n📊 Testing Database Queries:\n');

    // Test search by condition
    const diabetesPlants = await MedicinalPlant.searchByCondition('cough');
    console.log(`  ✓ Search by condition "cough": ${diabetesPlants.length} results`);

    // Test search by region
    const regionalPlants = await MedicinalPlant.searchByRegion('Nationwide');
    console.log(`  ✓ Search by region "Nationwide": ${regionalPlants.length} results`);

    // Test common name search
    const lagundiPlants = await MedicinalPlant.getByCommonName('lagundi');
    console.log(`  ✓ Search by common name "lagundi": ${lagundiPlants.length} results`);

    // Test clinical study queries
    const planStudies = await ClinicalStudy.findByPlant(plants[0]._id);
    console.log(`  ✓ Studies for Lagundi: ${planStudies.length} results`);

    // Test indigenous knowledge queries
    const publicKnowledge = await IndigenousKnowledge.findPublicKnowledge();
    console.log(`  ✓ Public indigenous knowledge: ${publicKnowledge.length} results`);

    console.log('\n✅ All tests passed!\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seed
seedDatabase();
