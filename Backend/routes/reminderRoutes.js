import express from 'express';
import { sendReminders } from '../controllers/reminderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, sendReminders);

export default router;
