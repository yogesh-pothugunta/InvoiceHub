const nodemailer = require('nodemailer');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (email, otp, name) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'InvoiceHub - Email Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 20px;">
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1);">
          
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">InvoiceHub</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px;">Email Verification</p>
          </div>

          <div style="padding: 40px;">
            <h2 style="color: #1a202c; margin: 0 0 8px;">Hi ${name}!</h2>
            <p style="color: #718096; margin: 0 0 28px;">
              Use the verification code below to complete your registration.
            </p>

            <div style="background: #f7f8fc; border: 2px dashed #4f46e5; border-radius: 16px; padding: 28px; text-align: center; margin-bottom: 24px;">
              <p style="color: #718096; font-size: 13px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Verification Code</p>
              <h1 style="color: #4f46e5; font-size: 48px; letter-spacing: 16px; margin: 0; font-weight: 800;">${otp}</h1>
            </div>

            <div style="background: #fef2f2; border-radius: 10px; padding: 14px; margin-bottom: 20px;">
              <p style="color: #ef4444; font-size: 13px; margin: 0;">
                ⏰ This code expires in <strong>10 minutes</strong>
              </p>
            </div>

            <p style="color: #a0aec0; font-size: 12px; margin: 0;">
              If you did not create an InvoiceHub account, please ignore this email.
            </p>
          </div>

          <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #a0aec0; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} InvoiceHub. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  });
};

module.exports = { generateOTP, sendOTPEmail };