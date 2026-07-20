/**
 * Clear all data from the database
 * 
 * Usage: node src/scripts/clearDatabase.js
 * 
 * WARNING: This will delete ALL data from:
 * - Users
 * - Equipment Listings
 * - Labour Listings
 * - Bookings
 */

require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../models/User');
const EquipmentListing = require('../models/EquipmentListing');
const LabourListing = require('../models/LabourListing');
const Booking = require('../models/Booking');

async function clearDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n⚠️  WARNING: This will delete ALL data from the database!');
    console.log('Starting in 3 seconds...\n');
    
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Delete all collections
    console.log('🗑️  Deleting Users...');
    const usersDeleted = await User.deleteMany({});
    console.log(`   ✅ Deleted ${usersDeleted.deletedCount} users`);

    console.log('🗑️  Deleting Equipment Listings...');
    const equipmentDeleted = await EquipmentListing.deleteMany({});
    console.log(`   ✅ Deleted ${equipmentDeleted.deletedCount} equipment listings`);

    console.log('🗑️  Deleting Labour Listings...');
    const labourDeleted = await LabourListing.deleteMany({});
    console.log(`   ✅ Deleted ${labourDeleted.deletedCount} labour listings`);

    console.log('🗑️  Deleting Bookings...');
    const bookingsDeleted = await Booking.deleteMany({});
    console.log(`   ✅ Deleted ${bookingsDeleted.deletedCount} bookings`);

    console.log('\n✨ Database cleared successfully!');
    console.log('\nSummary:');
    console.log(`   Users: ${usersDeleted.deletedCount}`);
    console.log(`   Equipment: ${equipmentDeleted.deletedCount}`);
    console.log(`   Labour: ${labourDeleted.deletedCount}`);
    console.log(`   Bookings: ${bookingsDeleted.deletedCount}`);
    console.log(`   Total: ${usersDeleted.deletedCount + equipmentDeleted.deletedCount + labourDeleted.deletedCount + bookingsDeleted.deletedCount}`);

  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

clearDatabase();
