const nodemailer = require('nodemailer');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, // Gmail + Port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTPEmail = async (email, otp, name) => {
  try {
    // Check SMTP connection
    await transporter.verify();
    console.log('✅ SMTP Connected');

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'InvoiceHub - Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 30px; background: #f9f9f9; border-radius: 10px;">
          <h2 style="color: #185FA5;">Hello ${name}! 👋</h2>

          <p style="font-size: 16px;">
            Thank you for registering with <strong>InvoiceHub</strong>.
          </p>

          <p>Your email verification code is:</p>

          <div
            style="
              background: #185FA5;
              color: #ffffff;
              font-size: 32px;
              font-weight: bold;
              text-align: center;
              padding: 20px;
              border-radius: 8px;
              letter-spacing: 8px;
              margin: 20px 0;
            "
          >
            ${otp}
          </div>

          <p style="color: #666;">
            This OTP is valid for <strong>10 minutes</strong>.
          </p>

          <p style="color: #888; font-size: 14px;">
            If you did not create an account, please ignore this email.
          </p>

          <hr />

          <p style="font-size: 13px; color: #999;">
            © ${new Date().getFullYear()} InvoiceHub. All rights reserved.
          </p>
        </div>
      `
    });

    console.log('✅ Email sent successfully');
    console.log('📧 Message ID:', info.messageId);

    return true;
  } catch (error) {
    console.error('❌ Email Error:', error);
    throw error;
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail
};