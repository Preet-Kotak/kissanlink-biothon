const mongoose = require('mongoose');

const labourListingSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workerPhone: {
      type: String,
      required: true,
    },
    workerName: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
      // e.g. ['harvesting', 'sowing', 'irrigation', 'general']
      default: ['general'],
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

labourListingSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('LabourListing', labourListingSchema);
