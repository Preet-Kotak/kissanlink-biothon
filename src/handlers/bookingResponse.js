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

      // Notify the Provider (Owner/Worker)
      await sendMessage(user.phone, t('booking_confirmed_provider', lang, farmerName));
      
      // Notify the Farmer
      await sendMessage(farmer.phone, t('booking_confirmed_farmer', farmerLang, providerName, formattedDate));

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