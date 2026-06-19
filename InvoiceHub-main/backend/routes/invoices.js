const express = require('express');
const router = express.Router();
const { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, updateStatus, downloadPDF, sendEmail, exportCSV } = require('../controllers/invoiceController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/export/csv', exportCSV);
router.route('/').get(getInvoices).post(createInvoice);
router.route('/:id').get(getInvoice).put(updateInvoice).delete(deleteInvoice);
router.patch('/:id/status', updateStatus);
router.get('/:id/pdf', downloadPDF);
router.post('/:id/send-email', sendEmail);

module.exports = router;
