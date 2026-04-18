/**
 * Quick test: Doctor notifications fetch using correct query
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Doctor from './models/Doctor.js';
import Notification from './models/Notification.js';
import User from './models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://mahendrapi0053_db_user:34NGMDlJC8Dk7pv3@cluster0.avvnhcg.mongodb.net/medicore?appName=Cluster0';

async function test() {
  console.log('🔍 Testing Doctor Notification Query\n');
  try {
    await mongoose.connect(MONGO_URI);
    
    const doctor = await Doctor.findOne();
    const patient = await User.findOne({ role: 'patient' });
    const admin = await User.findOne({ role: 'admin' });
    
    console.log(`👨‍⚕️ Doctor: ${doctor.name}`);
    console.log(`   Doctor._id: ${doctor._id}`);
    console.log(`   Doctor.user_id: ${doctor.user_id}`);
    console.log(`   These are DIFFERENT values\n`);

    await Notification.deleteMany({});

    // Create notifications with correct user_id (as fixed code does)
    await Notification.create({
      title: 'Doctor Notif', message: 'For doctor', type: 'system',
      userId: doctor.user_id, read: false
    });
    await Notification.create({
      title: 'Patient Notif', message: 'For patient', type: 'system',
      userId: patient._id, read: false
    });
    await Notification.create({
      title: 'Admin Notif', message: 'For admin', type: 'system',
      userId: admin._id, read: false
    });
    console.log('✅ Created 3 notifications with correct user IDs\n');

    // Test 1: Doctor query (FIXED - using findOne({ user_id: ... }))
    console.log('📌 Doctor queries notifications:');
    const jwtUserId = doctor._id.toString(); // from JWT
    console.log(`   JWT user._id = ${jwtUserId}`);
    
    const foundDoctor = await Doctor.findOne({ user_id: jwtUserId });
    const effectiveUserId = foundDoctor?.user_id || jwtUserId;
    console.log(`   Found Doctor.user_id matching JWT _id: ${foundDoctor?.user_id}`);
    console.log(`   Effective notification filter.userId = ${effectiveUserId}\n`);
    
    const doctorNotifs = await Notification.find({ userId: effectiveUserId });
    console.log(`   Doctor sees ${doctorNotifs.length} notification(s):`);
    doctorNotifs.forEach(n => console.log(`   - ${n.title} (userId: ${n.userId})`));
    const test1 = doctorNotifs.length === 1 && doctorNotifs[0].title === 'Doctor Notif';
    console.log(`   ${test1 ? '✅' : '❌'} Doctor sees only their own\n`);

    // Test 2: Patient query (unchanged)
    console.log('📌 Patient queries notifications:');
    const patientNotifs = await Notification.find({ userId: patient._id.toString() });
    console.log(`   Patient sees ${patientNotifs.length} notification(s)`);
    const test2 = patientNotifs.length === 1;
    console.log(`   ${test2 ? '✅' : '❌'} Patient unaffected\n`);

    // Test 3: Admin query (unchanged)
    console.log('📌 Admin queries all notifications:');
    const adminNotifs = await Notification.find({});
    console.log(`   Admin sees ${adminNotifs.length} notification(s)`);
    const test3 = adminNotifs.length === 3;
    console.log(`   ${test3 ? '✅' : '❌'} Admin sees all\n`);

    console.log('═══════════════════════════');
    if (test1 && test2 && test3) {
      console.log('✅ ALL ROLES WORKING CORRECTLY');
      console.log('Doctor notifications should now appear in the UI!\n');
    } else {
      console.log('❌ Something still broken\n');
    }

    await Notification.deleteMany({});
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
  }
}

test();
