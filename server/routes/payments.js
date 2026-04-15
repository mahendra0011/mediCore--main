import express from 'express';
import Payment from '../models/Payment.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const { status, patient_id } = req.query;
    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (patient_id) filter.patient_id = patient_id;
    const payments = await Payment.find(filter).sort({ createdAt: -1 });
    const total = await Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);
    res.json({ payments, total_amount: total[0]?.total || 0 });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const transaction_id = `TXN-${Date.now()}`;
    const payment = await Payment.create({ ...req.body, transaction_id });
    res.status(201).json(payment);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id/refund', protect, adminOnly, async (req, res) => {
  try {
    const refund_amount = req.body.refund_amount || 0;
    const payment = await Payment.findByIdAndUpdate(req.params.id, { status: 'refunded', refund_amount }, { new: true });
    res.json({ message: `Refund of ${refund_amount} processed`, payment });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
