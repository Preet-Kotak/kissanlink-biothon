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
    gu: ['🚜 સાધન ભાડે લો', '👷 મજૂર શોધો', '📋 સાધન ભાડે આપો', '💼 કામ ઓફર કરો', '⚙️ મારી પ્રોફાઇલ', '📅 મારા Bookings'],
    hi: ['🚜 उपकरण किराए पर लें', '👷 मजदूर खोजें', '📋 उपकरण किराए पर दें', '💼 काम ऑफर करें', '⚙️ मेरी प्रोफाइल', '📅 मेरे Bookings'],
    en: ['🚜 Rent Equipment', '👷 Find Labour', '📋 List My Equipment', '💼 Offer Work', '⚙️ My Profile', '📅 My Bookings'],
  },

  my_bookings_placeholder: {
    gu: `📅 મારા Bookings\n\n_આ ફીચર જલ્દી ઉપલબ્ધ થશે._`,
    hi: `📅 मेरे Bookings\n\n_यह फीचर जल्द उपलब्ध होगा._`,
    en: `📅 My Bookings\n\n_This feature will be available soon._`,
  },

  // ── My Bookings (Task 4 - Part 10) ──────────────────────────────────────────

  my_bookings_header: {
    gu: `📅 *મારા Bookings*`,
    hi: `📅 *मेरे Bookings*`,
    en: `📅 *My Bookings*`,
  },

  my_bookings_empty: {
    gu: `📭 કોઈ active bookings નથી.\n\nસાધન book કરો અથવા સેવાઓ આપો મુખ્ય મેનૂ થી.`,
    hi: `📭 कोई active bookings नहीं।\n\nउपकरण book करें या सेवाएं दें मुख्य मेनू से.`,
    en: `📭 No active bookings.\n\nBook equipment or offer services from main menu.`,
  },

  my_bookings_footer: {
    gu: `સંખ્યા પસંદ કરો અથવા 0 માટે મુખ્ય મેનૂ`,
    hi: `संख्या चुनें या 0 मुख्य मेनू`,
    en: `Select number or 0 for main menu`,
  },

  booking_detail_message: {
    gu: (item, date, dailyRate, totalRate, status, otherName, otherPhone, bookingId) =>
      `📋 *બુકિંગ વિગતો*\n\n` +
      `🚜 વસ્તુ: ${item}\n` +
      `📅 તારીખ: ${date}\n` +
      `💰 દર: ₹${dailyRate}/દિવસ (કુલ: ₹${totalRate})\n` +
      `${status}\n` +
      `👤 ${otherName}\n` +
      `📞 ${otherPhone}\n` +
      `🆔 બુકિંગ ID: ${bookingId}\n\n` +
      `1. બુકિંગ રદ કરો\n` +
      `2. ${otherName} ને સંપર્ક કરો\n` +
      `0. પાછળ`,
    hi: (item, date, dailyRate, totalRate, status, otherName, otherPhone, bookingId) =>
      `📋 *बुकिंग विवरण*\n\n` +
      `🚜 वस्तु: ${item}\n` +
      `📅 तारीख: ${date}\n` +
      `💰 किराया: ₹${dailyRate}/दिन (कुल: ₹${totalRate})\n` +
      `${status}\n` +
      `👤 ${otherName}\n` +
      `📞 ${otherPhone}\n` +
      `🆔 बुकिंग ID: ${bookingId}\n\n` +
      `1. बुकिंग रद्द करें\n` +
      `2. ${otherName} से संपर्क करें\n` +
      `0. वापस`,
    en: (item, date, dailyRate, totalRate, status, otherName, otherPhone, bookingId) =>
      `📋 *Booking Details*\n\n` +
      `🚜 Item: ${item}\n` +
      `📅 Date: ${date}\n` +
      `💰 Rate: ₹${dailyRate}/day (Total: ₹${totalRate})\n` +
      `${status}\n` +
      `👤 ${otherName}\n` +
      `📞 ${otherPhone}\n` +
      `🆔 Booking ID: ${bookingId}\n\n` +
      `1. Cancel Booking\n` +
      `2. Contact ${otherName}\n` +
      `0. Back`,
  },

  booking_not_found: {
    gu: `⚠️ Booking મળી નથી. મુખ્ય મેનૂ પર પાછા જાઓ.`,
    hi: `⚠️ Booking नहीं मिली. मुख्य मेनू पर वापस जाएं.`,
    en: `⚠️ Booking not found. Returning to main menu.`,
  },

  cancel_booking_confirm: {
    gu: (name, date) => `${name} સાથેની ${date}ની બુકિંગ રદ કરવી છે?\n\n1 લખો રદ કરવા અથવા 0 મુખ્ય મેનૂ માટે.`,
    hi: (name, date) => `${name} के साथ ${date} की बुकिंग रद्द करनी है?\n\n1 लिखें रद्द करने के लिए या 0 मुख्य मेनू.`,
    en: (name, date) => `Cancel booking with ${name} on ${date}?\n\nType 1 to confirm or 0 for main menu.`,
  },

  type_1_or_0: {
    gu: `કૃપા કરીને 1 લખો રદ કરવા અથવા 0 મુખ્ય મેનૂ માટે.`,
    hi: `कृपया 1 लिखें रद्द करने के लिए या 0 मुख्य मेनू.`,
    en: `Please type 1 to confirm cancellation or 0 for main menu.`,
  },

  cancellation_reason_prompt: {
    gu: `રદ કરવાનું કારણ?\n\n1 લખો છોડી દેવા માટે અથવા કારણ લખો.`,
    hi: `रद्द करने का कारण?\n\n1 लिखें छोड़ने के लिए या कारण लिखें.`,
    en: `Reason for cancellation?\n\nType 1 to skip or enter reason.`,
  },

  booking_cancelled_success: {
    gu: `✅ Booking cancelled. બીજી પાર્ટીને notify કર્યા છે.`,
    hi: `✅ Booking cancelled. दूसरी पार्टी को notify किया गया.`,
    en: `✅ Booking cancelled. Other party has been notified.`,
  },

  booking_cancelled_notification: {
    gu: (canceller, item, date, reason) =>
      `❌ ${canceller}એ ${date}ની ${item} booking cancel કરી.\n\nકારણ: ${reason}`,
    hi: (canceller, item, date, reason) =>
      `❌ ${canceller} ने ${date} की ${item} booking cancel की।\n\nकारण: ${reason}`,
    en: (canceller, item, date, reason) =>
      `❌ ${canceller} cancelled the ${item} booking for ${date}.\n\nReason: ${reason}`,
  },

  contact_info: {
    gu: (name, phone) => `📞 ${name}\nફોન: ${phone}`,
    hi: (name, phone) => `📞 ${name}\nफोन: ${phone}`,
    en: (name, phone) => `📞 ${name}\nPhone: ${phone}`,
  },

  // ── Multi-Day Bookings (Task 4 - Part 3) ────────────────────────────────────

  booking_days_prompt: {
    gu: `કેટલા દિવસ માટે જોઈએ છે?\n\n1. એક દિવસ\n2. ઘણા દિવસ (સંખ્યા દાખલ કરો)\n0. મુખ્ય મેનૂ`,
    hi: `कितने दिन के लिए चाहिए?\n\n1. एक दिन\n2. कई दिन (संख्या दर्ज करें)\n0. मुख्य मेनू`,
    en: `How many days?\n\n1. Single day\n2. Multiple days (enter number)\n0. Main menu`,
  },

  booking_days_custom_prompt: {
    gu: `કેટલા દિવસ માટે જોઈએ છે? (1-30 દાખલ કરો):`,
    hi: `कितने दिन के लिए चाहिए? (1-30 दर्ज करें):`,
    en: `How many days do you need? (Enter 1-30):`,
  },

  invalid_days: {
    gu: `⚠️ અમાન્ય દિવસો. 1 થી 30 ની વચ્ચે સંખ્યા દાખલ કરો.`,
    hi: `⚠️ अमान्य दिन. 1 से 30 के बीच संख्या दर्ज करें.`,
    en: `⚠️ Invalid days. Enter a number between 1 and 30.`,
  },

  // ── TASK 1: Enhanced Date Selection UI ─────────────────────────────────────

  eq_search_date_prompt: {
    gu: (tomorrow, inWeek) => `તમારે ક્યારે સાધન જોઈએ છે?\n\n1. આવતીકાલે (${tomorrow})\n2. એક અઠવાડિયામાં (${inWeek})\n3. તારીખ દાખલ કરો\n0. મુખ્ય મેનૂ`,
    hi: (tomorrow, inWeek) => `आपको उपकरण कब चाहिए?\n\n1. कल (${tomorrow})\n2. एक हफ्ते में (${inWeek})\n3. तारीख दर्ज करें\n0. मुख्य मेनू`,
    en: (tomorrow, inWeek) => `When do you need equipment?\n\n1. Tomorrow (${tomorrow})\n2. In a week (${inWeek})\n3. Enter custom date\n0. Main menu`
  },

  lab_search_date_prompt: {
    gu: (tomorrow, inWeek) => `તમારે ક્યારે મજૂર જોઈએ છે?\n\n1. આવતીકાલે (${tomorrow})\n2. એક અઠવાડિયામાં (${inWeek})\n3. તારીખ દાખલ કરો\n0. મુખ્ય મેનૂ`,
    hi: (tomorrow, inWeek) => `आपको मजदूर कब चाहिए?\n\n1. कल (${tomorrow})\n2. एक हफ्ते में (${inWeek})\n3. तारीख दर्ज करें\n0. मुख्य मेनू`,
    en: (tomorrow, inWeek) => `When do you need workers?\n\n1. Tomorrow (${tomorrow})\n2. In a week (${inWeek})\n3. Enter custom date\n0. Main menu`
  },

  eq_search_date_custom_prompt: {
    gu: `કઈ તારીખ જોઈએ? (DD-MM-YYYY ફોર્મેટ માં ટાઈપ કરો, જેમ કે 15-07-2026)`,
    hi: `कौन सी तारीख चाहिए? (DD-MM-YYYY फॉर्मेट में टाइप करें, जैसे 15-07-2026)`,
    en: `Enter custom date in DD-MM-YYYY format (e.g. 15-07-2026):`
  },

  lab_search_date_custom_prompt: {
    gu: `કઈ તારીખ જોઈએ? (DD-MM-YYYY ફોર્મેટ માં ટાઈપ કરો, જેમ કે 15-07-2026)`,
    hi: `कौन सी तारीख चाहिए? (DD-MM-YYYY फॉर्मेट में टाइप करें, जैसे 15-07-2026)`,
    en: `Enter custom date in DD-MM-YYYY format (e.g. 15-07-2026):`
  },

  date_invalid_format: {
    gu: `⚠️ ખોટી તારીખ. DD-MM-YYYY ફોર્મેટ માં ટાઈપ કરો (જેમ કે 15-07-2026):`,
    hi: `⚠️ गलत तारीख. DD-MM-YYYY फॉर्मेट में टाइप करें (जैसे 15-07-2026):`,
    en: `⚠️ Invalid format. Use DD-MM-YYYY (e.g. 15-07-2026):`,
  },

  date_in_past: {
    gu: `⚠️ માફ કરજો, તારીખ વીતી ગયેલ સમયની ના હોઈ શકે.`,
    hi: `⚠️ माफ़ करें, तारीख बीते हुए समय की नहीं हो सकती।`,
    en: `⚠️ Date cannot be in the past.`
  },

  date_too_far_ahead: {
    gu: `⚠️ માફ કરજો, તમે માત્ર 30 દિવસ સુધીનું જ બુકિંગ કરી શકો છો. કોઈ વહેલી તારીખ પસંદ કરો.`,
    hi: `⚠️ माफ़ करें, आप केवल 30 दिनों तक की बुकिंग कर सकते हैं। कोई पहले की तारीख चुनें।`,
    en: `⚠️ Bookings only allowed up to 30 days ahead. Please choose an earlier date.`
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

  no_listings_found: {
    gu: `😔 નજીકમાં કોઈ ઉપલબ્ધ નથી. કૃપા કરીને બીજી શોધ કરવાનો પ્રયાસ કરો.`,
    hi: `😔 पास में कोई उपलब्ध नहीं है। कृपया कोई अन्य खोज करने का प्रयास करें।`,
    en: `😔 No listings found nearby. Try another search.`
  },
  
  eq_search_results_header: {
    gu: `🚜 ઉપલબ્ધ સાધનો:`,
    hi: `🚜 उपलब्ध उपकरण:`,
    en: `🚜 Available Equipment:`
  },

  eq_search_results_footer: {
    gu: `\nકોઈ નંબર પસંદ કરો અથવા મુખ્ય મેનૂ માટે 0 દબાવો`,
    hi: `\nकोई नंबर चुनें या मुख्य मेनू के लिए 0 दबाएं`,
    en: `\nSelect a number or 0 for main menu`
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
    gu: `કઈ પસંદ કરો? (નંબર ટાઈપ કરો)`,
    hi: `कौन सा चुनें? (नंबर टाइप करें)`,
    en: `Which one to book? (Type number)`,
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

  lab_search_results_header: {
    gu: `👷 ઉપલબ્ધ મજૂરો:`,
    hi: `👷 उपलब्ध मजदूर:`,
    en: `👷 Available Workers:`
  },

  lab_search_results_footer: {
    gu: `\nકોઈ નંબર પસંદ કરો અથવા મુખ્ય મેનૂ માટે 0 દબાવો`,
    hi: `\nकोई नंबर चुनें या मुख्य मेनू के लिए 0 दबाएं`,
    en: `\nSelect a number or 0 for main menu`
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

  // ── TASK 1: Booking Handshake Notifications ─────────────────────────────────

  listing_just_booked: {
    gu: `⚠️ માફ કરજો, કોઈએ હમણાં જ આ બુક કરી લીધું છે. કૃપા કરીને બીજું પસંદ કરો.`,
    hi: `⚠️ माफ़ करें, किसी ने अभी इसे बुक कर लिया है। कृपया दूसरा चुनें।`,
    en: `⚠️ Sorry, someone just booked this. Please choose another.`
  },

  eq_booking_created_farmer: {
    gu: (ownerName, phone) => `✅ રિક્વેસ્ટ ${ownerName} ને મોકલવામાં આવી છે. તેમનો નંબર: ${phone}. તેઓ જલ્દી કન્ફર્મ કરશે.`,
    hi: (ownerName, phone) => `✅ रिक्वेस्ट ${ownerName} को भेज दी गई है। उनका नंबर: ${phone}। वे जल्द ही कन्फर्म करेंगे।`,
    en: (ownerName, phone) => `✅ Request sent to ${ownerName}. Their number: ${phone}. They'll confirm soon.`
  },

  eq_booking_request_provider: {
    gu: (farmerName, farmerPhone, item, date, rate) => `🔔 ${farmerName} (${farmerPhone}) ને ${date} ના રોજ ₹${rate} માં તમારું ${item} જોઈએ છે.\n\nજવાબ આપો:\n1 મંજૂર કરવા\n2 ના પાડવા`,
    hi: (farmerName, farmerPhone, item, date, rate) => `🔔 ${farmerName} (${farmerPhone}) को ${date} को ₹${rate} में आपका ${item} चाहिए।\n\nजवाब दें:\n1 मंजूर करने के लिए\n2 मना करने के लिए`,
    en: (farmerName, farmerPhone, item, date, rate) => `🔔 ${farmerName} (${farmerPhone}) wants your ${item} on ${date} for ₹${rate}.\n\nReply:\n1 to Accept\n2 to Decline`
  },

  lab_booking_created_farmer: {
    gu: (workerName, phone) => `✅ રિક્વેસ્ટ ${workerName} ને મોકલવામાં આવી છે. તેમનો નંબર: ${phone}. તેઓ જલ્દી કન્ફર્મ કરશે.`,
    hi: (workerName, phone) => `✅ रिक्वेस्ट ${workerName} को भेज दी गई है। उनका नंबर: ${phone}। वे जल्द ही कन्फर्म करेंगे।`,
    en: (workerName, phone) => `✅ Request sent to ${workerName}. Their number: ${phone}. They'll confirm soon.`
  },

  lab_booking_request_provider: {
    gu: (farmerName, farmerPhone, skill, date, rate) => `🔔 ${farmerName} (${farmerPhone}) ને ${date} ના રોજ ₹${rate} માં તમારું ${skill} કામ જોઈએ છે.\n\nજવાબ આપો:\n1 મંજૂર કરવા\n2 ના પાડવા`,
    hi: (farmerName, farmerPhone, skill, date, rate) => `🔔 ${farmerName} (${farmerPhone}) को ${date} को ₹${rate} में आपका ${skill} काम चाहिए।\n\nजवाब दें:\n1 मंजूर करने के लिए\n2 मना करने के लिए`,
    en: (farmerName, farmerPhone, skill, date, rate) => `🔔 ${farmerName} (${farmerPhone}) wants your ${skill} work on ${date} for ₹${rate}.\n\nReply:\n1 to Accept\n2 to Decline`
  },

  booking_confirmed_farmer: {
    gu: (providerName, date) => `✅ ${providerName} એ ${date} માટે તમારું બુકિંગ કન્ફર્મ કર્યું છે!`,
    hi: (providerName, date) => `✅ ${providerName} ने ${date} के लिए आपकी बुकिंग कन्फर्म कर दी है!`,
    en: (providerName, date) => `✅ ${providerName} confirmed your booking for ${date}!`
  },

  booking_confirmed_provider: {
    gu: (farmerName) => `✅ ${farmerName} સાથે બુકિંગ કન્ફર્મ થયું.`,
    hi: (farmerName) => `✅ ${farmerName} के साथ बुकिंग कन्फर्म हुई।`,
    en: (farmerName) => `✅ Booking confirmed with ${farmerName}.`
  },

  booking_declined_farmer: {
    gu: (providerName) => `માફ કરજો, ${providerName} એ ના પાડી છે. અહીં અન્ય વિકલ્પો છે...`,
    hi: (providerName) => `माफ़ करें, ${providerName} ने मना कर दिया है। यहाँ अन्य विकल्प हैं...`,
    en: (providerName) => `Sorry, ${providerName} declined. Here are other options...`
  },

  booking_expired: {
    gu: `⏰ તમારી બુકિંગ રિક્વેસ્ટ એક્સપાયર થઈ ગઈ છે (8 કલાક). કૃપા કરીને બીજા પ્રોવાઈડરનો પ્રયાસ કરો.`,
    hi: `⏰ आपकी बुकिंग रिक्वेस्ट एक्सपायर हो गई है (8 घंटे)। कृपया दूसरे प्रोवाइडर का प्रयास करें।`,
    en: `⏰ Your booking request expired (8 hours). Try another provider.`
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

  // ── Rating Abuse Prevention (Task 4) ────────────────────────────────────────

  cannot_rate_self: {
    gu: `⚠️ તમે તમારી જાતને rate કરી શકતા નથી.`,
    hi: `⚠️ आप खुद को rate नहीं कर सकते।`,
    en: `⚠️ You cannot rate yourself.`,
  },

  already_rated: {
    gu: `⚠️ તમે આ booking માટે પહેલાથી rate આપ્યું છે.`,
    hi: `⚠️ आपने पहले से इस booking के लिए rate दिया है।`,
    en: `⚠️ You've already rated this booking.`,
  },

  not_booking_participant: {
    gu: `⚠️ તમે આ booking નો ભાગ નથી.`,
    hi: `⚠️ आप इस booking के हिस्से नहीं हैं।`,
    en: `⚠️ You're not part of this booking.`,
  },

  // ── Profile ──────────────────────────────────────────────────────────────────

  profile_view: {
    gu: (name, village, languageDisplay, roles) =>
      `👤 *મારી પ્રોફાઇલ*\n\n📛 નામ: ${name}\n🏘️ ગામ: ${village}\n🌐 ભાષા: ${languageDisplay}\n🎭 ભૂમિકા: ${roles}\n\nશું બદલવું છે?`,
    hi: (name, village, languageDisplay, roles) =>
      `👤 *मेरी प्रोफाइल*\n\n📛 नाम: ${name}\n🏘️ गांव: ${village}\n🌐 भाषा: ${languageDisplay}\n🎭 भूमिका: ${roles}\n\nक्या बदलना है?`,
    en: (name, village, languageDisplay, roles) =>
      `👤 *My Profile*\n\n📛 Name: ${name}\n🏘️ Village: ${village}\n🌐 Language: ${languageDisplay}\n🎭 Roles: ${roles}\n\nWhat would you like to update?`,
  },

  profile_options: {
    gu: ['✏️ નામ બદલો', '📍 લોકેશન અપડેટ કરો', '🌐 ભાષા બદલો', '🏘️ ગામ બદલો', '📋 મારા Listings', '🔙 મુખ્ય મેનૂ'],
    hi: ['✏️ नाम बदलें', '📍 लोकेशन अपडेट करें', '🌐 भाषा बदलें', '🏘️ गांव बदलें', '📋 मेरे Listings', '🔙 मुख्य मेनू'],
    en: ['✏️ Change Name', '📍 Update Location', '🌐 Change Language', '🏘️ Change Village', '📋 My Listings', '🔙 Main Menu'],
  },

  village_prompt: {
    gu: `તમારા ગામનું નામ શું છે?`,
    hi: `आपके गांव का नाम क्या है?`,
    en: `What is your village name?`,
  },

  village_updated: {
    gu: (village) => `✅ ગામ અપડેટ થયું: ${village}`,
    hi: (village) => `✅ गांव अपडेट हुआ: ${village}`,
    en: (village) => `✅ Village updated: ${village}`,
  },

  // ── Generic ──────────────────────────────────────────────────────────────────

  system_error: {
    gu: `⚠️ કંઈક ખોટું થયું. કૃપા કરીને ફરી પ્રયાસ કરો.`,
    hi: `⚠️ कुछ गलत हुआ. कृपया फिर से प्रयास करें.`,
    en: `⚠️ Something went wrong. Please try again.`,
  },

  invalid_input: {
    gu: `⚠️ માફ કરજો, હું સમજ્યો નહીં. નીચેના વિકલ્પોમાંથી પસંદ કરો.`,
    hi: `⚠️ माफ करें, मैं समझ नहीं पाया. नीचे के विकल्पों में से चुनें.`,
    en: `⚠️ Sorry, I didn't understand. Please choose from the options below.`,
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

  //  --- photo Upload
  ask_PhotoUrl: {
    gu: "શું તમારી પાસે સાધનનો ફોટો છે? હમણાં મોકલો અથવા SKIP લખો",
    hi: "क्या आपके पास equipment की फोटो है? अभी भेजें या SKIP लिखें",
    en: "Do you have a photo of your equipment? Send it now or type SKIP"
  },

  photo_uploaded: {
    gu: "✅ ફોટો સાચવ્યો!",
    hi: "✅ फोटो सहेजी गई!",
    en: "✅ Photo saved!"
  },

  invalid_image: {
    gu: "⚠️ માન્ય ફોટો નથી. JPG/PNG મોકલો અથવા SKIP લખો.",
    hi: "⚠️ मान्य फोटो नहीं। JPG/PNG भेजें या SKIP लिखें।",
    en: "⚠️ Invalid photo. Send JPG/PNG or type SKIP."
  },

  ask_PhotoUrl_labour: {
    gu: "શું તમે તમારી પ્રોફાઇલ ફોટો ઉમેરવા માંગો છો? હમણાં મોકલો અથવા SKIP લખો",
    hi: "क्या आप अपनी प्रोफाइल फोटो जोड़ना चाहते हैं? अभी भेजें या SKIP लिखें",
    en: "Want to add your profile photo? Send it now or type SKIP"
  },

  my_listings_header: {
    gu: "📋 તમારા Listings:",
    hi: "📋 आपके Listings:",
    en: "📋 Your Listings:"
  },

  no_listings_owned: {
    gu: "તમારી કોઈ listing નથી. મુખ્ય મેનૂથી નવી listing બનાવો.",
    hi: "आपकी कोई listing नहीं। मुख्य मेनू से नई listing बनाएं।",
    en: "You don't have any listings. Create one from main menu."
  },

  listing_detail_menu: {
    gu: "1. Rate બદલો\n2. Availability toggle\n3. Dates manage કરો\n4. Delete\n0. પાછળ",
    hi: "1. Rate बदलें\n2. Availability toggle\n3. Dates manage करें\n4. Delete\n0. वापस",
    en: "1. Change Rate\n2. Toggle Availability\n3. Manage Dates\n4. Delete\n0. Back"
  },

  availability_menu: {
    gu: "📅 Availability:\n\n1. Dates block કરો\n2. Dates unblock કરો\n3. Blocked dates જુઓ\n0. પાછળ",
    hi: "📅 Availability:\n\n1. Dates block करें\n2. Dates unblock करें\n3. Blocked dates देखें\n0. वापस",
    en: "📅 Availability:\n\n1. Block dates\n2. Unblock dates\n3. View blocked dates\n0. Back"
  },

  block_dates_prompt: {
    gu: "કઈ તારીખો block કરવી છે? (DD-MM-YYYY, DD-MM-YYYY):",
    hi: "कौन सी तारीखें block करनी हैं? (DD-MM-YYYY, DD-MM-YYYY):",
    en: "Which dates to block? (DD-MM-YYYY, DD-MM-YYYY):"
  },

  date_has_booking: {
    gu: (date) => `⚠️ ${date}: Existing booking છે. પહેલા cancel કરો.`,
    hi: (date) => `⚠️ ${date}: Existing booking है। पहले cancel करें।`,
    en: (date) => `⚠️ ${date}: Existing booking. Cancel it first.`
  },

  dates_blocked_success: {
    gu: (count) => `✅ ${count} dates blocked.`,
    hi: (count) => `✅ ${count} dates blocked.`,
    en: (count) => `✅ ${count} dates blocked.`
  },

  delete_listing_confirm: {
    gu: "આ listing delete કરવી છે? YES લખો confirm કરવા માટે.",
    hi: "यह listing delete करनी है? YES लिखें confirm करने के लिए।",
    en: "Delete this listing? Type YES to confirm."
  },

  cannot_delete_has_bookings: {
    gu: "⚠️ Delete નથી થઈ શકતું - active bookings છે.",
    hi: "⚠️ Delete नहीं हो सकता - active bookings हैं।",
    en: "⚠️ Cannot delete - you have active bookings."
  },

  listing_deleted: {
    gu: "✅ Listing deleted.",
    hi: "✅ Listing deleted.",
    en: "✅ Listing deleted."
  },

  rate_updated_success: {
    gu: "✅ ભાવ બદલાઈ ગયો!",
    hi: "✅ दर बदल दी गई!",
    en: "✅ Rate updated successfully!"
  },

  back_to_profile: {
    gu: "🔙 પ્રોફાઇલ મેનૂ",
    hi: "🔙 प्रोफाइल मेनू",
    en: "🔙 Profile Menu"
  },

  status_available: {
    gu: "ઉપલબ્ધ",
    hi: "उपलब्ध",
    en: "Available"
  },

  status_unavailable: {
    gu: "અનઉપલબ્ધ",
    hi: "अनुपलब्ध",
    en: "Unavailable"
  },

  equipment_listing_item: {
    gu: (type, rate, status) => `🚜 ${type} — ₹${rate}/દિવસ (${status})`,
    hi: (type, rate, status) => `🚜 ${type} — ₹${rate}/दिन (${status})`,
    en: (type, rate, status) => `🚜 ${type} — ₹${rate}/day (${status})`
  },

  labour_listing_item: {
    gu: (skills, rate, status) => `👷 Labour (${skills}) — ₹${rate}/દિવસ (${status})`,
    hi: (skills, rate, status) => `👷 Labour (${skills}) — ₹${rate}/दिन (${status})`,
    en: (skills, rate, status) => `👷 Labour (${skills}) — ₹${rate}/day (${status})`
  },

  availability_updated: {
    gu: (status) => `✅ સ્ટેટસ ${status} સેટ થયું.`,
    hi: (status) => `✅ स्टेटस ${status} सेट हो गया।`,
    en: (status) => `✅ Status updated to ${status}.`
  }
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