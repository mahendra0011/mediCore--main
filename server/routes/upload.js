import express from 'express';
import multer from 'multer';
import path from 'path';
import Record from '../models/Record.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';
import { uploadFileToCloudinary } from '../services/cloudinaryService.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }
});

// Proxy download route - redirects to Cloudinary URL
router.get('/download/:publicId', protect, async (req, res) => {
  try {
    const { publicId } = req.params;
    const record = await Record.findOne({
      'data.uploadedFile.publicId': publicId,
      patientId: req.user._id
    });
    
    if (!record) {
      return res.status(404).json({ error: 'File not found or access denied' });
    }

    // Redirect to Cloudinary URL
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

// Test endpoint to verify Cloudinary connection
router.get('/test-cloudinary', protect, async (req, res) => {
  try {
    // Check if credentials are loaded
    const credentialsCheck = {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
      apiKey: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
      urlConfigured: process.env.CLOUDINARY_URL ? 'Set' : 'Missing',
    };
    
    // Create a small test file in memory
    const testBuffer = Buffer.from('Test file content');
    const result = await uploadFileToCloudinary(testBuffer, 'test-cloudinary-connection.txt', 'text/plain');
    res.json({ 
      success: true, 
      message: 'Cloudinary connection works!',
      credentials: credentialsCheck,
      file: result 
    });
  } catch (error) {
    console.error('Cloudinary test error:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      credentialsCheck: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
        apiKey: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
        urlConfigured: process.env.CLOUDINARY_URL ? 'Set' : 'Missing',
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

    // Upload to Cloudinary
    console.log('Attempting Cloudinary upload...');
    const cloudinaryResult = await uploadFileToCloudinary(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );
    console.log('Cloudinary upload successful:', { 
      fileName: cloudinaryResult.filename, 
      publicId: cloudinaryResult.publicId, 
      url: cloudinaryResult.url 
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
          url: cloudinaryResult.url,
          publicId: cloudinaryResult.publicId,
          size: req.file.size,
          format: path.extname(req.file.originalname).replace('.', ''),
          mimeType: req.file.mimetype,
          storedIn: 'cloudinary',
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
      url: cloudinaryResult.url,
      filename: req.file.originalname,
      size: req.file.size,
      format: path.extname(req.file.originalname).replace('.', ''),
      publicId: cloudinaryResult.publicId,
      storedIn: 'cloudinary',
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