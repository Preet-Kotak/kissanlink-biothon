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
async function handleLabourList(user, body, location, lang) {

  switch (user.state) {

    // ── Pick skills ───────────────────────────────────────────────────────────
    case 'LAB_LIST_SKILL': {
      // Allow comma-separated choices like "1,3" or single "2"
      const raw = body.trim().split(',').map((s) => parseInt(s.trim())).filter(Boolean);
      // 6 = back to main menu
      if (raw.includes(6)) { await user.updateOne({ state: 'MAIN_MENU', tempData: {} }); return showMainMenu(user, lang); }
      const valid = raw.filter((n) => n >= 1 && n <= strings.labour_skills_raw.length);

      if (valid.length === 0) {
        await sendMenu(user.phone, t('ask_worker_skill', lang), strings.labour_skills[lang], lang);
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

      const skills = user.tempData.skills;

      // Update or create listing
      const existing = await LabourListing.findOne({ workerId: user._id });
      if (existing) {
        await existing.updateOne({ skills, dailyRate: rate, available: true });
      } else {
        await LabourListing.create({
          workerId: user._id,
          workerPhone: user.phone,
          workerName: user.name,
          skills,
          dailyRate: rate,
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
      await showMainMenu(user, lang);
      break;
    }

    default:
      await showMainMenu(user, lang);
  }
}

module.exports = { handleLabourList };
