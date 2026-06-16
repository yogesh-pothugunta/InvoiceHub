const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Client email is required'],
    trim: true,
    lowercase: true
  },
  phone: { type: String, trim: true },
  company: { type: String, trim: true },
  gst: { type: String, trim: true },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    country: { type: String, default: 'India' }
  },
  totalInvoices: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  totalPaid: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

clientSchema.virtual('totalDue').get(function() {
  return this.totalAmount - this.totalPaid;
});

clientSchema.virtual('fullAddress').get(function() {
  const a = this.address;
  return [a.street, a.city, a.state, a.pincode, a.country].filter(Boolean).join(', ');
});

module.exports = mongoose.model('Client', clientSchema);
