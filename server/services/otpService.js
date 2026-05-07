import OTP from '../models/OTP.js';
import { sendEmail, sendSMS } from './notificationService.js';

// OTP validity: 10 minutes
const OTP_VALIDITY_MINUTES = 10;
const OTP_VALIDITY_MS = OTP_VALIDITY_MINUTES * 60 * 1000;

// Minimum gap between OTP requests: 1 minute
const MIN_OTP_REQUEST_GAP_MS = 60 * 1000;

// Generate 6-digit numeric OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Check if user can request a new OTP (minimum 1 minute gap)
 * @param {string} email - User email
 * @returns {Promise<{allowed: boolean, waitSeconds?: number, lastRequestAt?: Date}>}
 */
export const checkRateLimit = async (email) => {
  // Find the most recent OTP for this email
  const lastOtp = await OTP.findOne({ email })
    .sort({ createdAt: -1 })
    .select('createdAt')
    .limit(1);

  if (!lastOtp) {
    return { allowed: true };
  }

  const timeSinceLastRequest = Date.now() - new Date(lastOtp.createdAt).getTime();
  const waitTime = MIN_OTP_REQUEST_GAP_MS - timeSinceLastRequest;

  if (timeSinceLastRequest < MIN_OTP_REQUEST_GAP_MS) {
    return {
      allowed: false,
      waitSeconds: Math.ceil(waitTime / 1000),
      lastRequestAt: lastOtp.createdAt
    };
  }

  return { allowed: true };
};

/**
 * Create and send OTP
 * @param {Object} params - { userId, email, type = 'email', phone? }
 * @returns {Promise<{success: boolean, message: string, otpId?: string}>}
 */
export const createAndSendOTP = async ({ userId, email, type = 'email', phone = '' }) => {
  try {
    // Check rate limit
    const rateLimitCheck = await checkRateLimit(email);
    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        message: `Please wait ${rateLimitCheck.waitSeconds} seconds before requesting a new OTP`,
        rateLimited: true,
        waitSeconds: rateLimitCheck.waitSeconds
      };
    }

    // Generate OTP
    const otpPlain = generateOTP();
    const otpHash = await OTP.hashOTP(otpPlain);
    const expiresAt = new Date(Date.now() + OTP_VALIDITY_MS);

    // Create OTP record
    const otpRecord = await OTP.create({
      user: userId,
      email,
      otpHash,
      type,
      phone,
      used: false,
      expiresAt,
      lastRequestAt: new Date()
    });

    // Send OTP via email or SMS
    let sendResult;
    if (type === 'sms' && phone) {
      sendResult = await sendSMS(phone, `Your MediCore OTP is: ${otpPlain}. Valid for ${OTP_VALIDITY_MINUTES} minutes.`);
    } else {
      sendResult = await sendEmail({
        to: email,
        subject: 'Your OTP Verification - MediCore Hospital',
        text: `Your OTP for verification is: ${otpPlain}. This OTP will expire in ${OTP_VALIDITY_MINUTES} minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>OTP Verification</h2>
            <p>Your One-Time Password (OTP) is:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; padding: 20px; background: #f5f5f5; text-align: center;">
              ${otpPlain}
            </div>
            <p>This OTP will expire in <strong>${OTP_VALIDITY_MINUTES} minutes</strong>.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `
      });
    }

    if (!sendResult.success) {
      // Delete OTP record if sending failed
      await otpRecord.deleteOne();
      return {
        success: false,
        message: `Failed to send OTP: ${sendResult.error || sendResult.message}`
      };
    }

    return {
      success: true,
      message: 'OTP sent successfully',
      otpId: otpRecord._id,
      sentTo: type === 'sms' ? phone : email
    };

  } catch (error) {
    console.error('OTP creation error:', error);
    return {
      success: false,
      message: 'Failed to create OTP',
      error: error.message
    };
  }
};

/**
 * Verify OTP
 * @param {Object} params - { email, otp } or { phone, otp }
 * @returns {Promise<{success: boolean, message: string, otpRecord?: Object}>}
 */
export const verifyOTP = async ({ email, otp }) => {
  try {
    // Find valid, unused OTP for this email
    const otpRecord = await OTP.findOne({
      email,
      used: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 }); // Get the most recent

    if (!otpRecord) {
      return {
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.'
      };
    }

    // Check if OTP matches
    const isMatch = await otpRecord.compareOTP(otp);
    if (!isMatch) {
      return {
        success: false,
        message: 'Invalid OTP'
      };
    }

    // Mark as used (single-use)
    otpRecord.used = true;
    await otpRecord.save();

    return {
      success: true,
      message: 'OTP verified successfully',
      otpRecord: {
        id: otpRecord._id,
        userId: otpRecord.user,
        email: otpRecord.email,
        type: otpRecord.type,
        expiresAt: otpRecord.expiresAt
      }
    };

  } catch (error) {
    console.error('OTP verification error:', error);
    return {
      success: false,
      message: 'Verification failed',
      error: error.message
    };
  }
};

/**
 * Resend OTP (with rate limiting)
 * @param {Object} params - { userId, email, type = 'email', phone? }
 * @returns {Promise<Object>} - Same as createAndSendOTP
 */
export const resendOTP = async (params) => {
  // For resend, we simply create a new OTP (rate limiting will apply)
  return await createAndSendOTP(params);
};

/**
 * Get OTP details (for debugging/admin purposes)
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
export const getLatestOTP = async (email) => {
  return await OTP.findOne({ email })
    .sort({ createdAt: -1 })
    .select('-otpHash') // Don't expose hash
    .lean();
};
