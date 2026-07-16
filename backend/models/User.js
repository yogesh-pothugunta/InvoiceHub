const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  company: {
    name: { type: String, default: '' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    gst: { type: String, default: '' },
    website: { type: String, default: '' },
    logo: { type: String, default: '' }
  },
  bankDetails: {
    bankName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifsc: { type: String, default: '' },
    upiId: { type: String, default: '' }
  },
  invoicePrefix: { type: String, default: 'INV' },
  invoiceCounter: { type: Number, default: 1 },
  currency: { type: String, default: '₹ INR' },
  defaultTax: { type: Number, default: 18 },
  isActive: { type: Boolean, default: true },
  googleId: { type: String, default: '' },
  lastLogin: { type: Date },

  // OTP Verification Fields
  isVerified: { type: Boolean, default: false },
  otp: { type: String, select: false },
  otpExpire: { type: Date, select: false },

  resetPasswordToken: { type: String, select: false },
  resetPasswordExpiry: { type: Date, select: false }

}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Get next invoice number
userSchema.methods.getNextInvoiceNumber = function() {
  return `${this.invoicePrefix}-${String(this.invoiceCounter).padStart(3, '0')}`;
};

module.exports = mongoose.model('User', userSchema);
