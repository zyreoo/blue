import mongoose from 'mongoose';

// Delete the existing model if it exists
if (mongoose.models.Booking) {
  delete mongoose.models.Booking;
}

const bookingSchema = new mongoose.Schema({
  // Booking Reference
  bookingNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Property Reference
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Property is required']
  },
  adminEmail: {
    type: String,
    required: [true, 'Admin email is required'],
    lowercase: true
  },
  customerEmail: {
    type: String,
    required: [true, 'Customer email is required'],
    lowercase: true
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
bookingSchema.index({ customerEmail: 1, status: 1 });
bookingSchema.index({ checkIn: 1, checkOut: 1 });
bookingSchema.index({ adminEmail: 1 });
bookingSchema.index({ bookingNumber: 1 }, { unique: true });

// Pre-save middleware to generate booking number
bookingSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      // Get the current year
      const year = new Date().getFullYear();
      
      // Find the highest booking number for this year
      const lastBooking = await mongoose.model('Booking').findOne({
        bookingNumber: new RegExp(`^${year}-`)
      }).sort({ bookingNumber: -1 });
      
      // Extract the sequence number or start from 1
      let sequence = 1;
      if (lastBooking && lastBooking.bookingNumber) {
        const lastSequence = parseInt(lastBooking.bookingNumber.split('-')[1]);
        if (!isNaN(lastSequence)) {
          sequence = lastSequence + 1;
        }
      }
      
      // Generate the new booking number (YYYY-NNNNNN)
      this.bookingNumber = `${year}-${sequence.toString().padStart(6, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  
  this.updatedAt = new Date();
  next();
});

// Virtual for booking duration
bookingSchema.virtual('duration').get(function() {
  return Math.ceil((this.checkOut - this.checkIn) / (1000 * 60 * 60 * 24));
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking; 