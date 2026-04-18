import express from 'express';
import Emergency from '../models/Emergency.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const createNotification = async (userId, title, message, type = 'system') => {
  console.log('Creating notification for userId:', userId, 'title:', title);
  try {
    await Notification.create({ 
      title, 
      message, 
      type, 
      read: false, 
      userId: userId.toString(), 
      date: new Date().toISOString().split('T')[0] 
    });
    console.log('Notification created successfully');
  } catch (err) {
    console.error('Error creating notification:', err);
  }
};

router.get('/', protect, async (req, res) => {
  try {
    const { status, severity } = req.query;
    const filter = {};
    
    if (req.user.role === 'doctor') {
      filter.$or = [
        { assignedDoctor: req.user._id },
        { status: 'Pending' }
      ];
    } else if (req.user.role === 'patient') {
      filter.patientId = req.user._id;
    }
    
    if (status && status !== 'All') filter.status = status;
    if (severity && severity !== 'All') filter.severity = severity;
    
    const emergencies = await Emergency.find(filter).sort({ createdAt: -1 });
    res.json(emergencies);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const { patientName, patientId, age, gender, phone, condition, severity } = req.body;
    
    const emergency = await Emergency.create({
      patientName: patientName || 'Unknown',
      patientId,
      age,
      gender,
      phone,
      condition,
      severity: severity || 'Serious',
      status: 'Pending'
    });
    
    // Notify all admins about new emergency
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification(admin._id, 'New Emergency Case', `${severity || 'Serious'} emergency: ${condition}`, 'system');
    }
    
    res.status(201).json(emergency);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id/assign', protect, async (req, res) => {
  try {
    const { doctorId, doctorName } = req.body;
    console.log(`[emergency assign] doctorId from frontend: ${doctorId}`);
    
    let userDoctorId = doctorId;
    if (doctorId) {
      const doctor = await Doctor.findById(doctorId);
      console.log(`[emergency assign] Doctor.findById(${doctorId}):`, doctor ? `found user_id=${doctor.user_id}` : 'not found');
      if (doctor) {
        if (doctor.user_id) {
          userDoctorId = doctor.user_id;
          console.log(`[emergency assign] using existing user_id=${userDoctorId}`);
        } else {
          // Fallback: find User by email and link
          const user = await User.findOne({ email: doctor.email, role: 'doctor' });
          if (user) {
            userDoctorId = user._id.toString();
            await Doctor.findByIdAndUpdate(doctor._id, { user_id: user._id });
            console.log(`[emergency assign] doctor missing user_id; fixed via User lookup, userDoctorId=${userDoctorId}`);
          } else {
            console.log(`[emergency assign] doctor found but no matching User; keeping doctorId`);
          }
        }
      }
    }
    
    const emergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      {
        assignedDoctor: userDoctorId,
        assignedDoctorName: doctorName,
        status: 'Assigned'
      },
      { new: true }
    );
    
    if (!emergency) return res.status(404).json({ message: 'Emergency case not found' });
    
    if (userDoctorId) {
      await createNotification(userDoctorId, 'Emergency Case Assigned', `You have been assigned to emergency case: ${emergency.condition}`, 'system');
    }
    
    res.json(emergency);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) return res.status(404).json({ message: 'Emergency case not found' });
    
    emergency.status = status;
    if (status === 'Assigned' && !emergency.assignedDoctor && req.user.role === 'doctor') {
      emergency.assignedDoctor = req.user._id;
      emergency.assignedDoctorName = req.user.name;
    }
    
    if (emergency.assignedDoctor && !emergency.responseTime) {
      emergency.responseTime = Math.round((Date.now() - new Date(emergency.createdAt).getTime()) / 60000);
    }
    
    await emergency.save();
    res.json(emergency);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.post('/:id/notes', protect, async (req, res) => {
  try {
    const { text } = req.body;
    
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) return res.status(404).json({ message: 'Emergency case not found' });
    
    emergency.notes.push({
      text,
      timestamp: new Date(),
      doctorName: req.user.name
    });
    
    await emergency.save();
    res.json(emergency);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.get('/stats', protect, async (req, res) => {
  try {
    const stats = await Emergency.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const severityStats = await Emergency.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);
    
    const total = await Emergency.countDocuments();
    const critical = await Emergency.countDocuments({ severity: 'Critical', status: { $nin: ['Discharged', 'Transferred'] } });
    
    res.json({
      total,
      critical,
      byStatus: stats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
      bySeverity: severityStats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {})
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;