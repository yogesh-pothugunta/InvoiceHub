const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  rate: { type: Number, required: true, min: 0 },
  amount: { type: Number, required: true }
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  // Snapshot of client info at time of invoice (so editing client won't change old invoices)
  clientSnapshot: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    company: { type: String, default: '' },
    gst: { type: String, default: '' },
    address: { type: String, default: '' }
  },
  invoiceNumber: {
    type: String,
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  items: [itemSchema],
  currency: { type: String, default: '₹ INR' },
  subtotal: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, default: 18, min: 0, max: 100 },
  taxAmount: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true, min: 0 },
  notes: { type: String, default: '' },
  terms: { type: String, default: 'Payment due within 30 days. Late payments incur 2% monthly interest.' },
  pdfUrl: { type: String, default: '' },
  emailSentAt: { type: Date },
  paidAt: { type: Date },
  paymentMethod: { type: String, default: '' },
  paymentReference: { type: String, default: '' },
  // Recurring invoice fields
  isRecurring: { type: Boolean, default: false },
  recurringInterval: { type: String, enum: ['monthly', 'quarterly', 'yearly', ''], default: '' },
  nextRecurringDate: { type: Date }
}, { timestamps: true });

// Auto-set overdue status
invoiceSchema.pre('save', function(next) {
  if (this.status === 'sent' && this.dueDate < new Date()) {
    this.status = 'overdue';
  }
  next();
});

// Indexes for faster queries
invoiceSchema.index({ user: 1, status: 1 });
invoiceSchema.index({ user: 1, createdAt: -1 });
invoiceSchema.index({ user: 1, invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ dueDate: 1, status: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
