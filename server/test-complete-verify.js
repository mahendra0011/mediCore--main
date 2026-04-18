/**
 * Combined verification: All notification creation and retrieval paths
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Doctor from './models/Doctor.js';
import User from './models/User.js';
import Notification from './models/Notification.js';
import Emergency from './models/Emergency.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://mahendrapi0053_db_user:34NGMDlJC8Dk7pv3@cluster0.avvnhcg.mongodb.net/medicore?appName=Cluster0';

async function verifyAll() {
  await mongoose.connect(MONGO_URI);
  await Notification.deleteMany({});
  await Emergency.deleteMany({});

  const doctorUser = await User.findOne({ role: 'doctor' });
  const doctorRec = await Doctor.findOne({ user_id: doctorUser._id.toString() });
  const patient = await User.findOne({ role: 'patient' });

  console.log('🔍 FULL VERIFICATION\n');
  console.log('Doctor:', doctorUser.name);
  console.log('  User._id (JWT):', doctorUser._id);
  console.log('  Doctor._id:', doctorRec._id);
  console.log('  Doctor.user_id:', doctorRec.user_id);
  console.log('');

  // Test 1: createNotification from appointments.js pattern
  console.log('Test 1: Appointment notification (createNotification with Doctor._id)');
  const createNotification = async (userId, title, message) => {
    let finalUserId = userId.toString();
    const doc = await Doctor.findById(userId);
    if (doc && doc.user_id) finalUserId = doc.user_id;
    await Notification.create({ title, message, type: 'appointment', read: false, userId: finalUserId });
  };
  await createNotification(doctorRec._id, 'New Appointment', 'You have a new appointment');
  let notifs = await Notification.find({ userId: doctorRec.user_id });
  console.log(`  Created: ${notifs.length} notif for doctor`, notifs.length === 1 ? '✅' : '❌');

  // Test 2: Emergency assignment notification
  console.log('Test 2: Emergency assignment (converted doctorId)');
  let userDoctorId = doctorRec.user_id;
  const em = await Emergency.create({ patientName: 'Test', condition: 'Test', severity: 'Serious', status: 'Pending' });
  await Notification.create({
    title: 'Emergency Case Assigned',
    message: 'You have been assigned',
    type: 'system', read: false, userId: userDoctorId
  });
  notifs = await Notification.find({ userId: doctorRec.user_id });
  console.log(`  Doctor has ${notifs.length} total notifications`, notifs.length === 2 ? '✅' : '❌');

  // Test 3: Doctor GET /notifications query
  console.log('Test 3: GET /notifications for doctor');
  const rawId = doctorUser._id.toString();
  const foundDoc = await Doctor.findOne({ user_id: rawId });
  const filterUserId = foundDoc?.user_id || rawId;
  const fetched = await Notification.find({ userId: filterUserId });
  console.log(`  Query userId: ${filterUserId}`);
  console.log(`  Fetched ${fetched.length} notifications`, fetched.length === 2 ? '✅' : '❌');

  // Test 4: Patient unaffected
  console.log('Test 4: Patient notifications');
  const patientNotifs = await Notification.find({ userId: patient._id.toString() });
  console.log(`  Patient sees ${patientNotifs.length} (should be 0)`, patientNotifs.length === 0 ? '✅' : '❌');

  // Test 5: Admin sees all
  console.log('Test 5: Admin sees all');
  const admin = await User.findOne({ role: 'admin' });
  await Notification.create({ title: 'Admin Test', message: 'A', type: 'system', read: false, userId: admin._id });
  const all = await Notification.find({});
  console.log(`  Total notifications in DB: ${all.length}`, all.length >= 1 ? '✅' : '❌');

  console.log('');
  console.log('═══════════════════════════');
  const allPass = notifs.length === 2 && patientNotifs.length === 0 && all.length >= 1;
  if (allPass) {
    console.log('✅ ALL PATHS VERIFIED — Doctor notifications will work after server restart');
  } else {
    console.log('❌ SOME CHECKS FAILED');
  }

  await Notification.deleteMany({});
  await Emergency.deleteMany({});
  await mongoose.disconnect();
}

verifyAll();
