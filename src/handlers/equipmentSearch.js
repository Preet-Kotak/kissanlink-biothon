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

  const coords = (coordinates && Array.isArray(coordinates) && coordinates.length === 2)
    ? coordinates
    : [72.8311, 21.1702]; // Default to Surat, Gujarat center

  // Step 2: Geospatial search (10km radius)
  let listings = await EquipmentListing.find({
    ...baseQuery,
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: coords },
        $maxDistance: 10000
      }
    }
  }).limit(5).lean();

  // Step 3: Expand to 50km if < 3 results
  if (listings.length < 3) {
    listings = await EquipmentListing.find({
      ...baseQuery,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: coords },
          $maxDistance: 50000
        }
      }
    }).limit(5).lean();
  }

  // Step 4: System-wide fallback if still 0 results (so remote/testing users still see available equipment)
  if (listings.length === 0) {
    listings = await EquipmentListing.find({
      ...baseQuery,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: coords }
        }
      }
    }).limit(5).lean();
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
      return; // Do nothing on invalid input
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
      const targetDate = new Date(user.tempData?.bookingDate || Date.now());

      // Execute the Smart Filter safely
      const userCoords = user?.location?.coordinates || [72.8311, 21.1702];
      const listings = await getAvailableEquipmentListings(selectedType, targetDate, userCoords);

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
        return; // Do nothing on invalid input
      }

      const selectedListingId = savedResults[choiceIndex];
      
      // Store selected listing and move to days selection (Task 4 - Part 3)
      await user.updateOne({
        state: 'EQ_SEARCH_DAYS',
        'tempData.selectedListingId': selectedListingId
      });
      
      return sendMessage(user.phone, t('booking_days_prompt', lang));
    }

    // ── STATE: MULTI-DAY SELECTION (Task 4 - Part 3) ─────────────────────────
    if (state === 'EQ_SEARCH_DAYS') {
      if (text === '1') {
        // Single day booking
        return await createEquipmentBooking(user, 1, lang);
      } else if (text === '2') {
        // Ask for custom number of days
        await user.updateOne({ state: 'EQ_SEARCH_DAYS_CUSTOM' });
        return sendMessage(user.phone, t('booking_days_custom_prompt', lang));
      } else {
        return sendMessage(user.phone, t('invalid_input', lang) + '\n\n' + t('booking_days_prompt', lang));
      }
    }

    // ── STATE: CUSTOM DAYS INPUT (Task 4 - Part 3) ───────────────────────────
    if (state === 'EQ_SEARCH_DAYS_CUSTOM') {
      const days = parseInt(text, 10);
      
      if (isNaN(days) || days < 1 || days > 30) {
        return sendMessage(user.phone, t('invalid_days', lang) + '\n\n' + t('booking_days_custom_prompt', lang));
      }
      
      return await createEquipmentBooking(user, days, lang);
    }

  } catch (err) {
    console.error('[EquipmentSearch] Error:', err);
    await sendMessage(user.phone, t('system_error', lang));
    await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
    return showMainMenu(user, lang);
  }
}

/**
 * Create equipment booking with multi-day support (Task 4 - Part 3)
 */
