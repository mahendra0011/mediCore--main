import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Record from '../models/Record.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';
import { uploadToGoogleDrive } from '../services/driveService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }
});

router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Google Drive
    const driveResult = await uploadToGoogleDrive(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    let recordType = 'prescription';
    if (req.file.mimetype.startsWith('image/')) {
      recordType = 'lab_report';
    } else if (req.file.mimetype === 'application/pdf') {
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
          url: driveResult.url,
          fileId: driveResult.fileId,
          size: req.file.size,
          format: path.extname(req.file.originalname).replace('.', ''),
          mimeType: req.file.mimetype,
          storedIn: 'google_drive',
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
      url: driveResult.url,
      filename: req.file.originalname,
      size: req.file.size,
      format: path.extname(req.file.originalname).replace('.', ''),
      fileId: driveResult.fileId,
      storedIn: 'google_drive',
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;