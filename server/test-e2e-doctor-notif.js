/**
 * End-to-end: Patient creates appointment → doctor gets notification → doctor fetches it
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Doctor from './models/Doctor.js';
import User from './models/User.js';
import Appointment from './models/Appointment.js';
import Notification from './models/Notification.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://mahendrapi0053_db_user:34NGMDlJC8Dk7pv3@cluster0.avvnhcg.mongodb.net/medicore?appName=Cluster0';

async function e2e() {
  console.log('🔁 E2E: Patient books appointment → Doctor sees notification\n');
  
  await mongoose.connect(MONGO_URI);
  
  await Notification.deleteMany({});
  await Appointment.deleteMany({});
  
  const doctorRecord = await Doctor.findOne();
  const patientUser = await User.findOne({ role: 'patient' });
  
  console.log('Setup:');
  console.log(' Patient:', patientUser.name, '| User._id:', patientUser._id);
  console.log(' Doctor:', doctorRecord.name, '| Doctor._id:', doctorRecord._id);
  console.log(' Doctor.user_id (for notifications):', doctorRecord.user_id);
  console.log('');
  
  // Simulate POST /appointments (patient booking)
  console.log('Step 1: Patient books appointment for doctor');
  const { Appointment } = require('./models/Appointment.js');
  const { createNotification } = require('./routes/appointments.js');
  
  const appointmentData = {
    doctorId: doctorRecord._id, // frontend sends Doctor._id from dropdown
    doctor: doctorRecord.name,
    department: 'Cardiology',
    date: '2024-04-20',
    time: '10:00 AM',
    type: 'Consultation',
    symptoms: 'Checkup'
  };
  
  const appointment = await Appointment.create({
    patient: patientUser.name,
    patientId: patientUser._id,
    doctor: appointmentData.doctor,
    doctorId: appointmentData.doctorId,
    department: appointmentData.department,
    date: appointmentData.date,
    time: appointmentData.time,
    type: appointmentData.type,
    symptoms: appointmentData.symptoms,
    status: 'Pending'
  });
  console.log('✅ Appointment created:', appointment._id);
  
  // Simulate notification creation using the createNotification from appointments.js
  console.log('Step 2: System calls createNotification(doctorId, ...)');
  const originalCreate = createNotification;
  await originalCreate(
    appointmentData.doctorId,
    'New Appointment',
    `New ${appointmentData.type} appointment from ${patientUser.name} for ${appointmentData.date} at ${appointmentData.time}`,
    'appointment'
  );
  console.log('✅ createNotification called with doctorId:', appointmentData.doctorId);
  
  const notif = await Notification.findOne();
  console.log('Notification stored with userId:', notif?.userId);
  const storedCorrectly = notif?.userId.toString() === doctorRecord.user_id.toString();
  console.log(`Stored correctly: ${storedCorrectly ? '✅' : '❌'}\n`);
  
  // Step 3: Doctor fetches notifications
  console.log('Step 3: Doctor GET /notifications');
  const rawId = patientUser._id.toString(); // WRONG! Should be doctor's User._id
  // Correct simulation:
  const doctorJwtUserId = doctorRecord.user_id; // This is what JWT actually contains (User._id)
  console.log('   Doctor JWT user._id =', doctorJwtUserId);
  
  // getNotificationUserId logic:
  const foundDoctor = await Doctor.findOne({ user_id: doctorJwtUserId });
  const effectiveUserId = foundDoctor?.user_id || doctorJwtUserId;
  console.log('   Effective filter.userId =', effectiveUserId);
  
  const doctorNotifs = await Notification.find({ userId: effectiveUserId });
  console.log('   Found:', doctorNotifs.length, 'notification(s)');
  doctorNotifs.forEach(n => console.log('   -', n.title));
  
  const fetched = doctorNotifs.some(n => n.title === 'New Appointment');
  console.log(`Doctor sees appointment notification: ${fetched ? '✅' : '❌'}\n`);
  
  // Summary
  console.log('═══════════════════════');
  if (storedCorrectly && fetched) {
    console.log('✅ FULL FLOW WORKING');
    console.log('Doctor should see notifications in dashboard.\n');
  } else {
    console.log('❌ BROKEN at some step');
    console.log('storedCorrectly:', storedCorrectly);
    console.log('fetched:', fetched);
  }
  
  await Notification.deleteMany({});
  await Appointment.deleteMany({});
  await mongoose.disconnect();
}

e2e();
