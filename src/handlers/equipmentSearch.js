const Booking = require('../models/Booking');
const EquipmentListing = require('../models/EquipmentListing');
const User = require('../models/User');
const { sendMessage } = require('../services/twilio');
const { t, strings } = require('../lang/strings');
const { parseDate, getQuickDateOptions, formatDateForDisplay } = require('../utils/dateUtils');
const { showMainMenu } = require('./mainMenu');

/**
 * Helper: Calculate distance in KM using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

/**
 * Core Algorithm: Smart Filter (Task 1 & Task 4 multi-day safety)
 */
async function getAvailableEquipmentListings(type, dateObj, coordinates) {
  // Set to midnight UTC for exact matching
  const targetDate = new Date(dateObj);
  targetDate.setHours(0, 0, 0, 0);

  // Step 1: Find all conflicting bookings for this date
  const bookedListingIds = await Booking.find({
    status: { $in: ['pending', 'confirmed'] },
    $or: [
      { bookingDate: targetDate },
      { startDate: { $lte: targetDate }, endDate: { $gte: targetDate } }
    ]
  }).distinct('listingId');

  const baseQuery = {
    type: type,
    available: true,
    _id: { $nin: bookedListingIds },
    blockedDates: { $ne: targetDate }
  };

  // Step 2: Geospatial search (10km radius)
  let listings = await EquipmentListing.find({
    ...baseQuery,
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: coordinates },
        $maxDistance: 10000
      }
    }
  }).limit(3).lean();

  // Step 3: Expand to 20km if no results found
  if (listings.length < 3) {
    listings = await EquipmentListing.find({
      ...baseQuery,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: coordinates },
          $maxDistance: 20000
        }
      }
    }).limit(3).lean();
  }

  return listings;
}

/**
 * Main Router for Equipment Search States
 */
