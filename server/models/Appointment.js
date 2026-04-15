import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patient: { type: String, required: true },
  doctor: { type: String, required: true },
  department: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['Confirmed', 'Pending', 'Cancelled', 'Completed'], default: 'Pending' },
  type: { type: String, enum: ['Consultation', 'Follow-up', 'Check-up', 'Emergency'], default: 'Consultation' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Appointment', appointmentSchema);
