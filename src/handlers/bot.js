const User = require('../models/User');
const Booking = require('../models/Booking');
const { t } = require('../lang/strings');
const { sendMessage } = require('../services/twilio');
const { formatDate } = require('../utils/dateUtils');
const { handleOnboarding } = require('./onboarding');
const { handleMainMenu, showMainMenu } = require('./mainMenu');
const { handleEquipmentSearch } = require('./equipmentSearch');
const { handleEquipmentList } = require('./equipmentList');
const { handleLabourSearch } = require('./labourSearch');
const { handleLabourList } = require('./labourList');
const { handleProfile } = require('./profile');
const { handleRating } = require('./rating');
const { handleMyBookings } = require('./myBookings');
const { handleBookingResponse } = require('./bookingResponse');
/**
 * Log state transitions in JSON format for debugging (Task 4 - Part 7)
 */
function logStateTransition(user, fromState, toState, tempData = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    phone: user.phone.slice(-4), // Only last 4 digits for privacy
    fromState: fromState,
    toState: toState,
    tempData: Object.keys(tempData) // Only log keys, not values (privacy)
  };
  console.log('[StateTransition]', JSON.stringify(logEntry));
}

/**
 * Log errors in JSON format with context (Task 4 - Part 7)
 */
function logError(context, error, user) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    context: context,
    error: error.message,
    stack: error.stack,
    phone: user?.phone?.slice(-4) || 'unknown',
    state: user?.state || 'unknown'
  };
  console.error('[Error]', JSON.stringify(logEntry));
}

/**
 * Central message dispatcher
 */
