const User = require('../models/User');
const EquipmentListing = require('../models/EquipmentListing');
const LabourListing = require('../models/LabourListing');
const Booking = require('../models/Booking');
const { t } = require('../lang/strings');
const { sendMessage, sendMenu } = require('../services/twilio');
const { showProfileMenu } = require('./profile');

/**
 * Main handler for "My Listings" state machine
 */
async function handleMyListings(user, body, lang) {
  const text = body.trim();
  const state = user.state;

  switch (state) {
    case 'MY_LISTINGS_VIEW': {
      const choiceIndex = parseInt(text, 10) - 1;
      const savedListings = user.tempData?.myListings || [];

      // Check if user selected "Back" (the last option in the list)
      if (parseInt(text, 10) === savedListings.length + 1) {
        await user.updateOne({ state: 'PROFILE_MENU', tempData: {} });
        const freshUser = await User.findById(user._id);
        return showProfileMenu(freshUser, lang);
      }

      if (isNaN(choiceIndex) || choiceIndex < 0 || choiceIndex >= savedListings.length) {
        return showMyListings(user, lang);
      }

      const selected = savedListings[choiceIndex];
      await user.updateOne({
        state: 'LISTING_DETAIL',
        'tempData.selectedListing': selected
      });

      return showListingDetail(user, selected, lang);
    }

    case 'LISTING_DETAIL': {
      const choice = parseInt(text, 10);
      const selected = user.tempData?.selectedListing;

      if (!selected) {
        await user.updateOne({ state: 'PROFILE_MENU', tempData: {} });
        const freshUser = await User.findById(user._id);
        return showProfileMenu(freshUser, lang);
      }

      switch (choice) {
        case 1: // Change Rate
          await user.updateOne({ state: 'LISTING_EDIT_RATE' });
          return sendMessage(user.phone, t('ask_daily_rate', lang) + '\n' + t('back_hint', lang));

        case 2: // Toggle Availability
          return toggleAvailability(user, selected, lang);

        case 3: // Manage Dates
          const { showAvailabilityMenu } = require('./availability');
          return showAvailabilityMenu(user, selected.id, lang);

        case 4: // Delete Listing
          await user.updateOne({ state: 'LISTING_DELETE_CONFIRM' });
          return sendMessage(user.phone, t('delete_listing_confirm', lang) + '\n' + t('back_hint', lang));

        case 0: // Back
          await user.updateOne({ state: 'MY_LISTINGS_VIEW' });
          return showMyListings(user, lang);

        default:
          return showListingDetail(user, selected, lang);
      }
    }

    case 'LISTING_EDIT_RATE': {
      const rate = parseInt(text, 10);
      const selected = user.tempData?.selectedListing;

      if (isNaN(rate) || rate <= 0) {
        return sendMessage(user.phone, t('invalid_number', lang));
      }

      if (!selected) {
        await user.updateOne({ state: 'PROFILE_MENU', tempData: {} });
        const freshUser = await User.findById(user._id);
        return showProfileMenu(freshUser, lang);
      }

      if (selected.type === 'equipment') {
        await EquipmentListing.findByIdAndUpdate(selected.id, { dailyRate: rate });
      } else {
        await LabourListing.findByIdAndUpdate(selected.id, { dailyRate: rate });
      }

      await sendMessage(user.phone, t('rate_updated_success', lang));
      await user.updateOne({ state: 'LISTING_DETAIL' });
      return showListingDetail(user, selected, lang);
    }

    case 'LISTING_DELETE_CONFIRM': {
      const selected = user.tempData?.selectedListing;

      if (!selected) {
        await user.updateOne({ state: 'PROFILE_MENU', tempData: {} });
        const freshUser = await User.findById(user._id);
        return showProfileMenu(freshUser, lang);
      }

      if (text.toUpperCase() !== 'YES') {
        // Cancel and return to details
        await user.updateOne({ state: 'LISTING_DETAIL' });
        return showListingDetail(user, selected, lang);
      }

      // Check for active bookings (pending/confirmed)
      const conflict = await Booking.findOne({
        listingId: selected.id,
        status: { $in: ['pending', 'confirmed'] }
      });

      if (conflict) {
        await sendMessage(user.phone, t('cannot_delete_has_bookings', lang));
        await user.updateOne({ state: 'LISTING_DETAIL' });
        return showListingDetail(user, selected, lang);
      }

      // Delete the listing
      if (selected.type === 'equipment') {
        await EquipmentListing.findByIdAndDelete(selected.id);
      } else {
        await LabourListing.findByIdAndDelete(selected.id);
      }

      await sendMessage(user.phone, t('listing_deleted', lang));
      await user.updateOne({ state: 'MY_LISTINGS_VIEW' });
      return showMyListings(user, lang);
    }

    default:
      await user.updateOne({ state: 'PROFILE_MENU', tempData: {} });
      const freshUser = await User.findById(user._id);
      return showProfileMenu(freshUser, lang);
  }
}

