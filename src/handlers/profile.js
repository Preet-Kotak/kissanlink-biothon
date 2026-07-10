const User = require('../models/User');
const { t, strings } = require('../lang/strings');
const { sendMessage, sendMenu } = require('../services/twilio');
const { showMainMenu } = require('./mainMenu');

/**
 * Profile management flow
 * States: PROFILE_MENU → PROFILE_NAME | PROFILE_LOCATION | PROFILE_LANGUAGE | PROFILE_VILLAGE
 */
async function handleProfile(user, body, location, lang) {

  switch (user.state) {

    // ── Profile menu ──────────────────────────────────────────────────────────
    case 'PROFILE_MENU': {
      const choice = parseInt(body);
      switch (choice) {
        case 1: // Change name
          await user.updateOne({ state: 'PROFILE_NAME' });
          await sendMessage(user.phone, t('ask_name', lang), lang);
          break;
        case 2: // Update location
          await user.updateOne({ state: 'PROFILE_LOCATION' });
          await sendMessage(user.phone, t('ask_location', lang), lang);
          break;
        case 3: // Change language
          await user.updateOne({ state: 'PROFILE_LANGUAGE' });
          await sendMenu(user.phone, t('welcome_new', 'en'), strings.language_options, lang);
          break;
        case 4: // Edit village
          await user.updateOne({ state: 'PROFILE_VILLAGE' });
          await sendMessage(user.phone, t('village_prompt', lang), lang);
          break;
        case 5: // Back to main menu
          await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
          const updated = await User.findById(user._id);
          return showMainMenu(updated, lang);
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
        await sendMessage(user.phone, t('ask_name', lang), lang);
        break;
      }
      await user.updateOne({ name, state: 'PROFILE_MENU' });
      await sendMessage(user.phone, t('name_updated', lang, name), lang);
      const updated = await User.findOne({ phone: user.phone });
      await showProfileMenu(updated, lang);
      break;
    }

    // ── Update location ───────────────────────────────────────────────────────
    case 'PROFILE_LOCATION': {
      if (!location.latitude || !location.longitude) {
        await sendMessage(user.phone, t('ask_location', lang), lang);
        break;
      }
      const lat = parseFloat(location.latitude);
      const lng = parseFloat(location.longitude);
      await user.updateOne({
        'location.coordinates': [lng, lat],
        state: 'PROFILE_MENU',
      });
      await sendMessage(user.phone, t('location_updated', lang), lang);
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
        await sendMenu(user.phone, t('welcome_new', 'en'), strings.language_options, lang);
        break;
      }
      await user.updateOne({ language: chosen, state: 'PROFILE_MENU' });
      await sendMessage(user.phone, t('language_updated', chosen), chosen);
      const updated = await User.findOne({ phone: user.phone });
      await showProfileMenu(updated, chosen);
      break;
    }

    // ── Update village ──────────────────────────────────────────────────
    case 'PROFILE_VILLAGE': {
      const village = body.trim();
      if (!village || village.length < 2) {
        await sendMessage(user.phone, t('village_prompt', lang), lang);
        break;
      }
      await user.updateOne({ village, state: 'PROFILE_MENU' });
      await sendMessage(user.phone, t('village_updated', lang, village), lang);
      const updated = await User.findOne({ phone: user.phone });
      await showProfileMenu(updated, lang);
      break;
    }

    default:
      await showMainMenu(user, lang);
  }
}

async function showProfileMenu(user, lang) {
  const roles = user.roles.map((r) => t(`role_${r}`, lang)).join(', ');

  const langNames = { gu: 'Gujarati', hi: 'Hindi', en: 'English' };
  const languageDisplay = langNames[user.language || 'gu'];

  await user.updateOne({ state: 'PROFILE_MENU' });
  await sendMenu(
    user.phone,
    t('profile_view', lang, user.name, user.village || 'Not set', languageDisplay, roles),
    strings.profile_options[lang],
    lang
  );
}

module.exports = { handleProfile };
