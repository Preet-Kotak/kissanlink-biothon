const EquipmentListing = require('../models/EquipmentListing');
const LabourListing = require('../models/LabourListing');

/**
 * Location utilities for KissanLink
 */

/**
 * Find nearby equipment listings — tries 10km first, falls back to 20km
 * Returns { listings, radiusKm }
 */
async function findNearbyEquipment(coordinates, type) {
  for (const radiusKm of [10, 20]) {
    const listings = await EquipmentListing.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates },
          $maxDistance: radiusKm * 1000,
        },
      },
      type,
      available: true,
    }).limit(3);

    if (listings.length > 0) return { listings, radiusKm };
  }
  return { listings: [], radiusKm: 20 };
}

/**
 * Find nearby labour listings — tries 10km first, falls back to 20km
 * Returns { listings, radiusKm }
 */
async function findNearbyLabour(coordinates, skill) {
  for (const radiusKm of [10, 20]) {
    const listings = await LabourListing.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates },
          $maxDistance: radiusKm * 1000,
        },
      },
      skills: skill,
      available: true,
    }).limit(3);

    if (listings.length > 0) return { listings, radiusKm };
  }
  return { listings: [], radiusKm: 20 };
}

/**
 * Calculate distance in km between two [lng, lat] points using Haversine formula
 */
function distanceKm(coord1, coord2) {
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;

  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Format distance for display
 */
function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

module.exports = { findNearbyEquipment, findNearbyLabour, distanceKm, formatDistance };
