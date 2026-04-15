import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
  patient: { type: String, required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  doctor: { type: String, required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  date: { type: String, required: true },
  diagnosis: { type: String, default: '' },
  prescription: { type: String, default: '' },
  type: { type: String, enum: ['Diagnosis', 'Prescription', 'Lab Report', 'Imaging', 'prescription', 'lab_report', 'discharge_summary'], default: 'Diagnosis' },
  notes: { type: String, default: '' },
  data: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Record', recordSchema);
