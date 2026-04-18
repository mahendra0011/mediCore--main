import express from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'admin') {
      if (req.query.userId) filter.userId = req.query.userId;
    } else {
      filter.userId = req.user._id.toString();
    }
    const notifications = await Notification.find(filter).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/unread-count', protect, async (req, res) => {
  try {
    const filter = { read: false };
    if (req.user.role !== 'admin') {
      filter.userId = req.user._id.toString();
    }
    const count = await Notification.countDocuments(filter);
    res.json({ count });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/mark-all-read', protect, async (req, res) => {
  try {
    const filter = { read: false };
    if (req.user.role !== 'admin') {
      filter.userId = req.user._id.toString();
    }
    await Notification.updateMany(filter, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json(notification);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json(notification);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/clear-all', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role !== 'admin') {
      filter.userId = req.user._id.toString();
    }
    await Notification.deleteMany(filter);
    res.json({ message: 'All notifications cleared' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
