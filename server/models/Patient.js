import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  disease: { type: String, default: '' },
  doctor: { type: String, default: '' },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  bloodGroup: { type: String, default: '' },
  admitted: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'Discharged', 'Critical'], default: 'Active' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Patient', patientSchema);
