const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const passport = require('./config/passport');
const session = require('express-session');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const invoiceRoutes = require('./routes/invoices');
const clientRoutes = require('./routes/clients');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

app.use(helmet());
app.use(morgan('dev'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many auth attempts, try again in 1 hour.' }
});

app.use(cors({
  origin: ['http://localhost:3000', process.env.FRONTEND_URL, /\.vercel\.app$/],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/dashboard', dashboardRoutes);

const paymentRoutes = require('./routes/payments');
app.use('/api/payments', paymentRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'InvoiceHub API is running!',
    timestamp: new Date()
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  maxPoolSize: 10,
  retryWrites: true,
  heartbeatFrequencyMS: 10000,
})
  .then(() => {
    console.log('✅ MongoDB Connected');

    // Run recurring invoices check every day at midnight
    const { processRecurringInvoices } = require('./utils/recurringJob');

    setInterval(async () => {
      const now = new Date();

      if (now.getHours() === 0 && now.getMinutes() === 0) {
        await processRecurringInvoices();
      }
    }, 60 * 1000); // Check every minute

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 InvoiceHub Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    });

    // Keep alive - prevent Render cold start
    if (process.env.NODE_ENV === 'production') {
      setInterval(() => {
        const https = require('https');

        https.get(
          'https://invoicehub-backend-7smj.onrender.com/api/health',
          (res) => {
            console.log(`Keep alive ping: ${res.statusCode}`);
          }
        ).on('error', () => {});
      }, 14 * 60 * 1000);
    }

  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
