/**
 * Seed script — KissanLink demo data for Rajkot, Gujarat
 * Centre: Marwadi University, Rajkot [70.7957320, 22.3675808]
 * All data within 20km radius for realistic demo
 *
 * Run: npm run seed
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const EquipmentListing = require('../models/EquipmentListing');
const LabourListing = require('../models/LabourListing');

// ── Centre: Marwadi University, Rajkot, Gujarat ───────────────────────────
// Coordinates: 22.3675808°N, 70.7957320°E
const CENTER = [72.9850, 21.2150]; // [lng, lat] - Marwadi University

// Small offsets in degrees (~1deg lat ≈ 111km, ~1deg lng ≈ 95km at this latitude)
// 0.05 deg ≈ 5km, 0.10 deg ≈ 10km, 0.15 deg ≈ 15km
function near(dlng, dlat) {
  return [CENTER[0] + dlng, CENTER[1] + dlat];
}

// ── Villages/Areas near Marwadi University, Rajkot ────────────────────────
const villages = [
  { name: 'Gauridad',      coords: near(0.000,  0.000) },   // ~0km - University location
  { name: 'Metoda',        coords: near(0.045,  0.030) },   // ~5km NE
  { name: 'Kotda Sangani', coords: near(-0.040, 0.035) },   // ~5km NW
  { name: 'Shapar',        coords: near(0.080,  0.015) },   // ~8km E
  { name: 'Lodhika',       coords: near(-0.070, -0.025) },  // ~7.5km SW
  { name: 'Vavdi',         coords: near(0.055,  -0.055) },  // ~8km SE
  { name: 'Morbi Road',    coords: near(0.100,  0.020) },   // ~10km E
  { name: 'Jetpur Road',   coords: near(-0.095, 0.040) },   // ~10.5km NW
];

// ── Seed users ─────────────────────────────────────────────────────────────
const seedUsers = [
  // YOUR TEAM MEMBER - will appear in ALL searches! Update name and phone!
  { phone: 'whatsapp:+918320564971', name: 'Preet Kotak',         village: 'Gauridad',     role: ['farmer', 'owner', 'worker'], lang: 'gu', vi: 0 },
  
  // Equipment owners (vi = village index)
  { phone: 'whatsapp:+919876100001', name: 'Rameshbhai Patel',    village: 'Metoda',       role: ['farmer', 'owner'], lang: 'gu', vi: 1 },
  { phone: 'whatsapp:+919876100002', name: 'Bhavesh Jadeja',      village: 'Kotda Sangani',role: ['owner'],           lang: 'gu', vi: 2 },
  { phone: 'whatsapp:+919876100003', name: 'Vijaybhai Gohil',     village: 'Shapar',       role: ['farmer', 'owner'], lang: 'hi', vi: 3 },
  { phone: 'whatsapp:+919876100004', name: 'Dinesh Makwana',      village: 'Lodhika',      role: ['owner'],           lang: 'gu', vi: 4 },
  { phone: 'whatsapp:+919876100005', name: 'Kantibhai Rabari',    village: 'Vavdi',        role: ['farmer', 'owner'], lang: 'gu', vi: 5 },
  { phone: 'whatsapp:+919876100006', name: 'Pravinbhai Chavda',   village: 'Morbi Road',   role: ['owner'],           lang: 'gu', vi: 6 },

  // Workers
  { phone: 'whatsapp:+919876100010', name: 'Savitaben Parmar',    village: 'Gauridad',     role: ['worker'],          lang: 'gu', vi: 0 },
  { phone: 'whatsapp:+919876100011', name: 'Mukesh Solanki',      village: 'Metoda',       role: ['worker'],          lang: 'gu', vi: 1 },
  { phone: 'whatsapp:+919876100012', name: 'Geetaben Mer',        village: 'Kotda Sangani',role: ['worker'],          lang: 'gu', vi: 2 },
  { phone: 'whatsapp:+919876100013', name: 'Haribhai Thakor',     village: 'Shapar',       role: ['worker'],          lang: 'hi', vi: 3 },
  { phone: 'whatsapp:+919876100014', name: 'Rekha Barad',         village: 'Lodhika',      role: ['worker'],          lang: 'gu', vi: 4 },
  { phone: 'whatsapp:+919876100015', name: 'Bharat Vaghela',      village: 'Vavdi',        role: ['worker'],          lang: 'gu', vi: 5 },
  { phone: 'whatsapp:+919876100016', name: 'Ilaben Gohil',        village: 'Morbi Road',   role: ['worker'],          lang: 'gu', vi: 6 },
  { phone: 'whatsapp:+919876100017', name: 'Naresh Baria',        village: 'Jetpur Road',  role: ['farmer', 'worker'],lang: 'gu', vi: 7 },
  { phone: 'whatsapp:+919876100018', name: 'Arjunbhai Kumbhar',   village: 'Gauridad',     role: ['worker'],          lang: 'gu', vi: 0 },
];

// ── Equipment listings — 3+ per type with photos ──────────────────────────
// Photos should be uploaded to: public/images/equipment/
// userIdx 0 = YOUR TEAM MEMBER (appears in all equipment types!)
const seedEquipment = [
  // YOUR listings - one of each type
  { userIdx: 0, type: 'Tractor',    rate: 780, photo: 'tractor1.jpg' },
  { userIdx: 0, type: 'Rotavator',  rate: 490, photo: 'rotavator1.jpg' },
  { userIdx: 0, type: 'Thresher',   rate: 590, photo: 'thresher1.jpg' },
  { userIdx: 0, type: 'Water Pump', rate: 240, photo: 'pump1.jpg' },
  { userIdx: 0, type: 'Sprayer',    rate: 290, photo: 'sprayer1.jpg' },
  
  // Other tractors
  { userIdx: 1, type: 'Tractor',    rate: 850, photo: 'tractor2.jpg' },
  { userIdx: 2, type: 'Tractor',    rate: 750, photo: 'tractor3.jpg' },
  
  // Other rotavators
  { userIdx: 3, type: 'Rotavator',  rate: 500, photo: 'rotavator2.jpg' },
  { userIdx: 4, type: 'Rotavator',  rate: 520, photo: 'rotavator3.jpg' },
  
  // Other threshers
  { userIdx: 1, type: 'Thresher',   rate: 650, photo: 'thresher2.jpg' },
  { userIdx: 3, type: 'Thresher',   rate: 580, photo: 'thresher3.jpg' },
  
  // Other pumps
  { userIdx: 2, type: 'Water Pump', rate: 250, photo: 'pump2.jpg' },
  { userIdx: 5, type: 'Water Pump', rate: 270, photo: 'pump3.jpg' },
  
  // Other sprayers
  { userIdx: 1, type: 'Sprayer',    rate: 300, photo: 'sprayer2.jpg' },
  { userIdx: 6, type: 'Sprayer',    rate: 320, photo: 'sprayer3.jpg' },
];

// ── Labour listings — 3+ per skill with optional photos ───────────────────
// Photos should be uploaded to: public/images/workers/
// userIdx 0 = YOUR TEAM MEMBER (appears in all skill types!)
const seedLabour = [
  // YOUR listings - one of each skill type (you appear in ALL searches!)
  { userIdx: 0,  skills: ['harvesting'],        rate: 390, photo: null },
  { userIdx: 0,  skills: ['sowing'],            rate: 350, photo: null },
  { userIdx: 0,  skills: ['irrigation'],        rate: 330, photo: null },
  { userIdx: 0,  skills: ['weeding'],           rate: 310, photo: null },
  { userIdx: 0,  skills: ['general'],           rate: 290, photo: null },
  
  // Other harvesting workers
  { userIdx: 7,  skills: ['harvesting', 'sowing'],     rate: 400, photo: 'worker1.jpg' },
  { userIdx: 8,  skills: ['harvesting', 'general'],    rate: 380, photo: null },
  { userIdx: 15, skills: ['harvesting', 'weeding'],    rate: 420, photo: 'worker2.jpg' },
  
  // Other sowing workers
  { userIdx: 10, skills: ['sowing', 'weeding'],        rate: 360, photo: null },
  { userIdx: 11, skills: ['sowing', 'general'],        rate: 340, photo: 'worker3.jpg' },
  
  // Other irrigation workers
  { userIdx: 13, skills: ['irrigation', 'general'],    rate: 320, photo: null },
  { userIdx: 14, skills: ['irrigation', 'weeding'],    rate: 310, photo: 'worker4.jpg' },
  
  // Other weeding workers
  { userIdx: 8,  skills: ['weeding', 'general'],       rate: 300, photo: null },
  { userIdx: 10, skills: ['weeding', 'sowing'],        rate: 330, photo: null },
  
  // Other general workers
  { userIdx: 11, skills: ['general'],                  rate: 280, photo: null },
  { userIdx: 12, skills: ['general', 'irrigation'],    rate: 270, photo: 'worker5.jpg' },
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

  // Insert equipment with photos
  const BASE_URL = 'https://willpower-hush-regalia.ngrok-free.dev';
  for (const eq of seedEquipment) {
    const owner = createdUsers[eq.userIdx];
    const photoUrl = eq.photo ? `${BASE_URL}/images/equipment/${eq.photo}` : null;
    
    await EquipmentListing.create({
      ownerId: owner._id,
      ownerPhone: owner.phone,
      ownerName: owner.name,
      type: eq.type,
      dailyRate: eq.rate,
      photoUrl: photoUrl,
      available: true,
      location: owner.location,
      village: owner.village,
      rating: owner.rating,
      ratingCount: owner.ratingCount,
    });
  }
  console.log(`✅ Created ${seedEquipment.length} equipment listings (3+ per type) with photos`);

  // Insert labour with photos
  for (const lab of seedLabour) {
    const worker = createdUsers[lab.userIdx];
    const photoUrl = lab.photo ? `${BASE_URL}/images/workers/${lab.photo}` : null;
    
    await LabourListing.create({
      workerId: worker._id,
      workerPhone: worker.phone,
      workerName: worker.name,
      skills: lab.skills,
      dailyRate: lab.rate,
      photoUrl: photoUrl,
      available: true,
      location: worker.location,
      village: worker.village,
      rating: worker.rating,
      ratingCount: worker.ratingCount,
    });
  }
  console.log(`✅ Created ${seedLabour.length} labour listings (3+ per skill) with photos`);

  console.log('\n🌾 Seed complete!');
  console.log('📍 All data within 20km of Marwadi University, Rajkot');
  console.log('📱 Test user: +919016875906 (Preet Kotak) — share location from Marwadi University area');
  console.log('🖼️  Equipment photos: public/images/equipment/');
  console.log('👤 Worker photos: public/images/workers/\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
