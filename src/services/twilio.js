const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const FROM = process.env.TWILIO_WHATSAPP_NUMBER; // whatsapp:+14155238886

/**
 * Send a plain text WhatsApp message.
 * Note: Messages should include navigation hints directly in their text.
 * 
 * @param {string} to   - recipient WhatsApp number
 * @param {string} body - message content (already includes hints if needed)
 * @param {string} lang - 'gu' | 'hi' | 'en' (default: 'gu')
 * @param {string} mediaUrl - optional media URL
 */
async function sendMessage(to, body, lang = 'gu', mediaUrl = null) {
  try {
    const messageData = {
      from: FROM,
      to,
      body: body,
    };

    if (mediaUrl) {
      messageData.mediaUrl = [mediaUrl];
    }

    await client.messages.create(messageData);
  } catch (err) {
    console.error(`❌ Twilio send error to ${to}:`, err.message);
  }
}

/**
 * Send a list menu (sandbox-compatible numbered format).
 * Options array should already include emoji numbers (1️⃣, 2️⃣, etc.)
 * so we just join them with newlines.
 *
 * @param {string}   to      - recipient WhatsApp number
 * @param {string}   body    - prompt text shown above the menu
 * @param {string[]} options - array of option labels (already numbered with emojis)
 */
async function sendMenu(to, body, options) {
  const optionsText = options.join('\n');
  await sendMessage(to, `${body}\n\n${optionsText}`);
}

module.exports = { sendMessage, sendMenu };
