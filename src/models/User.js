import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
  },
  idNumber: {
    type: String,
    unique: true,
    sparse: true  // This allows multiple null values and makes the field optional
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  isHost: {
    type: Boolean,
    default: false
  },
  isSuperAdmin: {
    type: Boolean,
    default: false
  },
  properties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }],
  hostingSince: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Clear existing model to prevent OverwriteModelError
if (mongoose.models.User) {
  delete mongoose.models.User;
}

const User = mongoose.model('User', userSchema);

export default User; 