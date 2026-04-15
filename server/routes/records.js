import express from 'express';
import Record from '../models/Record.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const { search, type } = req.query;
    const filter = {};
    
    if (req.user.role === 'patient') {
      filter.patientId = req.user._id;
    }
    
    if (type && type !== 'All') filter.type = type;
    if (search) filter.$or = [
      { patient: new RegExp(search, 'i') },
      { doctor: new RegExp(search, 'i') },
      { diagnosis: new RegExp(search, 'i') },
    ];
    const records = await Record.find(filter).sort({ createdAt: -1 });
    res.json({ records });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const r = await Record.create(req.body);
    res.status(201).json(r);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const r = await Record.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