async function handleEquipmentSearch(user, body, location, lang) {
  const state = user.state;
  const text = body.trim();

  try {
    // ── STATE: INITIAL DATE PROMPT ──────────────────────────────────────────
    if (state === 'EQ_SEARCH_DATE') {
      const { tomorrow, inOneWeek } = getQuickDateOptions();

      if (text === '1') {
        await user.updateOne({ state: 'EQ_SEARCH_TYPE', 'tempData.bookingDate': tomorrow });
        return sendEquipmentTypePrompt(user.phone, lang);
      }
      if (text === '2') {
        await user.updateOne({ state: 'EQ_SEARCH_TYPE', 'tempData.bookingDate': inOneWeek });
        return sendEquipmentTypePrompt(user.phone, lang);
      }
      if (text === '3') {
        await user.updateOne({ state: 'EQ_SEARCH_DATE_CUSTOM' });
        return sendMessage(user.phone, t('eq_search_date_custom_prompt', lang) + t('back_hint', lang));
      }

      // Invalid selection, re-prompt
      const prompt = t('eq_search_date_prompt', lang, formatDateForDisplay(tomorrow), formatDateForDisplay(inOneWeek));
      return sendMessage(user.phone, t('invalid_input', lang) + '\n\n' + prompt);
    }

    // ── STATE: CUSTOM DATE INPUT ─────────────────────────────────────────────
    if (state === 'EQ_SEARCH_DATE_CUSTOM') {
      const parsed = parseDate(text, 30);

      if (!parsed.valid) {
        let errorMsg = t('date_invalid_format', lang);
        if (parsed.reason === 'PAST_DATE') errorMsg = t('date_in_past', lang);
        if (parsed.reason === 'TOO_FAR_AHEAD') errorMsg = t('date_too_far_ahead', lang);

        return sendMessage(user.phone, errorMsg + '\n\n' + t('eq_search_date_custom_prompt', lang) + t('back_hint', lang));
      }

      await user.updateOne({ state: 'EQ_SEARCH_TYPE', 'tempData.bookingDate': parsed.date });
      return sendEquipmentTypePrompt(user.phone, lang);
    }

    // ── STATE: TYPE SELECTION & SMART FILTER EXECUTION ───────────────────────
    if (state === 'EQ_SEARCH_TYPE') {
      const typeIndex = parseInt(text, 10) - 1;
      const typesRaw = strings.equipment_types_raw;

      if (isNaN(typeIndex) || typeIndex < 0 || typeIndex >= typesRaw.length) {
        return sendEquipmentTypePrompt(user.phone, lang, true);
      }

      const selectedType = typesRaw[typeIndex];
      const targetDate = new Date(user.tempData.bookingDate);

      // Execute the Smart Filter
      const listings = await getAvailableEquipmentListings(selectedType, targetDate, user.location.coordinates);

      if (listings.length === 0) {
        await sendMessage(user.phone, t('no_listings_found', lang));
        await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
        return showMainMenu(user, lang);
      }

      const savedResults = await showEquipmentResults(user, listings, lang);

      return await user.updateOne({
        state: 'EQ_SEARCH_RESULTS',
        'tempData.searchResults': savedResults,
        'tempData.selectedType': selectedType
      });
    }

    // ── STATE: BOOKING CONFIRMATION & HANDSHAKE ──────────────────────────────
    if (state === 'EQ_SEARCH_RESULTS') {
      const choiceIndex = parseInt(text, 10) - 1;
      const savedResults = user.tempData.searchResults || [];

      if (isNaN(choiceIndex) || choiceIndex < 0 || choiceIndex >= savedResults.length) {
        return sendMessage(user.phone, t('invalid_number', lang));
      }

      const selectedListingId = savedResults[choiceIndex];
      const targetDate = new Date(user.tempData.bookingDate);

      // Race Condition Check: Ensure it wasn't booked in the last 30 seconds
      const isStillAvailable = await getAvailableEquipmentListings(user.tempData.selectedType, targetDate, user.location.coordinates);
      if (!isStillAvailable.find(l => l._id.toString() === selectedListingId)) {
        return sendMessage(user.phone, t('listing_just_booked', lang));
      }

      const listing = await EquipmentListing.findById(selectedListingId);
      const owner = await User.findById(listing.ownerId);

      // 1. Create the Pending Booking
      const booking = await Booking.create({
        type: 'equipment',
        listingId: listing._id,
        farmerId: user._id,
        farmerPhone: user.phone,
        farmerName: user.name || 'Farmer',
        providerId: owner._id,
        providerPhone: owner.phone,
        providerName: owner.name || 'Owner',
        bookingDate: targetDate,
        startDate: targetDate,
        endDate: targetDate,
        rate: listing.dailyRate,
        itemName: listing.type,
        status: 'pending'
      });

      // 2. Notify Farmer immediately with Owner's contact
      await sendMessage(user.phone, t('eq_booking_created_farmer', lang, owner.name || 'the owner', owner.phone));

      // 3. Notify Owner and set state to await response
      const ownerLang = owner.language || 'gu';
      const dateStr = formatDateForDisplay(targetDate);

      await sendMessage(owner.phone, t('eq_booking_request_provider', ownerLang, user.name || 'A farmer', user.phone, listing.type, dateStr, listing.dailyRate));

      await owner.updateOne({
        state: 'AWAITING_BOOKING_RESPONSE',
        'tempData.pendingBookingId': booking._id
      });

      // 4. Reset Farmer to Main Menu
      await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
      return showMainMenu(user, lang);
    }

  } catch (err) {
    console.error('[EquipmentSearch] Error:', err);
    await sendMessage(user.phone, t('system_error', lang));
    await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
    return showMainMenu(user, lang);
  }
}

/**
 * Reusable helper to send the Equipment Type menu
 */
async function sendEquipmentTypePrompt(phone, lang, isError = false) {
  const types = t('equipment_types', lang);
  let msg = isError ? t('invalid_input', lang) + '\n\n' : '';
  msg += t('ask_equipment_type', lang) + '\n';

  types.forEach((type, index) => {
    msg += `\n${index + 1}. ${type}`;
  });

  msg += '\n\n' + t('back_hint', lang);
  return sendMessage(phone, msg);
}

/**
 * Display search results to user with images where available
 */
async function showEquipmentResults(user, listings, lang) {
  const savedResults = [];

  // 1. Send header
  await sendMessage(user.phone, t('eq_search_results_header', lang));

  // 2. Send each listing card
  for (let index = 0; index < listings.length; index++) {
    const listing = listings[index];
    const dist = calculateDistance(
      user.location.coordinates[1], user.location.coordinates[0],
      listing.location.coordinates[1], listing.location.coordinates[0]
    );
    const rating = listing.rating ? listing.rating.toFixed(1) : 'New';
    const listingDetailsText = t('equipment_card', lang, index + 1, listing.ownerName, listing.village || 'Nearby', listing.dailyRate, rating, dist + 'km');

    if (listing.photoUrl) {
      await sendMessage(
        user.phone,
        listingDetailsText,
        listing.photoUrl
      );
    } else {
      await sendMessage(user.phone, listingDetailsText);
    }

    savedResults.push(listing._id.toString());
  }

  // 3. Send footer
  await sendMessage(user.phone, t('eq_search_results_footer', lang));

  return savedResults;
}

module.exports = { handleEquipmentSearch, sendEquipmentTypePrompt, getAvailableEquipmentListings, showEquipmentResults };