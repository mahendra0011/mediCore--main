/**
 * Check doctor's User document
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Doctor from './models/Doctor.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://mahendrapi0053_db_user:34NGMDlJC8Dk7pv3@cluster0.avvnhcg.mongodb.net/medicore?appName=Cluster0';

async function check() {
  await mongoose.connect(MONGO_URI);
  
  const doctor = await Doctor.findOne();
  console.log('Doctor:', doctor.name);
  console.log('Doctor._id:', doctor._id);
  console.log('Doctor.user_id:', doctor.user_id);
  console.log('');
  
  // Find the User document that corresponds to this doctor
  const user = await User.findOne({ _id: doctor.user_id });
  console.log('User document with _id = doctor.user_id:');
  console.log('User._id:', user?._id);
  console.log('User.name:', user?.name);
  console.log('User.role:', user?.role);
  
  if (user) {
    console.log('\n✅ Doctor JWT token would contain User._id:', user._id);
    console.log('   Not Doctor._id:', doctor._id);
  }
  
  await mongoose.disconnect();
}

check();
