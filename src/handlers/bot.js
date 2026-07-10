const User = require('../models/User');
const { t, strings } = require('../lang/strings');
const { sendMessage, sendMenu } = require('../services/twilio');
const { handleOnboarding } = require('./onboarding');
const { handleMainMenu } = require('./mainMenu');
const { handleEquipmentSearch } = require('./equipmentSearch');
const { handleEquipmentList } = require('./equipmentList');
const { handleLabourSearch } = require('./labourSearch');
const { handleLabourList } = require('./labourList');
const { handleProfile } = require('./profile');
const { handleRating } = require('./rating');
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
 * Central message dispatcher — routes to the right handler based on user state
 */
async function handleMessage(user, body, location) {
  const lang = user.language || 'gu';
  const state = user.state;

  try {
    // ── Rating prompt takes priority over everything ──────────────────────────
    if (state === 'AWAITING_RATING') {
      return handleRating(user, body, lang);
    }

    // ── Global "0" = back to main menu (works from any state) ─────────────────
    if (user.isRegistered && body.trim() === '0') {
      logStateTransition(user, state, 'MAIN_MENU', {});
      await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
      const fresh = await require('../models/User').findOne({ phone: user.phone });
      const { showMainMenu } = require('./mainMenu');
      return showMainMenu(fresh, lang);
    }

    // ── TASK 1: Two-Sided Booking Handshake ───────────────────────────────────
    if (state === 'AWAITING_BOOKING_RESPONSE') {
      return handleBookingResponse(user, body, lang);
    }

    // ── Onboarding states ─────────────────────────────────────────────────────
    if (!user.isRegistered || ['NEW', 'AWAITING_LANGUAGE', 'AWAITING_NAME', 'AWAITING_LOCATION'].includes(state)) {
      return handleOnboarding(user, body, location, lang);
    }

    // ── Profile states ────────────────────────────────────────────────────────
    if (state.startsWith('PROFILE')) {
      return handleProfile(user, body, location, lang);
    }

    // ── TASK 1: Equipment search states (Date First) ──────────────────────────
    if (state.startsWith('EQ_SEARCH')) {
      return handleEquipmentSearch(user, body, location, lang);
    }

    // ── Equipment listing states ──────────────────────────────────────────────
    if (state.startsWith('EQ_LIST')) {
      return handleEquipmentList(user, body, location, lang);
    }

    // ── TASK 1: Labour search states (Date First) ─────────────────────────────
    if (state.startsWith('LAB_SEARCH')) {
      return handleLabourSearch(user, body, location, lang);
    }

    // ── Labour listing states ─────────────────────────────────────────────────
    if (state.startsWith('LAB_LIST')) {
      return handleLabourList(user, body, location, lang);
    }

    // ── Main menu / default ───────────────────────────────────────────────────
    return handleMainMenu(user, body, lang);
    
  } catch (err) {
    logError('handleMessage', err, user);
    await sendMessage(user.phone, t('system_error', lang) || '⚠️ Something went wrong. Please try again.');
  }
}

module.exports = { handleMessage, logStateTransition, logError };
