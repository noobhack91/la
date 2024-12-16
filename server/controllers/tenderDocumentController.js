// server/controllers/tenderDocumentController.js
import logger from '../config/logger.js';
import { Consignee, sequelize, TenderDocument } from '../models/index.js';
import { containers, uploadFile } from '../utils/azureStorage.js';

export const createLOA = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { tenderId, loaNumber, loaDate, remarks } = req.body;

    let documentPath = null;
    if (req.file) {
      documentPath = await uploadFile(req.file, containers.LOA);
    }

    const loa = await TenderDocument.create({
      tenderId,
      loaNumber,
      loaDate: new Date(loaDate),
      loaDocumentPath: documentPath,
      type: 'LOA',
      remarks,
      createdBy: req.user.id
    }, { transaction });

    await transaction.commit();
    logger.info(`LOA created for tender ${tenderId}`);
    res.status(201).json(loa);
  } catch (error) {
    await transaction.rollback();
    logger.error('Error creating LOA:', error);
    res.status(400).json({ error: error.message });
  }
};

export const createPO = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      tenderId, 
      loaId, 
      poNumber, 
      poDate, 
      remarks,
      consignees 
    } = req.body;

    // Validate consignees data
    if (!Array.isArray(consignees) || consignees.length === 0) {
      throw new Error('At least one consignee is required for PO');
    }

    let documentPath = null;
    if (req.file) {
      documentPath = await uploadFile(req.file, containers.PO);
    }

    // Create PO
    const po = await TenderDocument.create({
      tenderId,
      parentId: loaId, // Link to LOA if provided
      poNumber,
      poDate: new Date(poDate),
      poDocumentPath: documentPath,
      type: 'PO',
      remarks,
      createdBy: req.user.id
    }, { transaction });

    // Create consignees
    await Consignee.bulkCreate(
      consignees.map((consignee, index) => ({
        ...consignee,
        tenderId,
        tenderDocumentId: po.id,
        srNo: `${poNumber}-${index + 1}`,
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

    logger.info(`PO created for tender ${tenderId}`);
    res.status(201).json(completePO);
  } catch (error) {
    await transaction.rollback();
    logger.error('Error creating PO:', error);
    res.status(400).json({ error: error.message });
  }
};

export const getTenderDocuments = async (req, res) => {
  try {
    const { tenderId } = req.params;

    const documents = await TenderDocument.findAll({
      where: { tenderId },
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
      order: [
        ['createdAt', 'DESC'],
        ['purchaseOrders', 'createdAt', 'DESC']
      ]
    });

    res.json(documents);
  } catch (error) {
    logger.error('Error fetching tender documents:', error);
    res.status(500).json({ error: error.message });
  }
};