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

/**
 * Central message dispatcher — routes to the right handler based on user state
 */
async function handleMessage(user, body, location) {
  const lang = user.language || 'gu';
  const state = user.state;

  // ── Rating prompt takes priority over everything ──────────────────────────
  if (state === 'AWAITING_RATING') {
    return handleRating(user, body, lang);
  }

  // ── Global "0" = back to main menu (works from any state) ─────────────────
  if (user.isRegistered && body.trim() === '0') {
    await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
    const fresh = await require('../models/User').findOne({ phone: user.phone });
    const { showMainMenu } = require('./mainMenu');
    return showMainMenu(fresh, lang);
  }

  // ── Onboarding states ─────────────────────────────────────────────────────
  if (!user.isRegistered || ['NEW', 'AWAITING_LANGUAGE', 'AWAITING_NAME', 'AWAITING_LOCATION'].includes(state)) {
    return handleOnboarding(user, body, location, lang);
  }

  // ── Profile states ────────────────────────────────────────────────────────
  if (state.startsWith('PROFILE')) {
    return handleProfile(user, body, location, lang);
  }

  // ── Equipment search states ───────────────────────────────────────────────
  if (state.startsWith('EQ_SEARCH')) {
    return handleEquipmentSearch(user, body, location, lang);
  }

  // ── Equipment listing states ──────────────────────────────────────────────
  if (state.startsWith('EQ_LIST')) {
    return handleEquipmentList(user, body, location, lang);
  }

  // ── Labour search states ──────────────────────────────────────────────────
  if (state.startsWith('LAB_SEARCH')) {
    return handleLabourSearch(user, body, location, lang);
  }

  // ── Labour listing states ─────────────────────────────────────────────────
  if (state.startsWith('LAB_LIST')) {
    return handleLabourList(user, body, location, lang);
  }

  // ── Main menu / default ───────────────────────────────────────────────────
  return handleMainMenu(user, body, lang);
}

module.exports = { handleMessage };
