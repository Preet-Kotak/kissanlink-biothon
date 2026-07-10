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

/**
 * Central message dispatcher
 */
async function handleMessage(user, body, location) {

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

  if (state === 'AWAITING_RATING') {
    return handleRating(user, body, lang);
  }

  // ------------------------------------------------------------------
  // 6. Onboarding
  // ------------------------------------------------------------------

  if (
    !user.isRegistered ||
    [
      'NEW',
      'AWAITING_LANGUAGE',
      'AWAITING_NAME',
      'AWAITING_LOCATION',
      'AWAITING_VILLAGE',
    ].includes(state)
  ) {
    return handleOnboarding(user, body, location, lang);
  }

  // ------------------------------------------------------------------
  // 7. Profile
  // ------------------------------------------------------------------

  if (state.startsWith('PROFILE')) {
    return handleProfile(user, body, location, lang);
  }

  // ------------------------------------------------------------------
  // 8. Equipment Search
  // ------------------------------------------------------------------

  if (state.startsWith('EQ_SEARCH')) {
    return handleEquipmentSearch(user, body, location, lang);
  }

  // ------------------------------------------------------------------
  // 9. Equipment Listing
  // ------------------------------------------------------------------

  if (state.startsWith('EQ_LIST')) {
    return handleEquipmentList(user, body, location, lang);
  }

  // ------------------------------------------------------------------
  // 10. Labour Search
  // ------------------------------------------------------------------

  if (state.startsWith('LAB_SEARCH')) {
    return handleLabourSearch(user, body, location, lang);
  }

  // ------------------------------------------------------------------
  // 11. Labour Listing
  // ------------------------------------------------------------------

  if (state.startsWith('LAB_LIST')) {
    return handleLabourList(user, body, location, lang);
  }

  // ------------------------------------------------------------------
  // 12. Default
  // ------------------------------------------------------------------

  return handleMainMenu(user, body, lang);
}

module.exports = {
  handleMessage,
};