import express from 'express';
import Billing from '../models/Billing.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (search) filter.$or = [
      { patient: new RegExp(search, 'i') },
      { invoiceId: new RegExp(search, 'i') },
      { service: new RegExp(search, 'i') },
    ];
    const bills = await Billing.find(filter).sort({ createdAt: -1 });
    const total = await Billing.aggregate([{ $group: { _id: null, total: { $sum: '$amount' }, paid: { $sum: '$paid' } } }]);
    res.json({ bills, summary: total[0] || { total: 0, paid: 0 } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const count = await Billing.countDocuments();
    const invoiceId = `INV-${String(count + 1).padStart(4, '0')}`;
    const bill = await Billing.create({ ...req.body, invoiceId });
    res.status(201).json(bill);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const bill = await Billing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bill) return res.status(404).json({ message: 'Invoice not found' });
    res.json(bill);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Billing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Invoice removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
