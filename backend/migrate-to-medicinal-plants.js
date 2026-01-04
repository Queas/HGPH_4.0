/**
 * Migration Script: LibraryItem → MedicinalPlant
 * 
 * This script migrates existing plant data from the old LibraryItem model
 * to the new comprehensive MedicinalPlant schema.
 * 
 * Usage: node backend/migrate-to-medicinal-plants.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { LibraryItem, MedicinalPlant, User } = require('./models');

const migratePlants = async () => {
  try {
    console.log('🔄 Starting Migration: LibraryItem → MedicinalPlant\n');

    // Connect to database
    await connectDB();
    console.log('✓ Connected to MongoDB\n');

    // Find admin user for attribution (or create system user)
    let systemUser = await User.findOne({ role: 'admin' });
    if (!systemUser) {
      console.log('Creating system user for migration attribution...');
      systemUser = new User({
        username: 'system',
        email: 'system@halamanggaling.ph',
        password: 'System@MigrationOnly',
        role: 'admin',
        profile: {
          firstName: 'System',
          lastName: 'Migration'
        }
      });
      await systemUser.save();
      console.log('✓ System user created\n');
    }

    // Fetch all plant items from LibraryItem
    const plantItems = await LibraryItem.find({ 
      category: 'plants',
      isActive: true 
    });

    console.log(`Found ${plantItems.length} plant items to migrate\n`);

    if (plantItems.length === 0) {
      console.log('No plants to migrate. Exiting.');
      process.exit(0);
    }

    const migrationResults = {
      total: plantItems.length,
      successful: 0,
      skipped: 0,
      errors: []
    };

    for (const item of plantItems) {
      try {
        console.log(`\nMigrating: ${item.title}`);

        // Check if already migrated (by scientific name or title)
        const existing = await MedicinalPlant.findOne({
          $or: [
            { 'names.scientific': item.scientific },
            { 'names.commonNames.name': item.title }
          ]
        });

        if (existing) {
          console.log(`  ⚠️  Skipped (already exists): ${item.title}`);
          migrationResults.skipped++;
          continue;
        }

        // Extract common names from title
        // Assume title might be in format "Name1 / Name2" or just "Name"
        const titleNames = item.title.split('/').map(n => n.trim());
        const commonNames = titleNames.map(name => ({
          language: 'Filipino', // Default to Filipino, update manually later
          name: name
        }));

        // Map uses to traditional uses
        const traditionalUses = (item.uses || []).map(use => ({
          condition: use,
          preparation: 'Traditional method (needs verification)',
          administration: 'To be documented',
          sources: [{
            recordedBy: 'Migrated from legacy system',
            recordedDate: item.createdAt || new Date()
          }],
          iprStatus: 'pending' // Needs review
        }));

        // Extract region(s)
        const regions = item.region ? [item.region] : ['Nationwide'];

        // Create new MedicinalPlant document
        const plantData = {
          names: {
            scientific: item.scientific || 'Scientific name pending verification',
            commonNames: commonNames,
            family: 'Family to be determined',
            genus: 'Genus to be determined'
          },
          
          traditionalUses: traditionalUses,
          
          description: {
            botanical: item.fullDescription || item.description || 'Description to be added',
            morphology: 'To be documented',
            identification: 'To be documented'
          },
          
          distribution: {
            regions: regions,
            habitat: 'To be documented',
            conservationStatus: 'Unknown'
          },
          
          images: item.icon ? [{
            url: item.icon,
            caption: `${item.title} icon`,
            credit: 'Legacy system'
          }] : [],
          
          tags: item.tags || [],
          
          // Migration metadata
          validationStatus: 'draft', // Needs review and validation
          accessLevel: 'public',
          
          contributors: [{
            user: systemUser._id,
            role: 'creator',
            contribution: 'Migrated from legacy LibraryItem',
            contributedAt: new Date()
          }],
          
          sources: [{
            institution: 'HalamangGaling Legacy Database',
            reference: `LibraryItem ID: ${item._id}`,
            accessDate: new Date()
          }],
          
          // Preserve original timestamps if possible
          isActive: item.isActive
        };

        // Add createdAt/updatedAt from original if available
        if (item.createdAt) {
          plantData.createdAt = item.createdAt;
        }
        if (item.updatedAt) {
          plantData.updatedAt = item.updatedAt;
        }

        const plant = new MedicinalPlant(plantData);
        await plant.save();

        console.log(`  ✓ Migrated: ${plant.names.scientific}`);
        migrationResults.successful++;

      } catch (error) {
        console.error(`  ✗ Error migrating ${item.title}:`, error.message);
        migrationResults.errors.push({
          item: item.title,
          error: error.message
        });
      }
    }

    // Display results
    console.log('\n' + '='.repeat(60));
    console.log('MIGRATION COMPLETED');
    console.log('='.repeat(60));
    console.log(`\nTotal items processed: ${migrationResults.total}`);
    console.log(`Successfully migrated: ${migrationResults.successful}`);
    console.log(`Skipped (duplicates): ${migrationResults.skipped}`);
    console.log(`Errors: ${migrationResults.errors.length}`);

    if (migrationResults.errors.length > 0) {
      console.log('\nErrors encountered:');
      migrationResults.errors.forEach(err => {
        console.log(`  - ${err.item}: ${err.error}`);
      });
    }

    console.log('\n⚠️  IMPORTANT POST-MIGRATION TASKS:');
    console.log('━'.repeat(60));
    console.log('1. Review all migrated plants (status: draft)');
    console.log('2. Verify scientific names and families');
    console.log('3. Add proper language tags to common names');
    console.log('4. Document preparation methods for traditional uses');
    console.log('5. Add safety information and contraindications');
    console.log('6. Upload proper plant images (replace icons)');
    console.log('7. Link to clinical studies if available');
    console.log('8. Update IPR status for traditional uses');
    console.log('9. Change validation status to "published" when ready');
    console.log('10. DO NOT delete original LibraryItems until verified!');
    console.log('━'.repeat(60));

    // Optional: Create a migration report
    const report = {
      migrationDate: new Date(),
      results: migrationResults,
      nextSteps: [
        'Review all draft entries',
        'Validate scientific information',
        'Add comprehensive safety data',
        'Update to published status'
      ]
    };

    console.log('\n📄 Migration report saved to migration-report.json');
    const fs = require('fs');
    fs.writeFileSync(
      'migration-report.json', 
      JSON.stringify(report, null, 2)
    );

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
};

// Dry run option (test without saving)
const dryRun = async () => {
  try {
    console.log('🔍 DRY RUN MODE - No changes will be saved\n');

    await connectDB();
    
    const plantItems = await LibraryItem.find({ 
      category: 'plants',
      isActive: true 
    });

    console.log(`Would migrate ${plantItems.length} plants:\n`);

    plantItems.forEach((item, idx) => {
      console.log(`${idx + 1}. ${item.title}`);
      console.log(`   Scientific: ${item.scientific || 'MISSING'}`);
      console.log(`   Uses: ${item.uses?.length || 0} recorded`);
      console.log(`   Region: ${item.region || 'Not specified'}`);
      console.log('');
    });

    console.log('To perform actual migration, run: npm run migrate-plants');

  } catch (error) {
    console.error('Error during dry run:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Check command line arguments
const args = process.argv.slice(2);

if (args.includes('--dry-run') || args.includes('-d')) {
  dryRun();
} else if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Migration Script: LibraryItem → MedicinalPlant

Usage:
  node migrate-to-medicinal-plants.js [options]

Options:
  --dry-run, -d    Show what would be migrated without making changes
  --help, -h       Show this help message

Examples:
  node migrate-to-medicinal-plants.js --dry-run
  node migrate-to-medicinal-plants.js

⚠️  IMPORTANT:
  - Backup your database before running migration
  - Run with --dry-run first to preview changes
  - Review all migrated entries before going live
  - Original LibraryItems are NOT deleted automatically
  `);
  process.exit(0);
} else {
  // Confirm before proceeding
  console.log('⚠️  WARNING: This will create new MedicinalPlant entries');
  console.log('Original LibraryItems will NOT be deleted.');
  console.log('');
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
  
  setTimeout(() => {
    migratePlants();
  }, 5000);
}
