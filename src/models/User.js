const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      // Stored as "whatsapp:+91XXXXXXXXXX"
    },
    name: {
      type: String,
      default: null,
    },
    village: {
      type: String,
      default: null,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        // [longitude, latitude]
        type: [Number],
        default: [0, 0],
      },
    },
    // A user can be farmer, owner, worker — or all three
    roles: {
      type: [String],
      enum: ['farmer', 'owner', 'worker'],
      default: ['farmer'],
    },
    language: {
      type: String,
      enum: ['gu', 'hi', 'en'],
      default: 'gu',
    },
    rating: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    // Conversation state machine
    state: {
      type: String,
      default: 'NEW', // NEW, AWAITING_NAME, AWAITING_LOCATION, MAIN_MENU, etc.
    },
    // Temp data stored across conversation turns
    tempData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRegistered: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
