const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const FROM = process.env.TWILIO_WHATSAPP_NUMBER; // whatsapp:+14155238886

/**
 * Send a plain text WhatsApp message
 */
async function sendMessage(to, body) {
  try {
    await client.messages.create({
      from: FROM,
      to,
      body,
    });
  } catch (err) {
    console.error(`❌ Twilio send error to ${to}:`, err.message);
  }
}

/**
 * Send a message with interactive quick-reply buttons (max 3 buttons)
 * Falls back to plain numbered list if > 3 options (WhatsApp button limit)
 */
async function sendButtons(to, body, buttons) {
  if (buttons.length <= 3) {
    try {
      await client.messages.create({
        from: FROM,
        to,
        persistentAction: [],
        body,
        // Twilio Content API buttons — use plain text fallback for sandbox
        // Sandbox doesn't support interactive templates, so we send numbered list
      });
    } catch (err) {
      // fall through to plain text
    }
  }

  // Sandbox-compatible: send numbered list
  const numbered = buttons.map((b, i) => `${i + 1}. ${b}`).join('\n');
  await sendMessage(to, `${body}\n\n${numbered}`);
}

/**
 * Send a list menu (sandbox-compatible numbered format)
 */
async function sendMenu(to, body, options) {
  const numbered = options.map((o, i) => `${i + 1}. ${o}`).join('\n');
  await sendMessage(to, `${body}\n\n${numbered}`);
}

module.exports = { sendMessage, sendButtons, sendMenu };
