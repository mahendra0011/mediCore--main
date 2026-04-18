import express from 'express';
import Appointment from '../models/Appointment.js';
import Notification from '../models/Notification.js';
import Doctor from '../models/Doctor.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const createNotification = async (userId, title, message, type = 'appointment') => {
  console.log(`[createNotification] userId=${userId} title=${title} type=${type}`);
  if (!userId) return;
  try {
    let finalUserId = userId.toString();
    const doctor = await Doctor.findById(userId);
    console.log(`[createNotification] Doctor.findById(${userId}) =>`, doctor ? `found user_id=${doctor.user_id}` : 'not found');
    if (doctor && doctor.user_id) {
      finalUserId = doctor.user_id;
    }
    console.log(`[createNotification] finalUserId=${finalUserId}`);
    await Notification.create({ title, message, type, read: false, userId: finalUserId, date: new Date().toISOString().split('T')[0] });
    console.log(`[createNotification] created notification for userId=${finalUserId}`);
  } catch (err) {
    console.error('[createNotification] error:', err);
  }
};

router.get('/', protect, async (req, res) => {
  try {
    const { status, date, search } = req.query;
    const filter = {};
    
    if (status && status !== 'All') filter.status = status;
    if (date) filter.date = date;
    
    if (req.user.role === 'patient') {
      filter.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      // Match appointments where doctor name matches current doctor's name
      filter.doctor = new RegExp(req.user.name, 'i');
    }
    
    if (search && req.user.role === 'doctor') {
      filter.$or = [
        { patient: new RegExp(search, 'i') },
      ];
    }
    
    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialization')
      .sort({ date: -1, time: 1 });
    res.json(appointments);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/my-appointments', protect, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    
    if (req.user.role === 'patient') {
      filter.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      // Match by doctor name
      filter.doctor = new RegExp(req.user.name, 'i');
    }
    
    if (status && status !== 'All') filter.status = status;
    
    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialization')
      .sort({ date: -1, time: 1 });
    res.json(appointments);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const a = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialization');
    if (!a) return res.status(404).json({ message: 'Appointment not found' });
    res.json(a);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const { doctorId, doctor, department, date, time, type, symptoms } = req.body;
    
    let patientName = req.user.name;
    let patientId = req.user._id;
    
    const appointment = await Appointment.create({
      patient: patientName,
      patientId,
      doctor: doctor || '',
      doctorId: doctorId || null,
      department,
      date,
      time,
      type: type || 'Consultation',
      symptoms: symptoms || '',
      status: 'Pending'
    });
    
    await appointment.populate('doctorId', 'name specialization');
    
    // Notify doctor about new appointment
    if (doctorId) {
      await createNotification(doctorId, 'New Appointment', `New ${type || 'Consultation'} appointment from ${patientName} for ${date} at ${time}`, 'appointment');
    }
    
    res.status(201).json(appointment);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const { status, notes, time, date } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    const oldStatus = appointment.status;
    const updates = { ...req.body };
    
    const updated = await Appointment.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate('patientId', 'name email')
      .populate('doctorId', 'name');
    
    if (status && status !== oldStatus) {
      const patientUser = await import('../models/User.js').then(m => m.default.findById(updated.patientId?._id));
      if (patientUser) {
        await createNotification(patientUser._id.toString(), 'Appointment Update', `Your appointment status changed to ${status}`, 'appointment');
      }
      // Notify doctor
      if (updated.doctorId) {
        await createNotification(updated.doctorId._id.toString(), 'Appointment Update', `Appointment with ${updated.patient} status changed to ${status}`, 'appointment');
      }
    }
    
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
