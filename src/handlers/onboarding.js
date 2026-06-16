const User = require('../models/User');
const { t, strings } = require('../lang/strings');
const { sendMessage, sendMenu } = require('../services/twilio');
const { showMainMenu } = require('./mainMenu');

/**
 * Handles: NEW → AWAITING_LANGUAGE → AWAITING_NAME → AWAITING_LOCATION → registered
 */
async function handleOnboarding(user, body, location, lang) {
  const phone = user.phone;

  switch (user.state) {

    // ── Step 0: Brand new user — show welcome + language picker ───────────────
    case 'NEW': {
      await user.updateOne({ state: 'AWAITING_LANGUAGE' });
      await sendMenu(
        phone,
        t('welcome_new', 'en'), // show welcome in English so they understand the choice
        strings.language_options
      );
      break;
    }

    // ── Step 1: Language selected ─────────────────────────────────────────────
    case 'AWAITING_LANGUAGE': {
      const choice = parseInt(body);
      const langMap = { 1: 'gu', 2: 'hi', 3: 'en' };
      const chosen = langMap[choice];

      if (!chosen) {
        await sendMenu(
          phone,
          t('welcome_new', 'en'),
          strings.language_options
        );
        break;
      }

      await user.updateOne({ language: chosen, state: 'AWAITING_NAME' });
      await sendMessage(phone, t('ask_name', chosen));
      break;
    }

    // ── Step 2: Name entered ──────────────────────────────────────────────────
    case 'AWAITING_NAME': {
      const name = body.trim();
      if (!name || name.length < 2) {
        await sendMessage(phone, t('ask_name', lang));
        break;
      }

      await user.updateOne({ name, state: 'AWAITING_LOCATION' });
      await sendMessage(phone, t('ask_location', lang));
      break;
    }

    // ── Step 3: Location shared ───────────────────────────────────────────────
    case 'AWAITING_LOCATION': {
      if (!location.latitude || !location.longitude) {
        await sendMessage(phone, t('ask_location', lang));
        break;
      }

      const lat = parseFloat(location.latitude);
      const lng = parseFloat(location.longitude);

      await user.updateOne({
        'location.coordinates': [lng, lat],
        isRegistered: true,
        state: 'MAIN_MENU',
      });

      // Re-fetch with updated name
      const updated = await User.findOne({ phone });
      await sendMessage(phone, t('registration_done', lang, updated.name));
      await showMainMenu(updated, lang);
      break;
    }

    default: {
      // Shouldn't happen — reset to main menu
      await user.updateOne({ state: 'MAIN_MENU' });
      const updated = await User.findOne({ phone: user.phone });
      await showMainMenu(updated, lang);
    }
  }
}

module.exports = { handleOnboarding };