async function handleMessage(user, body, location, media) {
  const lang = user.language || 'gu';
  const state = user.state;
  const now = new Date();

  // ------------------------------------------------------------------
  // 1. Inactivity Timeout (10 minutes)
  // ------------------------------------------------------------------

  const lastActivity = user.lastMessageAt || user.updatedAt || now;
  const inactiveMinutes = (now - lastActivity) / 1000 / 60;

  if (
    user.isRegistered &&
    state !== 'MAIN_MENU' &&
    inactiveMinutes >= 10
  ) {

    await user.updateOne({
      state: 'MAIN_MENU',
      tempData: {},
      lastMessageAt: now,
    });

    const updated = await User.findById(user._id);

    await sendMessage(
      updated.phone,
      t('timeout_message', lang),
      lang
    );

    return showMainMenu(updated, lang);
  }

  // ------------------------------------------------------------------
  // 2. Global Main Menu Shortcut
  // ------------------------------------------------------------------

  if (user.isRegistered && body.trim() === '0') {

    await user.updateOne({
      state: 'MAIN_MENU',
      tempData: {},
      lastMessageAt: now,
    });

    const updated = await User.findById(user._id);

    return showMainMenu(updated, lang);
  }

  // ------------------------------------------------------------------
  // 3. Global HELP Command
  // ------------------------------------------------------------------

  if (
    user.isRegistered &&
    body.trim().toUpperCase() === 'HELP'
  ) {

    await user.updateOne({
      state: 'MAIN_MENU',
      tempData: {},
      lastMessageAt: now,
    });

    const updated = await User.findById(user._id);

    await sendMessage(
      updated.phone,
      t('help_message', lang),
      lang
    );

    return showMainMenu(updated, lang);
  }

  // ------------------------------------------------------------------
  // 3.5 Global CANCEL Command
  // ------------------------------------------------------------------

  const textBody = body.trim().toUpperCase();
  if (user.isRegistered && textBody.startsWith('CANCEL BK-')) {
    const bookingId = textBody.split(' ')[1];

    const booking = await Booking.findOne({ bookingId });
    if (!booking || booking.farmerId.toString() !== user._id.toString()) {
      await sendMessage(user.phone, t('cancel_invalid_id', lang), lang);
      return;
    }

    if (booking.status === 'cancelled') {
      await sendMessage(user.phone, t('cancel_already', lang), lang);
      return;
    }

    await booking.updateOne({ status: 'cancelled' });

    await sendMessage(user.phone, t('cancel_success_farmer', lang, booking.bookingId), lang);

    const dateStr = formatDate(booking.bookingDate);
    const provider = await User.findById(booking.providerId);
    const providerLang = provider?.language || 'gu';

    if (booking.type === 'equipment') {
      const EquipmentListing = require('../models/EquipmentListing');
      const listing = await EquipmentListing.findById(booking.listingId);
      if (listing) await listing.updateOne({ available: true });
      const typeStr = listing ? listing.type : '—';
      await sendMessage(booking.providerPhone, t('cancel_notify_owner', providerLang, typeStr, dateStr), providerLang);
    } else {
      const LabourListing = require('../models/LabourListing');
      const listing = await LabourListing.findById(booking.listingId);
      if (listing) await listing.updateOne({ available: true });
      await sendMessage(booking.providerPhone, t('cancel_notify_worker', providerLang, user.name, dateStr), providerLang);
    }

    const updated = await User.findById(user._id);
    return showMainMenu(updated, lang);
  }

  // ------------------------------------------------------------------
  // 4. Update last activity
  // ------------------------------------------------------------------

  await user.updateOne({
    lastMessageAt: now,
  });

  // ------------------------------------------------------------------
  // 5. Rating Priority
  // ------------------------------------------------------------------

  try {
    // ── Rating prompt takes priority over everything ──────────────────────────
    if (state === 'AWAITING_RATING') {
      return handleRating(user, body, lang);
    }

    // ── TASK 1: Two-Sided Booking Handshake ───────────────────────────────────
    if (state === 'AWAITING_BOOKING_RESPONSE') {
      return handleBookingResponse(user, body, lang);
    }

    // ── Onboarding states ─────────────────────────────────────────────────────
    if (!user.isRegistered || ['NEW', 'AWAITING_LANGUAGE', 'AWAITING_NAME', 'AWAITING_LOCATION', 'AWAITING_VILLAGE'].includes(state)) {
      return handleOnboarding(user, body, location, lang);
    }

    // ── Profile states ────────────────────────────────────────────────────────
    if (state.startsWith('PROFILE')) {
      return handleProfile(user, body, location, lang);
    }

    // ── My listings states ────────────────────────────────────────────────────
    if (state.startsWith('MY_LISTINGS') || state.startsWith('LISTING_')) {
      const { handleMyListings } = require('./myListings');
      return handleMyListings(user, body, lang);
    }

    // ── Availability management states ────────────────────────────────────────
    if (state.startsWith('AVAILABILITY_') || state.startsWith('MANAGE_AVAILABILITY')) {
      const { handleAvailability } = require('./availability');
      return handleAvailability(user, body, lang);
    }

    // ── TASK 1: Equipment search states (Date First + Task 4: Multi-day) ──────
    if (state.startsWith('EQ_SEARCH') || state === 'EQ_SEARCH_DAYS' || state === 'EQ_SEARCH_DAYS_CUSTOM') {
      return handleEquipmentSearch(user, body, location, lang);
    }

    // ── Equipment listing states ──────────────────────────────────────────────
    if (state.startsWith('EQ_LIST')) {
      return handleEquipmentList(user, body, location, lang, media);
    }

    // ── TASK 1: Labour search states (Date First + Task 4: Multi-day) ─────────
    if (state.startsWith('LAB_SEARCH') || state === 'LAB_SEARCH_DAYS' || state === 'LAB_SEARCH_DAYS_CUSTOM') {
      return handleLabourSearch(user, body, location, lang);
    }

    // ── Labour listing states ─────────────────────────────────────────────────
    if (state.startsWith('LAB_LIST')) {
      return handleLabourList(user, body, location, lang, media);
    }

    // ── My Bookings states (Task 4 - Part 9) ─────────────────────────────────
    if (state === 'MY_BOOKINGS' || state === 'MY_BOOKINGS_LIST' ||
      state === 'BOOKING_DETAIL' || state === 'BOOKING_CANCEL_CONFIRM' ||
      state === 'BOOKING_CANCEL_REASON') {
      return handleMyBookings(user, body, lang);
    }

    // ── Main menu / default ───────────────────────────────────────────────────
    return handleMainMenu(user, body, lang);

  } catch (err) {
    logError('handleMessage', err, user);
    await sendMessage(user.phone, t('system_error', lang) || '⚠️ Something went wrong. Please try again.');
  }
}

module.exports = { handleMessage, logStateTransition, logError };
