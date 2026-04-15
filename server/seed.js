import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Doctor from './models/Doctor.js';
import Patient from './models/Patient.js';
import Appointment from './models/Appointment.js';
import Record from './models/Record.js';
import Billing from './models/Billing.js';
import Review from './models/Review.js';
import Notification from './models/Notification.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://mahendrapi0053_db_user:34NGMDlJC8Dk7pv3@cluster0.avvnhcg.mongodb.net/?appName=Cluster0';

const hash = (p) => bcrypt.hash(p, 10);

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected. Clearing old data...');

  await Promise.all([
    User.deleteMany(), Doctor.deleteMany(), Patient.deleteMany(),
    Appointment.deleteMany(), Record.deleteMany(), Billing.deleteMany(),
    Review.deleteMany(), Notification.deleteMany(),
  ]);

  // Users
  await User.insertMany([
    { name: 'Admin User', email: 'admin@medicare.com', password: await hash('password'), role: 'admin' },
    { name: 'Dr. Sarah Smith', email: 'sarah.smith@medicare.com', password: await hash('password'), role: 'doctor', specialization: 'Cardiology' },
    { name: 'John Patient', email: 'patient@medicare.com', password: await hash('password'), role: 'patient' },
  ]);

  // Doctors
  await Doctor.insertMany([
    { name: 'Dr. Sarah Smith', specialization: 'Cardiology', experience: '12 years', rating: 4.8, patients: 1250, available: true, phone: '+1 234-567-8901', email: 'sarah.smith@medicare.com', initials: 'SS', department: 'Cardiology', fees: 500, consultation_fees: 500, location: 'New York, NY', qualifications: 'MBBS, MD Cardiology', bio: 'Expert cardiologist with 12 years of experience.', time_slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'], weekly_schedule: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false }, leaves: [], approved: true, user_id: '2', reviews_count: 3 },
    { name: 'Dr. Raj Patel', specialization: 'Neurology', experience: '8 years', rating: 4.9, patients: 890, available: true, phone: '+1 234-567-8902', email: 'raj.patel@medicare.com', initials: 'RP', department: 'Neurology', fees: 600, consultation_fees: 600, location: 'Los Angeles, CA', qualifications: 'MBBS, DM Neurology', bio: 'Specialized in neurological disorders.', time_slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'], weekly_schedule: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: false }, leaves: [], approved: true, reviews_count: 2 },
    { name: 'Dr. Emily Lee', specialization: 'Orthopedics', experience: '15 years', rating: 4.7, patients: 2100, available: false, phone: '+1 234-567-8903', email: 'emily.lee@medicare.com', initials: 'EL', department: 'Orthopedics', fees: 450, consultation_fees: 450, location: 'Chicago, IL', qualifications: 'MBBS, MS Orthopedics', bio: 'Bone and joint specialist.', time_slots: ['10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'], weekly_schedule: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: false, saturday: false, sunday: false }, leaves: ['2024-04-15'], approved: true, reviews_count: 0 },
    { name: 'Dr. Carlos Garcia', specialization: 'Pediatrics', experience: '10 years', rating: 4.6, patients: 1800, available: true, phone: '+1 234-567-8904', email: 'carlos.garcia@medicare.com', initials: 'CG', department: 'Pediatrics', fees: 350, consultation_fees: 350, location: 'Houston, TX', qualifications: 'MBBS, DCH Pediatrics', bio: 'Dedicated pediatrician.', time_slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'], weekly_schedule: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: false }, leaves: [], approved: true, reviews_count: 1 },
    { name: 'Dr. Min Kim', specialization: 'Dermatology', experience: '6 years', rating: 4.8, patients: 650, available: true, phone: '+1 234-567-8905', email: 'min.kim@medicare.com', initials: 'MK', department: 'Dermatology', fees: 400, consultation_fees: 400, location: 'Phoenix, AZ', qualifications: 'MBBS, MD Dermatology', bio: 'Skin care expert.', time_slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'], weekly_schedule: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false }, leaves: [], approved: true, reviews_count: 1 },
    { name: 'Dr. Anna Wilson', specialization: 'Oncology', experience: '20 years', rating: 4.9, patients: 3200, available: false, phone: '+1 234-567-8906', email: 'anna.wilson@medicare.com', initials: 'AW', department: 'Oncology', fees: 800, consultation_fees: 800, location: 'Philadelphia, PA', qualifications: 'MBBS, DM Oncology', bio: 'Leading oncologist.', time_slots: ['10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'], weekly_schedule: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: false, saturday: false, sunday: false }, leaves: [], approved: true, reviews_count: 0 },
  ]);

  // Patients
  await Patient.insertMany([
    { name: 'Sarah Johnson', age: 34, gender: 'Female', disease: 'Hypertension', doctor: 'Dr. Smith', phone: '+1 555-0101', email: 'sarah.j@email.com', bloodGroup: 'A+', admitted: new Date('2024-03-15'), status: 'Active' },
    { name: 'Mike Chen', age: 45, gender: 'Male', disease: 'Diabetes Type 2', doctor: 'Dr. Patel', phone: '+1 555-0102', email: 'mike.c@email.com', bloodGroup: 'O-', admitted: new Date('2024-03-12'), status: 'Active' },
    { name: 'Emma Wilson', age: 28, gender: 'Female', disease: 'Asthma', doctor: 'Dr. Lee', phone: '+1 555-0103', email: 'emma.w@email.com', bloodGroup: 'B+', admitted: new Date('2024-03-10'), status: 'Discharged' },
    { name: 'James Brown', age: 62, gender: 'Male', disease: 'Heart Disease', doctor: 'Dr. Smith', phone: '+1 555-0104', email: 'james.b@email.com', bloodGroup: 'AB+', admitted: new Date('2024-03-08'), status: 'Active' },
    { name: 'Lisa Davis', age: 51, gender: 'Female', disease: 'Arthritis', doctor: 'Dr. Lee', phone: '+1 555-0105', email: 'lisa.d@email.com', bloodGroup: 'A-', admitted: new Date('2024-03-05'), status: 'Active' },
    { name: 'Robert Taylor', age: 39, gender: 'Male', disease: 'Back Pain', doctor: 'Dr. Garcia', phone: '+1 555-0106', email: 'robert.t@email.com', bloodGroup: 'O+', admitted: new Date('2024-03-01'), status: 'Discharged' },
    { name: 'Amy Martinez', age: 23, gender: 'Female', disease: 'Migraine', doctor: 'Dr. Patel', phone: '+1 555-0107', email: 'amy.m@email.com', bloodGroup: 'B-', admitted: new Date('2024-02-28'), status: 'Active' },
    { name: 'David Lee', age: 58, gender: 'Male', disease: 'COPD', doctor: 'Dr. Wilson', phone: '+1 555-0108', email: 'david.l@email.com', bloodGroup: 'AB-', admitted: new Date('2024-02-25'), status: 'Critical' },
  ]);

  // Appointments
  const today = new Date().toISOString().split('T')[0];
  await Appointment.insertMany([
    { patient: 'Sarah Johnson', doctor: 'Dr. Smith', department: 'Cardiology', date: today, time: '10:00 AM', status: 'Confirmed', type: 'Follow-up' },
    { patient: 'Mike Chen', doctor: 'Dr. Patel', department: 'Neurology', date: today, time: '11:30 AM', status: 'Pending', type: 'Consultation' },
    { patient: 'Emma Wilson', doctor: 'Dr. Lee', department: 'Orthopedics', date: today, time: '2:00 PM', status: 'Confirmed', type: 'Check-up' },
    { patient: 'James Brown', doctor: 'Dr. Garcia', department: 'Pediatrics', date: '2024-03-21', time: '9:00 AM', status: 'Cancelled', type: 'Emergency' },
    { patient: 'Lisa Davis', doctor: 'Dr. Kim', department: 'Dermatology', date: '2024-03-21', time: '10:30 AM', status: 'Confirmed', type: 'Follow-up' },
    { patient: 'Robert Taylor', doctor: 'Dr. Wilson', department: 'Oncology', date: '2024-03-21', time: '1:00 PM', status: 'Completed', type: 'Consultation' },
    { patient: 'Amy Martinez', doctor: 'Dr. Patel', department: 'Neurology', date: '2024-03-22', time: '3:00 PM', status: 'Pending', type: 'Check-up' },
  ]);

  // Records
  await Record.insertMany([
    { patient: 'Sarah Johnson', doctor: 'Dr. Smith', date: '2024-03-15', diagnosis: 'Hypertension Stage 2', prescription: 'Amlodipine 5mg daily', type: 'Diagnosis' },
    { patient: 'Mike Chen', doctor: 'Dr. Patel', date: '2024-03-14', diagnosis: 'Migraine with Aura', prescription: 'Sumatriptan 50mg PRN', type: 'Prescription' },
    { patient: 'Emma Wilson', doctor: 'Dr. Lee', date: '2024-03-13', diagnosis: 'Knee Osteoarthritis', prescription: 'Physiotherapy + Ibuprofen 400mg', type: 'Lab Report' },
    { patient: 'James Brown', doctor: 'Dr. Smith', date: '2024-03-12', diagnosis: 'Coronary Artery Disease', prescription: 'Aspirin 75mg + Atorvastatin 40mg', type: 'Diagnosis' },
    { patient: 'Lisa Davis', doctor: 'Dr. Lee', date: '2024-03-11', diagnosis: 'Rheumatoid Arthritis', prescription: 'Methotrexate 7.5mg weekly', type: 'Prescription' },
    { patient: 'Amy Martinez', doctor: 'Dr. Patel', date: '2024-03-10', diagnosis: 'Chronic Migraine', prescription: 'Topiramate 25mg + Lifestyle changes', type: 'Lab Report' },
  ]);

  // Billing
  await Billing.insertMany([
    { invoiceId: 'INV-0001', patient: 'Sarah Johnson', doctor: 'Dr. Smith', service: 'Cardiology Consultation', amount: 350, paid: 350, status: 'Paid', date: '2024-03-15', dueDate: '2024-03-30' },
    { invoiceId: 'INV-0002', patient: 'Mike Chen', doctor: 'Dr. Patel', service: 'Neurology Follow-up', amount: 280, paid: 0, status: 'Pending', date: '2024-03-14', dueDate: '2024-03-29' },
    { invoiceId: 'INV-0003', patient: 'Emma Wilson', doctor: 'Dr. Lee', service: 'Orthopedic Check-up + X-Ray', amount: 520, paid: 260, status: 'Partial', date: '2024-03-13', dueDate: '2024-03-28' },
    { invoiceId: 'INV-0004', patient: 'James Brown', doctor: 'Dr. Smith', service: 'Cardiac Stress Test', amount: 890, paid: 890, status: 'Paid', date: '2024-03-12', dueDate: '2024-03-27' },
    { invoiceId: 'INV-0005', patient: 'Lisa Davis', doctor: 'Dr. Lee', service: 'Rheumatology Consultation', amount: 420, paid: 0, status: 'Overdue', date: '2024-02-28', dueDate: '2024-03-14' },
    { invoiceId: 'INV-0006', patient: 'Robert Taylor', doctor: 'Dr. Garcia', service: 'Pediatric Emergency Visit', amount: 1200, paid: 1200, status: 'Paid', date: '2024-03-01', dueDate: '2024-03-16' },
    { invoiceId: 'INV-0007', patient: 'Amy Martinez', doctor: 'Dr. Patel', service: 'Neurology MRI Scan', amount: 750, paid: 0, status: 'Pending', date: '2024-03-10', dueDate: '2024-03-25' },
  ]);

  // Reviews
  await Review.insertMany([
    { doctorId: 'd1', doctorName: 'Dr. Sarah Smith', patientName: 'Sarah Johnson', rating: 5, comment: 'Excellent cardiologist. Very thorough and caring.', date: '2024-03-15' },
    { doctorId: 'd2', doctorName: 'Dr. Raj Patel', patientName: 'Mike Chen', rating: 4, comment: 'Great neurologist. Explained everything clearly.', date: '2024-03-14' },
    { doctorId: 'd1', doctorName: 'Dr. Sarah Smith', patientName: 'James Brown', rating: 5, comment: 'Saved my life. Highly recommend.', date: '2024-03-12' },
    { doctorId: 'd4', doctorName: 'Dr. Carlos Garcia', patientName: 'Robert Taylor', rating: 4, comment: 'Very good with kids.', date: '2024-03-10' },
    { doctorId: 'd5', doctorName: 'Dr. Min Kim', patientName: 'Amy Martinez', rating: 5, comment: 'Quick diagnosis and effective treatment.', date: '2024-03-08' },
  ]);

  // Notifications
  await Notification.insertMany([
    { title: 'Appointment Reminder', message: 'Your appointment with Dr. Smith is tomorrow at 10:00 AM', type: 'reminder', read: false, userId: '3', date: '2024-03-15' },
    { title: 'Payment Received', message: 'Payment of $350 has been received for INV-0001', type: 'payment', read: true, userId: '3', date: '2024-03-14' },
    { title: 'New Appointment', message: 'Dr. Patel has confirmed your appointment', type: 'appointment', read: false, userId: '3', date: '2024-03-13' },
    { title: 'Lab Results Ready', message: 'Your lab results are now available in Medical Records', type: 'records', read: true, userId: '3', date: '2024-03-12' },
  ]);

  console.log('Seed complete!');
  console.log('\nDemo Login Credentials:');
  console.log('  Admin:   admin@medicare.com   / password');
  console.log('  Doctor:  sarah.smith@medicare.com / password');
  console.log('  Patient: patient@medicare.com  / password');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
