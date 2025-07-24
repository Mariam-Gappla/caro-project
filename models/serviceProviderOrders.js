const mongoose = require('mongoose');

const serviceProviderOrdersSchema = new mongoose.Schema(
  {
    serviceType: {
      type: String,
      required: true,
      enum: ['winch', 'tire Filling', 'battery Jumpstart'], // ممكن تعدلي الأنواع حسب المشروع
    },
    image: {
      type: String, // رابط الصورة بعد الرفع
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
    }
    },
    paymentType: {
      type: String,
      enum: ['cash', 'card', 'online'], // حسب طرق الدفع المتاحة
      required: true,
    },
    carLocation: {
      lat: {
      type: Number,
    },
    long: {
      type: Number,
    }
    },
    dropoffLocation: {
      lat: {
      type: Number,
    },
    long: {
      type: Number,
    }
    },
  },
  {
    timestamps: true, // يضيف createdAt و updatedAt
  }
);


module.exports = mongoose.model('ServiceProviderOrders', serviceProviderOrdersSchema);
