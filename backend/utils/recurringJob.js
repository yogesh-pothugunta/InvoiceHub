const Invoice = require('../models/Invoice');
const User = require('../models/User');

const processRecurringInvoices = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const recurringInvoices = await Invoice.find({
      isRecurring: true,
      status: 'paid',
      nextRecurringDate: { $lte: today }
    }).populate('user');

    console.log(`Processing ${recurringInvoices.length} recurring invoices`);

    for (const invoice of recurringInvoices) {
      const user = await User.findById(invoice.user);
      const invoiceNumber = user.getNextInvoiceNumber();

      // Calculate next due date
      const dueDate = new Date();
      if (invoice.recurringInterval === 'monthly') dueDate.setMonth(dueDate.getMonth() + 1);
      else if (invoice.recurringInterval === 'quarterly') dueDate.setMonth(dueDate.getMonth() + 3);
      else if (invoice.recurringInterval === 'yearly') dueDate.setFullYear(dueDate.getFullYear() + 1);

      // Create new invoice
      await Invoice.create({
        user: invoice.user,
        client: invoice.client,
        clientSnapshot: invoice.clientSnapshot,
        invoiceNumber,
        issueDate: new Date(),
        dueDate,
        status: 'sent',
        items: invoice.items,
        currency: invoice.currency,
        subtotal: invoice.subtotal,
        taxRate: invoice.taxRate,
        taxAmount: invoice.taxAmount,
        total: invoice.total,
        notes: invoice.notes,
        terms: invoice.terms,
        isRecurring: true,
        recurringInterval: invoice.recurringInterval,
        nextRecurringDate: dueDate,
      });

      // Update counter
      await User.findByIdAndUpdate(invoice.user, { $inc: { invoiceCounter: 1 } });

      // Update next recurring date on original
      const nextDate = new Date();
      if (invoice.recurringInterval === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
      else if (invoice.recurringInterval === 'quarterly') nextDate.setMonth(nextDate.getMonth() + 3);
      else if (invoice.recurringInterval === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

      await Invoice.findByIdAndUpdate(invoice._id, { nextRecurringDate: nextDate });

      console.log(`Created recurring invoice: ${invoiceNumber}`);
    }
  } catch (error) {
    console.error('Recurring job error:', error);
  }
};

module.exports = { processRecurringInvoices };
