/**
 * Manual trace of getNotificationUserId logic
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Doctor from './models/Doctor.js';
import Notification from './models/Notification.js';
import User from './models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://mahendrapi0053_db_user:34NGMDlJC8Dk7pv3@cluster0.avvnhcg.mongodb.net/medicore?appName=Cluster0';

async function trace() {
  await mongoose.connect(MONGO_URI);
  
  const doctorUser = await User.findOne({ role: 'doctor' });
  const doctorRecord = await Doctor.findOne({ user_id: doctorUser._id.toString() });
  
  console.log('🔍 Tracking getNotificationUserId logic\n');
  console.log('Simulated req object:');
  console.log('  req.user._id =', doctorUser._id, '(this is what JWT contains - User._id)');
  console.log('  req.user.role =', doctorUser.role);
  console.log('');
  
  console.log('Step 1: rawId = req.user._id.toString()');
  const rawId = doctorUser._id.toString();
  console.log('  rawId =', rawId);
  console.log('');
  
  console.log('Step 2: if (role === "doctor") → find doctor where user_id = rawId');
  const foundDoctor = await Doctor.findOne({ user_id: rawId });
  console.log('  Doctor.findOne({ user_id: rawId }) returns:', foundDoctor ? foundDoctor._id.toString() : 'null');
  console.log('');
  
  const effectiveUserId = (foundDoctor && foundDoctor.user_id) ? foundDoctor.user_id : rawId;
  console.log('Step 3: effectiveUserId =', effectiveUserId);
  console.log('');
  
  console.log('Now query: Notification.find({ userId: effectiveUserId })');
  const notifs = await Notification.find({ userId: effectiveUserId });
  console.log('Result:', notifs.length, 'notifications');
  
  // Create a test notification for verification
  await Notification.create({
    title: 'Test Doctor Notif',
    message: 'Testing',
    type: 'system',
    read: false,
    userId: effectiveUserId
  });
  const after = await Notification.find({ userId: effectiveUserId });
  console.log('After creating test notif:', after.length);
  
  if (after.length === 1) {
    console.log('\n✅ Doctor can receive and fetch notifications correctly!\n');
  } else {
    console.log('\n❌ Something wrong\n');
  }
  
  await Notification.deleteMany({});
  await mongoose.disconnect();
}

trace();
