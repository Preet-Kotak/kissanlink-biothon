const Booking = require('../models/Booking');
const User = require('../models/User');
const { sendMessage } = require('../services/twilio');
const { t } = require('../lang/strings');
const { formatDateForDisplay } = require('./dateUtils');

/**
 * Task 1: Find and expire pending bookings older than 8 hours
 */
async function expirePendingBookings() {
  // Calculate the timestamp for exactly 8 hours ago
  const eightHoursAgo = new Date(Date.now() - 8 * 60 * 60 * 1000);
  
  try {
    // Find all pending bookings created before that timestamp
    const expiredBookings = await Booking.find({
      status: 'pending',
      createdAt: { $lt: eightHoursAgo }
    }).populate('farmerId');
    
    let processedCount = 0;

    for (const booking of expiredBookings) {
      // 1. Update status to cancelled
      booking.status = 'cancelled';
      await booking.save();
      
      // 2. Notify the farmer that the request expired
      const farmer = booking.farmerId;
      if (farmer) {
        const lang = farmer.language || 'gu';
        await sendMessage(
          farmer.phone,
          t('booking_expired', lang)
        );
      }
      
      console.log(`[Cron] Auto-expired booking: ${booking._id}`);
      processedCount++;
    }
    
    return processedCount;
  } catch (error) {
    console.error('[Cron] Error expiring bookings:', error);
    return 0;
  }
}

/**
 * Task 4 - Part 5: Process completed bookings and send rating prompts
 * Runs daily at 6 AM IST
 */
async function processCompletedBookings() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  try {
    // Find bookings that ended before today and are still confirmed
    const completedBookings = await Booking.find({
      status: 'confirmed',
      endDate: { $lt: today }
    }).populate('farmerId providerId');
    
    let processedCount = 0;

    for (const booking of completedBookings) {
      // 1. Update status to completed
      booking.status = 'completed';
      await booking.save();
      
      console.log(`[Cron] Marked booking ${booking._id} as completed`);
      
      // 2. Send rating prompts to both parties
      await sendRatingPrompts(booking);
      
      processedCount++;
    }
    
    return processedCount;
  } catch (error) {
    console.error('[Cron] Error processing completed bookings:', error);
    return 0;
  }
}

/**
 * Send rating prompts to both farmer and provider
 * Task 4 - Part 5
 */
async function sendRatingPrompts(booking) {
  try {
    const farmer = booking.farmerId;
    const provider = booking.providerId;
    
    // Send to farmer (to rate provider) - only if not already rated
    if (farmer && !booking.farmerRated) {
      const farmerLang = farmer.language || 'gu';
      const providerName = booking.providerName || 'Provider';
      const itemName = booking.itemName || 'Item';
      
      await farmer.updateOne({
        state: 'AWAITING_RATING',
        tempData: {
          pendingRatingBookingId: booking._id.toString(),
          pendingRatingRole: 'farmer'
        }
      });
      
      await sendMessage(
        farmer.phone,
        t('rating_prompt', farmerLang, providerName, itemName)
      );
      
      console.log(`[Cron] Sent rating prompt to farmer ${farmer.phone} for booking ${booking._id}`);
    }
    
    // Send to provider (to rate farmer) - only if not already rated
    if (provider && !booking.providerRated) {
      const providerLang = provider.language || 'gu';
      const farmerName = booking.farmerName || 'Farmer';
      const itemName = booking.itemName || 'Item';
      
      await provider.updateOne({
        state: 'AWAITING_RATING',
        tempData: {
          pendingRatingBookingId: booking._id.toString(),
          pendingRatingRole: 'provider'
        }
      });
      
      await sendMessage(
        provider.phone,
        t('rating_prompt', providerLang, farmerName, itemName)
      );
      
      console.log(`[Cron] Sent rating prompt to provider ${provider.phone} for booking ${booking._id}`);
    }
  } catch (error) {
    console.error('[Cron] Error sending rating prompts:', error);
  }
}

module.exports = { 
  expirePendingBookings, 
  processCompletedBookings 
};