import express from 'express';
import Billing from '../models/Billing.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

export const LAB_SERVICES = [
  { id: 'bp_check', name: 'Blood Pressure Check', price: 100, category: 'Basic' },
  { id: 'blood_sugar', name: 'Blood Sugar Test', price: 150, category: 'Lab' },
  { id: 'fbc', name: 'Full Blood Count', price: 300, category: 'Lab' },
  { id: 'xray', name: 'X-Ray Scan', price: 500, category: 'Imaging' },
  { id: 'ecg', name: 'ECG Test', price: 400, category: 'Cardiac' },
  { id: 'urine_test', name: 'Urine Test', price: 150, category: 'Lab' },
  { id: 'lipid_profile', name: 'Lipid Profile', price: 450, category: 'Lab' },
  { id: 'thyroid', name: 'Thyroid Panel', price: 500, category: 'Lab' },
];

const createNotification = async (userId, title, message, type = 'payment') => {
  await Notification.create({ title, message, type, read: false, userId, date: new Date().toISOString().split('T')[0] });
};

const findPatientByName = async (name) => {
  if (!name) return null;
  const patient = await User.findOne({ name: new RegExp(name, 'i'), role: 'patient' });
  return patient;
};

// Get available lab services
router.get('/services', protect, async (req, res) => {
  res.json(LAB_SERVICES);
});

router.get('/', protect, async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = {};
    
    // If admin or doctor, show all bills (or filter by their name for doctors)
    if (req.user.role === 'patient') {
      filter.$or = [
        { patientId: req.user._id },
        { patient: new RegExp(req.user.name, 'i') }
      ];
    } else if (req.user.role === 'doctor') {
      // Doctors see bills created by them
      filter.doctor = new RegExp(req.user.name, 'i');
    }
    // Admin sees all bills - no filter needed
    
    if (status && status !== 'All') filter.status = status;
    if (search) {
      if (filter.$or) {
        filter.$or.push(
          { patient: new RegExp(search, 'i') },
          { invoiceId: new RegExp(search, 'i') },
          { service: new RegExp(search, 'i') }
        );
      } else {
        filter.$or = [
          { patient: new RegExp(search, 'i') },
          { invoiceId: new RegExp(search, 'i') },
          { service: new RegExp(search, 'i') },
          { doctor: new RegExp(search, 'i') }
        ];
      }
    }
    
    const bills = await Billing.find(filter)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 });
    
    // Calculate totals
    let totalFilter = {};
    if (req.user.role === 'patient') {
      totalFilter = { $or: [{ patientId: req.user._id }, { patient: new RegExp(req.user.name, 'i') }] };
    } else if (req.user.role === 'doctor') {
      totalFilter = { doctor: new RegExp(req.user.name, 'i') };
    }
    // Admin gets all
    
    const total = await Billing.aggregate([
      { $match: totalFilter },
      { $group: { _id: null, total: { $sum: '$amount' }, paid: { $sum: '$paid' } } }
    ]);
    
    res.json({ bills, summary: total[0] || { total: 0, paid: 0 } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const { doctorId, doctor, service, amount, date, patient, patientId, services } = req.body;
    
    const count = await Billing.countDocuments();
    const invoiceId = `INV-${String(count + 1).padStart(4, '0')}`;
    
    let finalPatientId = patientId;
    let finalPatient = patient || req.user.name;
    
    // If patientId not provided, try to find by patient name
    if (!finalPatientId && patient) {
      const patientUser = await findPatientByName(patient);
      if (patientUser) {
        finalPatientId = patientUser._id;
        finalPatient = patientUser.name;
      }
    }
    
    // If still no patientId and user is a patient, use their own ID
    if (!finalPatientId && req.user.role === 'patient') {
      finalPatientId = req.user._id;
    }
    
    // For doctors creating bills, if no patient found, return error
    if (!finalPatientId && req.user.role === 'doctor') {
      return res.status(400).json({ message: 'Patient not found. Please select a valid patient.' });
    }
    
    // Calculate total from services if provided
    let finalAmount = amount;
    let finalService = service;
    if (services && services.length > 0) {
      finalAmount = services.reduce((sum, s) => sum + (s.price || 0), 0);
      finalService = services.map(s => s.name).join(', ');
    }
    
    const bill = await Billing.create({
      invoiceId,
      patient: finalPatient,
      patientId: finalPatientId,
      doctor: doctor || req.user?.name || 'Lab Services',
      doctorId: doctorId || (req.user?.role === 'doctor' ? req.user._id : null),
      service: finalService,
      amount: finalAmount,
      date: date || new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Pending',
    });
    
    if (finalPatientId) {
      await createNotification(finalPatientId, 'New Invoice', `Invoice ${invoiceId} of Rs ${amount} for ${service}`, 'payment');
    }
    
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
    
    await createNotification(bill.patientId, 'Payment Successful', `Payment of Rs ${bill.amount} received for ${bill.invoiceId}`, 'payment');
    
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
