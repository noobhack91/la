// controllers/documentController.js
import { sequelize, TenderDocument, Consignee } from '../models/index.js';
import { uploadFile } from '../utils/azureStorage.js';
import logger from '../config/logger.js';

// Create LOA
export const createLOA = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { tenderId, documentNumber, documentDate, remarks } = req.body;

    let documentPath = null;
    if (req.file) {
      documentPath = await uploadFile(req.file, 'loa');
    }

    const loa = await TenderDocument.create({
      tenderId,
      type: 'LOA',
      documentNumber,
      documentDate: new Date(documentDate),
      documentPath,
      remarks,
      createdBy: req.user.id
    }, { transaction });

    await transaction.commit();
    res.status(201).json(loa);
  } catch (error) {
    await transaction.rollback();
    logger.error('Error creating LOA:', error);
    res.status(400).json({ error: error.message });
  }
};

// Create PO with Consignees
export const createPO = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      tenderId, 
      loaId,
      documentNumber, 
      documentDate, 
      remarks,
      consignees 
    } = req.body;

    // Validate consignees
    if (!Array.isArray(consignees) || consignees.length === 0) {
      throw new Error('At least one consignee is required for PO');
    }

    let documentPath = null;
    if (req.file) {
      documentPath = await uploadFile(req.file, 'po');
    }

    // Create PO
    const po = await TenderDocument.create({
      tenderId,
      parentId: loaId, // Optional LOA reference
      type: 'PO',
      documentNumber,
      documentDate: new Date(documentDate),
      documentPath,
      remarks,
      createdBy: req.user.id
    }, { transaction });

    // Create consignees
    await Consignee.bulkCreate(
      consignees.map(consignee => ({
        ...consignee,
        tenderId,
        documentId: po.id,
        createdBy: req.user.id
      })),
      { transaction }
    );

    await transaction.commit();

    // Fetch complete PO with consignees
    const completePO = await TenderDocument.findByPk(po.id, {
      include: [{
        model: Consignee,
        as: 'consignees'
      }]
    });

    res.status(201).json(completePO);
  } catch (error) {
    await transaction.rollback();
    logger.error('Error creating PO:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get Documents
export const getDocuments = async (req, res) => {
  try {
    const { tenderId, type } = req.query;
    const where = { tenderId };
    
    if (type) {
      where.type = type;
    }

    const documents = await TenderDocument.findAll({
      where,
      include: [
        {
          model: TenderDocument,
          as: 'purchaseOrders',
          include: [{
            model: Consignee,
            as: 'consignees'
          }]
        },
        {
          model: Consignee,
          as: 'consignees'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(documents);
  } catch (error) {
    logger.error('Error fetching documents:', error);
    res.status(500).json({ error: error.message });
  }
};