async function createEquipmentBooking(user, days, lang) {
  try {
    const selectedListingId = user.tempData?.selectedListingId;
    const bookingDate = user.tempData?.bookingDate;
    
    if (!selectedListingId || !bookingDate) {
      // Session data lost, return to main menu
      await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
      await sendMessage(user.phone, t('system_error', lang));
      return showMainMenu(user, lang);
    }
    
    const targetDate = new Date(bookingDate);
    targetDate.setHours(0, 0, 0, 0);
    
    // Calculate end date
    const endDate = new Date(targetDate);
    endDate.setDate(endDate.getDate() + days - 1);

    // Race Condition Check: Ensure it wasn't booked in the last 30 seconds
    const selectedType = user.tempData?.selectedType;
    if (!selectedType) {
      await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
      await sendMessage(user.phone, t('system_error', lang));
      return showMainMenu(user, lang);
    }
    
    const isStillAvailable = await getAvailableEquipmentListings(selectedType, targetDate, user.location.coordinates);
    if (!isStillAvailable.find(l => l._id.toString() === selectedListingId)) {
      return sendMessage(user.phone, t('listing_just_booked', lang));
    }

    const listing = await EquipmentListing.findById(selectedListingId);
    
    if (!listing) {
      await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
      await sendMessage(user.phone, t('system_error', lang));
      return showMainMenu(user, lang);
    }
    
    const owner = await User.findById(listing.ownerId);
    
    if (!owner) {
      await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
      await sendMessage(user.phone, t('system_error', lang));
      return showMainMenu(user, lang);
    }

    // 1. Create the Pending Booking with multi-day support
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
      endDate: endDate,
      days: days,
      rate: listing.dailyRate,
      itemName: listing.type,
      status: 'pending'
    });

    // 2. Notify Farmer immediately with Owner's contact matching exact screenshot layout
    const dateDisplay = days > 1 
      ? `${formatDateForDisplay(targetDate)} to ${formatDateForDisplay(endDate)} (${days} days)`
      : formatDateForDisplay(targetDate);
    const totalCost = listing.dailyRate * days;
    const isMultiDay = days > 1;

    const itemEmoji = '🚜';
    const itemLabel = lang === 'gu' ? 'સાધન' : lang === 'hi' ? 'उपकरण' : 'Equipment';
    const providerRole = lang === 'gu' ? 'માલિક' : lang === 'hi' ? 'मालिक' : 'Owner';

    await sendMessage(user.phone, 
      t('booking_confirmed_farmer', lang, booking.bookingId, listing.type, itemEmoji, itemLabel, providerRole, owner.name || 'Owner', dateDisplay, listing.dailyRate, owner.phone, isMultiDay, totalCost),
      lang
    );

    // 3. Notify Owner with New Booking format matching exact screenshot layout
    const ownerLang = owner.language || 'gu';
    const itemLabelOwner = ownerLang === 'gu' ? 'સાધન' : ownerLang === 'hi' ? 'उपकरण' : 'Equipment';

    await sendMessage(owner.phone, 
      t('booking_request_provider', ownerLang, booking.bookingId, listing.type, itemEmoji, itemLabelOwner, user.name || 'Farmer', dateDisplay, listing.dailyRate, user.phone, isMultiDay, totalCost),
      ownerLang
    );
    
    await owner.updateOne({
      state: 'AWAITING_BOOKING_RESPONSE',
      'tempData.pendingBookingId': booking._id
    });

    // 4. Reset Farmer to Main Menu
    await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
    return showMainMenu(user, lang);
    
  } catch (err) {
    console.error('[equipmentSearch] Error creating booking:', err);
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

  types.forEach((type) => {
    msg += `\n${type}`;
  });

  msg += '\n\n' + t('back_hint', lang);
  return sendMessage(phone, msg);
}

/**
 * Display search results to user with images where available
 */
async function showEquipmentResults(user, listings, lang) {
  const savedResults = [];
  // Strictly cap at maximum 5 listings
  const topListings = listings.slice(0, 5);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // 1. Send Header
  await sendMessage(user.phone, t('eq_search_results_header', lang), lang);

  // 2. Send each listing card with a 1.2s delay to guarantee strict delivery order
  for (let index = 0; index < topListings.length; index++) {
    await delay(1200);

    const listing = topListings[index];
    
    const ownerName = listing.ownerName || 'Owner';
    const village = listing.village || 'Nearby';
    const dailyRate = listing.dailyRate || 0;
    const rating = listing.rating ? listing.rating.toFixed(1) : 'New';
    const photoUrl = listing.photoUrl || null;
    
    let dist = '0';
    try {
      if (listing.location && listing.location.coordinates && 
          user.location && user.location.coordinates) {
        dist = calculateDistance(
          user.location.coordinates[1], user.location.coordinates[0],
          listing.location.coordinates[1], listing.location.coordinates[0]
        );
      }
    } catch (err) {
      console.error('[showEquipmentResults] Distance calc error:', err);
      dist = 'N/A';
    }
    
    const cardText = t('equipment_card', lang, index + 1, ownerName, village, dailyRate, rating, dist + 'km');

    if (photoUrl) {
      await sendMessage(user.phone, cardText, lang, photoUrl);
    } else {
      await sendMessage(user.phone, cardText, lang);
    }

    savedResults.push(listing._id.toString());
  }

  // 3. Send Footer
  await delay(1200);
  await sendMessage(user.phone, t('eq_search_results_footer', lang), lang);

  return savedResults;
}

module.exports = { handleEquipmentSearch, sendEquipmentTypePrompt, getAvailableEquipmentListings, createEquipmentBooking, showEquipmentResults };
