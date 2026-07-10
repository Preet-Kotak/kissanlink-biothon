const User = require('../models/User');
const EquipmentListing = require('../models/EquipmentListing');
const LabourListing = require('../models/LabourListing');
const Booking = require('../models/Booking');
const { t } = require('../lang/strings');
const { sendMessage, sendMenu } = require('../services/twilio');
const { parseDate, formatDateForDisplay } = require('../utils/dateUtils');

/**
 * Display the availability menu options
 */
async function showAvailabilityMenu(user, listingId, lang) {
  await user.updateOne({
    state: 'MANAGE_AVAILABILITY',
    'tempData.selectedListingId': listingId
  });

  // Use sendMessage because availability_menu has hardcoded numbers
  return sendMessage(user.phone, t('availability_menu', lang));
}

/**
 * Main handler for availability management states
 */
async function handleAvailability(user, body, lang) {
  const text = body.trim();
  const state = user.state;
  const listingId = user.tempData?.selectedListingId;
  const selectedListing = user.tempData?.selectedListing;

  if (!listingId || !selectedListing) {
    const { showMyListings } = require('./myListings');
    await user.updateOne({ state: 'MY_LISTINGS_VIEW', tempData: {} });
    return showMyListings(user, lang);
  }

  // Helper to fetch current listing
  const getListing = async () => {
    if (selectedListing.type === 'equipment') {
      return await EquipmentListing.findById(listingId);
    } else {
      return await LabourListing.findById(listingId);
    }
  };

  switch (state) {
    case 'MANAGE_AVAILABILITY': {
      const choice = parseInt(text, 10);

      switch (choice) {
        case 1: // Block dates
          await user.updateOne({ state: 'AVAILABILITY_BLOCK_INPUT' });
          return sendMessage(user.phone, t('block_dates_prompt', lang) + '\n' + t('back_hint', lang));

        case 2: { // Unblock dates
          const listing = await getListing();
          return showUnblockDatesMenu(user, listing, lang);
        }

        case 3: { // View blocked dates
          const listing = await getListing();
          return viewBlockedDates(user, listing, lang);
        }

        case 0: // Back
          await user.updateOne({ state: 'LISTING_DETAIL' });
          const { showListingDetail } = require('./myListings');
          return showListingDetail(user, selectedListing, lang);

        default:
          return sendMessage(user.phone, t('availability_menu', lang));
      }
    }

    case 'AVAILABILITY_BLOCK_INPUT': {
      const listing = await getListing();
      if (!listing) return;

      const dateStrings = text.split(',').map(s => s.trim()).filter(Boolean);
      const errors = [];
      const validDates = [];

      for (const dateStr of dateStrings) {
        const parsed = parseDate(dateStr, 365); // allow blocking up to 365 days in advance
        
        if (!parsed.valid) {
          let errorMsg = 'Invalid date';
          if (parsed.reason === 'PAST_DATE') errorMsg = 'Date in past';
          if (parsed.reason === 'TOO_FAR_AHEAD') errorMsg = 'Too far ahead';
          errors.push(`❌ ${dateStr}: ${errorMsg}`);
          continue;
        }

        // Normalize date to midnight to match DB queries
        const targetDate = new Date(parsed.date);
        targetDate.setHours(0, 0, 0, 0);

        // Check for conflicting confirmed/pending bookings
        const conflict = await Booking.findOne({
          listingId: listing._id,
          $or: [
            { bookingDate: targetDate },
            { startDate: { $lte: targetDate }, endDate: { $gte: targetDate } }
          ],
          status: { $in: ['pending', 'confirmed'] }
        });

        if (conflict) {
          errors.push(t('date_has_booking', lang, dateStr));
        } else {
          validDates.push(targetDate);
        }
      }

      if (validDates.length > 0) {
        if (selectedListing.type === 'equipment') {
          await EquipmentListing.findByIdAndUpdate(listing._id, {
            $addToSet: { blockedDates: { $each: validDates } }
          });
        } else {
          await LabourListing.findByIdAndUpdate(listing._id, {
            $addToSet: { blockedDates: { $each: validDates } }
          });
        }
      }

      let summary = '';
      if (validDates.length > 0) {
        summary += t('dates_blocked_success', lang, validDates.length) + '\n';
      }
      if (errors.length > 0) {
        summary += errors.join('\n');
      }

      await sendMessage(user.phone, summary.trim());

      // Return to availability menu
      await user.updateOne({ state: 'MANAGE_AVAILABILITY' });
      return sendMessage(user.phone, t('availability_menu', lang));
    }

    case 'AVAILABILITY_UNBLOCK_INPUT': {
      const listing = await getListing();
      if (!listing) return;

      const choiceIndices = text.split(',').map(s => parseInt(s.trim(), 10) - 1).filter(n => !isNaN(n));
      const blockedDates = listing.blockedDates || [];

      if (choiceIndices.length === 0) {
        await sendMessage(user.phone, t('invalid_input', lang));
        return showUnblockDatesMenu(user, listing, lang);
      }

      // Sort blocked dates chronologically so indices match the display
      const sortedBlockedDates = [...blockedDates].sort((a, b) => a - b);
      const datesToUnblock = [];
      const invalidIndices = [];

      for (const idx of choiceIndices) {
        if (idx >= 0 && idx < sortedBlockedDates.length) {
          datesToUnblock.push(sortedBlockedDates[idx]);
        } else {
          invalidIndices.push(idx + 1);
        }
      }

      if (datesToUnblock.length > 0) {
        if (selectedListing.type === 'equipment') {
          await EquipmentListing.findByIdAndUpdate(listing._id, {
            $pull: { blockedDates: { $in: datesToUnblock } }
          });
        } else {
          await LabourListing.findByIdAndUpdate(listing._id, {
            $pull: { blockedDates: { $in: datesToUnblock } }
          });
        }
        await sendMessage(user.phone, `✅ Successfully unblocked ${datesToUnblock.length} dates.`);
      }

      if (invalidIndices.length > 0) {
        await sendMessage(user.phone, `⚠️ Invalid selection: ${invalidIndices.join(', ')}`);
      }

      // Return to availability menu
      await user.updateOne({ state: 'MANAGE_AVAILABILITY' });
      return sendMessage(user.phone, t('availability_menu', lang));
    }

    default:
      await user.updateOne({ state: 'MANAGE_AVAILABILITY' });
      return sendMessage(user.phone, t('availability_menu', lang));
  }
}

