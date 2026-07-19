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
      if (choice === 0 || !choice || choice < 1 || choice > strings.equipment_types_raw.length) {
        if (choice === 0) {
          await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
          return showMainMenu(user, lang);
        }
        await sendMenu(user.phone, t('ask_list_equipment_type', lang), strings.equipment_types[lang]);
        break;
      }
      const eqType = strings.equipment_types_raw[choice - 1];
      await user.updateOne({ state: 'EQ_LIST_RATE', tempData: { eqType } });
      await sendMessage(user.phone, t('ask_daily_rate', lang), lang);
      break;
    }

    // ── Enter daily rate ──────────────────────────────────────────────────────
    case 'EQ_LIST_RATE': {
      const rate = parseInt(body.trim());
      if (isNaN(rate) || rate < 1) {
        await sendMessage(user.phone, t('invalid_number', lang), lang);
        break;
      }
      await user.updateOne({ state: 'EQ_LIST_PHOTO', tempData: { ...user.tempData, rate } });
      await sendMessage(user.phone, t('ask_PhotoUrl', lang, user.tempData.eqType) + '\n' + t('back_hint', lang), lang);
      break;
    }

    case 'EQ_LIST_PHOTO': {
      try {
        const textBody = (body || '').trim().toLowerCase();
        const isSkip = ['skip', 'no', '0', 'none', 'pass', 'સ્કીપ', 'નથી', 'છોડો', 'नहीं', 'छोड़ें'].includes(textBody);
        let photoUrl = null;

        if (media && media.url) {
          const cType = (media.contentType || '').toLowerCase();
          if (cType.startsWith('image/')) {
            photoUrl = media.url;
            await sendMessage(user.phone, t('photo_uploaded', lang), lang);
          } else {
            await sendMessage(user.phone, t('invalid_image', lang), lang);
            await sendMessage(user.phone, t('ask_PhotoUrl', lang, user.tempData?.eqType || 'equipment') + '\n' + t('back_hint', lang), lang);
            break;
          }
        } else if (isSkip || textBody.length > 0) {
          // Photo skipped
          photoUrl = null;
        } else {
          await sendMessage(user.phone, t('invalid_image', lang), lang);
          break;
        }

        const eqType = user.tempData?.eqType;
        const rate = user.tempData?.rate;

        // Validate session data
        if (!eqType || !rate) {
          await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
          await sendMessage(user.phone, t('system_error', lang), lang);
          return showMainMenu(user, lang);
        }

        // Validate required user location
        if (!user.location || !user.location.coordinates || user.location.coordinates.length < 2) {
          await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
          await sendMessage(user.phone, t('location_required', lang) || '📍 Location is required to list equipment. Please update your profile location.', lang);
          return showMainMenu(user, lang);
        }

        // Check if listing already exists for this owner + type, update if so
        const existing = await EquipmentListing.findOne({ ownerId: user._id, type: eqType });
        if (existing) {
          const updatedPhotoUrl = photoUrl !== null ? photoUrl : existing.photoUrl;
          await existing.updateOne({
            dailyRate: rate,
            photoUrl: updatedPhotoUrl,
            available: true,
            ownerName: user.name || existing.ownerName,
            location: user.location,
            village: user.village || existing.village || ''
          });
        } else {
          await EquipmentListing.create({
            ownerId: user._id,
            ownerPhone: user.phone,
            ownerName: user.name || '',
            type: eqType,
            dailyRate: rate,
            photoUrl,
            blockedDates: [],
            available: true,
            location: user.location,
            village: user.village || '',
          });
        }

        // Use $addToSet so MongoDB guarantees no duplicate roles
        await user.updateOne({
          $addToSet: { roles: 'owner' },
          $set: { state: 'MAIN_MENU', tempData: {} },
        });

        await sendMessage(user.phone, t('listing_created', lang, eqType, rate), lang);
        const updatedUser = await User.findById(user._id);
        await showMainMenu(updatedUser, lang);
      } catch (err) {
        console.error('❌ Error creating equipment listing:', err);
        await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
        await sendMessage(user.phone, t('system_error', lang), lang);
        await showMainMenu(user, lang);
      }
      break;
    }

    default:
      await showMainMenu(user, lang);
  }
}

module.exports = { handleEquipmentList };
