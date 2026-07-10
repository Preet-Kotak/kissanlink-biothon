const User = require('../models/User');
const Booking = require('../models/Booking');
const { t } = require('../lang/strings');
const { sendMessage } = require('../services/twilio');
const { showMainMenu } = require('./mainMenu');

/**
 * Handle rating input (1–5)
 * tempData.pendingRatingBookingId — the booking to rate
 * tempData.pendingRatingRole — 'farmer' (rating provider) or 'provider' (rating farmer)
 */
async function handleRating(user, body, lang) {
  const rating = parseInt(body.trim());

  if (isNaN(rating) || rating < 1 || rating > 5) {
    await sendMessage(user.phone, t('rating_prompt', lang, '—', '—'), lang);
    return;
  }

  const bookingId = user.tempData?.pendingRatingBookingId;
  const role = user.tempData?.pendingRatingRole; // 'farmer' | 'provider'

  if (!bookingId) {
    await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
    await showMainMenu(user, lang);
    return;
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
    await showMainMenu(user, lang);
    return;
  }

  // ── ABUSE PREVENTION CHECKS (Task 4 - Part 6) ──────────────────────────────
  
  // 1. Check if user is a valid participant in this booking
  const isParticipant = 
    user._id.toString() === booking.farmerId.toString() ||
    user._id.toString() === booking.providerId.toString();
  
  if (!isParticipant) {
    await sendMessage(user.phone, t('not_booking_participant', lang));
    await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
    await showMainMenu(user, lang);
    return;
  }

  // 2. Prevent self-rating (if someone is both farmer and provider - edge case)
  if (booking.farmerId.toString() === booking.providerId.toString()) {
    await sendMessage(user.phone, t('cannot_rate_self', lang));
    await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
    await showMainMenu(user, lang);
    return;
  }

  // 3. Check for duplicate rating
  if (role === 'farmer' && booking.farmerRated) {
    await sendMessage(user.phone, t('already_rated', lang));
    await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
    await showMainMenu(user, lang);
    return;
  }
  
  if (role === 'provider' && booking.providerRated) {
    await sendMessage(user.phone, t('already_rated', lang));
    await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
    await showMainMenu(user, lang);
    return;
  }

  // ────────────────────────────────────────────────────────────────────────────

  if (role === 'farmer') {
    // Farmer is rating the provider (owner/worker)
    await booking.updateOne({ 
      farmerRatedProvider: true, 
      farmerRating: rating,
      farmerRated: true  // New flag for Task 4
    });
    // Update provider's overall rating
    await updateUserRating(booking.providerId, rating);
  } else {
    // Provider is rating the farmer
    await booking.updateOne({ 
      providerRatedFarmer: true, 
      providerRating: rating,
      providerRated: true  // New flag for Task 4
    });
    await updateUserRating(booking.farmerId, rating);
  }

  await sendMessage(user.phone, t('rating_saved', lang, rating), lang);
  await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
  await showMainMenu(user, lang);
}

/**
 * Update a user's rolling average rating
 */
async function updateUserRating(userId, newRating) {
  const target = await User.findById(userId);
  if (!target) return;

  const newCount = target.ratingCount + 1;
  const newAvg = ((target.rating * target.ratingCount) + newRating) / newCount;

  await target.updateOne({ rating: newAvg, ratingCount: newCount });
}

/**
 * Called by cron job — marks bookings past their date as completed
 * and sends rating prompts to both parties
 */
async function processCompletedBookings() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(23, 59, 59, 999);

  const bookingsToComplete = await Booking.find({
    status: 'confirmed',
    bookingDate: { $lte: yesterday },
  });

  for (const booking of bookingsToComplete) {
    await booking.updateOne({ status: 'completed' });

    const farmer = await User.findById(booking.farmerId);
    const provider = await User.findById(booking.providerId);

    const bookingLabel = booking.type === 'equipment'
      ? (farmer?.language === 'hi' ? 'उपकरण' : farmer?.language === 'en' ? 'Equipment' : 'સાધન')
      : (farmer?.language === 'hi' ? 'मजदूरी' : farmer?.language === 'en' ? 'Labour' : 'મજૂર');

    // Prompt farmer to rate provider
    if (farmer && !booking.farmerRatedProvider) {
      await farmer.updateOne({
        state: 'AWAITING_RATING',
        tempData: {
          pendingRatingBookingId: booking._id.toString(),
          pendingRatingRole: 'farmer',
        },
      });
      await sendMessage(
        farmer.phone,
        t('rating_prompt', farmer.language || 'gu', provider?.name || '—', bookingLabel),
        farmer.language || 'gu'
      );
    }

    // Prompt provider to rate farmer (separate — they get their own rating request)
    if (provider && !booking.providerRatedFarmer) {
      await provider.updateOne({
        state: 'AWAITING_RATING',
        tempData: {
          pendingRatingBookingId: booking._id.toString(),
          pendingRatingRole: 'provider',
        },
      });
      await sendMessage(
        provider.phone,
        t('rating_prompt', provider.language || 'gu', farmer?.name || '—', bookingLabel),
        provider.language || 'gu'
      );
    }

    console.log(`✅ Booking ${booking._id} marked complete, rating prompts sent`);
  }
}

module.exports = { handleRating, processCompletedBookings };
