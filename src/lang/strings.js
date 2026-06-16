/**
 * All user-facing strings for KissanLink
 * Keys: 'gu' (Gujarati), 'hi' (Hindi), 'en' (English)
 */

const strings = {

  // ── Onboarding ──────────────────────────────────────────────────────────────

  welcome_new: {
    gu: `🌾 *KissanLink માં આપનું સ્વાગત છે!*\n\nગુજરાતના ખેડૂતો માટે WhatsApp બજાર.\n\nભાષા પસંદ કરો:`,
    hi: `🌾 *KissanLink में आपका स्वागत है!*\n\nगुजरात के किसानों के लिए WhatsApp बाज़ार.\n\nभाषा चुनें:`,
    en: `🌾 *Welcome to KissanLink!*\n\nWhatsApp marketplace for Gujarat farmers.\n\nChoose your language:`,
  },

  ask_name: {
    gu: `તમારું પૂરું નામ ટાઈપ કરો:`,
    hi: `अपना पूरा नाम टाइप करें:`,
    en: `Type your full name:`,
  },

  ask_location: {
    gu: `📍 તમારું *લોકેશન* શેર કરો.\n\n(નીચે 📎 → Location → Send Your Current Location દબાવો)`,
    hi: `📍 अपना *लोकेशन* शेयर करें.\n\n(नीचे 📎 → Location → Send Your Current Location दबाएं)`,
    en: `📍 Share your *location*.\n\n(Tap 📎 → Location → Send Your Current Location)`,
  },

  registration_done: {
    gu: (name) => `✅ *${name}*, નોંધણી થઈ ગઈ!\n\nKissanLink માં આપનું સ્વાગત છે. 🌾`,
    hi: (name) => `✅ *${name}*, पंजीकरण हो गया!\n\nKissanLink में आपका स्वागत है. 🌾`,
    en: (name) => `✅ *${name}*, registration done!\n\nWelcome to KissanLink. 🌾`,
  },

  // ── Main Menu ────────────────────────────────────────────────────────────────

  main_menu: {
    gu: `🏠 *મુખ્ય મેનૂ*\n\nઆપ શું કરવા માંગો છો?`,
    hi: `🏠 *मुख्य मेनू*\n\nआप क्या करना चाहते हैं?`,
    en: `🏠 *Main Menu*\n\nWhat would you like to do?`,
  },

  main_menu_options: {
    gu: ['🚜 સાધન ભાડે લો', '👷 મજૂર શોધો', '📋 સાધન ભાડે આપો', '💼 કામ ઓફર કરો', '⚙️ મારી પ્રોફાઇલ'],
    hi: ['🚜 उपकरण किराए पर लें', '👷 मजदूर खोजें', '📋 उपकरण किराए पर दें', '💼 काम ऑफर करें', '⚙️ मेरी प्रोफाइल'],
    en: ['🚜 Rent Equipment', '👷 Find Labour', '📋 List My Equipment', '💼 Offer Work', '⚙️ My Profile'],
  },

  // ── Equipment Search ─────────────────────────────────────────────────────────

  ask_equipment_type: {
    gu: `કયા પ્રકારનું સાધન જોઈએ છે?`,
    hi: `किस प्रकार का उपकरण चाहिए?`,
    en: `What type of equipment do you need?`,
  },

  equipment_types: {
    gu: ['🚜 ટ્રેક્ટર', '⚙️ રોટાવેટર', '🌾 થ્રેશર', '💧 વોટર પમ્પ', '🌿 સ્પ્રેયર', '🏠 મુખ્ય મેનૂ પર પાછા'],
    hi: ['🚜 ट्रैक्टर', '⚙️ रोटावेटर', '🌾 थ्रेशर', '💧 वाटर पंप', '🌿 स्प्रेयर', '🏠 मुख्य मेनू पर वापस'],
    en: ['🚜 Tractor', '⚙️ Rotavator', '🌾 Thresher', '💧 Water Pump', '🌿 Sprayer', '🏠 Back to Main Menu'],
  },

  equipment_types_raw: ['Tractor', 'Rotavator', 'Thresher', 'Water Pump', 'Sprayer'],

  ask_booking_date: {
    gu: `કઈ તારીખ જોઈએ? (DD-MM-YYYY ફોર્મેટ માં ટાઈપ કરો, જેમ કે 20-06-2026)`,
    hi: `कौन सी तारीख चाहिए? (DD-MM-YYYY फॉर्मेट में टाइप करें, जैसे 20-06-2026)`,
    en: `Which date do you need? (Type in DD-MM-YYYY format, e.g. 20-06-2026)`,
  },

  no_equipment_found: {
    gu: `😔 10km ની અંદર કોઈ *{type}* ઉપલબ્ધ નથી.\n\nથોડા સમય પછી ફરી ચકાસો.`,
    hi: `😔 10km के भीतर कोई *{type}* उपलब्ध नहीं है.\n\nथोड़ी देर बाद फिर जांचें.`,
    en: `😔 No *{type}* available within 10km.\n\nCheck again later.`,
  },

  equipment_results_header: {
    gu: (type, radius) => `✅ નજીકના *${type}* મળ્યા (${radius}km માં):`,
    hi: (type, radius) => `✅ नज़दीकी *${type}* मिले (${radius}km में):`,
    en: (type, radius) => `✅ Nearby *${type}* found (within ${radius}km):`,
  },

  equipment_card: {
    gu: (i, name, village, rate, rating, dist) =>
      `*${i}.* 👤 ${name} — ${village}\n💰 ₹${rate}/દિવસ  ⭐ ${rating}\n📍 ${dist} દૂર`,
    hi: (i, name, village, rate, rating, dist) =>
      `*${i}.* 👤 ${name} — ${village}\n💰 ₹${rate}/दिन  ⭐ ${rating}\n📍 ${dist} दूर`,
    en: (i, name, village, rate, rating, dist) =>
      `*${i}.* 👤 ${name} — ${village}\n💰 ₹${rate}/day  ⭐ ${rating}\n📍 ${dist} away`,
  },

  ask_select_listing: {
    gu: `કઈ પસંદ કરો? (1 / 2 / 3 ટાઈપ કરો)`,
    hi: `कौन सा चुनें? (1 / 2 / 3 टाइप करें)`,
    en: `Which one to book? (Type 1 / 2 / 3)`,
  },

  // ── Equipment Listing (owner side) ──────────────────────────────────────────

  ask_list_equipment_type: {
    gu: `કયા પ્રકારનું સાધન ભાડે આપવા માંગો છો?`,
    hi: `किस प्रकार का उपकरण किराए पर देना चाहते हैं?`,
    en: `What type of equipment do you want to list?`,
  },

  ask_daily_rate: {
    gu: `દૈનિક ભાડું ₹ (ફક્ત નંબર ટાઈપ કરો, જેમ કે 800):`,
    hi: `दैनिक किराया ₹ (केवल नंबर टाइप करें, जैसे 800):`,
    en: `Daily rate ₹ (type number only, e.g. 800):`,
  },

  listing_created: {
    gu: (type, rate) => `✅ તમારો *${type}* ₹${rate}/દિવસ ના ભાવે listed થઈ ગયો!\n\nજ્યારે કોઈ book કરશે ત્યારે તમને WhatsApp message આવશે.`,
    hi: (type, rate) => `✅ आपका *${type}* ₹${rate}/दिन पर listed हो गया!\n\nजब कोई book करेगा तो आपको WhatsApp message मिलेगा.`,
    en: (type, rate) => `✅ Your *${type}* listed at ₹${rate}/day!\n\nYou'll get a WhatsApp message when someone books.`,
  },

  // ── Labour Search ────────────────────────────────────────────────────────────

  ask_labour_skill: {
    gu: `કઈ પ્રકારનું કામ જોઈએ?`,
    hi: `किस प्रकार का काम चाहिए?`,
    en: `What type of work do you need?`,
  },

  labour_skills: {
    gu: ['🌾 વાવણી', '🌽 લણણી', '💧 સિંચાઈ', '🌿 નીંદણ', '🔧 સામાન્ય', '🏠 મુખ્ય મેનૂ પર પાછા'],
    hi: ['🌾 बुवाई', '🌽 कटाई', '💧 सिंचाई', '🌿 निराई', '🔧 सामान्य', '🏠 मुख्य मेनू पर वापस'],
    en: ['🌾 Sowing', '🌽 Harvesting', '💧 Irrigation', '🌿 Weeding', '🔧 General', '🏠 Back to Main Menu'],
  },

  labour_skills_raw: ['sowing', 'harvesting', 'irrigation', 'weeding', 'general'],

  ask_worker_count: {
    gu: `કેટલા મજૂર જોઈએ? (નંબર ટાઈપ કરો):`,
    hi: `कितने मजदूर चाहिए? (नंबर टाइप करें):`,
    en: `How many workers do you need? (Type number):`,
  },

  no_labour_found: {
    gu: `😔 10km ની અંદર *{skill}* માટે કોઈ મજૂર ઉપલબ્ધ નથી.`,
    hi: `😔 10km के भीतर *{skill}* के लिए कोई मजदूर उपलब्ध नहीं है.`,
    en: `😔 No workers available for *{skill}* within 10km.`,
  },

  labour_results_header: {
    gu: (skill, radius) => `✅ *${skill}* માટે નજીકના મજૂર (${radius}km માં):`,
    hi: (skill, radius) => `✅ *${skill}* के लिए नज़दीकी मजदूर (${radius}km में):`,
    en: (skill, radius) => `✅ Nearby workers for *${skill}* (within ${radius}km):`,
  },

  labour_card: {
    gu: (i, name, village, rate, rating, dist) =>
      `*${i}.* 👤 ${name} — ${village}\n💰 ₹${rate}/દિવસ  ⭐ ${rating}\n📍 ${dist} દૂર`,
    hi: (i, name, village, rate, rating, dist) =>
      `*${i}.* 👤 ${name} — ${village}\n💰 ₹${rate}/दिन  ⭐ ${rating}\n📍 ${dist} दूर`,
    en: (i, name, village, rate, rating, dist) =>
      `*${i}.* 👤 ${name} — ${village}\n💰 ₹${rate}/day  ⭐ ${rating}\n📍 ${dist} away`,
  },

  // ── Labour Listing (worker side) ─────────────────────────────────────────────

  ask_worker_skill: {
    gu: `તમે કઈ પ્રકારનું કામ કરો છો? (બધા લાગુ પડે તે પસંદ કરો — 1,2,3 ટાઈપ કરો)`,
    hi: `आप किस प्रकार का काम करते हैं? (सभी लागू चुनें — 1,2,3 टाइप करें)`,
    en: `What type of work do you do? (Select all that apply — type 1,2,3)`,
  },

  ask_worker_daily_rate: {
    gu: `દૈનિક મજૂરી ₹ (ફક્ત નંબર, જેમ કે 400):`,
    hi: `दैनिक मजदूरी ₹ (केवल नंबर, जैसे 400):`,
    en: `Daily wage ₹ (number only, e.g. 400):`,
  },

  worker_listed: {
    gu: (name) => `✅ *${name}*, તમે કામ માટે listed થઈ ગયા!\n\nજ્યારે કોઈ ખેડૂત ઈચ્છશે ત્યારે WhatsApp message આવશે.`,
    hi: (name) => `✅ *${name}*, आप काम के लिए listed हो गए!\n\nजब कोई किसान चाहेगा तो WhatsApp message आएगा.`,
    en: (name) => `✅ *${name}*, you are now listed for work!\n\nYou'll get a WhatsApp message when a farmer needs you.`,
  },

  // ── Booking Confirmation ─────────────────────────────────────────────────────

  booking_confirm_equipment: {
    gu: (name, type, date, rate, phone) =>
      `✅ *બુકિંગ Confirmed!*\n\n🚜 સાધન: *${type}*\n👤 માલિક: *${name}*\n📅 તારીખ: ${date}\n💰 ભાવ: ₹${rate}/દિવસ\n📞 સંપર્ક: ${phone}\n\n_માલિક ને notification ગઈ છે. સીધો સંપર્ક કરી શકો છો._`,
    hi: (name, type, date, rate, phone) =>
      `✅ *बुकिंग Confirmed!*\n\n🚜 उपकरण: *${type}*\n👤 मालिक: *${name}*\n📅 तारीख: ${date}\n💰 किराया: ₹${rate}/दिन\n📞 संपर्क: ${phone}\n\n_मालिक को notification भेजी गई है। सीधे संपर्क कर सकते हैं।_`,
    en: (name, type, date, rate, phone) =>
      `✅ *Booking Confirmed!*\n\n🚜 Equipment: *${type}*\n👤 Owner: *${name}*\n📅 Date: ${date}\n💰 Rate: ₹${rate}/day\n📞 Contact: ${phone}\n\n_Owner has been notified. You can contact them directly._`,
  },

  booking_confirm_labour: {
    gu: (name, skill, date, rate, phone) =>
      `✅ *બુકિંગ Confirmed!*\n\n🌾 કામ: *${skill}*\n👤 મજૂર: *${name}*\n📅 તારીખ: ${date}\n💰 મજૂરી: ₹${rate}/દિવસ\n📞 સંપર્ક: ${phone}\n\n_મજૂર ને notification ગઈ છે. સીધો સંપર્ક કરી શકો છો._`,
    hi: (name, skill, date, rate, phone) =>
      `✅ *बुकिंग Confirmed!*\n\n🌾 काम: *${skill}*\n👤 मजदूर: *${name}*\n📅 तारीख: ${date}\n💰 मजदूरी: ₹${rate}/दिन\n📞 संपर्क: ${phone}\n\n_मजदूर को notification भेजी गई है। सीधे संपर्क कर सकते हैं।_`,
    en: (name, skill, date, rate, phone) =>
      `✅ *Booking Confirmed!*\n\n🌾 Work: *${skill}*\n👤 Worker: *${name}*\n📅 Date: ${date}\n💰 Wage: ₹${rate}/day\n📞 Contact: ${phone}\n\n_Worker has been notified. You can contact them directly._`,
  },

  // ── Owner/Worker Notification ────────────────────────────────────────────────

  notify_owner_equipment: {
    gu: (farmerName, type, date, rate, farmerPhone) =>
      `🔔 *નવી બુકિંગ!*\n\n🚜 સાધન: *${type}*\n👤 ખેડૂત: *${farmerName}*\n📅 તારીખ: ${date}\n💰 ભાવ: ₹${rate}/દિવસ\n📞 સંપર્ક: ${farmerPhone}\n\n_KissanLink_`,
    hi: (farmerName, type, date, rate, farmerPhone) =>
      `🔔 *नई बुकिंग!*\n\n🚜 उपकरण: *${type}*\n👤 किसान: *${farmerName}*\n📅 तारीख: ${date}\n💰 किराया: ₹${rate}/दिन\n📞 संपर्क: ${farmerPhone}\n\n_KissanLink_`,
    en: (farmerName, type, date, rate, farmerPhone) =>
      `🔔 *New Booking!*\n\n🚜 Equipment: *${type}*\n👤 Farmer: *${farmerName}*\n📅 Date: ${date}\n💰 Rate: ₹${rate}/day\n📞 Contact: ${farmerPhone}\n\n_KissanLink_`,
  },

  notify_worker_labour: {
    gu: (farmerName, skill, date, rate, farmerPhone) =>
      `🔔 *કામ મળ્યું!*\n\n🌾 કામ: *${skill}*\n👤 ખેડૂત: *${farmerName}*\n📅 તારીખ: ${date}\n💰 મજૂરી: ₹${rate}/દિવસ\n📞 સંપર્ક: ${farmerPhone}\n\n_KissanLink_`,
    hi: (farmerName, skill, date, rate, farmerPhone) =>
      `🔔 *काम मिला!*\n\n🌾 काम: *${skill}*\n👤 किसान: *${farmerName}*\n📅 तारीख: ${date}\n💰 मजदूरी: ₹${rate}/दिन\n📞 संपर्क: ${farmerPhone}\n\n_KissanLink_`,
    en: (farmerName, skill, date, rate, farmerPhone) =>
      `🔔 *Work Assigned!*\n\n🌾 Work: *${skill}*\n👤 Farmer: *${farmerName}*\n📅 Date: ${date}\n💰 Wage: ₹${rate}/day\n📞 Contact: ${farmerPhone}\n\n_KissanLink_`,
  },

  // ── Rating ───────────────────────────────────────────────────────────────────

  rating_prompt: {
    gu: (name, type) =>
      `⭐ *${name}* સાથે *${type}* ની બુકિંગ પૂરી થઈ!\n\n1 થી 5 માં rating આપો:\n1⃣ 2⃣ 3⃣ 4⃣ 5⃣`,
    hi: (name, type) =>
      `⭐ *${name}* के साथ *${type}* की बुकिंग पूरी हुई!\n\n1 से 5 में rating दें:\n1⃣ 2⃣ 3⃣ 4⃣ 5⃣`,
    en: (name, type) =>
      `⭐ Booking with *${name}* for *${type}* completed!\n\nRate them 1 to 5:\n1⃣ 2⃣ 3⃣ 4⃣ 5⃣`,
  },

  rating_saved: {
    gu: (stars) => `✅ ${stars}⭐ rating સેવ થઈ. આભાર!`,
    hi: (stars) => `✅ ${stars}⭐ rating सेव हो गई. धन्यवाद!`,
    en: (stars) => `✅ ${stars}⭐ rating saved. Thank you!`,
  },

  // ── Profile ──────────────────────────────────────────────────────────────────

  profile_view: {
    gu: (name, village, roles, rating, count) =>
      `👤 *મારી પ્રોફાઇલ*\n\n📛 નામ: ${name}\n🏘️ ગામ: ${village}\n🎭 ભૂમિકા: ${roles}\n⭐ Rating: ${rating} (${count} reviews)\n\nશું બદલવું છે?`,
    hi: (name, village, roles, rating, count) =>
      `👤 *मेरी प्रोफाइल*\n\n📛 नाम: ${name}\n🏘️ गांव: ${village}\n🎭 भूमिका: ${roles}\n⭐ Rating: ${rating} (${count} reviews)\n\nक्या बदलना है?`,
    en: (name, village, roles, rating, count) =>
      `👤 *My Profile*\n\n📛 Name: ${name}\n🏘️ Village: ${village}\n🎭 Roles: ${roles}\n⭐ Rating: ${rating} (${count} reviews)\n\nWhat would you like to update?`,
  },

  profile_options: {
    gu: ['✏️ નામ બદલો', '📍 લોકેશન અપડેટ કરો', '🌐 ભાષા બદલો', '🔙 મુખ્ય મેનૂ'],
    hi: ['✏️ नाम बदलें', '📍 लोकेशन अपडेट करें', '🌐 भाषा बदलें', '🔙 मुख्य मेनू'],
    en: ['✏️ Change Name', '📍 Update Location', '🌐 Change Language', '🔙 Main Menu'],
  },

  // note: profile option 4 = back to main menu (handled in profile handler)
  // type 0 at any point also returns to main menu

  // ── Generic ──────────────────────────────────────────────────────────────────

  invalid_input: {
    gu: `⚠️ માફ કરજો, હું સમજ્યો નહીં. નીચેના વિકલ્પોમાંથી પસંდ કરો.`,
    hi: `⚠️ माफ करें, मैं समझ नहीं पाया. नीचे के विकल्पों में से चुनें.`,
    en: `⚠️ Sorry, I didn't understand. Please choose from the options below.`,
  },

  invalid_date: {
    gu: `⚠️ ખોટી તારીખ. DD-MM-YYYY ફોર્મેટ માં ટાઈપ કરો (જેમ કે 20-06-2026):`,
    hi: `⚠️ गलत तारीख. DD-MM-YYYY फॉर्मेट में टाइप करें (जैसे 20-06-2026):`,
    en: `⚠️ Invalid date. Type in DD-MM-YYYY format (e.g. 20-06-2026):`,
  },

  invalid_number: {
    gu: `⚠️ ફક્ત નંબર ટાઈપ કરો:`,
    hi: `⚠️ केवल नंबर टाइप करें:`,
    en: `⚠️ Please type a number only:`,
  },

  back_hint: {
    gu: `_(0 ટાઈપ કરો = મુખ્ય મેનૂ)_`,
    hi: `_(0 टाइप करें = मुख्य मेनू)_`,
    en: `_(type 0 = main menu)_`,
  },

  back_to_menu: {
    gu: `🔙 મુખ્ય મેનૂ`,
    hi: `🔙 मुख्य मेनू`,
    en: `🔙 Main Menu`,
  },

  language_options: ['🇮🇳 ગુજરાતી', '🇮🇳 हिंदी', '🇬🇧 English'],

  name_updated: {
    gu: (name) => `✅ નામ *${name}* અપડેટ થઈ ગયું.`,
    hi: (name) => `✅ नाम *${name}* अपडेट हो गया.`,
    en: (name) => `✅ Name updated to *${name}*.`,
  },

  location_updated: {
    gu: `✅ લોકેશન અપડેટ થઈ ગઈ.`,
    hi: `✅ लोकेशन अपडेट हो गई.`,
    en: `✅ Location updated.`,
  },

  language_updated: {
    gu: `✅ ભાષા ગુજરાતી સેટ થઈ.`,
    hi: `✅ भाषा हिंदी सेट हो गई.`,
    en: `✅ Language set to English.`,
  },
};

/**
 * Get a string in the user's language
 * @param {string} key - key in strings object
 * @param {string} lang - 'gu' | 'hi' | 'en'
 * @param {...any} args - optional args if the value is a function
 */
function t(key, lang = 'gu', ...args) {
  const entry = strings[key];
  if (!entry) return `[missing: ${key}]`;
  const val = entry[lang] || entry['en'];
  if (typeof val === 'function') return val(...args);
  return val;
}

module.exports = { strings, t };
