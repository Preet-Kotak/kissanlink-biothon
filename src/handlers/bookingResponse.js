const Booking = require('../models/Booking');
const { sendMessage } = require('../services/twilio');
const { t } = require('../lang/strings');
const { formatDateForDisplay } = require('../utils/dateUtils');
const { showMainMenu } = require('./mainMenu');

/**
 * Task 1: Handle owner/worker accepting or declining booking requests
 * This handler is called when provider is in AWAITING_BOOKING_RESPONSE state
 */
async function handleBookingResponse(user, body, lang) {
  const choice = body.trim();

  // Handle invalid inputs
  if (choice !== '1' && choice !== '2') {
    await sendMessage(user.phone, t('invalid_input', lang));
    return;
  }

  // Retrieve the pending booking ID from the provider's session data
  const bookingId = user.tempData.pendingBookingId;
  if (!bookingId) {
    await sendMessage(user.phone, t('system_error', lang));
    await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
    return showMainMenu(user, lang);
  }

  try {
    // Fetch the booking and populate the farmer's details so we can message them
    const booking = await Booking.findById(bookingId).populate('farmerId');
    
    // Edge case: Booking was already handled or auto-expired by the cron job
    if (!booking || booking.status !== 'pending') {
      await sendMessage(user.phone, "⚠️ This booking request is no longer valid or has already expired.");
      await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
      return showMainMenu(user, lang);
    }

    const farmer = booking.farmerId;
    
    // Check if farmer exists (in case account was deleted)
    if (!farmer) {
      await sendMessage(user.phone, "⚠️ This booking request is no longer valid.");
      await booking.updateOne({ status: 'cancelled' });
      await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
      return showMainMenu(user, lang);
    }
    
    const farmerLang = farmer.language || 'gu';
    
    // Use startDate (Task 4 compatibility) or fallback to bookingDate
    const dateObj = booking.startDate || booking.bookingDate;
    const formattedDate = dateObj ? formatDateForDisplay(dateObj) : 'the requested date';
    
    const providerName = user.name || 'Provider';
    const farmerName = farmer.name || 'Farmer';

    if (choice === '1') {
      // ── ACCEPT FLOW ──────────────────────────────────────────────
      booking.status = 'confirmed';
      await booking.save();

      const itemEmoji = booking.type === 'equipment' ? '🚜' : '👷';
      const itemLabelFarmer = farmerLang === 'gu' 
        ? (booking.type === 'equipment' ? 'સાધન' : 'કામ') 
        : farmerLang === 'hi' 
        ? (booking.type === 'equipment' ? 'उपकरण' : 'काम') 
        : (booking.type === 'equipment' ? 'Equipment' : 'Work');
      const providerRole = farmerLang === 'gu' 
        ? (booking.type === 'equipment' ? 'માલિક' : 'મજૂર') 
        : farmerLang === 'hi' 
        ? (booking.type === 'equipment' ? 'मालिक' : 'मजदूर') 
        : (booking.type === 'equipment' ? 'Owner' : 'Worker');
      
      const isMultiDay = (booking.days || 1) > 1;
      const totalCost = (booking.rate || 0) * (booking.days || 1);

      // Notify the Provider (Owner/Worker)
      await sendMessage(user.phone, t('booking_confirmed_provider', lang, farmerName), lang);
      
      // Notify the Farmer matching exact screenshot layout
      await sendMessage(farmer.phone, 
        t('booking_confirmed_farmer', farmerLang, booking.bookingId, booking.itemName, itemEmoji, itemLabelFarmer, providerRole, providerName, formattedDate, booking.rate, user.phone, isMultiDay, totalCost),
        farmerLang
      );

    } else if (choice === '2') {
      // ── DECLINE FLOW ─────────────────────────────────────────────
      booking.status = 'cancelled';
      await booking.save();

      // Notify the Provider (Owner/Worker)
      await sendMessage(user.phone, "✅ You have declined the request.");

      // Notify the Farmer
      await sendMessage(farmer.phone, t('booking_declined_farmer', farmerLang, providerName));
    }

    // Clean up the provider's state and return them to the Main Menu
    await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
    await showMainMenu(user, lang);

  } catch (err) {
    console.error('[BookingResponse] Error:', err);
    await sendMessage(user.phone, t('system_error', lang));
    await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
    await showMainMenu(user, lang);
  }
}

module.exports = { handleBookingResponse };