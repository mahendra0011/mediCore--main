import express from 'express';
import multer from 'multer';
import path from 'path';
import Record from '../models/Record.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';
import { uploadToGoogleDrive } from '../services/driveService.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }
});

// Proxy download route - fetches file from Google Drive and streams to client
router.get('/download/:fileId', protect, async (req, res) => {
  try {
    const { fileId } = req.params;
    const record = await Record.findOne({
      'data.uploadedFile.fileId': fileId,
      patientId: req.user._id
    });
    
    if (!record) {
      return res.status(404).json({ error: 'File not found or access denied' });
    }

    // For now, redirect to Google Drive URL
    const fileUrl = record.data.uploadedFile.url;
    if (fileUrl) {
      res.redirect(fileUrl);
    } else {
      res.status(404).json({ error: 'File URL not found' });
    }
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to verify Drive connection
router.get('/test-drive', protect, async (req, res) => {
  try {
    // Check if credentials are loaded
    const credentialsCheck = {
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID ? 'Set' : 'Missing',
      privateKeyId: process.env.GOOGLE_CLOUD_PRIVATE_KEY_ID ? 'Set' : 'Missing',
      clientEmail: process.env.GOOGLE_CLOUD_CLIENT_EMAIL ? 'Set' : 'Missing',
      folderId: process.env.GOOGLE_DRIVE_FOLDER_ID || 'Using default',
    };
    
    // Create a small test file in memory
    const testBuffer = Buffer.from('Test file content');
    const result = await uploadToGoogleDrive(testBuffer, 'test-drive-connection.txt', 'text/plain');
    res.json({ 
      success: true, 
      message: 'Google Drive connection works!',
      credentials: credentialsCheck,
      file: result 
    });
  } catch (error) {
    console.error('Drive test error:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      credentialsCheck: {
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID ? 'Set' : 'Missing',
        privateKeyId: process.env.GOOGLE_CLOUD_PRIVATE_KEY_ID ? 'Set' : 'Missing',
        clientEmail: process.env.GOOGLE_CLOUD_CLIENT_EMAIL ? 'Set' : 'Missing',
        privateKeyLength: process.env.GOOGLE_CLOUD_PRIVATE_KEY ? process.env.GOOGLE_CLOUD_PRIVATE_KEY.length : 0,
        folderId: process.env.GOOGLE_DRIVE_FOLDER_ID || 'Using default',
      }
    });
  }
});

router.post('/', protect, upload.single('file'), async (req, res) => {
  console.log('Upload request received:', { 
    user: req.user?.name, 
    userRole: req.user?.role,
    fileName: req.file?.originalname,
    fileSize: req.file?.size,
    mimeType: req.file?.mimetype 
  });
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Google Drive
    console.log('Attempting Google Drive upload...');
    const driveResult = await uploadToGoogleDrive(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );
    console.log('Google Drive upload successful:', { 
      fileName: driveResult.filename, 
      fileId: driveResult.fileId, 
      url: driveResult.url 
    });

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
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;