import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 1000
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true
  },
  bedrooms: {
    type: Number,
    required: true,
    min: 1
  },
  bathrooms: {
    type: Number,
    required: true,
    min: 1
  },
  maxGuests: {
    type: Number,
    required: true,
    min: 1
  },
  amenities: [{
    type: String,
    trim: true
  }],
  adminEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  petsAllowed: {
    type: Boolean,
    default: false
  },
  maxPets: {
    type: Number,
    default: 0,
    validate: {
      validator: function(value) {
        if (!this.petsAllowed) return value === 0;
        return value >= 0;
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

propertySchema.index({ location: 1, price: 1 });

propertySchema.pre('save', function(next) {
  try {
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.models.Property || mongoose.model('Property', propertySchema); 