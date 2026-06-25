/**
 * Seed script — Bhimrad area (near Surat, Gujarat)
 * Centre: Bhimrad [72.9850, 21.2150]
 * All data within 8km of centre
 *
 * Run: npm run seed:bhimrad
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const EquipmentListing = require('../models/EquipmentListing');
const LabourListing = require('../models/LabourListing');

const CENTER = [72.9850, 21.2150]; // Bhimrad, Surat district [lng, lat]

function near(dlng, dlat) {
  return [CENTER[0] + dlng, CENTER[1] + dlat];
}

// ── Villages near Bhimrad, Surat district ─────────────────────────────────
const villages = [
  { name: 'Bhimrad',     coords: near( 0.000,  0.000) }, // centre ~0km
  { name: 'Kadodara',    coords: near( 0.030,  0.020) }, // ~3.5km NE
  { name: 'Kosad',       coords: near(-0.025,  0.030) }, // ~3.8km NW
  { name: 'Valod',       coords: near( 0.055,  0.010) }, // ~5.3km E
  { name: 'Kamrej',      coords: near(-0.045, -0.020) }, // ~5km SW
  { name: 'Palsana',     coords: near( 0.040, -0.045) }, // ~6km SE
  { name: 'Sachin',      coords: near(-0.060,  0.025) }, // ~6.5km W
  { name: 'Bardoli',     coords: near( 0.060,  0.040) }, // ~7.3km NE
];

// ── Seed users — phone range +919876200001 to avoid clashes ───────────────
const seedUsers = [
  // Equipment owners
  { phone: 'whatsapp:+919876200001', name: 'Mukeshbhai Patel',    village: 'Bhimrad',   role: ['farmer', 'owner'], lang: 'gu', vi: 0 },
  { phone: 'whatsapp:+919876200002', name: 'Dilipbhai Desai',     village: 'Kadodara',  role: ['owner'],           lang: 'gu', vi: 1 },
  { phone: 'whatsapp:+919876200003', name: 'Yogeshbhai Vasava',   village: 'Kosad',     role: ['farmer', 'owner'], lang: 'hi', vi: 2 },
  { phone: 'whatsapp:+919876200004', name: 'Hiteshbhai Gamit',    village: 'Valod',     role: ['owner'],           lang: 'gu', vi: 3 },
  { phone: 'whatsapp:+919876200005', name: 'Sureshbhai Chaudhary',village: 'Kamrej',    role: ['farmer', 'owner'], lang: 'gu', vi: 4 },
  { phone: 'whatsapp:+919876200006', name: 'Maheshbhai Tadvi',    village: 'Palsana',   role: ['owner'],           lang: 'gu', vi: 5 },

  // Workers
  { phone: 'whatsapp:+919876200010', name: 'Reenaben Patel',      village: 'Bhimrad',   role: ['worker'],           lang: 'gu', vi: 0 },
  { phone: 'whatsapp:+919876200011', name: 'Jignesh Vasava',      village: 'Kadodara',  role: ['worker'],           lang: 'gu', vi: 1 },
  { phone: 'whatsapp:+919876200012', name: 'Kokilaben Gamit',     village: 'Kosad',     role: ['worker'],           lang: 'gu', vi: 2 },
  { phone: 'whatsapp:+919876200013', name: 'Dineshbhai Nayka',    village: 'Valod',     role: ['worker'],           lang: 'hi', vi: 3 },
  { phone: 'whatsapp:+919876200014', name: 'Sangitaben Halpati',  village: 'Kamrej',    role: ['worker'],           lang: 'gu', vi: 4 },
  { phone: 'whatsapp:+919876200015', name: 'Praful Baria',        village: 'Palsana',   role: ['worker'],           lang: 'gu', vi: 5 },
  { phone: 'whatsapp:+919876200016', name: 'Ushaben Rathod',      village: 'Sachin',    role: ['worker'],           lang: 'gu', vi: 6 },
  { phone: 'whatsapp:+919876200017', name: 'Kamlesh Makvana',     village: 'Bardoli',   role: ['farmer', 'worker'], lang: 'gu', vi: 7 },
  { phone: 'whatsapp:+919876200018', name: 'Bhavnaben Parmar',    village: 'Bhimrad',   role: ['worker'],           lang: 'gu', vi: 0 },
];

// ── Equipment — 3+ per type ───────────────────────────────────────────────
const seedEquipment = [
  { userIdx: 0, type: 'Tractor',    rate: 820 },
  { userIdx: 1, type: 'Tractor',    rate: 800 },
  { userIdx: 2, type: 'Tractor',    rate: 780 },
  { userIdx: 3, type: 'Rotavator',  rate: 510 },
  { userIdx: 4, type: 'Rotavator',  rate: 490 },
  { userIdx: 5, type: 'Rotavator',  rate: 530 },
  { userIdx: 0, type: 'Thresher',   rate: 620 },
  { userIdx: 1, type: 'Thresher',   rate: 600 },
  { userIdx: 3, type: 'Thresher',   rate: 590 },
  { userIdx: 2, type: 'Water Pump', rate: 240 },
  { userIdx: 4, type: 'Water Pump', rate: 260 },
  { userIdx: 5, type: 'Water Pump', rate: 230 },
  { userIdx: 1, type: 'Sprayer',    rate: 310 },
  { userIdx: 3, type: 'Sprayer',    rate: 290 },
  { userIdx: 5, type: 'Sprayer',    rate: 330 },
];

// ── Labour — 3+ per skill ─────────────────────────────────────────────────
const seedLabour = [
  // Harvesting
  { userIdx: 6,  skills: ['harvesting', 'sowing'],     rate: 420 },
  { userIdx: 7,  skills: ['harvesting', 'general'],    rate: 400 },
  { userIdx: 8,  skills: ['harvesting', 'weeding'],    rate: 410 },
  { userIdx: 14, skills: ['harvesting', 'sowing'],     rate: 390 },
  // Sowing
  { userIdx: 9,  skills: ['sowing', 'weeding'],        rate: 370 },
  { userIdx: 10, skills: ['sowing', 'general'],        rate: 350 },
  { userIdx: 11, skills: ['sowing', 'irrigation'],     rate: 380 },
  // Irrigation
  { userIdx: 12, skills: ['irrigation', 'general'],    rate: 330 },
  { userIdx: 13, skills: ['irrigation', 'weeding'],    rate: 320 },
  { userIdx: 6,  skills: ['irrigation', 'harvesting'], rate: 360 },
  // Weeding
  { userIdx: 7,  skills: ['weeding', 'general'],       rate: 310 },
  { userIdx: 9,  skills: ['weeding', 'sowing'],        rate: 340 },
  { userIdx: 14, skills: ['weeding', 'general'],       rate: 300 },
  // General
  { userIdx: 10, skills: ['general'],                  rate: 290 },
  { userIdx: 11, skills: ['general', 'sowing'],        rate: 310 },
  { userIdx: 12, skills: ['general', 'irrigation'],    rate: 280 },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const seedPhones = seedUsers.map((u) => u.phone);
  await User.deleteMany({ phone: { $in: seedPhones } });
  console.log('🗑️  Cleared old Bhimrad seed users');

  const createdUsers = [];
  for (const u of seedUsers) {
    const v = villages[u.vi];
    const user = await User.create({
      phone: u.phone,
      name: u.name,
      village: u.village,
      location: {
        type: 'Point',
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

  await EquipmentListing.deleteMany({ ownerId: { $in: createdUsers.map((u) => u._id) } });
  await LabourListing.deleteMany({ workerId: { $in: createdUsers.map((u) => u._id) } });

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

  console.log('\n🌾 Bhimrad seed complete!');
  console.log('📍 All data within 8km of Bhimrad, Surat district');
  console.log('📱 Share location near Bhimrad to see all results\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
