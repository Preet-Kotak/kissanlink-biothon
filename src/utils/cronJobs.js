const Booking = require('../models/Booking');
const { sendMessage } = require('../services/twilio');
const { t } = require('../lang/strings');

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

module.exports = { expirePendingBookings };