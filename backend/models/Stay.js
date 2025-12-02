const mongoose = require('mongoose');

const staySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String,
    required: true,
    trim: true,
    default: 'Coorg'
  },
  type: {
    type: String,
    required: true,
    trim: true,
    default: 'Homestay'
  },
  price: {
    type: String,
    required: true
  },
  pricePerNight: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  description: {
    type: String,
    default: ''
  },
  amenities: [{
    type: String
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 4.5
  },
  guests: {
    type: Number,
    default: 2
  },
  bedrooms: {
    type: Number,
    default: 1
  },
  bathrooms: {
    type: Number,
    default: 1
  },
  address: {
    type: String,
    trim: true
  },
  contactInfo: {
    phone: String,
    email: String
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

staySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Stay', staySchema);

