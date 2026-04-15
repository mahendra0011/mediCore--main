# 🏥 MediCore - Hospital Management System

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/MongoDB-Foundation-green?style=for-the-badge&logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License">
</p>

A comprehensive Hospital Management System (HMS) built with the MERN stack. MediCore enables healthcare facilities to manage patients, doctors, appointments, medical records, billing, and generate professional reports.

---

## ✨ Features

### 👨‍⚕️ Doctor Management
- Complete doctor profiles with specializations and qualifications
- Availability tracking and scheduling
- Consultation fee management
- Patient history access

### 👤 Patient Management  
- Patient registration and records
- Medical history tracking
- Appointment booking with doctors
- Payment and billing history

### 📅 Appointment System
- Online appointment booking
- Calendar-based scheduling
- Status tracking (Pending, Confirmed, Completed, Cancelled)
- SMS/Email reminders

### 📄 Medical Records
- Digital prescriptions
- Lab reports management
- Discharge summaries
- PDF report generation

### 💰 Billing & Payments
- Invoice generation
- Payment tracking
- Multiple payment methods
- Financial reporting

### 🔔 Notifications
- Email notifications
- SMS reminders
- OTP verification
- System alerts

### 📊 Admin Dashboard
- Real-time analytics
- Revenue tracking
- User management
- Department administration

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, Tailwind CSS |
| **UI Components** | shadcn/ui, Lucide Icons |
| **Routing** | React Router v6 |
| **Charts** | Recharts |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Authentication** | JWT, bcryptjs |
| **PDF Generation** | PDFKit |
| **Email** | Nodemailer (SMTP) |
| **Image Processing** | Sharp |
| **Excel/CSV** | xlsx, json2csv |
| **File Upload** | Multer |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- MongoDB (local or Atlas cloud)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/medicore.git
cd medicore

# Install dependencies
npm run install:all

# Configure environment variables
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI and JWT_SECRET
```

### Run Development Server

```bash
# Start both frontend and backend
npm run dev

# Or run individually
npm run dev --prefix server   # Backend: http://localhost:5000
npm run dev --prefix client   # Frontend: http://localhost:8080
```

### Seed Demo Data

```bash
npm run seed
```

**Demo Accounts:**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@medicore.com | password |
| Doctor | sarah.smith@medicore.com | password |
| Patient | patient@medicore.com | password |

---

## 📁 Project Structure

```
medicore/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # Auth context
│   │   ├── lib/              # API wrapper
│   │   ├── pages/            # Page components
│   │   │   ├── admin/        # Admin dashboard pages
│   │   │   ├── doctor/       # Doctor dashboard pages
│   │   │   └── patient/      # Patient dashboard pages
│   │   └── main.jsx          # App entry point
│   └── public/               # Static assets
│
├── server/                   # Express Backend
│   ├── models/               # Mongoose models
│   ├── routes/               # API routes
│   ├── services/             # Business logic
│   ├── utils/                # Utility functions
│   ├── middleware/           # Auth middleware
│   └── index.js              # Server entry point
│
└── README.md
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Doctors
- `GET /api/doctors` - List doctors
- `POST /api/doctors` - Create doctor
- `PUT /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Delete doctor

### Patients
- `GET /api/patients` - List patients
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Appointments
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Book appointment
- `PUT /api/appointments/:id` - Update appointment

### Medical Records
- `GET /api/records` - List records
- `POST /api/records` - Create record

### Billing
- `GET /api/billing` - List invoices
- `POST /api/billing` - Create invoice
- `PUT /api/billing/:id` - Update invoice

### Reports (PDF & Export)
- `POST /api/reports/generate-prescription` - Generate prescription PDF
- `POST /api/reports/generate-lab-report` - Generate lab report PDF
- `POST /api/reports/generate-discharge-summary` - Generate discharge summary
- `GET /api/reports/export/patients` - Export patients (Excel/CSV)
- `POST /api/reports/import/patients` - Import patients from Excel

---

## 🌐 Environment Variables

```env
# Server
PORT=5000
MONGO_URI=mongodb://localhost:27017/medicore
JWT_SECRET=your_secret_key

# SMTP (for emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Client
VITE_API_URL=http://localhost:5000/api
```

---

## 📱 Features in Detail

### PDF Report Generation
- Professional prescriptions with hospital letterhead
- Lab reports with test results
- Discharge summaries
- Auto-save to patient records

### Email & SMS Notifications
- Appointment reminders
- OTP verification
- Prescription delivery
- Lab result alerts

### File Handling
- Medical image upload/compression
- X-ray processing
- Document management

### Import/Export
- Bulk patient import (Excel)
- Bulk doctor import (Excel)
- Export to Excel/CSV formats

---

## 🏗️ Building for Production

```bash
# Build frontend
npm run build

# Output: client/dist/

# Serve with PM2
pm2 start server/index.js --name medicore-api
```

---

## 📄 License

MIT License - feel free to use this project for your healthcare facility.

---

## 👨‍💻 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<div align="center">
  <p>Built with ❤️ using MERN Stack</p>
  <p>© 2026 MediCore Hospital Management System</p>
</div>
