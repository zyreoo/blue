import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  properties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
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


locationSchema.index({ city: 1, country: 1 }, { unique: true });


locationSchema.pre('save', function(next) {
  if (this.isModified('city') || this.isModified('country')) {
    this.slug = `${this.city}-${this.country}`.toLowerCase()
      .replace(/\s+/g, '-')           
      .replace(/[^\w\-]+/g, '')      
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')            
      .replace(/-+$/, '');
  }
  this.updatedAt = Date.now();
  next();
});

const Location = mongoose.models.Location || mongoose.model('Location', locationSchema);

export default Location; 