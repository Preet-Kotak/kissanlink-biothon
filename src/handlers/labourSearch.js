const User = require('../models/User');
const LabourListing = require('../models/LabourListing');
const Booking = require('../models/Booking');
const { t, strings } = require('../lang/strings');
const { sendMessage, sendMenu } = require('../services/twilio');
const { showMainMenu } = require('./mainMenu');
const { distanceKm, formatDistance, findNearbyLabour } = require('../services/location');

/**
 * Labour search + booking flow
 * States: LAB_SEARCH_SKILL → LAB_SEARCH_DATE → LAB_SEARCH_RESULTS → LAB_SEARCH_CONFIRM
 */
async function handleLabourSearch(user, body, location, lang) {

  switch (user.state) {

    // ── Pick skill needed ─────────────────────────────────────────────────────
    case 'LAB_SEARCH_SKILL': {
      const choice = parseInt(body);
      if (choice === 6) { await user.updateOne({ state: 'MAIN_MENU', tempData: {} }); return showMainMenu(user, lang); }
      if (!choice || choice < 1 || choice > strings.labour_skills_raw.length) {
        await sendMenu(user.phone, t('ask_labour_skill', lang), strings.labour_skills[lang]);
        break;
      }
      const skill = strings.labour_skills_raw[choice - 1];
      const skillLabel = strings.labour_skills[lang][choice - 1];
      await user.updateOne({ state: 'LAB_SEARCH_DATE', tempData: { skill, skillLabel } });
      await sendMessage(user.phone, t('ask_booking_date', lang) + '\n' + t('back_hint', lang));
      break;
    }

    // ── Enter booking date ────────────────────────────────────────────────────
    case 'LAB_SEARCH_DATE': {
      const date = parseDate(body.trim());
      if (!date) {
        await sendMessage(user.phone, t('invalid_date', lang));
        break;
      }
      const { skill, skillLabel } = user.tempData;
      await user.updateOne({ tempData: { ...user.tempData, bookingDate: date.toISOString() }, state: 'LAB_SEARCH_RESULTS' });

      // Find nearby workers — 10km first, fallback to 20km
      const { listings: workers, radiusKm } = await findNearbyLabour(user.location.coordinates, skill);

      if (workers.length === 0) {
        const noFound = t('no_labour_found', lang).replace('{skill}', skillLabel);
        await sendMessage(user.phone, noFound);
        await showMainMenu(user, lang);
        break;
      }

      const userCoords = user.location.coordinates;
      let msg = t('labour_results_header', lang, skillLabel, radiusKm) + '\n\n';
      workers.forEach((w, i) => {
        const dist = formatDistance(distanceKm(userCoords, w.location.coordinates));
        const rating = w.ratingCount > 0 ? `${w.rating.toFixed(1)}⭐` : '—';
        msg += t('labour_card', lang, i + 1, w.workerName, w.village || '—', w.dailyRate, rating, dist);
        msg += '\n\n';
      });

      const listingIds = workers.map((w) => w._id.toString());
      await user.updateOne({
        state: 'LAB_SEARCH_CONFIRM',
        tempData: { ...user.tempData, listingIds },
      });

      msg += t('ask_select_listing', lang);
      await sendMessage(user.phone, msg);
      break;
    }

    // ── Confirm booking ───────────────────────────────────────────────────────
    case 'LAB_SEARCH_CONFIRM': {
      const choice = parseInt(body);
      const listingIds = user.tempData.listingIds || [];

      if (!choice || choice < 1 || choice > listingIds.length) {
        await sendMessage(user.phone, t('invalid_input', lang));
        break;
      }

      const listing = await LabourListing.findById(listingIds[choice - 1]);
      if (!listing) {
        await sendMessage(user.phone, t('invalid_input', lang));
        break;
      }

      const worker = await User.findById(listing.workerId);
      const bookingDate = new Date(user.tempData.bookingDate);
      const skillLabel = user.tempData.skillLabel;

      await Booking.create({
        type: 'labour',
        listingId: listing._id,
        farmerId: user._id,
        farmerPhone: user.phone,
        farmerName: user.name,
        providerId: listing.workerId,
        providerPhone: listing.workerPhone,
        providerName: listing.workerName,
        bookingDate,
        status: 'confirmed',
      });

      const workerDisplayPhone = listing.workerPhone.replace('whatsapp:', '');
      const dateStr = formatDate(bookingDate);

      // Confirm to farmer
      await sendMessage(
        user.phone,
        t('booking_confirm_labour', lang, listing.workerName, skillLabel, dateStr, listing.dailyRate, workerDisplayPhone)
      );

      // Notify worker
      const workerLang = worker?.language || 'gu';
      const farmerDisplayPhone = user.phone.replace('whatsapp:', '');
      await sendMessage(
        listing.workerPhone,
        t('notify_worker_labour', workerLang, user.name, skillLabel, dateStr, listing.dailyRate, farmerDisplayPhone)
      );

      await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
      await showMainMenu(user, lang);
      break;
    }

    // LAB_SEARCH_RESULTS is a transient state — same handling as date entry
    case 'LAB_SEARCH_RESULTS': {
      // User may be retrying after no results were found — go to date step
      await user.updateOne({ state: 'LAB_SEARCH_DATE' });
      await handleLabourSearch(user, body, location, lang);
      break;
    }

    default:
      await showMainMenu(user, lang);
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseDate(str) {
  const match = str.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const d = new Date(`${year}-${month}-${day}`);
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d < today) return null;
  return d;
}

function formatDate(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

module.exports = { handleLabourSearch };
