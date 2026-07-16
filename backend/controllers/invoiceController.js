const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const User = require('../models/User');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const { sendInvoiceEmail } = require('../utils/emailService');

// @route GET /api/invoices
const getInvoices = async (req, res) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = { user: req.user.id };

    if (status) query.status = status;

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'clientSnapshot.name': { $regex: search, $options: 'i' } },
        { 'clientSnapshot.email': { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Invoice.countDocuments(query);

    const invoices = await Invoice.find(query)
      .sort({
        [sortBy]: order === 'desc' ? -1 : 1
      })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('client', 'name email');

    res.json({
      success: true,
      data: invoices,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('GET INVOICES ERROR:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// @route GET /api/invoices/:id
const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate(
      'client',
      'name email phone company address'
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      data: invoice
    });

  } catch (error) {
    console.error('GET INVOICE ERROR:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// @route POST /api/invoices
const createInvoice = async (req, res) => {
  try {
    const {
      clientId,
      clientSnapshot,
      items,
      dueDate,
      taxRate,
      discount,
      notes,
      terms,
      currency,
      status,
      isRecurring,
      recurringInterval
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required'
      });
    }

    const processedItems = items.map(item => ({
      ...item,
      amount: parseFloat(
        (item.quantity * item.rate).toFixed(2)
      )
    }));

    const subtotal = parseFloat(
      processedItems
        .reduce((sum, item) => sum + item.amount, 0)
        .toFixed(2)
    );

    const taxAmount = parseFloat(
      (subtotal * (taxRate || 0) / 100).toFixed(2)
    );

    const discountAmt = parseFloat(discount || 0);

    const total = parseFloat(
      (subtotal + taxAmount - discountAmt).toFixed(2)
    );

    const user = await User.findById(req.user.id);

    const invoiceNumber = user.getNextInvoiceNumber();

    const invoice = await Invoice.create({
      user: req.user.id,
      client: clientId || undefined,
      clientSnapshot,
      invoiceNumber,
      dueDate,
      status: status || 'draft',
      items: processedItems,
      currency: currency || user.currency,
      subtotal,
      taxRate: taxRate || user.defaultTax,
      taxAmount,
      discount: discountAmt,
      total,
      notes,
      terms,
      isRecurring: isRecurring || false,
      recurringInterval: isRecurring
        ? recurringInterval
        : ''
    });

    await User.findByIdAndUpdate(
      req.user.id,
      {
        $inc: {
          invoiceCounter: 1
        }
      }
    );

    if (clientId) {
      await Client.findByIdAndUpdate(
        clientId,
        {
          $inc: {
            totalInvoices: 1,
            totalAmount: total
          }
        }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Invoice created',
      data: invoice
    });

  } catch (error) {
    console.error('CREATE INVOICE ERROR:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// @route PUT /api/invoices/:id
const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit a paid invoice'
      });
    }

    const {
      items,
      taxRate,
      discount
    } = req.body;

    if (items) {
      const processedItems = items.map(item => ({
        ...item,
        amount: item.quantity * item.rate
      }));

      const subtotal = processedItems.reduce(
        (sum, item) => sum + item.amount,
        0
      );

      const taxAmount =
        subtotal * (taxRate || invoice.taxRate) / 100;

      const discountAmt =
        discount || invoice.discount || 0;

      req.body.subtotal =
        parseFloat(subtotal.toFixed(2));

      req.body.taxAmount =
        parseFloat(taxAmount.toFixed(2));

      req.body.total =
        parseFloat(
          (subtotal + taxAmount - discountAmt).toFixed(2)
        );

      req.body.items = processedItems;
    }

    const updated = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      message: 'Invoice updated',
      data: updated
    });

  } catch (error) {
    console.error('UPDATE INVOICE ERROR:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// @route DELETE /api/invoices/:id
const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a paid invoice'
      });
    }

    await Invoice.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Invoice deleted'
    });

  } catch (error) {
    console.error('DELETE INVOICE ERROR:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// @route PATCH /api/invoices/:id/status
const updateStatus = async (req, res) => {
  try {
    const {
      status,
      paymentMethod,
      paymentReference
    } = req.body;

    const validStatuses = [
      'draft',
      'sent',
      'paid',
      'overdue',
      'cancelled'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const update = {
      status
    };

    if (status === 'paid') {
      update.paidAt = new Date();
      update.paymentMethod = paymentMethod || '';
      update.paymentReference = paymentReference || '';

      const invoice = await Invoice.findById(
        req.params.id
      );

      if (invoice && invoice.client) {
        await Client.findByIdAndUpdate(
          invoice.client,
          {
            $inc: {
              totalPaid: invoice.total
            }
          }
        );
      }
    }

    const invoice = await Invoice.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id
      },
      update,
      {
        new: true
      }
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      message: `Status updated to ${status}`,
      data: invoice
    });

  } catch (error) {
    console.error('UPDATE STATUS ERROR:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// @route GET /api/invoices/:id/pdf
const downloadPDF = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const user = await User.findById(req.user.id);

    const pdfBuffer = await generateInvoicePDF(
      invoice,
      user
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        `attachment; filename="${invoice.invoiceNumber}.pdf"`,
      'Content-Length': pdfBuffer.length
    });

    res.end(pdfBuffer);

  } catch (error) {
    console.error('PDF GENERATION ERROR:', error);

    res.status(500).json({
      success: false,
      message:
        'PDF generation failed: ' + error.message
    });
  }
};


