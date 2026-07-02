/**
 * Seed script — loads realistic dummy data for KissanLink demo
 * All data placed within 8km of test user at [70.364044, 20.912044] (near Upleta, Rajkot dist.)
 *
 * Run: npm run seed
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const EquipmentListing = require('../models/EquipmentListing');
const LabourListing = require('../models/LabourListing');

// ── Test user location (centre point) ─────────────────────────────────────
// whatsapp:+919016875906 is at [70.364044, 20.912044]
// All seed coords placed within ~3-8km of this point

const CENTER = [70.364044, 20.912044]; // [lng, lat]

// Small offsets in degrees (~1deg lat ≈ 111km, ~1deg lng ≈ 95km at this latitude)
// 0.03 deg ≈ 3km, 0.07 deg ≈ 7km
function near(dlng, dlat) {
  return [CENTER[0] + dlng, CENTER[1] + dlat];
}

// ── Villages near Upleta, Rajkot district ─────────────────────────────────
const villages = [
  { name: 'Upleta',      coords: near(0.000,  0.000) },  // ~0km — same village
  { name: 'Bhanvad',     coords: near(0.030,  0.020) },  // ~3.5km NE
  { name: 'Keshod',      coords: near(-0.030, 0.025) },  // ~3.8km NW
  { name: 'Mendarda',    coords: near(0.055,  0.010) },  // ~5.3km E
  { name: 'Visavadar',   coords: near(-0.050, -0.020) }, // ~5.4km SW
  { name: 'Bagasra',     coords: near(0.040,  -0.045) }, // ~6km SE
  { name: 'Dhoraji',     coords: near(-0.060, 0.030) },  // ~6.6km W
  { name: 'Jetpur',      coords: near(0.065,  0.035) },  // ~7.3km NE
];

// ── Seed users ─────────────────────────────────────────────────────────────
const seedUsers = [
  // Equipment owners (vi = village index)
  { phone: 'whatsapp:+919876100001', name: 'Ramesh Patel',        village: 'Upleta',    role: ['farmer', 'owner'], lang: 'gu', vi: 0 },
  { phone: 'whatsapp:+919876100002', name: 'Bhavesh Mer',         village: 'Bhanvad',   role: ['owner'],           lang: 'gu', vi: 1 },
  { phone: 'whatsapp:+919876100003', name: 'Vijaybhai Vaghela',   village: 'Keshod',    role: ['farmer', 'owner'], lang: 'hi', vi: 2 },
  { phone: 'whatsapp:+919876100004', name: 'Dinesh Kumbhar',      village: 'Mendarda',  role: ['owner'],           lang: 'gu', vi: 3 },
  { phone: 'whatsapp:+919876100005', name: 'Kantibhai Rabari',    village: 'Visavadar', role: ['farmer', 'owner'], lang: 'gu', vi: 4 },
  { phone: 'whatsapp:+919876100006', name: 'Pravinbhai Jadeja',   village: 'Bagasra',   role: ['owner'],           lang: 'gu', vi: 5 },

  // Workers
  { phone: 'whatsapp:+919876100010', name: 'Savitaben Parmar',    village: 'Upleta',    role: ['worker'],           lang: 'gu', vi: 0 },
  { phone: 'whatsapp:+919876100011', name: 'Mukesh Solanki',      village: 'Bhanvad',   role: ['worker'],           lang: 'gu', vi: 1 },
  { phone: 'whatsapp:+919876100012', name: 'Geetaben Jadav',      village: 'Keshod',    role: ['worker'],           lang: 'gu', vi: 2 },
  { phone: 'whatsapp:+919876100013', name: 'Haribhai Thakar',     village: 'Mendarda',  role: ['worker'],           lang: 'hi', vi: 3 },
  { phone: 'whatsapp:+919876100014', name: 'Rekha Chauhan',       village: 'Visavadar', role: ['worker'],           lang: 'gu', vi: 4 },
  { phone: 'whatsapp:+919876100015', name: 'Bharat Makwana',      village: 'Bagasra',   role: ['worker'],           lang: 'gu', vi: 5 },
  { phone: 'whatsapp:+919876100016', name: 'Ilaben Gohil',        village: 'Dhoraji',   role: ['worker'],           lang: 'gu', vi: 6 },
  { phone: 'whatsapp:+919876100017', name: 'Naresh Baria',        village: 'Jetpur',    role: ['farmer', 'worker'], lang: 'gu', vi: 7 },
  { phone: 'whatsapp:+919876100018', name: 'Arjunbhai Chavda',    village: 'Upleta',    role: ['worker'],           lang: 'gu', vi: 0 },
];

// ── Equipment listings — 3+ per type ──────────────────────────────────────
const seedEquipment = [
  { userIdx: 0, type: 'Tractor',    rate: 800 },
  { userIdx: 1, type: 'Tractor',    rate: 850 },
  { userIdx: 2, type: 'Tractor',    rate: 750 },
  { userIdx: 3, type: 'Rotavator',  rate: 500 },
  { userIdx: 4, type: 'Rotavator',  rate: 480 },
  { userIdx: 5, type: 'Rotavator',  rate: 520 },
  { userIdx: 0, type: 'Thresher',   rate: 600 },
  { userIdx: 1, type: 'Thresher',   rate: 650 },
  { userIdx: 3, type: 'Thresher',   rate: 580 },
  { userIdx: 2, type: 'Water Pump', rate: 250 },
  { userIdx: 4, type: 'Water Pump', rate: 220 },
  { userIdx: 5, type: 'Water Pump', rate: 270 },
  { userIdx: 1, type: 'Sprayer',    rate: 300 },
  { userIdx: 3, type: 'Sprayer',    rate: 280 },
  { userIdx: 5, type: 'Sprayer',    rate: 320 },
];

// ── Labour listings — 3+ per skill ────────────────────────────────────────
const seedLabour = [
  // Harvesting (3+)
  { userIdx: 6,  skills: ['harvesting', 'sowing'],          rate: 400 },
  { userIdx: 7,  skills: ['harvesting', 'general'],         rate: 380 },
  { userIdx: 8,  skills: ['harvesting', 'weeding'],         rate: 420 },
  { userIdx: 14, skills: ['harvesting', 'sowing'],          rate: 390 },
  // Sowing (3+)
  { userIdx: 9,  skills: ['sowing', 'weeding'],             rate: 360 },
  { userIdx: 10, skills: ['sowing', 'general'],             rate: 340 },
  { userIdx: 11, skills: ['sowing', 'irrigation'],          rate: 370 },
  // Irrigation (3+)
  { userIdx: 12, skills: ['irrigation', 'general'],         rate: 320 },
  { userIdx: 13, skills: ['irrigation', 'weeding'],         rate: 310 },
  { userIdx: 6,  skills: ['irrigation', 'harvesting'],      rate: 350 },
  // Weeding (3+)
  { userIdx: 7,  skills: ['weeding', 'general'],            rate: 300 },
  { userIdx: 9,  skills: ['weeding', 'sowing'],             rate: 330 },
  { userIdx: 14, skills: ['weeding', 'general'],            rate: 290 },
  // General (3+)
  { userIdx: 10, skills: ['general'],                       rate: 280 },
  { userIdx: 11, skills: ['general', 'sowing'],             rate: 300 },
  { userIdx: 12, skills: ['general', 'irrigation'],         rate: 270 },
];

async function seed() {
  // Safety check: prevent running against production DB
  if (process.env.NODE_ENV === 'production') {
    throw new Error('❌ Seed scripts cannot run in production environment');
  }

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
        // Small random jitter so listings aren't all on exact same point
        coordinates: [
          v.coords[0] + (Math.random() - 0.5) * 0.008,
          v.coords[1] + (Math.random() - 0.5) * 0.008,
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

  // Clear old listings
  await EquipmentListing.deleteMany({ ownerId: { $in: createdUsers.map((u) => u._id) } });
  await LabourListing.deleteMany({ workerId: { $in: createdUsers.map((u) => u._id) } });

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
  console.log(`✅ Created ${seedEquipment.length} equipment listings (3+ per type)`);

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
  console.log(`✅ Created ${seedLabour.length} labour listings (3+ per skill)`);

  console.log('\n🌾 Seed complete!');
  console.log('📍 All data within 8km of test user (Upleta, Rajkot district)');
  console.log('📱 Test user: +919016875906 — share location from Upleta area to see all results\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
