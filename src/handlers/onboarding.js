const User = require('../models/User');
const { t, strings } = require('../lang/strings');
const { sendMessage, sendMenu } = require('../services/twilio');
const { showMainMenu } = require('./mainMenu');

/**
 * Handles:
 * NEW
 * ↓
 * LANGUAGE
 * ↓
 * NAME
 * ↓
 * LOCATION
 * ↓
 * VILLAGE
 * ↓
 * REGISTER
 */

async function handleOnboarding(user, body, location, lang) {

  const phone = user.phone;

  switch (user.state) {

    // ---------------------------------------------------------
    // NEW USER
    // ---------------------------------------------------------

    case 'NEW': {

      await user.updateOne({
        state: 'AWAITING_LANGUAGE',
      });

      await sendMenu(
        phone,
        t('welcome_new', 'en'),
        strings.language_options
      );

      break;
    }

    // ---------------------------------------------------------
    // LANGUAGE
    // ---------------------------------------------------------

    case 'AWAITING_LANGUAGE': {

      const choice = parseInt(body);

      const langMap = {
        1: 'gu',
        2: 'hi',
        3: 'en',
      };

      const chosen = langMap[choice];

      if (!chosen) {

        await sendMenu(
          phone,
          t('welcome_new', 'en'),
          strings.language_options
        );

        break;
      }

      await user.updateOne({
        language: chosen,
        state: 'AWAITING_NAME',
      });

      // Consent Notice
      await sendMessage(
        phone,
        t('welcome_with_consent', chosen),
        chosen
      );

      await sendMessage(
        phone,
        t('ask_name', chosen),
        chosen
      );

      break;
    }

    // ---------------------------------------------------------
    // NAME
    // ---------------------------------------------------------

    case 'AWAITING_NAME': {

      const name = body.trim();

      if (!name || name.length < 2) {

        await sendMessage(
          phone,
          t('ask_name', lang),
          lang
        );

        break;
      }

      await user.updateOne({

        name,

        state: 'AWAITING_LOCATION',

      });

      await sendMessage(
        phone,
        t('ask_location', lang),
        lang
      );

      break;
    }

    // ---------------------------------------------------------
    // LOCATION
    // ---------------------------------------------------------

    case 'AWAITING_LOCATION': {

      if (
        !location ||
        !location.latitude ||
        !location.longitude
      ) {

        await sendMessage(
          phone,
          t('ask_location', lang),
          lang
        );

        break;
      }

      const lat = Number(location.latitude);
      const lng = Number(location.longitude);

      await user.updateOne({

        'location.coordinates': [lng, lat],

        state: 'AWAITING_VILLAGE',

      });

      await sendMessage(
        phone,
        t('village_prompt', lang),
        lang
      );

      break;
    }

    // ---------------------------------------------------------
    // VILLAGE
    // ---------------------------------------------------------

    case 'AWAITING_VILLAGE': {

      const village = body.trim();

      if (village.length < 2) {

        await sendMessage(
          phone,
          t('village_prompt', lang),
          lang
        );

        break;
      }

      await user.updateOne({

        village,

        isRegistered: true,

        state: 'MAIN_MENU',

      });

      const updated = await User.findById(user._id);

      await sendMessage(

        phone,

        t(
          'registration_done',
          lang,
          updated.name
        ),

        lang

      );

      return showMainMenu(updated, lang);
    }

    default: {

      await user.updateOne({

        state: 'MAIN_MENU',

      });

      const updated = await User.findById(user._id);

      return showMainMenu(updated, lang);
    }

  }

}

module.exports = {

  handleOnboarding,

};