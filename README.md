# 🧾 InvoiceHub — Full Stack Invoice Management System

React + Node.js + MongoDB + JWT + PDF + Email

---

## 📁 Project Structure

```
invoicehub/
├── backend/          ← Node.js + Express API
└── frontend/         ← React + Tailwind UI
```

---

## 🚀 Setup & Run

### 1. Backend Setup

```bash
cd backend
npm install

# Create your .env file
cp .env.example .env
# Edit .env — fill MongoDB URI, Gmail credentials, JWT secret

npm run dev        # Starts on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start          # Starts on http://localhost:3000
```

---

## ⚙️ .env Configuration

```env
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/invoicehub
JWT_SECRET=your_secret_here
JWT_EXPIRE=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password      ← Gmail App Password (NOT Gmail login password)

COMPANY_NAME=Your Company
FRONTEND_URL=http://localhost:3000
```

### Gmail App Password Setup:
1. Go to Google Account → Security
2. Enable 2-Factor Authentication
3. Search "App Passwords" → Generate one for "Mail"
4. Use that 16-digit password as EMAIL_PASS

---

## 🌐 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get profile |
| PUT | /api/auth/profile | Update profile |
| PUT | /api/auth/change-password | Change password |

### Invoices
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/invoices | List (search, filter, paginate) |
| POST | /api/invoices | Create invoice |
| GET | /api/invoices/:id | Get one |
| PUT | /api/invoices/:id | Update |
| DELETE | /api/invoices/:id | Delete |
| PATCH | /api/invoices/:id/status | Update status |
| GET | /api/invoices/:id/pdf | Download PDF |
| POST | /api/invoices/:id/send-email | Email to client |
| GET | /api/invoices/export/csv | Export CSV |

### Clients
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/clients | List |
| POST | /api/clients | Create |
| GET | /api/clients/:id | Get one + invoices |
| PUT | /api/clients/:id | Update |
| DELETE | /api/clients/:id | Delete |

### Dashboard
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/dashboard/stats | Full stats + chart data |
| GET | /api/dashboard/recent | Recent + overdue invoices |

---

## ✅ Features Implemented

- 🔐 JWT Auth (Register / Login / Profile)
- 📊 Dashboard with Revenue Chart (last 6 months)
- 🧾 Invoice CRUD with auto invoice numbering
- 👥 Client Management with address book
- 💰 Auto-calculate subtotal, tax, total
- 📄 PDF Generation (Puppeteer — professional layout)
- 📧 Email with PDF attachment (Nodemailer + HTML template)
- 📥 Export invoices to CSV
- 🔍 Search & Filter by status
- 📱 Pagination
- ⚙️ Company settings, bank details, invoice prefix
- 🔒 Rate limiting, helmet security headers
- 🔄 Auto overdue detection

---

## 🚀 Deploy

### Backend → Render.com
1. Push to GitHub
2. New Web Service on render.com → connect repo → `cd backend && npm start`
3. Add all .env variables in Render dashboard

### Frontend → Vercel
1. Push frontend/ to GitHub
2. Import on vercel.com
3. Set env: `REACT_APP_API_URL=https://your-backend.onrender.com`
4. Update `frontend/src/utils/api.js` baseURL to use `process.env.REACT_APP_API_URL`

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router v6, Tailwind CSS, Recharts, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| PDF | Puppeteer |
| Email | Nodemailer (Gmail SMTP) |
| Security | Helmet, express-rate-limit |
| Deploy | Vercel (frontend) + Render (backend) |
