import mongoose from 'mongoose';

const PropertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true
  },
  type: {
    type: String,
    enum: {
      values: ['Villa', 'Apartment', 'Cabin', 'House', 'Loft', 'Other'],
      message: '{VALUE} is not a valid property type'
    },
    default: 'House'
  },
  description: {
    type: String,
    trim: true
  },
  bedrooms: {
    type: Number,
    default: 1,
    min: [0, 'Number of bedrooms cannot be negative']
  },
  bathrooms: {
    type: Number,
    default: 1,
    min: [0, 'Number of bathrooms cannot be negative']
  },
  maxGuests: {
    type: Number,
    default: 2,
    min: [1, 'Maximum guests must be at least 1']
  }
}, {
  timestamps: true
});

// Add index for faster queries
PropertySchema.index({ location: 1 });
PropertySchema.index({ type: 1 });
PropertySchema.index({ price: 1 });

// Add error handling for save operations
PropertySchema.pre('save', function(next) {
  try {
    // Additional validation if needed
    next();
  } catch (error) {
    next(error);
  }
});

const Property = mongoose.models.Property || mongoose.model('Property', PropertySchema);

export default Property; 