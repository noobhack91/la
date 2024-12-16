// routes/documentRoutes.js
import express from 'express';
import { createLOA, createPO, getDocuments } from '../controllers/documentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(authenticate);

router.post('/loa', authorize('admin'), upload.single('document'), createLOA);
router.post('/po', authorize('admin'), upload.single('document'), createPO);
router.get('/', authorize('admin'), getDocuments);

export default router;