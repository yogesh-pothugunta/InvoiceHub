const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendInvoiceEmail = async (invoice, user, pdfBuffer, customMessage = '') => {
  const transporter = createTransporter();
  const company = user.company || {};
  const companyName = company.name || user.name || 'InvoiceHub';

  const defaultMessage = `Dear ${invoice.clientSnapshot.name},

Please find attached Invoice #${invoice.invoiceNumber} for ${formatCurrency(invoice.total, invoice.currency)}.

Payment is due by ${formatDate(invoice.dueDate)}.

${user.bankDetails?.bankName ? `
Payment Details:
Bank: ${user.bankDetails.bankName}
A/C: ${user.bankDetails.accountNumber}
IFSC: ${user.bankDetails.ifsc}
${user.bankDetails.upiId ? 'UPI: ' + user.bankDetails.upiId : ''}
` : ''}

For any queries, please contact us at ${user.email}.

Thank you for your business!

Best regards,
${companyName}`;

  const emailHTML = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5;">
  <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:#185FA5;padding:28px 32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:500;">Invoice from ${companyName}</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#333;font-size:15px;margin-bottom:20px;">Dear <strong>${invoice.clientSnapshot.name}</strong>,</p>
      <div style="background:#E6F1FB;border-left:4px solid #185FA5;padding:16px 20px;border-radius:4px;margin-bottom:24px;">
        <p style="margin:0;color:#185FA5;font-size:14px;"><strong>Invoice #${invoice.invoiceNumber}</strong></p>
        <p style="margin:4px 0 0;color:#555;font-size:24px;font-weight:700;">${formatCurrency(invoice.total, invoice.currency)}</p>
        <p style="margin:4px 0 0;color:#888;font-size:12px;">Due by ${formatDate(invoice.dueDate)}</p>
      </div>
      <p style="color:#555;font-size:14px;line-height:1.7;white-space:pre-line;">${customMessage || defaultMessage}</p>
      ${user.bankDetails?.bankName ? `
      <div style="background:#f9f9f9;border-radius:6px;padding:16px 20px;margin-top:20px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:1px;">Payment Details</p>
        <p style="margin:0;font-size:13px;color:#555;line-height:1.8;">
          Bank: ${user.bankDetails.bankName}<br>
          A/C: ${user.bankDetails.accountNumber}<br>
          IFSC: ${user.bankDetails.ifsc}
          ${user.bankDetails.upiId ? '<br>UPI: ' + user.bankDetails.upiId : ''}
        </p>
      </div>` : ''}
    </div>
    <div style="background:#f5f5f5;padding:16px 32px;text-align:center;font-size:12px;color:#aaa;">
      ${companyName} &nbsp;|&nbsp; ${user.email} &nbsp;|&nbsp; Powered by InvoiceHub
    </div>
  </div>
</body>
</html>`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || `${companyName} <${process.env.EMAIL_USER}>`,
    to: invoice.clientSnapshot.email,
    subject: `Invoice #${invoice.invoiceNumber} from ${companyName} — ${formatCurrency(invoice.total, invoice.currency)} due ${formatDate(invoice.dueDate)}`,
    text: customMessage || defaultMessage,
    html: emailHTML,
    attachments: [{
      filename: `${invoice.invoiceNumber}-${invoice.clientSnapshot.name.replace(/\s+/g, '-')}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    }]
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

const formatCurrency = (amount, currency = '₹ INR') => {
  const symbol = currency.split(' ')[0];
  return `${symbol}${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

module.exports = { sendInvoiceEmail };
