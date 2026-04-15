import mongoose from 'mongoose';

const billingSchema = new mongoose.Schema({
  invoiceId: { type: String, required: true, unique: true },
  patient: { type: String, required: true },
  doctor: { type: String, required: true },
  service: { type: String, required: true },
  amount: { type: Number, required: true },
  paid: { type: Number, default: 0 },
  status: { type: String, enum: ['Paid', 'Pending', 'Overdue', 'Partial'], default: 'Pending' },
  date: { type: String, required: true },
  dueDate: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Billing', billingSchema);
