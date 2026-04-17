import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Record from '../models/Record.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = path.join(uploadDir, 'patient-uploads');
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }
});

router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/patient-uploads/${req.file.filename}`;
    const fileType = req.file.mimetype;
    
    let recordType = 'prescription';
    if (fileType.startsWith('image/')) {
      recordType = 'lab_report';
    } else if (fileType === 'application/pdf') {
      recordType = 'discharge_summary';
    }

    const record = await Record.create({
      patient: req.user.name,
      patientId: req.user._id,
      doctor: 'Self Upload',
      diagnosis: `Uploaded ${req.file.originalname}`,
      type: recordType,
      notes: `File: ${req.file.originalname}`,
      data: {
        patient: { name: req.user.name },
        doctor: { name: 'Self Upload' },
        uploadedFile: {
          filename: req.file.originalname,
          url: fileUrl,
          size: req.file.size,
          format: path.extname(req.file.originalname).replace('.', ''),
          mimeType: fileType,
        },
        date: new Date().toISOString().split('T')[0],
      },
    });

    await Notification.create({
      title: 'File Uploaded',
      message: `Your file "${req.file.originalname}" has been uploaded successfully`,
      type: 'records',
      read: false,
      userId: req.user._id,
      date: new Date().toISOString().split('T')[0],
    });

    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.originalname,
      size: req.file.size,
      format: path.extname(req.file.originalname).replace('.', ''),
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;