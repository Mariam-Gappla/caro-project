const mongoose = require('mongoose');

const serviceProviderOrdersSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'serviceProvider', // اسم الموديل المرتبط
    },
    orderNumber: {
      type: Number,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // اسم الموديل المرتبط
      required: true,
    },
    serviceType: {
      type: String,
      required: true,
      enum: ['winch', 'tire Filling', 'battery Jumpstart'],
    },
    image: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    location: {
      lat: {
        type: Number,
      },
      long: {
        type: Number,
      },
    },
    locationText: {
      type: String
    },
    dropoffLocationText: {
      type: String
    },
    paymentType: {
      type: String,
      enum: ['cash', 'mada', 'bank'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['inProgress', 'paid'],
      default: "inProgress"
    },
    dropoffLocation: {
      lat: {
        type: Number,
      },
      long: {
        type: Number,
      },
    },
    price: {
      type: Number
    },
    ended: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'refused'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);



module.exports = mongoose.model('ServiceProviderOrders', serviceProviderOrdersSchema);
