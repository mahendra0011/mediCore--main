import express from 'express';
import Record from '../models/Record.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const createNotification = async (userId, title, message, type = 'records') => {
  await Notification.create({ title, message, type, read: false, userId, date: new Date().toISOString().split('T')[0] });
};

router.get('/', protect, async (req, res) => {
  try {
    const { search, type, patient } = req.query;
    const filter = {};
    
    if (req.user.role === 'patient') {
      filter.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      filter.doctorId = req.user._id;
    }
    
    if (type && type !== 'All') filter.type = type;
    if (search) filter.$or = [
      { patient: new RegExp(search, 'i') },
      { doctor: new RegExp(search, 'i') },
      { diagnosis: new RegExp(search, 'i') },
    ];
    if (patient) filter.patient = new RegExp(patient, 'i');
    
    const records = await Record.find(filter)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 });
    res.json({ records });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/patient/:patientId', protect, async (req, res) => {
  try {
    const records = await Record.find({ patientId: req.params.patientId })
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 });
    res.json({ records });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const { patientId, patient, diagnosis, prescription, type, notes, data, appointmentId, attachments } = req.body;
    
    let doctorName = req.user.name;
    let doctorId = req.user._id;
    
    if (req.user.role === 'patient') {
      doctorName = req.body.doctor || '';
      doctorId = req.body.doctorId || null;
    }
    
    const record = await Record.create({
      patient: patient || req.user.name,
      patientId: patientId || req.user._id,
      doctor: doctorName,
      doctorId: doctorId,
      appointmentId: appointmentId || null,
      date: new Date().toISOString().split('T')[0],
      diagnosis: diagnosis || '',
      prescription: prescription || '',
      type: type || 'Diagnosis',
      notes: notes || '',
      data: data || {},
      attachments: attachments || []
    });
    
    await record.populate('doctorId', 'name specialization');
    
    await createNotification(patientId || req.user._id, 'New Medical Record', `A new ${type || 'record'} has been added to your medical history`, 'records');
    
    res.status(201).json(record);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const r = await Record.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('doctorId', 'name specialization');
    if (!r) return res.status(404).json({ message: 'Record not found' });
    res.json(r);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Record.findByIdAndDelete(req.params.id);
    res.json({ message: 'Record removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
