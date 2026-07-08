const User = require('../models/User');
const { t, strings } = require('../lang/strings');
const { sendMessage, sendMenu } = require('../services/twilio');

/**
 * Show the main menu
 */
async function showMainMenu(user, lang) {
  await user.updateOne({ state: 'MAIN_MENU' });
  await sendMenu(user.phone, t('main_menu', lang), strings.main_menu_options[lang]);
}

/**
 * Handle main menu selection
 */
async function handleMainMenu(user, body, lang) {
  const choice = parseInt(body);

  switch (choice) {
    case 1: // Rent Equipment
      await user.updateOne({ state: 'EQ_SEARCH_TYPE', tempData: {} });
      await sendMenu(
        user.phone,
        t('ask_equipment_type', lang),
        strings.equipment_types[lang]
      );
      break;

    case 2: // Find Labour
      await user.updateOne({ state: 'LAB_SEARCH_SKILL', tempData: {} });
      await sendMenu(
        user.phone,
        t('ask_labour_skill', lang),
        strings.labour_skills[lang]
      );
      break;

    case 3: // List My Equipment
      await user.updateOne({ state: 'EQ_LIST_TYPE', tempData: {} });
      await sendMenu(
        user.phone,
        t('ask_list_equipment_type', lang),
        strings.equipment_types[lang]
      );
      break;

    case 4: // Offer Work
      await user.updateOne({ state: 'LAB_LIST_SKILL', tempData: {} });
      await sendMenu(
        user.phone,
        t('ask_worker_skill', lang),
        strings.labour_skills[lang]
      );
      break;

    case 5: // My Profile
      await handleProfileView(user, lang);
      break;

    case 6: // My Bookings (Task 4 - Part 8)
      await user.updateOne({ state: 'MY_BOOKINGS', tempData: {} });
      await sendMessage(user.phone, t('my_bookings_placeholder', lang));
      // Note: Full implementation depends on Task 1
      // For now, just acknowledge and return to menu
      await showMainMenu(user, lang);
      break;

    default:
      await sendMenu(user.phone, t('main_menu', lang), strings.main_menu_options[lang]);
  }
}

/**
 * Quick profile view from main menu
 */
async function handleProfileView(user, lang) {
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

module.exports = { showMainMenu, handleMainMenu };
