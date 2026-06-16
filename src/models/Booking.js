const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['equipment', 'labour'],
      required: true,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // ref is either EquipmentListing or LabourListing depending on type
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    farmerPhone: {
      type: String,
      required: true,
    },
    farmerName: {
      type: String,
      default: '',
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providerPhone: {
      type: String,
      required: true,
    },
    providerName: {
      type: String,
      default: '',
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'confirmed',
    },
    // Rating fields — filled after completion
    farmerRatedProvider: {
      type: Boolean,
      default: false,
    },
    providerRatedFarmer: {
      type: Boolean,
      default: false,
    },
    farmerRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    providerRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
