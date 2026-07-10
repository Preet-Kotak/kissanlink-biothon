const User = require('../models/User');
const EquipmentListing = require('../models/EquipmentListing');
const { t, strings } = require('../lang/strings');
const { sendMessage, sendMenu } = require('../services/twilio');
const { showMainMenu } = require('./mainMenu');

/**
 * Equipment listing flow (owner side)
 * States: EQ_LIST_TYPE → EQ_LIST_RATE → done
 */
async function handleEquipmentList(user, body, location, lang, media) {

  switch (user.state) {

    // ── Pick equipment type ───────────────────────────────────────────────────
    case 'EQ_LIST_TYPE': {
      const choice = parseInt(body);
      if (choice === 6) { await user.updateOne({ state: 'MAIN_MENU', tempData: {} }); return showMainMenu(user, lang); }
      if (!choice || choice < 1 || choice > strings.equipment_types_raw.length) {
        await sendMenu(user.phone, t('ask_list_equipment_type', lang), strings.equipment_types[lang]);
        break;
      }
      const eqType = strings.equipment_types_raw[choice - 1];
      await user.updateOne({ state: 'EQ_LIST_RATE', tempData: { eqType } });
      await sendMessage(user.phone, t('ask_daily_rate', lang) + '\n' + t('back_hint', lang));
      break;
    }

    // ── Enter daily rate ──────────────────────────────────────────────────────
    case 'EQ_LIST_RATE': {
      const rate = parseInt(body.trim());
      if (isNaN(rate) || rate < 1) {
        await sendMessage(user.phone, t('invalid_number', lang));
        break;
      }
      await user.updateOne({ state: 'EQ_LIST_PHOTO', tempData: { ...user.tempData, rate } });
      await sendMessage(user.phone, t('ask_PhotoUrl', lang, user.tempData.eqType) + '\n' + t('back_hint', lang));
      break;
    }

    case 'EQ_LIST_PHOTO': {
      let photoUrl = null;
      if (media && media.url) {
        const cType = media.contentType || '';
        if (cType === 'image/jpeg' || cType === 'image/png') {
          photoUrl = media.url;
          await sendMessage(user.phone, t('photo_uploaded', lang));
        } else {
          await sendMessage(user.phone, t('invalid_image', lang));
          await sendMessage(user.phone, t('ask_PhotoUrl', lang, user.tempData.eqType) + '\n' + t('back_hint', lang));
          break;
        }
      } else if (body.trim().toLowerCase() === 'skip') {
        photoUrl = null;
      } else {
        await sendMessage(user.phone, t('invalid_image', lang));
        break;
      }

      const eqType = user.tempData.eqType;
      const rate = user.tempData.rate;
      // Add owner role if not present
      const roles = user.roles.includes('owner') ? user.roles : [...user.roles, 'owner'];

      // Check if listing already exists for this owner + type, update if so
      const existing = await EquipmentListing.findOne({ ownerId: user._id, type: eqType });
      if (existing) {
        await existing.updateOne({ dailyRate: rate, photoUrl, available: true });
      } else {
        await EquipmentListing.create({
          ownerId: user._id,
          ownerPhone: user.phone,
          ownerName: user.name,
          type: eqType,
          dailyRate: rate,
          photoUrl,
          available: true,
          location: user.location,
          village: user.village || '',
        });
      }

      await user.updateOne({ roles, state: 'MAIN_MENU', tempData: {} });
      await sendMessage(user.phone, t('listing_created', lang, eqType, rate));
      await showMainMenu(user, lang);
      break;
    }

    default:
      await showMainMenu(user, lang);
  }
}

module.exports = { handleEquipmentList };
