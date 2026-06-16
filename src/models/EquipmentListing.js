const mongoose = require('mongoose');

const equipmentListingSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ownerPhone: {
      type: String,
      required: true,
    },
    ownerName: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      required: true,
      // e.g. Tractor, Rotavator, Thresher, Water Pump, Sprayer
    },
    description: {
      type: String,
      default: '',
    },
    dailyRate: {
      type: Number,
      required: true, // in INR
    },
    available: {
      type: Boolean,
      default: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    village: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

equipmentListingSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('EquipmentListing', equipmentListingSchema);
