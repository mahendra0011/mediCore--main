import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { sendOTPEmail } from '../services/notificationService.js';

const router = express.Router();
const sign = (user) => jwt.sign(
  { id: user._id, role: user.role, name: user.name, email: user.email },
  process.env.JWT_SECRET || 'secret',
  { expiresIn: '30d' }
);

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, secretKey } = req.body;

    if (role === 'admin' && secretKey !== 'medicore2580') {
      return res.status(403).json({ message: 'Invalid secret key for admin registration' });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user (unverified)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'patient',
      isVerified: false,
      otp,
      otpExpires,
    });

    // Send OTP email in background - don't wait for response
    sendOTPEmail(email, otp).then(result => {
      if (!result.success) {
        console.error('OTP email failed:', result.error || result.message);
      } else {
        console.log('OTP email sent successfully:', result.messageId || 'simulated');
      }
    }).catch(err => {
      console.error('Failed to send OTP email:', err.message);
    });

    res.status(201).json({
      message: 'Registration successful. Please verify your email with the OTP sent.',
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: false }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark user as verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({
      message: 'Email verified successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: true }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send OTP email in background - don't wait
    sendOTPEmail(email, otp).then(result => {
      if (!result.success) {
        console.error('OTP email failed:', result.error || result.message);
      } else {
        console.log('OTP email sent successfully:', result.messageId || 'simulated');
      }
    }).catch(err => {
      console.error('Failed to send OTP email:', err.message);
    });
    
    res.json({ message: 'OTP resent to your email' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ message: `This account is not a ${role}` });
    }

    if (!user.isVerified) {
      // Generate and send new OTP for unverified email
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      // Send OTP immediately so we can report delivery issues accurately.
      const emailResult = await sendOTPEmail(email, otp);
      if (!emailResult.success) {
        console.error('OTP email failed during login:', emailResult.error || emailResult.message);
        return res.status(500).json({
          message: 'Unable to send OTP email right now. Please check SMTP settings and try again.'
        });
      }
      
      return res.status(403).json({
        message: emailResult.simulated
          ? 'Please verify your email first. OTP email is running in simulated mode (SMTP not configured).'
          : 'Please verify your email first',
        requiresVerification: true,
        email: user.email
      });
    }

    res.json({ token: sign(user), user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, isVerified: user.isVerified } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name, phone, avatar }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
