import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function migrate() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🧹 Cleaning up old OTP fields from User collection...');
    
    // Count users with old OTP fields
    const usersWithOtp = await User.countDocuments({
      $or: [{ otp: { $exists: true } }, { otpExpires: { $exists: true } }]
    });
    
    console.log(`   Found ${usersWithOtp} users with old OTP fields`);

    if (usersWithOtp > 0) {
      // Remove otp and otpExpires fields from all users
      const result = await User.updateMany(
        { $or: [{ otp: { $exists: true } }, { otpExpires: { $exists: true } }] },
        { $unset: { otp: '', otpExpires: '' } }
      );

      console.log(`   ✅ Removed OTP fields from ${result.modifiedCount} users`);
    } else {
      console.log('   No users with old OTP fields found');
    }

    console.log('\n✨ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
