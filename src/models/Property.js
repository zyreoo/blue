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
  },
  roomCapacity: {
    type: Number,
    required: [true, 'Room capacity is required'],
    min: [1, 'Room capacity must be at least 1']
  },
  personCapacity: {
    type: Number,
    required: [true, 'Person capacity is required'],
    min: [1, 'Person capacity must be at least 1']
  },
  petsAllowed: {
    type: Boolean,
    default: false
  },
  maxPets: {
    type: Number,
    default: 0,
    min: [0, 'Maximum number of pets cannot be negative'],
    validate: {
      validator: function(value) {
        // If pets are not allowed, maxPets should be 0
        return this.petsAllowed ? value >= 0 : value === 0;
      },
      message: 'Maximum pets must be 0 when pets are not allowed'
    }
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