import express from 'express';
import Doctor from '../models/Doctor.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const { search, available, specialization, location } = req.query;
    const filter = {};
    if (search) filter.$or = [
      { name: new RegExp(search, 'i') },
      { specialization: new RegExp(search, 'i') },
    ];
    if (specialization && specialization !== 'All') filter.specialization = new RegExp(specialization, 'i');
    if (location && location !== 'All') filter.location = new RegExp(location, 'i');
    if (available !== undefined) filter.available = available === 'true';
    const doctors = await Doctor.find(filter).sort({ createdAt: -1 });
    res.json(doctors);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/user/:userId', protect, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user_id: req.params.userId });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    res.json(doctor);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json(doctor);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    res.json({ message: 'Doctor approved', doctor });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/reject', protect, adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, { approved: false }, { new: true });
    res.json({ message: 'Doctor rejected', doctor });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/schedule', protect, async (req, res) => {
  try {
    const update = {};
    if (req.body.time_slots) update.time_slots = req.body.time_slots;
    if (req.body.weekly_schedule) update.weekly_schedule = req.body.weekly_schedule;
    if (req.body.leaves) update.leaves = req.body.leaves;
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(doctor);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Doctor removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
