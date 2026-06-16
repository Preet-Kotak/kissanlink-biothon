require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const webhookRouter = require('./routes/webhook');
const { processCompletedBookings } = require('./handlers/rating');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Routes
app.use('/webhook', webhookRouter);

app.get('/', (req, res) => {
  res.send('KissanLink is running 🚜');
});

// Keep-alive endpoint for Render.com free tier (prevents spin-down)
app.get('/ping', (req, res) => {
  res.status(200).send('Bot is alive!');
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 8080;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📱 Webhook URL: http://localhost:${PORT}/webhook`);
    });

    // ── Self-ping to keep Render free tier alive ───────────────────────────
    const RENDER_URL = process.env.RENDER_URL || '';
    const KEEPALIVE_INTERVAL = parseInt(process.env.KEEPALIVE_INTERVAL || '300') * 1000;

    if (RENDER_URL) {
      // Wait 30s after startup before first ping
      setTimeout(() => {
        setInterval(async () => {
          try {
            const res = await fetch(`${RENDER_URL}/health`);
            console.log(`[Keepalive] Ping → ${res.status}`);
          } catch (err) {
            console.error(`[Keepalive] Ping failed: ${err.message}`);
          }
        }, KEEPALIVE_INTERVAL);
      }, 30000);
      console.log(`[Keepalive] Self-ping active → ${RENDER_URL}/health every ${KEEPALIVE_INTERVAL / 1000}s`);
    }

    // ── Cron: check for completed bookings every hour ──────────────────────
    // Marks bookings past their date as 'completed' and sends rating prompts
    setInterval(async () => {
      try {
        await processCompletedBookings();
      } catch (err) {
        console.error('❌ Cron error:', err);
      }
    }, 60 * 60 * 1000); // every 60 minutes

    // Also run once on startup to catch any missed bookings
    processCompletedBookings().catch(console.error);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
