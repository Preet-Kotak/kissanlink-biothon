const User = require('../models/User');
const LabourListing = require('../models/LabourListing');
const { t, strings } = require('../lang/strings');
const { sendMessage, sendMenu } = require('../services/twilio');
const { showMainMenu } = require('./mainMenu');

/**
 * Labour listing flow (worker side)
 * States: LAB_LIST_SKILL → LAB_LIST_RATE → done
 *
 * Worker can pick multiple skills (type: 1,2 or 1,2,3)
 */
async function handleLabourList(user, body, location, lang, media) {

  switch (user.state) {

    // ── Pick skills ───────────────────────────────────────────────────────────
    case 'LAB_LIST_SKILL': {
      // Allow comma-separated choices like "1,3" or single "2"
      const raw = body.trim().split(',').map((s) => parseInt(s.trim())).filter(Boolean);
      // 0 = back to main menu
      if (raw.includes(0)) { 
        await user.updateOne({ state: 'MAIN_MENU', tempData: {} }); 
        return showMainMenu(user, lang);
      }
      const valid = raw.filter((n) => n >= 1 && n <= strings.labour_skills_raw.length);

      if (valid.length === 0) {
        await sendMenu(user.phone, t('ask_worker_skill', lang), strings.labour_skills[lang]);
        break;
      }

      const skills = valid.map((n) => strings.labour_skills_raw[n - 1]);
      await user.updateOne({ state: 'LAB_LIST_RATE', tempData: { skills } });
      await sendMessage(user.phone, t('ask_worker_daily_rate', lang), lang);
      break;
    }

    // ── Enter daily wage ──────────────────────────────────────────────────────
    case 'LAB_LIST_RATE': {
      const rate = parseInt(body.trim());
      if (isNaN(rate) || rate < 1) {
        await sendMessage(user.phone, t('invalid_number', lang), lang);
        break;
      }
      await user.updateOne({ state: 'LAB_LIST_PHOTO', tempData: { ...user.tempData, rate } });
      await sendMessage(user.phone, t('ask_PhotoUrl_labour', lang) + '\n' + t('back_hint', lang), lang);
      break;
    }

    case 'LAB_LIST_PHOTO': {
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
            await sendMessage(user.phone, t('ask_PhotoUrl_labour', lang) + '\n' + t('back_hint', lang), lang);
            break;
          }
        } else if (isSkip || textBody.length > 0) {
          // Photo skipped
          photoUrl = null;
        } else {
          await sendMessage(user.phone, t('invalid_image', lang), lang);
          break;
        }

        const skills = user.tempData?.skills;
        const rate = user.tempData?.rate;

        // Validate session data
        if (!skills || !rate) {
          await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
          await sendMessage(user.phone, t('system_error', lang), lang);
          return showMainMenu(user, lang);
        }

        // Validate required user location
        if (!user.location || !user.location.coordinates || user.location.coordinates.length < 2) {
          await user.updateOne({ state: 'MAIN_MENU', tempData: {} });
          await sendMessage(user.phone, t('location_required', lang) || '📍 Location is required. Please update your profile location.', lang);
          return showMainMenu(user, lang);
        }

        // Update or create listing
        const existing = await LabourListing.findOne({ workerId: user._id });
        if (existing) {
          const updatedPhotoUrl = photoUrl !== null ? photoUrl : existing.photoUrl;
          await existing.updateOne({ 
            skills, 
            dailyRate: rate, 
            photoUrl: updatedPhotoUrl, 
            available: true,
            workerName: user.name || 'Worker',
            location: user.location || existing.location,
            village: user.village || existing.village || ''
          });
        } else {
          await LabourListing.create({
            workerId: user._id,
            workerPhone: user.phone,
            workerName: user.name || 'Worker',
            skills,
            dailyRate: rate,
            photoUrl,
            available: true,
            location: user.location,
            village: user.village || '',
          });
        }

        // Use $addToSet so MongoDB guarantees no duplicate roles
        await user.updateOne({
          $addToSet: { roles: 'worker' },
          $set: { state: 'MAIN_MENU', tempData: {} },
        });

        await sendMessage(user.phone, t('worker_listed', lang, user.name), lang);
        const updatedUser = await User.findById(user._id);
        await showMainMenu(updatedUser, lang);
      } catch (err) {
        console.error('❌ Error creating labour listing:', err);
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

module.exports = { handleLabourList };
