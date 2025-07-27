const mongoose = require('mongoose');

const serviceProviderOrdersSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceProvider', // اسم الموديل المرتبط
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
    paymentType: {
      type: String,
      enum: ['cash', 'card', 'online'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['inprogress', 'paid'],
      default:"inprogress"
    },
    carLocation: {
      lat: {
        type: Number,
      },
      long: {
        type: Number,
      },
    },
    dropoffLocation: {
      lat: {
        type: Number,
      },
      long: {
        type: Number,
      },
    },
    price:{
      type: Number,
      default:12
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
