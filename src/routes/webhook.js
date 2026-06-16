const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { handleMessage } = require('../handlers/bot');

/**
 * POST /webhook
 * Twilio sends all incoming WhatsApp messages here
 */
router.post('/', async (req, res) => {
  // Always respond 200 immediately so Twilio doesn't retry
  res.status(200).send('<Response></Response>');

  const from = req.body.From;       // "whatsapp:+91XXXXXXXXXX"
  const body = (req.body.Body || '').trim();
  const latitude = req.body.Latitude;
  const longitude = req.body.Longitude;

  if (!from) return;

  try {
    // Load or create user
    let user = await User.findOne({ phone: from });
    if (!user) {
      user = await User.create({ phone: from, state: 'NEW' });
    }

    await handleMessage(user, body, { latitude, longitude });
  } catch (err) {
    console.error('❌ Webhook error:', err);
  }
});

module.exports = router;
