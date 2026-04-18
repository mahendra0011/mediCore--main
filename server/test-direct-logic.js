/**
 * Direct test: Call the fixed notification logic functions
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Doctor from './models/Doctor.js';
import User from './models/User.js';
import Notification from './models/Notification.js';

// Import actual route code to test
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://mahendrapi0053_db_user:34NGMDlJC8Dk7pv3@cluster0.avvnhcg.mongodb.net/medicore?appName=Cluster0';

async function directTest() {
  await mongoose.connect(MONGO_URI);
  
  // Clear
  await Notification.deleteMany({});
  
  // Get doctor's User account (this is what JWT contains)
  const doctorUser = await User.findOne({ role: 'doctor' });
  const doctorRecord = await Doctor.findOne({ user_id: doctorUser._id.toString() });
  
  console.log('🧑‍⚕️ Doctor login context:');
  console.log('   User._id (in JWT):', doctorUser._id);
  console.log('   Doctor._id:', doctorRecord._id);
  console.log('   Doctor.user_id:', doctorRecord.user_id);
  console.log('');
  
  // Simulate appointment creates notification (passing Doctor._id to createNotification)
  console.log('📝 Simulate: createNotification(doctor._id, "New Appointment", "...")');
  
  // This is the code from appointments.js createNotification:
  const passedUserId = doctorRecord._id; // This is what's passed when doctor creates/gets appointment
  let finalUserId = passedUserId.toString();
  const doc = await Doctor.findById(passedUserId);
  if (doc && doc.user_id) {
    finalUserId = doc.user_id;
  }
  console.log('   Input to createNotification:', passedUserId.toString());
  console.log('   Resolved to finalUserId:', finalUserId);
  console.log('   Matches doctor.user_id?', finalUserId === doctorRecord.user_id ? '✅ YES' : '❌ NO');
  
  await Notification.create({
    title: 'New Appointment',
    message: 'Test',
    type: 'appointment',
    read: false,
    userId: finalUserId
  });
  console.log('   Notification saved with userId:', finalUserId);
  console.log('');
  
  // Simulate doctor GET /notifications
  console.log('📬 Simulate: GET /notifications as doctor');
  console.log('   JWT req.user._id =', doctorUser._id.toString());
  
  // This is getNotificationUserId from notifications.js:
  const rawId = doctorUser._id.toString();
  const foundDoc = await Doctor.findOne({ user_id: rawId });
  const effectiveUserId = (foundDoc && foundDoc.user_id) ? foundDoc.user_id : rawId;
  
  console.log('   Doctor.findOne({ user_id: rawId }) result:', foundDoc ? foundDoc._id.toString() : 'null');
  console.log('   Effective filter.userId =', effectiveUserId);
  
  const notifs = await Notification.find({ userId: effectiveUserId });
  console.log('   Notifications found:', notifs.length);
  
  if (notifs.length > 0) {
    console.log('\n✅ SUCCESS: Doctor can see notifications!');
  } else {
    console.log('\n❌ FAIL: Doctor sees nothing');
  }
  
  await Notification.deleteMany({});
  await mongoose.disconnect();
}

directTest();