/**
 * Helper: Show dates that can be unblocked
 */
async function showUnblockDatesMenu(user, listing, lang) {
  if (!listing) return;

  const blockedDates = listing.blockedDates || [];
  if (blockedDates.length === 0) {
    await sendMessage(user.phone, lang === 'en' ? 'No blocked dates to unblock.' : 'કોઈ blocked તારીખો નથી.');
    await user.updateOne({ state: 'MANAGE_AVAILABILITY' });
    return sendMessage(user.phone, t('availability_menu', lang));
  }

  // Sort blocked dates chronologically
  const sortedBlockedDates = [...blockedDates].sort((a, b) => a - b);
  const options = sortedBlockedDates.map((date, index) => {
    return `${index + 1}. ${formatDateForDisplay(date)}`;
  });

  await user.updateOne({ state: 'AVAILABILITY_UNBLOCK_INPUT' });
  
  const instruction = lang === 'en' 
    ? 'Select date(s) to unblock (comma-separated numbers):' 
    : 'unblock કરવા માટે તારીખો પસંદ કરો:';

  return sendMessage(user.phone, `${instruction}\n\n${options.join('\n')}\n\n${t('back_hint', lang)}`);
}

/**
 * Helper: Show list of blocked dates
 */
async function viewBlockedDates(user, listing, lang) {
  if (!listing) return;

  const blockedDates = listing.blockedDates || [];
  if (blockedDates.length === 0) {
    await sendMessage(user.phone, lang === 'en' ? 'No blocked dates.' : 'કોઈ blocked તારીખો નથી.');
  } else {
    // Sort blocked dates chronologically
    const sortedBlockedDates = [...blockedDates].sort((a, b) => a - b);
    const dateList = sortedBlockedDates.map(d => formatDateForDisplay(d)).join(', ');
    await sendMessage(user.phone, `📅 ${lang === 'en' ? 'Blocked' : 'બ્લોક કરેલી'}: ${dateList}`);
  }

  await user.updateOne({ state: 'MANAGE_AVAILABILITY' });
  return sendMessage(user.phone, t('availability_menu', lang));
}

module.exports = { showAvailabilityMenu, handleAvailability };
