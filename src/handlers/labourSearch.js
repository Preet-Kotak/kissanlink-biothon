const Booking = require('../models/Booking');
const LabourListing = require('../models/LabourListing');
const User = require('../models/User');
const { sendMessage } = require('../services/twilio');
const { t, strings } = require('../lang/strings');
const { parseDate, getQuickDateOptions, formatDateForDisplay } = require('../utils/dateUtils');
const { showMainMenu } = require('./mainMenu');

/**
 * Helper: Calculate distance in KM using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c).toFixed(1);
}

/**
 * Core Algorithm: Smart Filter for Labour
 */
async function getAvailableLabourListings(skill, dateObj, coordinates) {
  const targetDate = new Date(dateObj);
  targetDate.setHours(0, 0, 0, 0);

  // Step 1: Find conflicting bookings
  const bookedListingIds = await Booking.find({
    status: { $in: ['pending', 'confirmed'] },
    $or: [
      { bookingDate: targetDate },
      { startDate: { $lte: targetDate }, endDate: { $gte: targetDate } }
    ]
  }).distinct('listingId');

  // Step 2: Query LabourListing using Geospatial search
  const baseQuery = {
    skills: skill, 
    available: true,
    _id: { $nin: bookedListingIds },
    blockedDates: { $ne: targetDate }
  };

  // Check 10km radius
  let listings = await LabourListing.find({
    ...baseQuery,
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: coordinates },
        $maxDistance: 10000 
      }
    }
  }).limit(3).lean();

  // Expand to 20km if empty
  if (listings.length < 3) {
    listings = await LabourListing.find({
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
 * Main Router for Labour Search States
 */
async function handleLabourSearch(user, body, location, lang) {
  const state = user.state;
  const text = body.trim();

  try {
    // ── STATE: INITIAL DATE PROMPT ──────────────────────────────────────────
    if (state === 'LAB_SEARCH_DATE') {
      const { tomorrow, inOneWeek } = getQuickDateOptions();
      
      if (text === '1') {
        await user.updateOne({ state: 'LAB_SEARCH_SKILL', 'tempData.bookingDate': tomorrow });
        return sendLabourSkillPrompt(user.phone, lang);
      } 
      if (text === '2') {
        await user.updateOne({ state: 'LAB_SEARCH_SKILL', 'tempData.bookingDate': inOneWeek });
        return sendLabourSkillPrompt(user.phone, lang);
      } 
      if (text === '3') {
        await user.updateOne({ state: 'LAB_SEARCH_DATE_CUSTOM' });
        return sendMessage(user.phone, t('lab_search_date_custom_prompt', lang) + t('back_hint', lang));
      }

      const prompt = t('lab_search_date_prompt', lang, formatDateForDisplay(tomorrow), formatDateForDisplay(inOneWeek));
      return sendMessage(user.phone, t('invalid_input', lang) + '\n\n' + prompt);
    }

    // ── STATE: CUSTOM DATE INPUT ─────────────────────────────────────────────
    if (state === 'LAB_SEARCH_DATE_CUSTOM') {
      const parsed = parseDate(text, 30);
      
      if (!parsed.valid) {
        let errorMsg = t('date_invalid_format', lang);
        if (parsed.reason === 'PAST_DATE') errorMsg = t('date_in_past', lang);
        if (parsed.reason === 'TOO_FAR_AHEAD') errorMsg = t('date_too_far_ahead', lang);
        
        return sendMessage(user.phone, errorMsg + '\n\n' + t('lab_search_date_custom_prompt', lang) + t('back_hint', lang));
      }

      await user.updateOne({ state: 'LAB_SEARCH_SKILL', 'tempData.bookingDate': parsed.date });
      return sendLabourSkillPrompt(user.phone, lang);
    }

    // ── STATE: SKILL SELECTION & SMART FILTER EXECUTION ───────────────────────
    if (state === 'LAB_SEARCH_SKILL') {
      const skillIndex = parseInt(text, 10) - 1;
      const skillsRaw = strings.labour_skills_raw;

      if (isNaN(skillIndex) || skillIndex < 0 || skillIndex >= skillsRaw.length) {
        return sendLabourSkillPrompt(user.phone, lang, true);
      }

      const selectedSkill = skillsRaw[skillIndex];
      const targetDate = new Date(user.tempData.bookingDate);
      
      const listings = await getAvailableLabourListings(selectedSkill, targetDate, user.location.coordinates);

      if (listings.length === 0) {
        await sendMessage(user.phone, t('no_listings_found', lang));
        await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
        return showMainMenu(user, lang);
      }

      const savedResults = await showLabourResults(user, listings, lang);

      return await user.updateOne({ 
        state: 'LAB_SEARCH_RESULTS', 
        'tempData.searchResults': savedResults,
        'tempData.selectedSkill': selectedSkill
      });
    }

    // ── STATE: BOOKING CONFIRMATION & HANDSHAKE ──────────────────────────────
    if (state === 'LAB_SEARCH_RESULTS') {
      const choiceIndex = parseInt(text, 10) - 1;
      const savedResults = user.tempData.searchResults || [];

      if (isNaN(choiceIndex) || choiceIndex < 0 || choiceIndex >= savedResults.length) {
        return sendMessage(user.phone, t('invalid_number', lang));
      }

      const selectedListingId = savedResults[choiceIndex];
      
      // Store selected listing and move to days selection (Task 4 - Part 3)
      await user.updateOne({
        state: 'LAB_SEARCH_DAYS',
        'tempData.selectedListingId': selectedListingId
      });
      
      return sendMessage(user.phone, t('booking_days_prompt', lang));
    }

    // ── STATE: MULTI-DAY SELECTION (Task 4 - Part 3) ─────────────────────────
    if (state === 'LAB_SEARCH_DAYS') {
      if (text === '1') {
        // Single day booking
        return await createLabourBooking(user, 1, lang);
      } else if (text === '2') {
        // Ask for custom number of days
        await user.updateOne({ state: 'LAB_SEARCH_DAYS_CUSTOM' });
        return sendMessage(user.phone, t('booking_days_custom_prompt', lang));
      } else {
        return sendMessage(user.phone, t('invalid_input', lang) + '\n\n' + t('booking_days_prompt', lang));
      }
    }

    // ── STATE: CUSTOM DAYS INPUT (Task 4 - Part 3) ───────────────────────────
    if (state === 'LAB_SEARCH_DAYS_CUSTOM') {
      const days = parseInt(text, 10);
      
      if (isNaN(days) || days < 1 || days > 30) {
        return sendMessage(user.phone, t('invalid_days', lang) + '\n\n' + t('booking_days_custom_prompt', lang));
      }
      
      return await createLabourBooking(user, days, lang);
    }

  } catch (err) {
    console.error('[LabourSearch] Error:', err);
    await sendMessage(user.phone, t('system_error', lang));
    await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
    return showMainMenu(user, lang);
  }
}

/**
 * Create labour booking with multi-day support (Task 4 - Part 3)
 */
async function createLabourBooking(user, days, lang) {
  try {
    const selectedListingId = user.tempData.selectedListingId;
    const targetDate = new Date(user.tempData.bookingDate);
    targetDate.setHours(0, 0, 0, 0);
    
    // Calculate end date
    const endDate = new Date(targetDate);
    endDate.setDate(endDate.getDate() + days - 1);

    // Race Condition Check
    const isStillAvailable = await getAvailableLabourListings(user.tempData.selectedSkill, targetDate, user.location.coordinates);
    if (!isStillAvailable.find(l => l._id.toString() === selectedListingId)) {
      return sendMessage(user.phone, t('listing_just_booked', lang));
    }

    const listing = await LabourListing.findById(selectedListingId);
    const worker = await User.findById(listing.workerId);

    // 1. Create Pending Booking with multi-day support
    const booking = await Booking.create({
      type: 'labour',
      listingId: listing._id,
      farmerId: user._id,
      farmerPhone: user.phone,
      farmerName: user.name || 'Farmer',
      providerId: worker._id,
      providerPhone: worker.phone,
      providerName: worker.name || 'Worker',
      bookingDate: targetDate,
      startDate: targetDate,
      endDate: endDate,
      days: days,
      rate: listing.dailyRate,
      itemName: listing.skills.join(', '),
      status: 'pending'
    });

    // 2. Notify Farmer immediately
    const dateDisplay = days > 1 
      ? `${formatDateForDisplay(targetDate)} to ${formatDateForDisplay(endDate)} (${days} days)`
      : formatDateForDisplay(targetDate);
    const totalCost = listing.dailyRate * days;
    
    await sendMessage(user.phone, 
      t('lab_booking_created_farmer', lang, worker.name || 'the worker', worker.phone) +
      `\n\n📅 ${dateDisplay}\n💰 Total: ₹${totalCost}`
    );

    // 3. Notify Worker and set state to await response
    const workerLang = worker.language || 'gu';
    
    await sendMessage(worker.phone, 
      t('lab_booking_request_provider', workerLang, user.name || 'A farmer', user.phone, user.tempData.selectedSkill, dateDisplay, listing.dailyRate) +
      (days > 1 ? `\n\n💰 Total: ₹${totalCost} (${days} days)` : '')
    );
    
    await worker.updateOne({
      state: 'AWAITING_BOOKING_RESPONSE',
      'tempData.pendingBookingId': booking._id
    });

    // 4. Reset Farmer
    await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
    return showMainMenu(user, lang);
    
  } catch (err) {
    console.error('[labourSearch] Error creating booking:', err);
    await sendMessage(user.phone, t('system_error', lang));
    await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
    return showMainMenu(user, lang);
  }
}

/**
 * Reusable helper to send the Labour Skill menu
 */
async function sendLabourSkillPrompt(phone, lang, isError = false) {
  const skills = t('labour_skills', lang);
  let msg = isError ? t('invalid_input', lang) + '\n\n' : '';
  msg += t('ask_labour_skill', lang) + '\n';
  
  skills.forEach((skill, index) => {
    msg += `\n${index + 1}. ${skill}`;
  });
  
  msg += '\n\n' + t('back_hint', lang);
  return sendMessage(phone, msg);
}

/**
 * Display search results to user with images where available
 */
async function showLabourResults(user, listings, lang) {
  const savedResults = [];

  // 1. Send header
  await sendMessage(user.phone, t('lab_search_results_header', lang), lang);

  // 2. Send each listing card
  for (let index = 0; index < listings.length; index++) {
    const listing = listings[index];
    const dist = calculateDistance(
      user.location.coordinates[1], user.location.coordinates[0],
      listing.location.coordinates[1], listing.location.coordinates[0]
    );
    const rating = listing.rating ? listing.rating.toFixed(1) : 'New';
    const listingDetailsText = t('labour_card', lang, index + 1, listing.workerName, listing.village || 'Nearby', listing.dailyRate, rating, dist + 'km');

    if (listing.photoUrl) {
      await sendMessage(
        user.phone,
        listingDetailsText,
        lang,
        listing.photoUrl
      );
    } else {
      await sendMessage(user.phone, listingDetailsText, lang);
    }

    savedResults.push(listing._id.toString());
  }

  // 3. Send footer
  await sendMessage(user.phone, t('lab_search_results_footer', lang), lang);

  return savedResults;
}

module.exports = { handleLabourSearch, sendLabourSkillPrompt, getAvailableLabourListings, createLabourBooking, showLabourResults };
