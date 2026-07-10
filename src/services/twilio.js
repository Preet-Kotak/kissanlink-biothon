const twilio = require('twilio');
const { t } = require('../lang/strings');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const FROM = process.env.TWILIO_WHATSAPP_NUMBER; // whatsapp:+14155238886

/**
 * Send a plain text WhatsApp message.
 * Automatically appends the back_hint footer ("type 0 = main menu")
 * so every handler benefits without manual edits.
 *
 * @param {string} to   - recipient WhatsApp number
 * @param {string} body - message content
 * @param {string} lang - 'gu' | 'hi' | 'en' (default: 'gu')
 */
async function sendMessage(to, body, lang = 'gu') {
  try {
    const footer = `\n\n_(${t('press_zero_hint', lang)})_`;
    await client.messages.create({
      from: FROM,
      to,
      body: body + footer,
    });
  } catch (err) {
    console.error(`❌ Twilio send error to ${to}:`, err.message);
  }
}

/**
 * Send a list menu (sandbox-compatible numbered format).
 * Delegates to sendMessage so the back_hint footer is added automatically.
 *
 * @param {string}   to      - recipient WhatsApp number
 * @param {string}   body    - prompt text shown above the menu
 * @param {string[]} options - array of option labels
 * @param {string}   lang    - 'gu' | 'hi' | 'en' (default: 'gu')
 */
async function sendMenu(to, body, options, lang = 'gu') {
  const numbered = options.map((o, i) => `${i + 1}. ${o}`).join('\n');
  await sendMessage(to, `${body}\n\n${numbered}`, lang);
}

module.exports = { sendMessage, sendMenu };
