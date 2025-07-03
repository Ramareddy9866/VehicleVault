import express from 'express';
import { addService, getServices, deleteService } from '../controllers/serviceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/:vehicleId', protect, addService);
router.get('/:vehicleId', protect, getServices);
router.delete('/:id', protect, deleteService);

export default router;