/**
 * Show a list of all listings owned by the user
 */
async function showMyListings(user, lang) {
  const equipmentListings = await EquipmentListing.find({ ownerId: user._id });
  const labourListings = await LabourListing.find({ workerId: user._id });

  if (equipmentListings.length === 0 && labourListings.length === 0) {
    await sendMessage(user.phone, t('no_listings_owned', lang));
    const freshUser = await User.findById(user._id);
    return showProfileMenu(freshUser, lang);
  }

  const options = [];
  const savedListings = [];

  const statusAvailable = t('status_available', lang);
  const statusUnavailable = t('status_unavailable', lang);

  equipmentListings.forEach((listing) => {
    const statusStr = listing.available ? statusAvailable : statusUnavailable;
    options.push(t('equipment_listing_item', lang, listing.type, listing.dailyRate, statusStr));
    savedListings.push({ id: listing._id.toString(), type: 'equipment' });
  });

  labourListings.forEach((listing) => {
    const statusStr = listing.available ? statusAvailable : statusUnavailable;
    options.push(t('labour_listing_item', lang, listing.skills.join(', '), listing.dailyRate, statusStr));
    savedListings.push({ id: listing._id.toString(), type: 'labour' });
  });

  // Append a back option at the end
  options.push(t('back_to_profile', lang));

  await user.updateOne({
    state: 'MY_LISTINGS_VIEW',
    'tempData.myListings': savedListings
  });

  return sendMenu(user.phone, t('my_listings_header', lang), options);
}

/**
 * Show details of a specific listing
 */
async function showListingDetail(user, selected, lang) {
  let detailsText = '';
  const statusAvailable = t('status_available', lang);
  const statusUnavailable = t('status_unavailable', lang);

  if (selected.type === 'equipment') {
    const listing = await EquipmentListing.findById(selected.id);
    if (!listing) return showMyListings(user, lang);

    const statusStr = listing.available ? statusAvailable : statusUnavailable;
    detailsText = `🚜 *${listing.type}*\n💰 Rate: ₹${listing.dailyRate}/day\n🟢 Status: ${statusStr}\n📅 Blocked Dates: ${listing.blockedDates ? listing.blockedDates.length : 0}`;
  } else {
    const listing = await LabourListing.findById(selected.id);
    if (!listing) return showMyListings(user, lang);

    const statusStr = listing.available ? statusAvailable : statusUnavailable;
    detailsText = `👷 *Labour Listing*\n💼 Skills: ${listing.skills.join(', ')}\n💰 Rate: ₹${listing.dailyRate}/day\n🟢 Status: ${statusStr}\n📅 Blocked Dates: ${listing.blockedDates ? listing.blockedDates.length : 0}`;
  }

  // Use sendMessage because listing_detail_menu string already contains numbers (1. Change Rate\n2. Toggle...)
  return sendMessage(user.phone, `${detailsText}\n\n${t('listing_detail_menu', lang)}`);
}

/**
 * Toggle the availability of a listing
 */
async function toggleAvailability(user, selected, lang) {
  let newAvailableStatus = false;
  let listing = null;

  if (selected.type === 'equipment') {
    listing = await EquipmentListing.findById(selected.id);
  } else {
    listing = await LabourListing.findById(selected.id);
  }

  if (!listing) {
    return showMyListings(user, lang);
  }

  newAvailableStatus = !listing.available;
  await listing.updateOne({ available: newAvailableStatus });

  const statusLabel = newAvailableStatus ? t('status_available', lang) : t('status_unavailable', lang);
  await sendMessage(user.phone, t('availability_updated', lang, statusLabel));

  return showListingDetail(user, selected, lang);
}

module.exports = { handleMyListings, showMyListings, showListingDetail };
