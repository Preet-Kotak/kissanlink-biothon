const User = require('../models/User');
const Booking = require('../models/Booking');
const EquipmentListing = require('../models/EquipmentListing');
const LabourListing = require('../models/LabourListing');
const { t, strings } = require('../lang/strings');
const { sendMessage } = require('../services/twilio');
const { formatDateForDisplay } = require('../utils/dateUtils');

/**
 * Show My Bookings list (Task 4 - Part 2)
 */
async function showMyBookings(user, lang) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Query bookings where user is farmer OR provider
    const bookings = await Booking.find({
      $or: [
        { farmerId: user._id },
        { providerId: user._id }
      ],
      status: { $in: ['pending', 'confirmed'] },
      endDate: { $gte: today }
    })
    .sort({ startDate: 1 })
    .limit(10)
    .lean();
    
    if (bookings.length === 0) {
      await sendMessage(user.phone, t('my_bookings_empty', lang));
      await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
      const { showMainMenu } = require('./mainMenu');
      return showMainMenu(user, lang);
    }
    
    // Build message with numbered bookings
    let message = t('my_bookings_header', lang) + '\n\n';
    
    for (let i = 0; i < bookings.length; i++) {
      const booking = bookings[i];
      const isFarmer = booking.farmerId.toString() === user._id.toString();
      
      // Get item name
      let itemName = 'Item';
      if (booking.type === 'equipment') {
        const listing = await EquipmentListing.findById(booking.listingId).lean();
        itemName = listing?.type || 'Equipment';
      } else {
        itemName = 'Labour';
      }
      
      // Format date
      const dateStr = formatDateForDisplay(booking.startDate);
      const isMultiDay = booking.days > 1;
      const dateDisplay = isMultiDay 
        ? `${dateStr} (${booking.days} days)`
        : dateStr;
      
      // Get other party name
      const otherParty = isFarmer ? booking.providerName : booking.farmerName;
      
      // Status badge
      const statusBadge = booking.status === 'confirmed' ? '✅' : '⏳';
      
      // Build line
      const line = isFarmer
        ? `${i + 1}. ${statusBadge} ${itemName} with ${otherParty} (${dateDisplay})`
        : `${i + 1}. ${statusBadge} ${itemName} for ${otherParty} (${dateDisplay})`;
      
      message += line + '\n';
    }
    
    message += '\n' + t('my_bookings_footer', lang);
    
    // Store booking IDs in tempData
    await user.updateOne({
      state: 'MY_BOOKINGS_LIST',
      tempData: { bookingIds: bookings.map(b => b._id.toString()) }
    });
    
    await sendMessage(user.phone, message);
    
  } catch (err) {
    console.error('[myBookings] Error in showMyBookings:', err);
    await sendMessage(user.phone, t('system_error', lang));
  }
}

/**
 * Handle booking selection from list
 */
async function handleMyBookingsList(user, body, lang) {
  try {
    const choice = parseInt(body.trim());
    
    if (choice === 0) {
      // Back to main menu
      await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
      const { showMainMenu } = require('./mainMenu');
      return showMainMenu(user, lang);
    }
    
    const bookingIds = user.tempData.bookingIds || [];
    
    if (isNaN(choice) || choice < 1 || choice > bookingIds.length) {
      await sendMessage(user.phone, t('invalid_input', lang));
      return;
    }
    
    const bookingId = bookingIds[choice - 1];
    await showBookingDetail(user, bookingId, lang);
    
  } catch (err) {
    console.error('[myBookings] Error in handleMyBookingsList:', err);
    await sendMessage(user.phone, t('system_error', lang));
  }
}

/**
 * Show booking detail view
 */
async function showBookingDetail(user, bookingId, lang) {
  try {
    const booking = await Booking.findById(bookingId).lean();
    
    if (!booking) {
      await sendMessage(user.phone, t('booking_not_found', lang));
      await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
      const { showMainMenu } = require('./mainMenu');
      return showMainMenu(user, lang);
    }
    
    const isFarmer = booking.farmerId.toString() === user._id.toString();
    
    // Get item name
    let itemName = 'Item';
    if (booking.type === 'equipment') {
      const listing = await EquipmentListing.findById(booking.listingId).lean();
      itemName = listing?.type || 'Equipment';
    } else {
      itemName = 'Labour';
    }
    
    // Format dates
    const startDateStr = formatDateForDisplay(booking.startDate);
    const isMultiDay = booking.days > 1;
    const dateDisplay = isMultiDay
      ? `${startDateStr} to ${formatDateForDisplay(booking.endDate)} (${booking.days} days)`
      : startDateStr;
    
    // Calculate total rate
    const dailyRate = booking.type === 'equipment'
      ? (await EquipmentListing.findById(booking.listingId).lean())?.dailyRate || 0
      : (await LabourListing.findById(booking.listingId).lean())?.dailyRate || 0;
    const totalRate = dailyRate * booking.days;
    
    // Get other party details
    const otherPartyName = isFarmer ? booking.providerName : booking.farmerName;
    const otherPartyPhone = isFarmer ? booking.providerPhone : booking.farmerPhone;
    
    // Status
    const statusText = booking.status === 'confirmed' 
      ? (lang === 'gu' ? '✅ પુષ્ટિ થયેલ' : lang === 'hi' ? '✅ पुष्टि' : '✅ Confirmed')
      : (lang === 'gu' ? '⏳ પેન્ડિંગ' : lang === 'hi' ? '⏳ पेंडिंग' : '⏳ Pending');
    
    // Build message
    const message = t('booking_detail_message', lang,
      itemName,
      dateDisplay,
      dailyRate,
      totalRate,
      statusText,
      otherPartyName,
      otherPartyPhone,
      booking._id.toString().slice(-6)
    );
    
    // Store booking ID for next actions
    await user.updateOne({
      state: 'BOOKING_DETAIL',
      tempData: { currentBookingId: bookingId }
    });
    
    await sendMessage(user.phone, message);
    
  } catch (err) {
    console.error('[myBookings] Error in showBookingDetail:', err);
    await sendMessage(user.phone, t('system_error', lang));
  }
}

