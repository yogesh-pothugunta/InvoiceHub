const nodemailer = require('nodemailer');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      pool: true,
      maxConnections: 5,
      rateDelta: 20000,
      rateLimit: 5
    });
  }
  return transporter;
};

const sendOTPEmail = async (email, otp, name) => {
  const transport = getTransporter();

  await transport.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'InvoiceHub — Email Verification Code',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:400px;margin:auto;padding:30px;border-radius:10px;background:#f9f9f9;">
        <h2 style="color:#185FA5;">Hello ${name}! 👋</h2>
        <p style="color:#555;">Your verification code:</p>
        <div style="background:#185FA5;color:#fff;font-size:32px;font-weight:bold;text-align:center;padding:20px;border-radius:8px;letter-spacing:8px;">
          ${otp}
        </div>
        <p style="color:#888;font-size:12px;margin-top:16px;">Valid for 10 minutes only.</p>
      </div>
    `
  });
};

module.exports = { generateOTP, sendOTPEmail };