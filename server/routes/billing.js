import express from 'express';
import Billing from '../models/Billing.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const createNotification = async (userId, title, message, type = 'payment') => {
  await Notification.create({ title, message, type, read: false, userId, date: new Date().toISOString().split('T')[0] });
};

router.get('/', protect, async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = {};
    
    if (req.user.role === 'patient') {
      filter.patientId = req.user._id;
    }
    
    if (status && status !== 'All') filter.status = status;
    if (search) filter.$or = [
      { patient: new RegExp(search, 'i') },
      { invoiceId: new RegExp(search, 'i') },
      { service: new RegExp(search, 'i') },
    ];
    
    const bills = await Billing.find(filter)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name')
      .sort({ createdAt: -1 });
    
    const total = await Billing.aggregate([
      { $match: req.user.role === 'patient' ? { patientId: req.user._id } : {} },
      { $group: { _id: null, total: { $sum: '$amount' }, paid: { $sum: '$paid' } } }
    ]);
    
    res.json({ bills, summary: total[0] || { total: 0, paid: 0 } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const { doctorId, doctor, service, amount, date, patient, patientId } = req.body;
    
    const count = await Billing.countDocuments();
    const invoiceId = `INV-${String(count + 1).padStart(4, '0')}`;
    
    const bill = await Billing.create({
      invoiceId,
      patient: patient || req.user.name,
      patientId: patientId || req.user._id,
      doctor: doctor || '',
      doctorId: doctorId || null,
      service,
      amount,
      date: date || new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Pending'
    });
    
    res.status(201).json(bill);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.post('/:id/pay', protect, async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Invoice not found' });
    
    const { paymentMethod } = req.body;
    const transactionId = `TXN-${Date.now()}`;
    
    bill.paid = bill.amount;
    bill.status = 'Paid';
    bill.paymentMethod = paymentMethod || 'card';
    bill.transactionId = transactionId;
    
    await bill.save();
    
    await createNotification(bill.patientId, 'Payment Successful', `Payment of $${bill.amount} received for ${bill.invoiceId}`, 'payment');
    
    res.json(bill);
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