/**
 * Handle booking detail menu choices
 */
async function handleBookingDetail(user, body, lang) {
  try {
    const choice = body.trim();
    
    if (choice === '0') {
      // Back to bookings list
      return showMyBookings(user, lang);
    }
    
    if (choice === '1') {
      // Cancel booking - show confirmation
      const bookingId = user.tempData.currentBookingId;
      const booking = await Booking.findById(bookingId).lean();
      
      if (!booking) {
        await sendMessage(user.phone, t('booking_not_found', lang));
        await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
        const { showMainMenu } = require('./mainMenu');
        return showMainMenu(user, lang);
      }
      
      const isFarmer = booking.farmerId.toString() === user._id.toString();
      const otherPartyName = isFarmer ? booking.providerName : booking.farmerName;
      const dateStr = formatDateForDisplay(booking.startDate);
      
      await user.updateOne({ state: 'BOOKING_CANCEL_CONFIRM' });
      await sendMessage(user.phone, t('cancel_booking_confirm', lang, otherPartyName, dateStr));
      
    } else if (choice === '2') {
      // Contact other party - show phone again
      const bookingId = user.tempData.currentBookingId;
      const booking = await Booking.findById(bookingId).lean();
      
      if (booking) {
        const isFarmer = booking.farmerId.toString() === user._id.toString();
        const otherPartyName = isFarmer ? booking.providerName : booking.farmerName;
        const otherPartyPhone = isFarmer ? booking.providerPhone : booking.farmerPhone;
        
        await sendMessage(user.phone, t('contact_info', lang, otherPartyName, otherPartyPhone));
      }
      
    } else {
      await sendMessage(user.phone, t('invalid_input', lang));
    }
    
  } catch (err) {
    console.error('[myBookings] Error in handleBookingDetail:', err);
    await sendMessage(user.phone, t('system_error', lang));
  }
}

/**
 * Handle cancellation confirmation
 */
async function handleCancelConfirm(user, body, lang) {
  try {
    const choice = body.trim();
    
    if (choice === '1') {
      // Ask for cancellation reason
      await user.updateOne({ state: 'BOOKING_CANCEL_REASON' });
      await sendMessage(user.phone, t('cancellation_reason_prompt', lang));
      
    } else if (choice === '0') {
      // Back to main menu
      await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
      const { showMainMenu } = require('./mainMenu');
      return showMainMenu(user, lang);
      
    } else {
      // Invalid - ask again
      await sendMessage(user.phone, t('invalid_input', lang) + '\n\n' + t('type_1_or_0', lang));
    }
    
  } catch (err) {
    console.error('[myBookings] Error in handleCancelConfirm:', err);
    await sendMessage(user.phone, t('system_error', lang));
  }
}

/**
 * Handle cancellation reason input
 */
async function handleCancelReason(user, body, lang) {
  try {
    const input = body.trim();
    const reason = input === '1' ? null : input;
    const bookingId = user.tempData.currentBookingId;
    
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      await sendMessage(user.phone, t('booking_not_found', lang));
      await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
      const { showMainMenu } = require('./mainMenu');
      return showMainMenu(user, lang);
    }
    
    // Update booking status
    booking.status = 'cancelled';
    if (reason) {
      booking.cancellationReason = reason;
    }
    await booking.save();
    
    const isFarmer = booking.farmerId.toString() === user._id.toString();
    
    // Get item name
    let itemName = 'Item';
    if (booking.type === 'equipment') {
      const listing = await EquipmentListing.findById(booking.listingId).lean();
      itemName = listing?.type || 'Equipment';
    } else {
      itemName = 'Labour';
    }
    
    const dateStr = formatDateForDisplay(booking.startDate);
    
    // Notify the user
    await sendMessage(user.phone, t('booking_cancelled_success', lang));
    
    // Notify the other party
    const otherPartyId = isFarmer ? booking.providerId : booking.farmerId;
    const otherParty = await User.findById(otherPartyId);
    
    if (otherParty) {
      const otherLang = otherParty.language || 'gu';
      const cancellerName = user.name;
      await sendMessage(
        otherParty.phone,
        t('booking_cancelled_notification', otherLang, cancellerName, itemName, dateStr, reason || 'Not specified')
      );
    }
    
    // Return to main menu
    await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
    const { showMainMenu } = require('./mainMenu');
    return showMainMenu(user, lang);
    
  } catch (err) {
    console.error('[myBookings] Error in handleCancelReason:', err);
    await sendMessage(user.phone, t('system_error', lang));
  }
}

/**
 * Main handler router for My Bookings states
 */
async function handleMyBookings(user, body, lang) {
  switch (user.state) {
    case 'MY_BOOKINGS':
      return showMyBookings(user, lang);
    case 'MY_BOOKINGS_LIST':
      return handleMyBookingsList(user, body, lang);
    case 'BOOKING_DETAIL':
      return handleBookingDetail(user, body, lang);
    case 'BOOKING_CANCEL_CONFIRM':
      return handleCancelConfirm(user, body, lang);
    case 'BOOKING_CANCEL_REASON':
      return handleCancelReason(user, body, lang);
    default:
      return showMyBookings(user, lang);
  }
}

module.exports = {
  handleMyBookings,
  showMyBookings,
  handleMyBookingsList,
  showBookingDetail,
  handleBookingDetail,
  handleCancelConfirm,
  handleCancelReason
};
