const User = require('../models/User');
const { t, strings } = require('../lang/strings');
const { sendMessage, sendMenu } = require('../services/twilio');

/**
 * Show the main menu
 */
async function showMainMenu(user, lang) {
  await user.updateOne({ state: 'MAIN_MENU' });
  await sendMenu(user.phone, t('main_menu', lang), strings.main_menu_options[lang], lang);
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
        strings.equipment_types[lang],
        lang
      );
      break;

    case 2: // Find Labour
      await user.updateOne({ state: 'LAB_SEARCH_SKILL', tempData: {} });
      await sendMenu(
        user.phone,
        t('ask_labour_skill', lang),
        strings.labour_skills[lang],
        lang
      );
      break;

    case 3: // List My Equipment
      await user.updateOne({ state: 'EQ_LIST_TYPE', tempData: {} });
      await sendMenu(
        user.phone,
        t('ask_list_equipment_type', lang),
        strings.equipment_types[lang],
        lang
      );
      break;

    case 4: // Offer Work
      await user.updateOne({ state: 'LAB_LIST_SKILL', tempData: {} });
      await sendMenu(
        user.phone,
        t('ask_worker_skill', lang),
        strings.labour_skills[lang],
        lang
      );
      break;

    case 5: // My Profile
      await handleProfileView(user, lang);
      break;

    default:
      await sendMenu(user.phone, t('main_menu', lang), strings.main_menu_options[lang], lang);
  }
}

/**
 * Quick profile view from main menu
 */
async function handleProfileView(user, lang) {
  const freshUser = await User.findById(user._id);
  const roles = freshUser.roles.map((r) => t(`role_${r}`, lang)).join(', ');

  const langNames = { gu: 'Gujarati', hi: 'Hindi', en: 'English' };
  const languageDisplay = langNames[freshUser.language || 'gu'];

  await freshUser.updateOne({ state: 'PROFILE_MENU' });
  await sendMenu(
    freshUser.phone,
    t('profile_view', lang, freshUser.name, freshUser.village || 'Not set', languageDisplay, roles),
    strings.profile_options[lang],
    lang
  );
}

module.exports = { showMainMenu, handleMainMenu };
