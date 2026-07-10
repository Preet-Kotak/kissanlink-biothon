const User = require('../models/User');
const { t, strings } = require('../lang/strings');
const { sendMessage, sendMenu } = require('../services/twilio');
const { showMainMenu } = require('./mainMenu');

/**
 * Profile management flow
 * States: PROFILE_MENU → PROFILE_NAME | PROFILE_LOCATION | PROFILE_LANGUAGE
 */
async function handleProfile(user, body, location, lang) {

  switch (user.state) {

    case 'PROFILE_MENU': {
      const choice = parseInt(body);
      switch (choice) {
        case 1: // Change name
          await user.updateOne({ state: 'PROFILE_NAME' });
          await sendMessage(user.phone, t('ask_name', lang));
          break;
        case 2: // Update location
          await user.updateOne({ state: 'PROFILE_LOCATION' });
          await sendMessage(user.phone, t('ask_location', lang));
          break;
        case 3: // Change language
          await user.updateOne({ state: 'PROFILE_LANGUAGE' });
          await sendMenu(user.phone, t('welcome_new', 'en'), strings.language_options);
          break;
        case 4: // Back to menu
          await showMainMenu(user, lang);
          break;
        case 5: // My Listings
          const { showMyListings } = require('./myListings');
          await showMyListings(user, lang);
          break;
        default:
          // Re-show profile
          await showProfileMenu(user, lang);
      }
      break;
    }

    // ── Update name ───────────────────────────────────────────────────────────
    case 'PROFILE_NAME': {
      const name = body.trim();
      if (!name || name.length < 2) {
        await sendMessage(user.phone, t('ask_name', lang));
        break;
      }
      await user.updateOne({ name, state: 'PROFILE_MENU' });
      await sendMessage(user.phone, t('name_updated', lang, name));
      const updated = await User.findOne({ phone: user.phone });
      await showProfileMenu(updated, lang);
      break;
    }

    // ── Update location ───────────────────────────────────────────────────────
    case 'PROFILE_LOCATION': {
      if (!location.latitude || !location.longitude) {
        await sendMessage(user.phone, t('ask_location', lang));
        break;
      }
      const lat = parseFloat(location.latitude);
      const lng = parseFloat(location.longitude);
      await user.updateOne({
        'location.coordinates': [lng, lat],
        state: 'PROFILE_MENU',
      });
      await sendMessage(user.phone, t('location_updated', lang));
      const updated = await User.findOne({ phone: user.phone });
      await showProfileMenu(updated, lang);
      break;
    }

    // ── Update language ───────────────────────────────────────────────────────
    case 'PROFILE_LANGUAGE': {
      const choice = parseInt(body);
      const langMap = { 1: 'gu', 2: 'hi', 3: 'en' };
      const chosen = langMap[choice];
      if (!chosen) {
        await sendMenu(user.phone, t('welcome_new', 'en'), strings.language_options);
        break;
      }
      await user.updateOne({ language: chosen, state: 'PROFILE_MENU' });
      await sendMessage(user.phone, t('language_updated', chosen));
      const updated = await User.findOne({ phone: user.phone });
      await showProfileMenu(updated, chosen);
      break;
    }

    default:
      await showMainMenu(user, lang);
  }
}

async function showProfileMenu(user, lang) {
  const roleLabels = {
    gu: { farmer: 'ખેડૂત', owner: 'માલિક', worker: 'મજૂર' },
    hi: { farmer: 'किसान', owner: 'मालिक', worker: 'मजदूर' },
    en: { farmer: 'Farmer', owner: 'Owner', worker: 'Worker' },
  };
  const roles = user.roles.map((r) => roleLabels[lang][r] || r).join(', ');
  const rating = user.ratingCount > 0 ? user.rating.toFixed(1) : (lang === 'gu' ? 'હજી નહીં' : lang === 'hi' ? 'अभी नहीं' : 'None yet');

  await user.updateOne({ state: 'PROFILE_MENU' });
  await sendMenu(
    user.phone,
    t('profile_view', lang, user.name, user.village || '—', roles, rating, user.ratingCount),
    strings.profile_options[lang]
  );
}

module.exports = { handleProfile };