// @route POST /api/invoices/:id/send-email
const sendEmail = async (req, res) => {
  try {
    console.log('📧 SEND EMAIL STARTED');

    const invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    console.log('✅ Invoice found');

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User found');

    const {
      customMessage
    } = req.body || {};

    console.log('📄 Generating PDF...');

    const pdfBuffer = await generateInvoicePDF(
      invoice,
      user
    );

    console.log('✅ PDF generated');

    console.log('📧 Sending email...');

    await sendInvoiceEmail(
      invoice,
      user,
      pdfBuffer,
      customMessage
    );

    console.log('✅ Email sent successfully');

    await Invoice.findByIdAndUpdate(
      req.params.id,
      {
        emailSentAt: new Date(),
        status:
          invoice.status === 'draft'
            ? 'sent'
            : invoice.status
      }
    );

    res.json({
      success: true,
      message:
        `Invoice emailed to ${invoice.clientSnapshot.email}`
    });

  } catch (error) {
    console.error('❌ EMAIL ERROR:', error);

    res.status(500).json({
      success: false,
      message:
        'Email failed: ' + error.message
    });
  }
};


// @route GET /api/invoices/export/csv
const exportCSV = async (req, res) => {
  try {
    const {
      status,
      from,
      to
    } = req.query;

    const query = {
      user: req.user.id
    };

    if (status) {
      query.status = status;
    }

    if (from || to) {
      query.createdAt = {};

      if (from) {
        query.createdAt.$gte = new Date(from);
      }

      if (to) {
        query.createdAt.$lte = new Date(to);
      }
    }

    const invoices = await Invoice.find(query)
      .sort({
        createdAt: -1
      });

    const headers = [
      'Invoice #',
      'Client',
      'Email',
      'Issue Date',
      'Due Date',
      'Subtotal',
      'Tax',
      'Total',
      'Status'
    ];

    const rows = invoices.map(inv => [
      inv.invoiceNumber,
      inv.clientSnapshot.name,
      inv.clientSnapshot.email,
      new Date(inv.issueDate)
        .toLocaleDateString('en-IN'),
      new Date(inv.dueDate)
        .toLocaleDateString('en-IN'),
      inv.subtotal,
      inv.taxAmount,
      inv.total,
      inv.status
    ]);

    const csv = [
      headers,
      ...rows
    ]
      .map(row => row.join(','))
      .join('\n');

    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition':
        `attachment; filename="invoices-export-${Date.now()}.csv"`
    });

    res.send(csv);

  } catch (error) {
    console.error('EXPORT CSV ERROR:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  updateStatus,
  downloadPDF,
  sendEmail,
  exportCSV
};
