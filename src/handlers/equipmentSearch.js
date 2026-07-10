const User = require('../models/User');
const EquipmentListing = require('../models/EquipmentListing');
const Booking = require('../models/Booking');
const { t, strings } = require('../lang/strings');
const { sendMessage, sendMenu } = require('../services/twilio');
const { showMainMenu } = require('./mainMenu');
const { distanceKm, formatDistance, findNearbyEquipment } = require('../services/location');
const { parseDate, formatDate, dateFromTimestamp } = require('../utils/dateUtils');

/**
 * Equipment search + booking flow
 * States: EQ_SEARCH_TYPE → EQ_SEARCH_DATE → EQ_SEARCH_RESULTS → EQ_SEARCH_CONFIRM
 */
async function handleEquipmentSearch(user, body, location, lang) {

  switch (user.state) {

    // ── Pick equipment type ───────────────────────────────────────────────────
    case 'EQ_SEARCH_TYPE': {
      const choice = parseInt(body);
      if (choice === 6) { await user.updateOne({ state: 'MAIN_MENU', tempData: {} }); return showMainMenu(user, lang); }
      if (!choice || choice < 1 || choice > strings.equipment_types_raw.length) {
        await sendMenu(user.phone, t('ask_equipment_type', lang), strings.equipment_types[lang], lang);
        break;
      }
      const eqType = strings.equipment_types_raw[choice - 1];
      await user.updateOne({ state: 'EQ_SEARCH_DATE', tempData: { eqType } });
      await sendMessage(user.phone, t('ask_booking_date', lang), lang);
      break;
    }

    // ── Enter booking date ────────────────────────────────────────────────────
    case 'EQ_SEARCH_DATE': {
      const date = parseDate(body.trim());
      if (!date) {
        await sendMessage(user.phone, t('invalid_date', lang), lang);
        break;
      }
      const eqType = user.tempData.eqType;
      await user.updateOne({ $set: { 'tempData.bookingDate': date.getTime(), state: 'EQ_SEARCH_RESULTS' } });

      // Find nearby listings — 10km first, fallback to 20km
      const { listings, radiusKm } = await findNearbyEquipment(user.location.coordinates, eqType);

      if (listings.length === 0) {
        const noFound = t('no_equipment_found', lang).replace('{type}', eqType);
        await sendMessage(user.phone, noFound, lang);
        await showMainMenu(user, lang);
        break;
      }

      // Build result cards
      const userCoords = user.location.coordinates;
      let msg = t('equipment_results_header', lang, listings.length, eqType, radiusKm) + '\n\n';
      listings.forEach((l, i) => {
        const ownerUser = null; // we'll enrich from listing data
        const dist = formatDistance(distanceKm(userCoords, l.location.coordinates));
        const rating = l.ratingCount > 0 ? `${l.rating.toFixed(1)}⭐` : '—';
        msg += t('equipment_card', lang, i + 1, l.ownerName || '—', l.village || '—', l.dailyRate, rating, dist);
        msg += '\n\n';
      });

      // Store listing IDs in tempData for confirmation step
      const listingIds = listings.map((l) => l._id.toString());
      await user.updateOne({
        $set: {
          state: 'EQ_SEARCH_CONFIRM',
          'tempData.listingIds': listingIds,
        },
      });

      msg += t('ask_select_listing', lang);
      await sendMessage(user.phone, msg, lang);
      break;
    }

    // ── Confirm booking ───────────────────────────────────────────────────────
    case 'EQ_SEARCH_CONFIRM': {
      const choice = parseInt(body);
      const listingIds = user.tempData.listingIds || [];

      if (!choice || choice < 1 || choice > listingIds.length) {
        await sendMessage(user.phone, t('invalid_input', lang), lang);
        break;
      }

      const listing = await EquipmentListing.findById(listingIds[choice - 1]);
      if (!listing) {
        await sendMessage(user.phone, t('invalid_input', lang), lang);
        break;
      }

      // Re-fetch user to get latest tempData from DB
      const freshUser = await User.findOne({ phone: user.phone });
      const bookingDate = dateFromTimestamp(freshUser.tempData?.bookingDate);
      if (!bookingDate) {
        // tempData lost — restart the flow
        await user.updateOne({ state: 'EQ_SEARCH_TYPE', tempData: {} });
        await sendMessage(user.phone, t('invalid_input', lang), lang);
        await showMainMenu(user, lang);
        break;
      }

      const owner = await User.findById(listing.ownerId);

      // Create booking
      const booking = await Booking.create({
        type: 'equipment',
        listingId: listing._id,
        farmerId: user._id,
        farmerPhone: user.phone,
        farmerName: user.name,
        providerId: listing.ownerId,
        providerPhone: listing.ownerPhone,
        providerName: listing.ownerName || owner?.name || '—',
        bookingDate,
        status: 'confirmed',
      });

      // Format phone for display (strip whatsapp: prefix)
      await listing.updateOne({ available: false });

      const ownerDisplayPhone = listing.ownerPhone.replace('whatsapp:', '');
      const dateStr = formatDate(bookingDate);

      // Confirm to farmer
      await sendMessage(
        user.phone,
        t('booking_confirm_equipment', lang, booking.bookingId, listing.ownerName || owner?.name || '—', listing.type, dateStr, listing.dailyRate, ownerDisplayPhone),
        lang
      );

      // Notify owner
      const ownerLang = owner?.language || 'gu';
      const farmerDisplayPhone = user.phone.replace('whatsapp:', '');
      await sendMessage(
        listing.ownerPhone,
        t('notify_owner_equipment', ownerLang, booking.bookingId, user.name, listing.type, dateStr, listing.dailyRate, farmerDisplayPhone),
        ownerLang
      );

      await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
      await showMainMenu(user, lang);
      break;
    }

    default:
      await showMainMenu(user, lang);
  }
}

module.exports = { handleEquipmentSearch };
