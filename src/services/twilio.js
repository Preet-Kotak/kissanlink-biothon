const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const FROM = process.env.TWILIO_WHATSAPP_NUMBER; // whatsapp:+14155238886

/**
 * Send a plain text WhatsApp message
 */
async function sendMessage(to, body, mediaUrl = null) {
  try {
    const messageData = {
      from: FROM,
      to,
      body,
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
 * Send a list menu (sandbox-compatible numbered format)
 */
async function sendMenu(to, body, options) {
  const numbered = options.map((o, i) => `${i + 1}. ${o}`).join('\n');
  await sendMessage(to, `${body}\n\n${numbered}`);
}

module.exports = { sendMessage, sendMenu };
