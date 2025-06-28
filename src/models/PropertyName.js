import mongoose from 'mongoose';

const propertyNameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  collection: 'propertiesnames'
});

const PropertyName = mongoose.models.PropertyName || mongoose.model('PropertyName', propertyNameSchema);

export default PropertyName; 