import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hostEmail: {
    type: String,
    required: true
  },
  propertyType: {
    type: String,
    required: true,
    enum: ['house', 'apartment', 'barn', 'guesthouse', 'boat', 'cabin', 'camper', 'villa', 'castle', 'cave', 'container', 'cycladic']
  },
  spaceType: {
    type: String,
    required: true,
    enum: [
      'entire_place',
      'private_room',
      'shared_room',
      'private_cabin',
      'private_wing'
    ]
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  details: {
    maxGuests: {
      type: Number,
      required: true,
      min: 1
    },
    bedrooms: {
      type: Number,
      required: true,
      min: 1
    },
    beds: {
      type: Number,
      required: true,
      min: 1
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 1
    }
  },
  amenities: [{
    type: String
  }],
  photos: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    cleaningFee: {
      type: Number,
      default: 0
    },
    serviceFee: {
      type: Number,
      default: 0
    }
  },
  description: {
    type: String,
    required: true,
    minLength: 50
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'active', 'inactive'],
    default: 'pending'
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],
  rules: {
    smokingAllowed: {
      type: Boolean,
      default: false
    },
    petsAllowed: {
      type: Boolean,
      default: false
    },
    partiesAllowed: {
      type: Boolean,
      default: false
    },
    additionalRules: [String]
  },
  availability: {
    alwaysAvailable: {
      type: Boolean,
      default: true
    },
    unavailableDates: [{
      startDate: Date,
      endDate: Date,
      reason: String
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps on save
propertySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add indexes for common queries
propertySchema.index({ 'location.city': 1 });
propertySchema.index({ 'location.country': 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ 'pricing.basePrice': 1 });
propertySchema.index({ averageRating: -1 });

const Property = mongoose.models.Property || mongoose.model('Property', propertySchema);

export default Property; 