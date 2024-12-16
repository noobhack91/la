// server/routes/documentRoutes.js
import express from 'express';
import {
    addLOA,
    addPurchaseOrder,
    deleteLOA // Added delete route for LOA
    ,
    deletePurchaseOrder,
    getPurchaseOrders,
    getTenderDocuments
} from '../controllers/documentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Add LOA
router.post(
    '/loa',
    authorize('admin'), // Restrict to admin users
    upload.single('document'), // Handle file uploads
    addLOA
);

// Add Purchase Order (PO)
router.post(
    '/po',
    authorize('admin'), // Restrict to admin users
    upload.single('document'), // Handle file uploads
    addPurchaseOrder
);

// Get Purchase Orders by Tender ID
router.get(
    '/tender/:tenderId/po',
    authorize('admin'), // Restrict to admin users
    getPurchaseOrders
);

// Get Tender Documents (LOA and PO)
router.get(
    '/tender/:tenderId/documents',
    authorize('admin'), // Restrict to admin users
    getTenderDocuments
);

// Delete Purchase Order by ID
router.delete(
    '/po/:id',
    authorize('admin'), // Restrict to admin users
    deletePurchaseOrder
);

// Delete LOA by ID
router.delete(
    '/loa/:id',
    authorize('admin'), // Restrict to admin users
    deleteLOA
);

export default router;
