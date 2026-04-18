/**
 * Debug: Check Doctor collection structure
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Doctor from './models/Doctor.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://mahendrapi0053_db_user:34NGMDlJC8Dk7pv3@cluster0.avvnhcg.mongodb.net/medicore?appName=Cluster0';

async function debug() {
  await mongoose.connect(MONGO_URI);
  
  const doctor = await Doctor.findOne();
    console.log('First Doctor document:');
    console.log(JSON.stringify(doctor.toObject(), null, 2));
    console.log('\nKey fields:');
    console.log('doctor._id:', doctor._id);
    console.log('doctor.user_id:', doctor.user_id);
    console.log('doctor.user_id type:', typeof doctor.user_id);
    console.log('doctor.user_id === doctor._id.toString():', doctor.user_id === doctor._id.toString());
  
  await mongoose.disconnect();
}

debug();
