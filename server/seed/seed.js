const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Flat = require('../models/Flat');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/society_db';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding...');

    // Clear existing users and flats
    await User.deleteMany({});
    await Flat.deleteMany({});
    console.log('🧹 Cleared existing Users and Flats collections.');

    // 1. Create Demo Flats
    const flatsToCreate = [
      { wing: 'A', flatNumber: '101', floor: 1, type: '2BHK', status: 'vacant' },
      { wing: 'A', flatNumber: '102', floor: 1, type: '2BHK', status: 'vacant' },
      { wing: 'A', flatNumber: '201', floor: 2, type: '3BHK', status: 'vacant' },
      { wing: 'A', flatNumber: '202', floor: 2, type: '3BHK', status: 'vacant' },
      { wing: 'B', flatNumber: '101', floor: 1, type: '2BHK', status: 'vacant' },
      { wing: 'B', flatNumber: '102', floor: 1, type: '1BHK', status: 'vacant' },
      { wing: 'B', flatNumber: '201', floor: 2, type: '3BHK', status: 'vacant' },
      { wing: 'B', flatNumber: '202', floor: 2, type: '4BHK', status: 'vacant' },
      { wing: 'C', flatNumber: '101', floor: 1, type: '2BHK', status: 'vacant' },
      { wing: 'C', flatNumber: '102', floor: 1, type: '2BHK', status: 'vacant' },
    ];

    const createdFlats = await Flat.insertMany(flatsToCreate);
    console.log(`🏢 Created ${createdFlats.length} flats.`);

    const flatA101 = createdFlats.find((f) => f.wing === 'A' && f.flatNumber === '101');
    const flatB201 = createdFlats.find((f) => f.wing === 'B' && f.flatNumber === '201');

    // 2. Create Demo Users
    const usersToCreate = [
      {
        name: 'System Administrator',
        email: 'admin@society.com',
        password: 'admin123',
        phone: '+1-555-0100',
        role: 'admin',
        status: 'active',
      },
      {
        name: 'John Resident',
        email: 'resident@society.com',
        password: 'resident123',
        phone: '+1-555-0200',
        role: 'resident',
        flat: flatA101 ? flatA101._id : null,
        status: 'active',
      },
      {
        name: 'Sarah Smith',
        email: 'sarah@society.com',
        password: 'resident123',
        phone: '+1-555-0201',
        role: 'resident',
        flat: flatB201 ? flatB201._id : null,
        status: 'active',
      },
      {
        name: 'Main Gate Officer',
        email: 'security@society.com',
        password: 'security123',
        phone: '+1-555-0300',
        role: 'security',
        status: 'active',
      },
    ];

    // Use User.create so pre('save') triggers password hashing
    const createdUsers = [];
    for (const u of usersToCreate) {
      const user = await User.create(u);
      createdUsers.push(user);
    }
    console.log(`👥 Created ${createdUsers.length} initial users.`);

    // Update flats with resident relationships
    const john = createdUsers.find((u) => u.email === 'resident@society.com');
    const sarah = createdUsers.find((u) => u.email === 'sarah@society.com');

    if (flatA101 && john) {
      flatA101.owner = john._id;
      flatA101.residents = [john._id];
      flatA101.status = 'occupied';
      await flatA101.save();
    }

    if (flatB201 && sarah) {
      flatB201.owner = sarah._id;
      flatB201.residents = [sarah._id];
      flatB201.status = 'occupied';
      await flatB201.save();
    }

    console.log('✨ Database seeding complete!');
    console.log('\n================ DEMO CREDENTIALS ================');
    console.log('1. Admin:    admin@society.com    / admin123');
    console.log('2. Resident: resident@society.com / resident123 (Flat A-101)');
    console.log('3. Resident: sarah@society.com    / resident123 (Flat B-201)');
    console.log('4. Security: security@society.com / security123');
    console.log('==================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
