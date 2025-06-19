import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  // Property Reference
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Property is required']
  },
  propertyOwnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Property owner is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  
  // Customer Information
  customer: {
    name: {
      type: String,
      required: [true, 'Customer name is required']
    },
    email: {
      type: String,
      required: [true, 'Customer email is required'],
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    },
    idNumber: {
      type: String,
      required: [true, 'ID/Passport number is required']
    }
  },
  
  // Booking Details
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  checkOut: {
    type: Date,
    required: [true, 'Check-out date is required']
  },
  numberOfGuests: {
    adults: { type: Number, default: 0 },
    teens: { type: Number, default: 0 },
    babies: { type: Number, default: 0 }
  },
  numberOfRooms: {
    type: Number,
    required: [true, 'Number of rooms is required'],
    min: [1, 'At least one room is required']
  },
  specialRequests: {
    type: String,
    maxlength: [500, 'Special requests cannot exceed 500 characters']
  },
  
  // Payment and Status
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  
  // Timestamps
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

// Add indexes for faster queries
bookingSchema.index({ propertyId: 1, status: 1 });
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ checkIn: 1, checkOut: 1 });
bookingSchema.index({ propertyOwnerId: 1 });

// Pre-save middleware to update timestamps
bookingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for booking duration
bookingSchema.virtual('duration').get(function() {
  return Math.ceil((this.checkOut - this.checkIn) / (1000 * 60 * 60 * 24));
});

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

export default Booking; 