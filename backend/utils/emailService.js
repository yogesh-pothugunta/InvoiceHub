const nodemailer = require('nodemailer');

const createTransporter = () => {
return nodemailer.createTransport({
host: process.env.EMAIL_HOST,
port: Number(process.env.EMAIL_PORT),
secure: Number(process.env.EMAIL_PORT) === 465,
auth: {
user: process.env.EMAIL_USER,
pass: process.env.EMAIL_PASS
},
connectionTimeout: 30000,
greetingTimeout: 30000,
socketTimeout: 30000,
});
};

const sendInvoiceEmail = async (invoice, user, pdfBuffer, customMessage = '') => {
const transporter = createTransporter();
const company = user.company || {};
const companyName = company.name || user.name || 'InvoiceHub';

const defaultMessage = `Dear ${invoice.clientSnapshot.name},

Please find attached Invoice #${invoice.invoiceNumber} for ${formatCurrency(invoice.total, invoice.currency)}.

Payment is due by ${formatDate(invoice.dueDate)}.

${user.bankDetails?.bankName ? "Payment Details: Bank: ${user.bankDetails.bankName} A/C: ${user.bankDetails.accountNumber} IFSC: ${user.bankDetails.ifsc} ${user.bankDetails.upiId ? 'UPI: ' + user.bankDetails.upiId : ''}" : ''}

For any queries, please contact us at ${user.email}.

Thank you for your business!

Best regards,
${companyName}`;

const emailHTML = `<!DOCTYPE html>

<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5;">
  <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:#185FA5;padding:28px 32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;">Invoice from ${companyName}</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#333;font-size:15px;">Dear <strong>${invoice.clientSnapshot.name}</strong>,</p>
      <div style="background:#E6F1FB;border-left:4px solid #185FA5;padding:16px 20px;border-radius:4px;margin-bottom:24px;">
        <p style="margin:0;color:#185FA5;"><strong>Invoice #${invoice.invoiceNumber}</strong></p>
        <p style="margin:4px 0 0;color:#555;font-size:24px;font-weight:700;">${formatCurrency(invoice.total, invoice.currency)}</p>
        <p style="margin:4px 0 0;color:#888;font-size:12px;">Due by ${formatDate(invoice.dueDate)}</p>
      </div>
      <p style="color:#555;font-size:14px;line-height:1.7;white-space:pre-line;">${customMessage || defaultMessage}</p>
    </div>
    <div style="background:#f5f5f5;padding:16px 32px;text-align:center;font-size:12px;color:#aaa;">
      ${companyName} | ${user.email} | Powered by InvoiceHub
    </div>
  </div>
</body>
</html>`;const mailOptions = {
from: process.env.EMAIL_FROM || "${companyName} <${process.env.EMAIL_USER}>",
to: invoice.clientSnapshot.email,
subject: "Invoice #${invoice.invoiceNumber} from ${companyName}",
text: customMessage || defaultMessage,
html: emailHTML,
attachments: [{
filename: "${invoice.invoiceNumber}.pdf",
content: pdfBuffer,
contentType: 'application/pdf'
}]
};

const info = await transporter.sendMail(mailOptions);
return info;
};

const formatCurrency = (amount, currency = '₹ INR') => {
const symbol = currency.split(' ')[0];
return "${symbol}${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}";
};

const formatDate = (date) => {
return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

module.exports = { sendInvoiceEmail };
