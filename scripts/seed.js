const mongoose = require('mongoose');
const { addDays, subDays, format } = require('date-fns');

// Import models
const User = require('../models/User');
const database = require('../config/database');

async function seed() {
  console.log('🌱 Starting MongoDB database seeding...');

  try {
    // Connect to MongoDB
    await database.connect();
    console.log('📊 Connected to MongoDB for seeding');

    // Clear existing data (only in development)
    if (process.env.NODE_ENV !== 'production') {
      await User.deleteMany({});
      console.log('🗑️  Cleared existing data');
    }

    // Create a test user with unified model
    const testUser = new User({
      firstName: 'Jane',
      lastName: 'Doe', 
      username: 'janedoe',
      email: 'jane@example.com',
      password: 'password123'
    });

    await testUser.save();
    console.log('✅ Test user created');

    // Add sample cycles using unified User model
    const cycles = [
      {
        startDate: subDays(new Date(), 150),
        endDate: subDays(new Date(), 145),
        cycleLength: 28,
        periodLength: 5,
        predicted: false,
        confidence: 95
      },
      {
        startDate: subDays(new Date(), 122),
        endDate: subDays(new Date(), 118),
        cycleLength: 28,
        periodLength: 4,
        predicted: false,
        confidence: 90
      },
      {
        startDate: subDays(new Date(), 93),
        endDate: subDays(new Date(), 89),
        cycleLength: 29,
        periodLength: 4,
        predicted: false,
        confidence: 88
      },
      {
        startDate: subDays(new Date(), 64),
        endDate: subDays(new Date(), 60),
        cycleLength: 29,
        periodLength: 4,
        predicted: false,
        confidence: 85
      },
      {
        startDate: subDays(new Date(), 35),
        endDate: subDays(new Date(), 31),
        cycleLength: 29,
        periodLength: 4,
        predicted: false,
        confidence: 92
      },
      {
        startDate: subDays(new Date(), 7),
        endDate: subDays(new Date(), 3),
        cycleLength: 28,
        periodLength: 4,
        predicted: false,
        confidence: 88
      }
    ];

    // Add cycles to user using the unified model
    for (const cycleData of cycles) {
      testUser.addCycle(cycleData);
    }
    
    // Update stats and save user
    testUser.updateStats();
    await testUser.save();

    console.log('✅ Sample cycles added to unified user model');

    // Add some daily entries using unified model
    const recentCycle = testUser.cycles[testUser.cycles.length - 1];
    const dailyEntries = [
      {
        date: subDays(new Date(), 7),
        flow: 'heavy',
        cycleId: recentCycle._id
      },
      {
        date: subDays(new Date(), 6),
        flow: 'medium',
        cycleId: recentCycle._id
      },
      {
        date: subDays(new Date(), 5),
        flow: 'light',
        cycleId: recentCycle._id
      },
      {
        date: subDays(new Date(), 4),
        flow: 'spotting',
        cycleId: recentCycle._id
      }
    ];

    // Add daily entries to user
    for (const entryData of dailyEntries) {
      testUser.addDailyEntry(entryData);
    }
    
    await testUser.save();
    console.log('✅ Sample daily entries added to unified user model');

    // Create some additional users for testing
    const additionalUsers = [
      {
        firstName: 'Sarah',
        lastName: 'Smith',
        username: 'sarahsmith',
        email: 'sarah@example.com',
        password: 'password123'
      },
      {
        firstName: 'Emily',
        lastName: 'Johnson',
        username: 'emilyjohnson',
        email: 'emily@example.com',
        password: 'password123'
      }
    ];

    for (const userData of additionalUsers) {
      const user = new User(userData);
      await user.save();
    }

    console.log('✅ Additional test users created');

    console.log('\n🎉 MongoDB database seeded successfully!');
    console.log('\n📝 Test user credentials:');
    console.log('Email: jane@example.com');
    console.log('Password: password123');
    console.log('\n📊 Data created:');
    console.log(`- Users: ${additionalUsers.length + 1}`);
    console.log(`- Cycles: ${cycles.length} (embedded in unified User model)`);
    console.log(`- Daily Entries: ${dailyEntries.length} (embedded in unified User model)`);
    
    console.log('\n🔬 Frontend Prediction Engine:');
    console.log('- Linear regression model integrated in frontend');
    console.log('- 6 cycles available for prediction');
    console.log('- Average cycle length: 28.5 days');
    console.log('- Ready for frontend-based predictions!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await database.disconnect();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seed();
}

module.exports = seed;