import logger from '../config/logger.js';
import { LOA, PurchaseOrder, Tender } from '../models/index.js';
import { containers, uploadFile } from '../utils/azureStorage.js';

// Add LOA
export const addLOA = async (req, res) => {
    try {
        const { tenderId, loaNumber, loaDate } = req.body;

        // Validate required fields
        if (!tenderId || !loaNumber || !loaDate) {
            return res.status(400).json({
                error: 'Missing required fields. tenderId, loaNumber, and loaDate are required.'
            });
        }

        // Check if tender exists
        const tender = await Tender.findByPk(tenderId);
        if (!tender) {
            return res.status(404).json({ error: 'Tender not found' });
        }

        let documentPath = null;
        if (req.file) {
            documentPath = await uploadFile(req.file, containers.LOA);
        }

        const loa = await LOA.create({
            tenderId,
            loaNumber,
            loaDate: new Date(loaDate),
            documentPath,
            createdBy: req.user.id
        });

        logger.info(`LOA created for tender ${tenderId}`);
        res.status(201).json(loa);
    } catch (error) {
        logger.error('Error adding LOA:', error);
        res.status(400).json({ error: error.message });
    }
};

// Get LOAs
export const getLOAs = async (req, res) => {
    try {
        const { tenderId } = req.params;

        const loas = await LOA.findAll({
            where: { tenderId },
            order: [['createdAt', 'DESC']]
        });

        res.json(loas);
    } catch (error) {
        logger.error('Error fetching LOAs:', error);
        res.status(500).json({ error: error.message });
    }
};

// Delete LOA
export const deleteLOA = async (req, res) => {
    try {
        const { id } = req.params;

        const loa = await LOA.findByPk(id);
        if (!loa) {
            return res.status(404).json({ error: 'LOA not found' });
        }

        await loa.destroy();
        res.json({ message: 'LOA deleted successfully' });
    } catch (error) {
        logger.error('Error deleting LOA:', error);
        res.status(500).json({ error: error.message });
    }
};

// Add Purchase Order
export const addPurchaseOrder = async (req, res) => {
    try {
        const { tenderId, poNumber, poDate } = req.body;

        // Validate required fields
        if (!tenderId || !poNumber || !poDate) {
            return res.status(400).json({
                error: 'Missing required fields. tenderId, poNumber, and poDate are required.'
            });
        }

        // Check if tender exists
        const tender = await Tender.findByPk(tenderId);
        if (!tender) {
            return res.status(404).json({ error: 'Tender not found' });
        }

        let documentPath = null;
        if (req.file) {
            documentPath = await uploadFile(req.file, containers.PO);
        }

        const purchaseOrder = await PurchaseOrder.create({
            tenderId,
            poNumber,
            poDate: new Date(poDate),
            documentPath,
            createdBy: req.user.id
        });

        logger.info(`Purchase Order created for tender ${tenderId}`);
        res.status(201).json(purchaseOrder);
    } catch (error) {
        logger.error('Error adding Purchase Order:', error);
        res.status(400).json({ error: error.message });
    }
};

// Get Purchase Orders
export const getPurchaseOrders = async (req, res) => {
    try {
        const { tenderId } = req.params;

        const purchaseOrders = await PurchaseOrder.findAll({
            where: { tenderId },
            order: [['createdAt', 'DESC']]
        });

        res.json(purchaseOrders);
    } catch (error) {
        logger.error('Error fetching Purchase Orders:', error);
        res.status(500).json({ error: error.message });
    }
};

// Delete Purchase Order
export const deletePurchaseOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const purchaseOrder = await PurchaseOrder.findByPk(id);
        if (!purchaseOrder) {
            return res.status(404).json({ error: 'Purchase Order not found' });
        }

        await purchaseOrder.destroy();
        res.json({ message: 'Purchase Order deleted successfully' });
    } catch (error) {
        logger.error('Error deleting Purchase Order:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get documents for a tender
export const getTenderDocuments = async (req, res) => {
    try {
        const { tenderId } = req.params;

        const [loas, purchaseOrders] = await Promise.all([
            LOA.findAll({ where: { tenderId } }),
            PurchaseOrder.findAll({ where: { tenderId } })
        ]);

        res.json({ loas, purchaseOrders });
    } catch (error) {
        logger.error('Error fetching tender documents:', error);
        res.status(500).json({ error: error.message });
    }
};
