/**
 * Seed script — loads realistic dummy data for demo
 * Villages from Rajkot / Saurashtra district, Gujarat
 *
 * Run: npm run seed
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const EquipmentListing = require('../models/EquipmentListing');
const LabourListing = require('../models/LabourListing');

// ── Villages around Surat district, Gujarat (lat, lng) ────────────────────
const villages = [
  { name: 'Kamrej',      coords: [72.9683, 21.2693] },
  { name: 'Sachin',      coords: [72.8836, 21.0877] },
  { name: 'Palsana',     coords: [72.9291, 21.1726] },
  { name: 'Bardoli',     coords: [73.1106, 21.1244] },
  { name: 'Mandvi',      coords: [73.2738, 21.2647] },
  { name: 'Olpad',       coords: [72.7560, 21.3338] },
  { name: 'Mangrol',     coords: [73.2338, 21.4183] },
  { name: 'Vyara',       coords: [73.3872, 21.1123] },
];

// ── Seed users ────────────────────────────────────────────────────────────
const seedUsers = [
  // Equipment owners
  { phone: 'whatsapp:+919876000001', name: 'Ramesh Patel',     village: 'Kamrej',  role: ['farmer', 'owner'], lang: 'gu', vi: 0 },
  { phone: 'whatsapp:+919876000002', name: 'Bhavesh Desai',    village: 'Sachin',  role: ['owner'],           lang: 'gu', vi: 1 },
  { phone: 'whatsapp:+919876000003', name: 'Vijaybhai Vasava', village: 'Palsana', role: ['farmer', 'owner'], lang: 'hi', vi: 2 },
  { phone: 'whatsapp:+919876000004', name: 'Dinesh Gamit',     village: 'Bardoli', role: ['owner'],           lang: 'gu', vi: 3 },
  { phone: 'whatsapp:+919876000005', name: 'Kantibhai Chaudhary', village: 'Mandvi', role: ['farmer', 'owner'], lang: 'gu', vi: 4 },

  // Workers
  { phone: 'whatsapp:+919876000010', name: 'Savitaben Patel',  village: 'Sachin',  role: ['worker'],           lang: 'gu', vi: 1 },
  { phone: 'whatsapp:+919876000011', name: 'Mukesh Vasava',    village: 'Palsana', role: ['worker'],           lang: 'gu', vi: 2 },
  { phone: 'whatsapp:+919876000012', name: 'Geetaben Gamit',   village: 'Kamrej',  role: ['worker'],           lang: 'gu', vi: 0 },
  { phone: 'whatsapp:+919876000013', name: 'Haribhai Chaudhary', village: 'Mandvi', role: ['worker'],          lang: 'hi', vi: 4 },
  { phone: 'whatsapp:+919876000014', name: 'Rekha Tadvi',      village: 'Olpad',   role: ['worker'],           lang: 'gu', vi: 5 },
  { phone: 'whatsapp:+919876000015', name: 'Bharat Nayka',     village: 'Mangrol', role: ['worker'],           lang: 'gu', vi: 6 },
  { phone: 'whatsapp:+919876000016', name: 'Ilaben Halpati',   village: 'Vyara',   role: ['worker'],           lang: 'gu', vi: 7 },
  { phone: 'whatsapp:+919876000017', name: 'Naresh Baria',     village: 'Bardoli', role: ['farmer', 'worker'], lang: 'gu', vi: 3 },
];

// ── Equipment listings ────────────────────────────────────────────────────
const seedEquipment = [
  { userIdx: 0, type: 'Tractor',    rate: 800  },
  { userIdx: 1, type: 'Tractor',    rate: 850  },
  { userIdx: 2, type: 'Rotavator',  rate: 500  },
  { userIdx: 3, type: 'Thresher',   rate: 600  },
  { userIdx: 4, type: 'Water Pump', rate: 250  },
  { userIdx: 2, type: 'Sprayer',    rate: 300  },
];

// ── Labour listings ───────────────────────────────────────────────────────
const seedLabour = [
  { userIdx: 5,  skills: ['harvesting', 'sowing'],    rate: 400 },
  { userIdx: 6,  skills: ['harvesting', 'general'],   rate: 350 },
  { userIdx: 7,  skills: ['sowing', 'weeding'],       rate: 380 },
  { userIdx: 8,  skills: ['irrigation', 'general'],   rate: 320 },
  { userIdx: 9,  skills: ['harvesting', 'weeding'],   rate: 360 },
  { userIdx: 10, skills: ['sowing', 'general'],       rate: 340 },
  { userIdx: 11, skills: ['harvesting', 'sowing'],    rate: 400 },
  { userIdx: 12, skills: ['general'],                 rate: 300 },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing seed data
  const seedPhones = seedUsers.map((u) => u.phone);
  await User.deleteMany({ phone: { $in: seedPhones } });
  console.log('🗑️  Cleared old seed users');

  // Insert users
  const createdUsers = [];
  for (const u of seedUsers) {
    const v = villages[u.vi];
    const user = await User.create({
      phone: u.phone,
      name: u.name,
      village: u.village,
      location: {
        type: 'Point',
        // Slightly randomize coordinates so listings spread within ~2km
        coordinates: [
          v.coords[0] + (Math.random() - 0.5) * 0.02,
          v.coords[1] + (Math.random() - 0.5) * 0.02,
        ],
      },
      roles: u.role,
      language: u.lang,
      isRegistered: true,
      state: 'MAIN_MENU',
      rating: +(3.5 + Math.random() * 1.5).toFixed(1),
      ratingCount: Math.floor(Math.random() * 20) + 3,
    });
    createdUsers.push(user);
  }
  console.log(`✅ Created ${createdUsers.length} users`);

  // Clear equipment listings for these owners
  await EquipmentListing.deleteMany({ ownerId: { $in: createdUsers.map((u) => u._id) } });

  // Insert equipment
  for (const eq of seedEquipment) {
    const owner = createdUsers[eq.userIdx];
    await EquipmentListing.create({
      ownerId: owner._id,
      ownerPhone: owner.phone,
      ownerName: owner.name,
      type: eq.type,
      dailyRate: eq.rate,
      available: true,
      location: owner.location,
      village: owner.village,
      rating: owner.rating,
      ratingCount: owner.ratingCount,
    });
  }
  console.log(`✅ Created ${seedEquipment.length} equipment listings`);

  // Clear labour listings for these workers
  await LabourListing.deleteMany({ workerId: { $in: createdUsers.map((u) => u._id) } });

  // Insert labour
  for (const lab of seedLabour) {
    const worker = createdUsers[lab.userIdx];
    await LabourListing.create({
      workerId: worker._id,
      workerPhone: worker.phone,
      workerName: worker.name,
      skills: lab.skills,
      dailyRate: lab.rate,
      available: true,
      location: worker.location,
      village: worker.village,
      rating: worker.rating,
      ratingCount: worker.ratingCount,
    });
  }
  console.log(`✅ Created ${seedLabour.length} labour listings`);

  console.log('\n🌾 Seed complete! Villages loaded: Kotda Sangani, Gondal, Vinchhiya, Paddhari, Jasdan, Upleta, Dhoraji, Jetpur');
  console.log('📱 Demo tip: Share any location near Rajkot to get results within 10km radius\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
